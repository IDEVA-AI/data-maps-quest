import { ReactNode, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (user && user.id_usuario) {
      const stored = localStorage.getItem(`theme:${user.id_usuario}`);
      if (stored === "dark" || stored === "light") {
        setTheme(stored);
      }
    }
  }, [user, setTheme]);

  useEffect(() => {
    if (user && user.id_usuario && (theme === "dark" || theme === "light")) {
      localStorage.setItem(`theme:${user.id_usuario}`, theme);
    }
  }, [user, theme]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-subtle">
        <AppSidebar />
        <main className="flex-1">
          <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-card/80 backdrop-blur-sm px-6">
            <SidebarTrigger />
            <div className="flex-1">
              <h2 className="text-sm font-medium text-black dark:text-white">
                {user ? `Bem-vindo, ${user.nome}` : 'Bem-vindo ao Lead Radar'}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full">
                    {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setTheme("light")}>Claro</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>Escuro</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
