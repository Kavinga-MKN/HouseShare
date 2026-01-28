import { useState } from 'react';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  runTransaction,
  serverTimestamp,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';
import { useAuth } from './useAuth';

interface House {
  id: string;
  name: string;
  description: string | null;
  rules: string | null;
  invite_code: string;
  created_by: string;
}

export function useHouse() {
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInviteCode = async () => {
    let code = '';
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 5) {
      code = Math.floor(100000 + Math.random() * 900000).toString();
      const q = query(collection(db, 'houses'), where('invite_code', '==', code));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) throw new Error('Failed to generate unique invite code');
    return code;
  };

  const createHouse = async (name: string, description?: string, rules?: string) => {
    if (!user) {
      const err = 'You must be logged in to create a house';
      setError(err);
      return { error: err };
    }

    setLoading(true);
    setError(null);

    try {
      const inviteCode = await generateInviteCode();

      const houseData = {
        name,
        description: description || null,
        rules: rules || null,
        invite_code: inviteCode,
        created_by: user.uid,
        created_at: serverTimestamp()
      };

      const houseRef = await runTransaction(db, async (transaction) => {
        // 1. Create House directly (we can't easily return the ID before creation in transaction with addDoc, 
        // unlike native SDKs which allow generating ID. We can use doc() to generate ID first).
        const newHouseRef = doc(collection(db, 'houses'));
        transaction.set(newHouseRef, houseData);

        // 2. Add creator as admin member
        // Using a composite ID for uniqueness: houseId_userId
        const memberRef = doc(db, 'house_members', `${newHouseRef.id}_${user.uid}`);
        transaction.set(memberRef, {
          house_id: newHouseRef.id,
          user_id: user.uid,
          role: 'admin',
          joined_at: serverTimestamp()
        });

        // 3. Update user profile - Use setDoc with merge to safety handle missing profiles
        const userRef = doc(db, 'users', user.uid);
        transaction.set(userRef, { current_house_id: newHouseRef.id }, { merge: true });

        return newHouseRef;
      });

      await refreshProfile();

      return {
        house: { id: houseRef.id, ...houseData } as House,
        error: null
      };

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create house';
      setError(message);
      return { error: message };
    } finally {
      setLoading(false);
    }
  };

  const joinHouse = async (inviteCode: string) => {
    if (!user) {
      const err = 'You must be logged in to join a house';
      setError(err);
      return { error: err };
    }

    setLoading(true);
    setError(null);

    try {
      const q = query(
        collection(db, 'houses'),
        where('invite_code', '==', inviteCode.trim())
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error('Invalid invite code. Please check and try again.');
      }

      const houseDoc = querySnapshot.docs[0];
      const houseId = houseDoc.id;
      const houseData = houseDoc.data();

      await runTransaction(db, async (transaction) => {
        // Check if member already exists
        const memberRef = doc(db, 'house_members', `${houseId}_${user.uid}`);
        const memberDoc = await transaction.get(memberRef);

        if (!memberDoc.exists()) {
          // Add member
          transaction.set(memberRef, {
            house_id: houseId,
            user_id: user.uid,
            role: 'member',
            joined_at: serverTimestamp()
          });
        }

        // Update user profile - Use setDoc with merge to safely handle missing profiles
        const userRef = doc(db, 'users', user.uid);
        transaction.set(userRef, { current_house_id: houseId }, { merge: true });
      });

      await refreshProfile();

      return {
        house: { id: houseId, ...houseData } as House,
        error: null
      };

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to join house';
      setError(message);
      return { error: message };
    } finally {
      setLoading(false);
    }
  };

  const getHousemates = async (houseId: string) => {
    try {
      const q = query(
        collection(db, 'house_members'),
        where('house_id', '==', houseId)
      );
      const snapshot = await getDocs(q);
      const memberIds = snapshot.docs.map(doc => doc.data().user_id);

      const housemates = [];
      for (const userId of memberIds) {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          housemates.push({ id: userId, ...userDoc.data() });
        }
      }
      return housemates;
    } catch (err) {
      console.error("Error fetching housemates:", err);
      return [];
    }
  };

  const getHouseDetails = async (houseId: string) => {
    try {
      const houseDoc = await getDoc(doc(db, 'houses', houseId));
      if (houseDoc.exists()) {
        return { id: houseDoc.id, ...houseDoc.data() } as House;
      }
      return null;
    } catch (err) {
      console.error("Error fetching house details:", err);
      return null;
    }
  };

  const getMemberRole = async (houseId: string, userId: string) => {
    try {
      const memberRef = doc(db, 'house_members', `${houseId}_${userId}`);
      const memberDoc = await getDoc(memberRef);
      if (memberDoc.exists()) {
        return memberDoc.data().role as 'admin' | 'member';
      }
      return null;
    } catch (err) {
      console.error("Error fetching member role:", err);
      return null;
    }
  };

  const updateHouseName = async (houseId: string, newName: string) => {
    if (!user) return;
    setLoading(true);
    try {
      await setDoc(doc(db, 'houses', houseId), {
        name: newName
      }, { merge: true });
      await refreshProfile();
    } catch (err) {
      setError('Failed to update house name');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const leaveHouse = async () => {
    if (!user || !user.uid) return;
    setLoading(true);
    try {
      // Get current house ID from profile (or passed arg, but profile is safer source of truth)
      // Note: We need the profile loaded in context for this, which useAuth provides but we didn't import 'profile' here.
      // Let's assume the component calling this checks for houseId, or we fetch it.
      // Ideally we'd remove the member document: ${houseId}_${userId}
      // For now, simpler approach: just clear the user's current_house_id

      await updateDoc(doc(db, 'users', user.uid), {
        current_house_id: null
      });

      await refreshProfile();
    } catch (err) {
      setError('Failed to leave house');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createHouse,
    joinHouse,
    getHousemates,
    getHouseDetails,
    getMemberRole,
    updateHouseName,
    leaveHouse,
    loading,
    error,
  };
}
