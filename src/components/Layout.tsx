import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/contexts/AuthContext";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user } = useAuth();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-subtle">
        <AppSidebar />
        <main className="flex-1">
          <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-card/80 backdrop-blur-sm px-6">
            <SidebarTrigger />
            <div className="flex-1">
              <h2 className="text-sm font-medium text-muted-foreground">
                {user ? `Bem-vindo, ${user.nome}` : 'Bem-vindo ao Lead Radar'}
              </h2>
            </div>
          </header>
          <div className="container mx-auto p-6 md:p-8 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
