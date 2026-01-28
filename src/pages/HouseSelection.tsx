import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Home, Plus, KeyRound, Loader2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useHouse } from '@/hooks/useHouse';
import { useToast } from '@/hooks/use-toast';

const createHouseSchema = z.object({
  name: z.string().trim().min(2, 'House name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
});

const joinHouseSchema = z.object({
  inviteCode: z.string().trim().length(6, 'Invite code must be 6 digits'),
});

export default function HouseSelection() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);

  // Create house form state
  const [houseName, setHouseName] = useState('');
  const [houseDescription, setHouseDescription] = useState('');
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});

  // Join house form state
  const [inviteCode, setInviteCode] = useState('');
  const [joinErrors, setJoinErrors] = useState<Record<string, string>>({});

  const { profile, signOut } = useAuth();
  const { createHouse, joinHouse, loading, error } = useHouse();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCreateHouse = async () => {
    setCreateErrors({});

    const result = createHouseSchema.safeParse({ name: houseName, description: houseDescription });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        fieldErrors[field] = err.message;
      });
      setCreateErrors(fieldErrors);
      return;
    }

    const { house, error: actionError } = await createHouse(houseName, houseDescription);

    if (house) {
      toast({
        title: 'House created!',
        description: `Welcome to ${house.name}. Your invite code is: ${house.invite_code}`,
      });
      setShowCreateDialog(false);
      navigate('/dashboard');
    } else if (actionError) {
      toast({
        title: 'Failed to create house',
        description: actionError,
        variant: 'destructive',
      });
    }
  };

  const handleJoinHouse = async () => {
    setJoinErrors({});

    const result = joinHouseSchema.safeParse({ inviteCode });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        fieldErrors[field] = err.message;
      });
      setJoinErrors(fieldErrors);
      return;
    }

    const { house, error: actionError } = await joinHouse(inviteCode);

    if (house) {
      toast({
        title: 'Joined house!',
        description: `Welcome to ${house.name}!`,
      });
      setShowJoinDialog(false);
      navigate('/dashboard');
    } else if (actionError) {
      toast({
        title: 'Failed to join house',
        description: actionError,
        variant: 'destructive',
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Home className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">HouseShare</span>
          </div>
          <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Welcome, {profile?.full_name || 'Roommate'}!</h1>
          <p className="text-muted-foreground text-lg">
            To get started, create a new house or join an existing one with an invite code.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Create House Card */}
          <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setShowCreateDialog(true)}>
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-success/10 rounded-full">
                  <Plus className="h-10 w-10 text-success" />
                </div>
              </div>
              <CardTitle className="text-xl">Create a New House</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-base">
                Start fresh with your own house. You'll get an invite code to share with your roommates.
              </CardDescription>
            </CardContent>
            <CardFooter className="justify-center pt-0">
              <Button className="bg-success hover:bg-success/90">
                <Plus className="mr-2 h-4 w-4" />
                Create House
              </Button>
            </CardFooter>
          </Card>

          {/* Join House Card */}
          <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setShowJoinDialog(true)}>
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <KeyRound className="h-10 w-10 text-primary" />
                </div>
              </div>
              <CardTitle className="text-xl">Join with Invite Code</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-base">
                Have an invite code from your roommate? Enter it here to join their house.
              </CardDescription>
            </CardContent>
            <CardFooter className="justify-center pt-0">
              <Button>
                <KeyRound className="mr-2 h-4 w-4" />
                Enter Code
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>

      {/* Create House Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a New House</DialogTitle>
            <DialogDescription>
              Give your house a name. You can add more details later.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="houseName">House Name *</Label>
              <Input
                id="houseName"
                placeholder="e.g., The Beach House"
                value={houseName}
                onChange={(e) => setHouseName(e.target.value)}
                disabled={loading}
              />
              {createErrors.name && (
                <p className="text-sm text-destructive">{createErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="houseDescription">Description (optional)</Label>
              <Textarea
                id="houseDescription"
                placeholder="A brief description of your house..."
                value={houseDescription}
                onChange={(e) => setHouseDescription(e.target.value)}
                disabled={loading}
                rows={3}
              />
              {createErrors.description && (
                <p className="text-sm text-destructive">{createErrors.description}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleCreateHouse} disabled={loading} className="bg-success hover:bg-success/90">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create House'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Join House Dialog */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join a House</DialogTitle>
            <DialogDescription>
              Enter the 6-digit invite code shared by your roommate.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="inviteCode">Invite Code</Label>
              <Input
                id="inviteCode"
                placeholder="000000"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                disabled={loading}
                maxLength={6}
                className="text-center text-2xl tracking-widest font-mono"
              />
              {joinErrors.inviteCode && (
                <p className="text-sm text-destructive">{joinErrors.inviteCode}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowJoinDialog(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleJoinHouse} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Joining...
                </>
              ) : (
                'Join House'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
