import { useState } from 'react';
import { Plus, DollarSign, Wallet } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AddExpenseDialog } from '@/components/expenses/AddExpenseDialog';
import { ExpensesProvider, useExpenses } from '@/hooks/useExpenses';
import { useAuth } from '@/hooks/useAuth';

function ExpensesContent() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { expenses, loading, balances } = useExpenses();
    const { user } = useAuth();

    if (loading) {
        return <div className="p-8 text-center">Loading expenses...</div>;
    }

    const myBalance = user ? (balances[user.uid] || 0) : 0;
    const isOwed = myBalance > 0;
    const balanceText = myBalance === 0
        ? "All settled up"
        : isOwed
            ? `You are owed $${myBalance.toFixed(2)}`
            : `You owe $${Math.abs(myBalance).toFixed(2)}`;

    return (
        <div className="container mx-auto p-6 max-w-5xl space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
                    <p className="text-muted-foreground">Track shared costs and settle debts.</p>
                </div>
                <Button onClick={() => setIsDialogOpen(true)} className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" /> Add New Expense
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Balance Card */}
                <Card className="md:col-span-2 bg-primary/5 border-primary/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-medium text-primary flex items-center gap-2">
                            <Wallet className="h-5 w-5" />
                            Your Balance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-4xl font-bold ${isOwed ? 'text-success' : myBalance < 0 ? 'text-destructive' : 'text-primary'}`}>
                            {balanceText}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            Net balance across all shared expenses.
                        </p>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Latest transactions in the house</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {expenses.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                                <DollarSign className="h-10 w-10 mb-3 opacity-20" />
                                <p>No expenses recorded yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {expenses.map((expense) => {
                                    const isPayer = expense.paid_by === user?.uid;
                                    return (
                                        <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg bg-card/50">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-full ${isPayer ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                                                    <DollarSign className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{expense.description}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {isPayer ? 'You paid' : 'Someone paid'} • {expense.date ? format(expense.date.toDate(), 'MMM d, yyyy') : 'Recently'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-bold block">${expense.amount.toFixed(2)}</span>
                                                {isPayer ? (
                                                    <span className="text-xs text-success">Lent</span>
                                                ) : (
                                                    <span className="text-xs text-destructive">Borrowed</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <AddExpenseDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
        </div>
    );
}

export default function Expenses() {
    return (
        <ExpensesContent />
    );
}

