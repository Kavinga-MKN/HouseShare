
import { useAuth } from '@/hooks/useAuth';
import { useChores } from '@/hooks/useChores';
import { useExpenses } from '@/hooks/useExpenses';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { Home, DollarSign, ClipboardList, Bell, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format, isToday, isTomorrow } from 'date-fns';

export default function Dashboard() {
  const { profile, user } = useAuth();
  const { chores } = useChores();
  const { expenses, balances } = useExpenses();
  const { announcements } = useAnnouncements();

  // Chores Logic
  const pendingChores = chores.filter(c => c.status === 'pending');
  // Sort by due date (ascending)
  const upcomingChores = [...pendingChores].sort((a, b) => {
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return a.due_date.toDate().getTime() - b.due_date.toDate().getTime();
  }).slice(0, 3); // Take top 3

  // Expenses Logic
  const myBalance = user ? (balances[user.uid] || 0) : 0;
  const isOwed = myBalance > 0;
  const balanceText = myBalance === 0
    ? "$0.00"
    : `$${Math.abs(myBalance).toFixed(2)}`;

  const recentExpenses = [...expenses].sort((a, b) => { // Sort descending
    if (!a.date) return 1;
    if (!b.date) return -1;
    return b.date.toDate().getTime() - a.date.toDate().getTime();
  }).slice(0, 3);

  // Announcements Logic
  const latestAnnouncement = announcements.length > 0 ? announcements[0] : null;

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {profile?.full_name?.split(' ')[0] || 'Roommate'}!</h1>
        <p className="text-muted-foreground mt-1">Here's what's happening in your house today.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Chores</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingChores.length}</div>
            <p className="text-xs text-muted-foreground">
              {pendingChores.length === 0 ? "All caught up!" : "Tasks waiting for you"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">You Owe</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${!isOwed && myBalance !== 0 ? 'text-destructive' : ''}`}>
              {!isOwed && myBalance !== 0 ? balanceText : "$0.00"}
            </div>
            <p className="text-xs text-muted-foreground">
              {!isOwed && myBalance !== 0 ? "Outstanding debt" : "All settled up!"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Owed to You</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isOwed ? 'text-success' : ''}`}>
              {isOwed ? balanceText : "$0.00"}
            </div>
            <p className="text-xs text-muted-foreground">
              {isOwed ? "To be collected" : "No outstanding debts"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Housemates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">Just you for now</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Upcoming Chores */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              Upcoming Chores
            </CardTitle>
            <CardDescription>Your next assigned tasks</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingChores.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-10 w-10 mb-3 opacity-20" />
                <p className="text-center font-medium">No chores pending</p>
                <p className="text-xs text-center mt-1">Great job keeping the house clean!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingChores.map(chore => (
                  <div key={chore.id} className="flex items-start justify-between border-b pb-3 last:border-0 last:pb-0">
                    <div className="space-y-1">
                      <p className="font-medium text-sm leading-none">{chore.title}</p>
                      {chore.due_date && (
                        <p className="text-xs text-muted-foreground">
                          Due: {
                            isToday(chore.due_date.toDate()) ? 'Today' :
                              isTomorrow(chore.due_date.toDate()) ? 'Tomorrow' :
                                format(chore.due_date.toDate(), 'MMM d')
                          }
                        </p>
                      )}
                    </div>
                    {chore.is_rotating && (
                      <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground font-medium">
                        Rotating
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Expenses */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Recent Expenses
            </CardTitle>
            <CardDescription>Latest shared expenses</CardDescription>
          </CardHeader>
          <CardContent>
            {recentExpenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <DollarSign className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-center">No expenses recorded yet.</p>
                <p className="text-sm text-center mt-1">Add your first shared expense!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentExpenses.map((expense) => {
                  const isPayer = expense.paid_by === user?.uid;
                  return (
                    <div key={expense.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium text-sm leading-none">{expense.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {isPayer ? 'You paid' : 'Someone paid'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-sm block">${expense.amount.toFixed(2)}</span>
                        <span className={`text-[10px] ${isPayer ? 'text-success' : 'text-destructive'}`}>
                          {isPayer ? '+Lent' : '-Borrowed'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Announcements */}
        <Card className="col-span-1 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Announcements
            </CardTitle>
            <CardDescription>House updates & news</CardDescription>
          </CardHeader>
          <CardContent>
            {latestAnnouncement ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    {latestAnnouncement.priority === 'urgent' && <AlertCircle className="h-3 w-3 text-destructive" />}
                    {latestAnnouncement.title}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {latestAnnouncement.created_at ? format(latestAnnouncement.created_at.toDate(), 'MMM d') : 'Now'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-3">
                  {latestAnnouncement.content}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-center">No announcements yet.</p>
                <p className="text-sm text-center mt-1">Stay tuned for house updates!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
