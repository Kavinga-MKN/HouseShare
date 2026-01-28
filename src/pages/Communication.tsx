import { useState, useEffect } from 'react';
import { Megaphone, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnnouncementCard } from '@/components/communication/AnnouncementCard';
import { CreateAnnouncementDialog } from '@/components/communication/CreateAnnouncementDialog';
import { AnnouncementsProvider, useAnnouncements } from '@/hooks/useAnnouncements';
import { useHouse } from '@/hooks/useHouse';
import { useAuth } from '@/hooks/useAuth';

function CommunicationContent() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { announcements, loading } = useAnnouncements();
    const { getMemberRole } = useHouse();
    const { profile, user } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        if (profile?.current_house_id && user) {
            getMemberRole(profile.current_house_id, user.uid).then(role => {
                setIsAdmin(role === 'admin');
            });
        }
    }, [profile?.current_house_id, user]);

    if (loading) {
        return <div className="p-8 text-center">Loading announcements...</div>;
    }

    return (
        <div className="container mx-auto p-6 max-w-3xl space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
                    <p className="text-muted-foreground">House updates, news, and important notices.</p>
                </div>

                {isAdmin && (
                    <Button onClick={() => setIsDialogOpen(true)} className="w-full sm:w-auto">
                        <Megaphone className="mr-2 h-4 w-4" /> Post Announcement
                    </Button>
                )}
            </div>

            <div className="space-y-4">
                {announcements.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
                        <Bell className="h-12 w-12 mb-4 opacity-20" />
                        <p className="text-lg font-medium">Quiet house!</p>
                        <p className="text-sm">No announcements have been posted yet.</p>
                    </div>
                ) : (
                    announcements.map((announcement) => (
                        <AnnouncementCard key={announcement.id} announcement={announcement} />
                    ))
                )}
            </div>

            <CreateAnnouncementDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
        </div >
    );
}

export default function Communication() {
    return (
        <CommunicationContent />
    );
}
