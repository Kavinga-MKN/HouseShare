import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';

interface AppLayoutProps {
  children: ReactNode;
}

import { ChoresProvider } from '@/hooks/useChores';
import { ExpensesProvider } from '@/hooks/useExpenses';
import { AnnouncementsProvider } from '@/hooks/useAnnouncements';

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <ChoresProvider>
        <ExpensesProvider>
          <AnnouncementsProvider>
            <div className="min-h-screen flex w-full">
              <AppSidebar />
              <SidebarInset className="flex-1">
                <header className="h-14 flex items-center border-b bg-background px-4 gap-4">
                  <SidebarTrigger />
                </header>
                <main className="flex-1 overflow-auto">
                  {children}
                </main>
              </SidebarInset>
            </div>
          </AnnouncementsProvider>
        </ExpensesProvider>
      </ChoresProvider>
    </SidebarProvider>
  );
}
