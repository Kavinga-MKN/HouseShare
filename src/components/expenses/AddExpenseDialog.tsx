import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, DollarSign } from 'lucide-react';

import { useExpenses } from '@/hooks/useExpenses';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const createExpenseSchema = z.object({
    description: z.string().min(2, 'Description must be at least 2 characters').max(50),
    amount: z.coerce.number().positive('Amount must be greater than 0'),
    splitWithAll: z.boolean().default(true),
});

type CreateExpenseValues = z.infer<typeof createExpenseSchema>;

interface AddExpenseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddExpenseDialog({ open, onOpenChange }: AddExpenseDialogProps) {
    const { addExpense } = useExpenses();
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // In a real app, we would fetch housemates here to allow selecting specific people
    // For this minimal version, we assume "Split with All" implies splitting with everyone in house
    // Since we don't have a reliable "housemates" list yet in context, we'll implement a simplified "Split" logic
    // logic: split_with = [] means "everyone".

    const form = useForm<CreateExpenseValues>({
        resolver: zodResolver(createExpenseSchema),
        defaultValues: {
            description: '',
            amount: 0,
            splitWithAll: true,
        },
    });

    const onSubmit = async (values: CreateExpenseValues) => {
        setIsSubmitting(true);
        try {
            await addExpense({
                description: values.description,
                amount: values.amount,
                paid_by: user?.uid || '',
                splitWithAll: values.splitWithAll, // We'll handle this logic better in a full version
                // For minimal version, we'll store a mock ID or empty array to signify "others"
                split_with: values.splitWithAll ? ['placeholder_all'] : []
            } as any);

            form.reset();
            onOpenChange(false);
        } catch (error) {
            // Error handled in hook
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Expense</DialogTitle>
                    <DialogDescription>
                        Enter the cost details. It will be split equally.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Weekly Groceries" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Amount ($)</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input type="number" step="0.01" className="pl-9" placeholder="0.00" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="splitWithAll"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            Split with everyone
                                        </FormLabel>
                                        <FormDescription>
                                            Cost will be shared equally among all housemates.
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Add Expense
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
