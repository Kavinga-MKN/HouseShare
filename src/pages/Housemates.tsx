import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useHouse } from '@/hooks/useHouse';
import { HousemateRow } from '@/components/settings/HousemateRow';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function Housemates() {
    const { profile, user } = useAuth();
    const { getHousemates } = useHouse();
    const [housemates, setHousemates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            if (profile?.current_house_id) {
                const members = await getHousemates(profile.current_house_id);
                setHousemates(members);
            }
            setLoading(false);
        };
        loadData();
    }, [profile?.current_house_id]);

    if (loading) return <div className="p-8 text-center">Loading housemates...</div>;

    return (
        <div className="container mx-auto p-6 max-w-3xl space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Housemates</h1>
                    <p className="text-muted-foreground">Who you are living with.</p>
                </div>
                <Button onClick={() => navigate('/settings')} variant="outline">
                    Invite New Member
                </Button>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Members ({housemates.length})
                        </CardTitle>
                        <CardDescription>People currently in this house.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {housemates.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No other housemates found. Invite some in Settings!
                            </div>
                        ) : (
                            housemates.map((mate) => (
                                <HousemateRow
                                    key={mate.id}
                                    name={mate.full_name || 'Unknown'}
                                    role={mate.id === user?.uid ? 'You' : 'Member'}
                                    isCurrentUser={mate.id === user?.uid}
                                    email={mate.email}
                                />
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
