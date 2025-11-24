import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Search, History, CreditCard, Radar, Send, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { tokenService } from "@/services/tokenService";

const items = [
  { title: "Consultas", url: "/consulta", icon: Search },
  { title: "Disparo", url: "/disparo", icon: Send },
  { title: "Histórico", url: "/history", icon: History },
  { title: "Recargas", url: "/tokens", icon: CreditCard },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [userTokens, setUserTokens] = useState<number>(0);
  const currentPath = location.pathname;
  useEffect(() => {
    const load = async () => {
      if (user) {
        const resp = await tokenService.getBalance(user.id_usuario)
        if (resp.success && resp.data) setUserTokens(resp.data.tokens)
      }
    }
    load()
  }, [user])

  const isActive = (path: string) => currentPath === path;
  const getNavCls = (active: boolean) =>
    active
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
      : "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground";

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sidebar className="border-sidebar-border">
      <SidebarContent>
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
            <Radar className="h-5 w-5 text-primary-foreground" />
          </div>
          {state === "expanded" && (
            <span className="text-lg font-bold text-sidebar-foreground">Lead Radar</span>
          )}
        </div>

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={getNavCls(isActive(item.url))}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with Token Balance */}
      <SidebarFooter>
        {state === "expanded" ? (
          <div className="space-y-4 p-4">
            {/* Token Balance Card */}
            <div className="rounded-lg bg-gradient-primary p-4 text-primary-foreground shadow-glow">
              <p className="text-xs font-medium opacity-90">Saldo de Tokens</p>
              <p className="mt-1 text-3xl font-bold">{userTokens}</p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-3 w-full"
                asChild
              >
                <Link to="/tokens">Comprar Mais</Link>
              </Button>
            </div>

            {/* User Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-3 rounded-lg border border-sidebar-border p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary text-sm font-bold text-primary-foreground">
                  {user ? getUserInitials(user.nome) : 'U'}
                </div>
                <div className="flex-1 text-sm">
                  <p className="font-medium text-sidebar-foreground">
                    {user ? user.nome : 'Usuário'}
                  </p>
                  <p className="text-xs text-sidebar-foreground/70">
                    {user ? user.email : 'user@email.com'}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                className="w-full bg-primary text-primary-foreground hover:bg-white hover:text-primary border border-primary transition-colors"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 p-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary text-xs font-bold text-primary-foreground">
              {userTokens}
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-primary text-xs font-bold text-primary-foreground">
              {user ? getUserInitials(user.nome) : 'U'}
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
