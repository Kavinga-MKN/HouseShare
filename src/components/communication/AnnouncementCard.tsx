import { format } from 'date-fns';
import { AlertCircle, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Announcement } from '@/hooks/useAnnouncements';

interface AnnouncementCardProps {
    announcement: Announcement;
}

export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
    const isUrgent = announcement.priority === 'urgent';

    return (
        <Card className={isUrgent ? 'border-destructive/50' : ''}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-base font-medium leading-none flex items-center gap-2">
                        {isUrgent && <AlertCircle className="h-4 w-4 text-destructive" />}
                        {announcement.title}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                        {announcement.created_at ? format(announcement.created_at.toDate(), 'PPP p') : 'Just now'}
                    </p>
                </div>
                {isUrgent && (
                    <Badge variant="destructive" className="ml-auto">Urgent</Badge>
                )}
            </CardHeader>
            <CardContent>
                <p className="text-sm">{announcement.content}</p>
            </CardContent>
        </Card>
    );
}
