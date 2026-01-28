import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import {
    collection,
    query,
    where,
    onSnapshot,
    addDoc,
    updateDoc,
    doc,
    serverTimestamp,
    Timestamp,
    orderBy
} from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Chore {
    id: string;
    title: string;
    description?: string;
    assigned_to: string | null; // user_id
    house_id: string;
    status: 'pending' | 'completed';
    due_date: Timestamp | null;
    is_rotating: boolean;
    rotation_interval?: 'weekly';
    created_at: Timestamp;
}

interface ChoresContextType {
    chores: Chore[];
    loading: boolean;
    addChore: (chore: Omit<Chore, 'id' | 'created_at' | 'house_id' | 'status'>) => Promise<void>;
    toggleChoreStatus: (choreId: string, currentStatus: 'pending' | 'completed') => Promise<void>;
    deleteChore: (choreId: string) => Promise<void>;
}

const ChoresContext = createContext<ChoresContextType | undefined>(undefined);

export function ChoresProvider({ children }: { children: ReactNode }) {
    const [chores, setChores] = useState<Chore[]>([]);
    const [loading, setLoading] = useState(true);
    const { profile } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        if (!profile?.current_house_id) {
            setChores([]);
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, 'chores'),
            where('house_id', '==', profile.current_house_id)
            // orderBy('created_at', 'desc') // Temporarily removed to fix Index Error
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const choresData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Chore[];
            setChores(choresData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching chores:", error);
            toast({
                title: "Error fetching chores",
                description: "Could not load chores list.",
                variant: "destructive"
            });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [profile?.current_house_id]);

    const addChore = async (choreData: Omit<Chore, 'id' | 'created_at' | 'house_id' | 'status'>) => {
        if (!profile?.current_house_id) return;

        try {
            await addDoc(collection(db, 'chores'), {
                ...choreData,
                house_id: profile.current_house_id,
                status: 'pending',
                created_at: serverTimestamp()
            });
            toast({
                title: "Chore added",
                description: "New chore has been created successfully."
            });
        } catch (error) {
            console.error("Error adding chore:", error);
            toast({
                title: "Error adding chore",
                description: "Failed to create the chore. Please try again.",
                variant: "destructive"
            });
            throw error;
        }
    };

    const toggleChoreStatus = async (choreId: string, currentStatus: 'pending' | 'completed') => {
        try {
            const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
            await updateDoc(doc(db, 'chores', choreId), {
                status: newStatus
            });
        } catch (error) {
            console.error("Error updating chore:", error);
            toast({
                title: "Action failed",
                description: "Could not update chore status.",
                variant: "destructive"
            });
        }
    };

    const deleteChore = async (choreId: string) => {
        // Implement delete if needed, or archive
        console.log("Delete not implemented yet for:", choreId);
    };

    return (
        <ChoresContext.Provider value={{ chores, loading, addChore, toggleChoreStatus, deleteChore }}>
            {children}
        </ChoresContext.Provider>
    );
}

export function useChores() {
    const context = useContext(ChoresContext);
    if (context === undefined) {
        throw new Error('useChores must be used within a ChoresProvider');
    }
    return context;
}
