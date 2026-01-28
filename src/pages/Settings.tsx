import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, LogOut, Save, Users, Home } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

import { useAuth } from '@/hooks/useAuth';
import { useHouse } from '@/hooks/useHouse';
import { InviteCard } from '@/components/settings/InviteCard';
import { HousemateRow } from '@/components/settings/HousemateRow';

const updateHouseSchema = z.object({
    name: z.string().min(2, 'House name must be at least 2 characters').max(50),
});

export default function Settings() {
    const { profile, user } = useAuth();
    const { getHousemates, getHouseDetails, getMemberRole, updateHouseName, leaveHouse } = useHouse();
    const { toast } = useToast();
    const navigate = useNavigate();

    const [housemates, setHousemates] = useState<any[]>([]);
    const [houseDetails, setHouseDetails] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    const form = useForm({
        resolver: zodResolver(updateHouseSchema),
        defaultValues: {
            name: '',
        },
    });

    useEffect(() => {
        const loadData = async () => {
            if (profile?.current_house_id) {
                const members = await getHousemates(profile.current_house_id);
                setHousemates(members);

                const house = await getHouseDetails(profile.current_house_id);
                if (house) {
                    setHouseDetails(house);
                    if (!form.getValues().name) {
                        form.setValue('name', house.name);
                    }
                }

                if (user) {
                    const role = await getMemberRole(profile.current_house_id, user.uid);
                    setIsAdmin(role === 'admin');
                }
            }
            setLoading(false);
        };
        loadData();
    }, [profile?.current_house_id, user]);

    const onUpdateHouse = async (values: z.infer<typeof updateHouseSchema>) => {
        if (!isAdmin) return;
        if (!profile?.current_house_id) return;
        setIsUpdating(true);
        try {
            await updateHouseName(profile.current_house_id, values.name);
            toast({ title: "House updated", description: "New name saved successfully." });
        } catch (error: any) {
            console.error("Update failed:", error);
            toast({
                title: "Error",
                description: error?.message || "Failed to update house name.",
                variant: "destructive"
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const onLeaveHouse = async () => {
        try {
            await leaveHouse();
            toast({ title: "Left House", description: "You have successfully left the house." });
            navigate('/house-selection'); // Redirect to selection
        } catch (error) {
            toast({ title: "Error", description: "Failed to leave house.", variant: "destructive" });
        }
    };

    if (loading) return <div className="p-8 text-center">Loading settings...</div>;

    return (
        <div className="container mx-auto p-6 max-w-4xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your house details and members.</p>
            </div>

            <div className="grid gap-6">
                {/* House Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>House Details</CardTitle>
                        <CardDescription>Update your house information.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onUpdateHouse)} className="flex w-full items-end gap-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>House Name {isAdmin ? '' : '(Admin Only)'}</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter house name" {...field} disabled={!isAdmin} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {isAdmin && (
                                    <Button type="submit" disabled={isUpdating}>
                                        {isUpdating ? <Save className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                        Save
                                    </Button>
                                )}
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                {/* Invite Code */}
                {/* Invite Code */}
                {houseDetails && <InviteCard inviteCode={houseDetails.invite_code} />}

                {/* Housemates List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Housemates ({housemates.length})
                        </CardTitle>
                        <CardDescription>People currently in this house.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {housemates.map((mate) => (
                            <HousemateRow
                                key={mate.id}
                                name={mate.full_name || 'Unknown'}
                                role={mate.id === user?.uid ? 'You' : 'Member'} // Simplified role
                                isCurrentUser={mate.id === user?.uid}
                                email={null}
                            />
                        ))}
                    </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-destructive/50 bg-destructive/5">
                    <CardHeader>
                        <CardTitle className="text-destructive">Danger Zone</CardTitle>
                        <CardDescription>Irreversible actions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Leave House
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will remove you from the house. You won't be able to see chores or expenses anymore unless you rejoin with an invite code.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={onLeaveHouse} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                        Yes, Leave House
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
