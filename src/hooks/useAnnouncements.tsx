import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import {
    collection,
    query,
    where,
    onSnapshot,
    addDoc,
    serverTimestamp,
    Timestamp,
    orderBy
} from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Announcement {
    id: string;
    title: string;
    content: string;
    author_id: string;
    house_id: string;
    created_at: Timestamp;
    priority: 'normal' | 'urgent';
}

interface AnnouncementsContextType {
    announcements: Announcement[];
    loading: boolean;
    addAnnouncement: (data: { title: string; content: string; priority: 'normal' | 'urgent' }) => Promise<void>;
}

const AnnouncementsContext = createContext<AnnouncementsContextType | undefined>(undefined);

export function AnnouncementsProvider({ children }: { children: ReactNode }) {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const { profile, user } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        if (!profile?.current_house_id) {
            setAnnouncements([]);
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, 'announcements'),
            where('house_id', '==', profile.current_house_id)
            // orderBy('created_at', 'desc') // Temporarily removed to fix Index Error
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Announcement[];
            setAnnouncements(data);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching announcements:", error);
            toast({
                title: "Error fetching updates",
                description: "Could not load announcements.",
                variant: "destructive"
            });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [profile?.current_house_id]);

    const addAnnouncement = async ({ title, content, priority }: { title: string; content: string; priority: 'normal' | 'urgent' }) => {
        if (!profile?.current_house_id || !user) return;

        try {
            await addDoc(collection(db, 'announcements'), {
                title,
                content,
                priority,
                house_id: profile.current_house_id,
                author_id: user.uid,
                created_at: serverTimestamp()
            });
            toast({
                title: "Announcement posted",
                description: "Your message has been shared."
            });
        } catch (error) {
            console.error("Error posting announcement:", error);
            toast({
                title: "Error posting",
                description: "Failed to share message.",
                variant: "destructive"
            });
            throw error;
        }
    };

    return (
        <AnnouncementsContext.Provider value={{ announcements, loading, addAnnouncement }}>
            {children}
        </AnnouncementsContext.Provider>
    );
}

export function useAnnouncements() {
    const context = useContext(AnnouncementsContext);
    if (context === undefined) {
        throw new Error('useAnnouncements must be used within an AnnouncementsProvider');
    }
    return context;
}
