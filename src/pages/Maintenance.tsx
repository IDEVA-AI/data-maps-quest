import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";

const Maintenance = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <div className="mx-auto mb-2 w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-yellow-600" />
          </div>
          <CardTitle>Site em manutenção</CardTitle>
          <CardDescription>
            Sua conta está com acesso limitado. Para acesso completo, utilize um cupom no cadastro.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Se você ainda não possui um cupom, entre em contato com o suporte.
            </p>
            <div className="flex items-center justify-center gap-2">
              <Link to="/home">
                <Button variant="outline">Voltar à página inicial</Button>
              </Link>
              <Link to="/register">
                <Button>Fazer cadastro com cupom</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Maintenance;

