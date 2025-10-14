import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Database, History, CreditCard, LogOut, Search } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const isAuthenticated = true; // Mock - will be replaced with real auth
  const userTokens = 15; // Mock - will be replaced with real data

  const navigation = [
    { name: "Consultas", href: "/", icon: Search },
    { name: "Histórico", href: "/history", icon: History },
    { name: "Planos", href: "/pricing", icon: CreditCard },
  ];

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-2 border-b border-border px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
              <Database className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">Maps Data</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Token Balance */}
          <div className="border-t border-border p-4">
            <div className="rounded-lg bg-gradient-primary p-4 text-primary-foreground">
              <p className="text-sm font-medium opacity-90">Saldo de Tokens</p>
              <p className="mt-1 text-3xl font-bold">{userTokens}</p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-3 w-full"
                asChild
              >
                <Link to="/pricing">Comprar Mais</Link>
              </Button>
            </div>
          </div>

          {/* User Section */}
          <div className="border-t border-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                  U
                </div>
                <div className="text-sm">
                  <p className="font-medium">Usuário</p>
                  <p className="text-xs text-muted-foreground">user@email.com</p>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pl-64">
        <div className="mx-auto max-w-7xl p-8">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
