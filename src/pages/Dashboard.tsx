import { useAuth } from '@/hooks/useAuth';
import { Home, DollarSign, ClipboardList, Bell, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Dashboard() {
  const { profile } = useAuth();

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
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">No chores assigned yet</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">You Owe</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">$0.00</div>
            <p className="text-xs text-muted-foreground">All settled up!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Owed to You</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground">No outstanding debts</p>
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              Upcoming Chores
            </CardTitle>
            <CardDescription>Your next assigned tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <ClipboardList className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-center">No chores scheduled yet.</p>
              <p className="text-sm text-center mt-1">Set up your chore rotation to get started!</p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Expenses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Recent Expenses
            </CardTitle>
            <CardDescription>Latest shared expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <DollarSign className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-center">No expenses recorded yet.</p>
              <p className="text-sm text-center mt-1">Add your first shared expense!</p>
            </div>
          </CardContent>
        </Card>

        {/* Announcements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Announcements
            </CardTitle>
            <CardDescription>House updates & news</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-center">No announcements yet.</p>
              <p className="text-sm text-center mt-1">Stay tuned for house updates!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
