import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface InviteCardProps {
    inviteCode: string;
}

export function InviteCard({ inviteCode }: InviteCardProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(inviteCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Invite Housemates</CardTitle>
                <CardDescription>
                    Share this code with people you want to join your house.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
                <div className="relative flex-1">
                    <Input
                        value={inviteCode}
                        readOnly
                        className="font-mono text-lg tracking-wider text-center bg-muted"
                    />
                </div>
                <Button onClick={handleCopy} variant="outline" className="w-24 shrink-0">
                    {copied ? (
                        <>
                            <Check className="mr-2 h-4 w-4 text-green-500" />
                            Copied
                        </>
                    ) : (
                        <>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
