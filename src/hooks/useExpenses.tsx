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

export interface Expense {
    id: string;
    description: string;
    amount: number;
    paid_by: string; // user_id
    house_id: string;
    date: Timestamp;
    split_with: string[]; // array of user_ids
}

interface ExpensesContextType {
    expenses: Expense[];
    loading: boolean;
    addExpense: (expense: Omit<Expense, 'id' | 'date' | 'house_id'>) => Promise<void>;
    balances: Record<string, number>; // user_id -> amount (positive = owed to you, negative = you owe)
}

const ExpensesContext = createContext<ExpensesContextType | undefined>(undefined);

export function ExpensesProvider({ children }: { children: ReactNode }) {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [balances, setBalances] = useState<Record<string, number>>({});
    const { profile, user } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        if (!profile?.current_house_id) {
            setExpenses([]);
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, 'expenses'),
            where('house_id', '==', profile.current_house_id)
            // orderBy('date', 'desc') // Temporarily removed to fix Index Error
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const expensesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Expense[];

            setExpenses(expensesData);
            calculateBalances(expensesData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching expenses:", error);
            toast({
                title: "Error fetching expenses",
                description: "Could not load transaction history.",
                variant: "destructive"
            });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [profile?.current_house_id, user?.uid]);

    const calculateBalances = (expensesList: Expense[]) => {
        if (!user) return;

        // Simple calculation: 
        // If I paid $10 split with 2 others (3 people total), I am owed $6.66 ($3.33 from each).
        // If someone else paid $10 split with me and 1 other, I owe $3.33.

        let netBalance = 0;

        expensesList.forEach(expense => {
            const splitCount = expense.split_with.length + 1; // +1 for the payer
            const amountPerPerson = expense.amount / splitCount;

            if (expense.paid_by === user.uid) {
                // I paid, so I am owed by everyone else involved
                // Amount I am owed = Total Amount - My Share
                const myShare = amountPerPerson;
                netBalance += (expense.amount - myShare);
            } else if (expense.split_with.includes(user.uid)) {
                // Someone else paid, and I am involved
                // I owe my share
                netBalance -= amountPerPerson;
            }
        });

        // For now, we only track the current user's net balance against the "house"
        // In a real app, you'd track pair-wise balances (User A owes User B)
        setBalances({ [user.uid]: netBalance });
    };

    const addExpense = async (expenseData: Omit<Expense, 'id' | 'date' | 'house_id'>) => {
        if (!profile?.current_house_id) return;

        try {
            await addDoc(collection(db, 'expenses'), {
                ...expenseData,
                house_id: profile.current_house_id,
                date: serverTimestamp()
            });
            toast({
                title: "Expense added",
                description: "Transaction recorded successfully."
            });
        } catch (error) {
            console.error("Error adding expense:", error);
            toast({
                title: "Error adding expense",
                description: "Failed to record transaction.",
                variant: "destructive"
            });
            throw error;
        }
    };

    return (
        <ExpensesContext.Provider value={{ expenses, loading, addExpense, balances }}>
            {children}
        </ExpensesContext.Provider>
    );
}

export function useExpenses() {
    const context = useContext(ExpensesContext);
    if (context === undefined) {
        throw new Error('useExpenses must be used within an ExpensesProvider');
    }
    return context;
}
