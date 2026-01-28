import { Check, Clock, User as UserIcon, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { Chore, useChores } from '@/hooks/useChores';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface ChoreCardProps {
    chore: Chore;
}

export function ChoreCard({ chore }: ChoreCardProps) {
    const { toggleChoreStatus } = useChores();
    const { user } = useAuth();

    const isCompleted = chore.status === 'completed';
    const isAssignedToMe = chore.assigned_to === user?.uid;

    const handleToggle = () => {
        toggleChoreStatus(chore.id, chore.status);
    };

    return (
        <Card className={cn(
            "transition-all duration-200",
            isCompleted ? "opacity-60 bg-muted/50" : "hover:border-primary/50"
        )}>
            <CardContent className="p-4 pt-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                        <h3 className={cn(
                            "font-semibold leading-none tracking-tight",
                            isCompleted && "line-through text-muted-foreground"
                        )}>
                            {chore.title}
                        </h3>
                        {chore.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                                {chore.description}
                            </p>
                        )}

                        <div className="flex items-center gap-3 pt-2 text-xs text-muted-foreground">
                            {chore.due_date && (
                                <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{format(chore.due_date.toDate(), 'MMM d')}</span>
                                </div>
                            )}
                            {chore.is_rotating && (
                                <div className="flex items-center gap-1 text-primary">
                                    <RefreshCw className="h-3 w-3" />
                                    <span>Weekly</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex-shrink-0">
                        {/* Placeholder for fetching assignee details, for now just show icon */}
                        <Avatar className="h-8 w-8 border">
                            <AvatarFallback>
                                <UserIcon className="h-4 w-4" />
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-end">
                <Button
                    variant={isCompleted ? "outline" : "default"}
                    size="sm"
                    onClick={handleToggle}
                    className={cn(
                        "gap-2",
                        isCompleted && "text-muted-foreground"
                    )}
                >
                    {isCompleted ? (
                        <>
                            <Check className="h-4 w-4" /> Completed
                        </>
                    ) : (
                        "Mark Complete"
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}
