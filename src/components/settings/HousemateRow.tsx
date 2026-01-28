import { User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface HousemateRowProps {
    name: string;
    email: string | null;
    role: string; // 'admin' | 'member'
    isCurrentUser: boolean;
    avatarUrl?: string; // Optional if we had one
}

export function HousemateRow({ name, role, isCurrentUser }: HousemateRowProps) {
    return (
        <div className="flex items-center justify-between p-4 border rounded-lg bg-card/50">
            <div className="flex items-center gap-4">
                <Avatar>
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${name}`} />
                    <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-medium flex items-center gap-2">
                        {name}
                        {isCurrentUser && <span className="text-xs text-muted-foreground">(You)</span>}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">{role}</p>
                </div>
            </div>
            {role === 'admin' && <Badge variant="secondary">Admin</Badge>}
        </div>
    );
}
