import { useState } from 'react';
import { Plus, List, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreateChoreDialog } from '@/components/chores/CreateChoreDialog';
import { ChoreCard } from '@/components/chores/ChoreCard';
import { ChoresProvider, useChores } from '@/hooks/useChores';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';

function ChoresContent() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { chores, loading } = useChores();

    if (loading) {
        return <div className="p-8 text-center">Loading chores...</div>;
    }

    const pendingChores = chores.filter(c => c.status === 'pending');
    const completedChores = chores.filter(c => c.status === 'completed');

    // Simple Weekly View Logic
    const today = new Date();
    const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 }); // Monday start
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startOfCurrentWeek, i));

    return (
        <div className="container mx-auto p-6 max-w-5xl space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Chores</h1>
                    <p className="text-muted-foreground">Manage household tasks and schedules.</p>
                </div>
                <Button onClick={() => setIsDialogOpen(true)} className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" /> Add Chore
                </Button>
            </div>

            <Tabs defaultValue="list" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="list" className="gap-2">
                        <List className="h-4 w-4" /> List View
                    </TabsTrigger>
                    <TabsTrigger value="calendar" className="gap-2">
                        <CalendarIcon className="h-4 w-4" /> Weekly View
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="space-y-8">
                    {/* Pending Chores */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            To Do <span className="text-sm font-normal text-muted-foreground">({pendingChores.length})</span>
                        </h2>
                        {pendingChores.length === 0 ? (
                            <div className="text-center py-12 border rounded-lg bg-muted/10 border-dashed">
                                <p className="text-muted-foreground">No chores pending. Great job!</p>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {pendingChores.map(chore => (
                                    <ChoreCard key={chore.id} chore={chore} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Completed Chores */}
                    {completedChores.length > 0 && (
                        <div className="space-y-4 pt-4">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                Completed <span className="text-sm font-normal text-muted-foreground">({completedChores.length})</span>
                            </h2>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {completedChores.map(chore => (
                                    <ChoreCard key={chore.id} chore={chore} />
                                ))}
                            </div>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="calendar">
                    <div className="grid grid-cols-1 md:grid-cols-7 gap-4 min-w-[800px] overflow-x-auto pb-4">
                        {weekDays.map((day) => {
                            const dayChores = chores.filter(c =>
                                c.due_date && isSameDay(c.due_date.toDate(), day)
                            );
                            const isToday = isSameDay(day, today);

                            return (
                                <div key={day.toISOString()} className={`space-y-3 min-w-[150px] ${isToday ? 'bg-accent/20 -mx-2 px-2 rounded-lg py-2' : 'py-2'}`}>
                                    <div className="text-sm font-medium mb-2 opacity-70">
                                        {format(day, 'EEE')} <span className="ml-1 opacity-50">{format(day, 'd')}</span>
                                    </div>
                                    {dayChores.length === 0 ? (
                                        <div className="h-24 border border-dashed rounded-md flex items-center justify-center text-xs text-muted-foreground bg-muted/5">
                                            No chores
                                        </div>
                                    ) : (
                                        dayChores.map(chore => (
                                            <ChoreCard key={chore.id} chore={chore} />
                                        ))
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <p className="text-xs text-muted-foreground text-center mt-4">Showing chores due this week.</p>
                </TabsContent>
            </Tabs>

            <CreateChoreDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
        </div>
    );
}

export default function Chores() {
    return (
        <ChoresContent />
    );
}
