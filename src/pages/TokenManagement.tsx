import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Zap, Rocket, Crown, Download, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const TokenManagement = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const plans = [
    {
      name: "Starter",
      tokens: 100,
      price: 49.90,
      icon: Zap,
      popular: false,
      features: [
        "100 tokens",
        "~6 consultas",
        "Válido por 30 dias",
        "Suporte por email",
      ],
    },
    {
      name: "Professional",
      tokens: 500,
      price: 199.90,
      icon: Rocket,
      popular: true,
      features: [
        "500 tokens",
        "~33 consultas",
        "Válido por 90 dias",
        "Suporte prioritário",
        "Relatórios avançados",
      ],
    },
    {
      name: "Enterprise",
      tokens: 2000,
      price: 699.90,
      icon: Crown,
      popular: false,
      features: [
        "2000 tokens",
        "~133 consultas",
        "Válido por 1 ano",
        "Suporte 24/7",
        "Relatórios avançados",
        "API dedicada",
      ],
    },
  ];

  // Mock data - histórico de recargas
  const rechargeHistory = [
    { id: 1, date: "2024-03-15", tokens: 500, value: 199.90, plan: "Professional" },
    { id: 2, date: "2024-02-10", tokens: 100, value: 49.90, plan: "Starter" },
    { id: 3, date: "2024-01-20", tokens: 500, value: 199.90, plan: "Professional" },
  ];

  const userTokens = 15; // Mock - will be replaced with real data

  const handlePurchase = (planName: string) => {
    setSelectedPlan(planName);
    toast.success(`Redirecionando para pagamento do plano ${planName}...`);
  };

  const handleDownloadHistory = () => {
    toast.success("Download do histórico iniciado!");
  };

  return (
    <TooltipProvider>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
            Recargas
          </h1>
          <p className="text-lg text-muted-foreground">
            Gerencie seus tokens e acompanhe seu histórico de recargas
          </p>
        </div>

        {/* Token Balance - Small */}
        <Card className="border-0 bg-gradient-hero shadow-card">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">Saldo Atual de Tokens</p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Quantidade de tokens disponíveis para realizar consultas. Cada consulta consome 15 tokens.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                {userTokens} tokens
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Histórico de Recargas */}
        <Card className="shadow-card border-0 bg-gradient-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Histórico de Recargas</CardTitle>
                <CardDescription className="text-base mt-2">
                  Todas as suas compras de tokens
                </CardDescription>
              </div>
              <Button variant="outline" onClick={handleDownloadHistory}>
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead className="text-right">Tokens</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rechargeHistory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {new Date(item.date).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-primary/10 border-primary/20">
                        {item.plan}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {item.tokens} tokens
                    </TableCell>
                    <TableCell className="text-right font-semibold text-primary">
                      R$ {item.value.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Info Banner */}
        <Card className="border-0 bg-gradient-hero shadow-card">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-base font-semibold">
                Cada consulta consome <span className="font-bold text-primary text-lg">15 tokens</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Escolha o plano ideal para suas necessidades e aumente seu potencial de vendas
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Cards */}
        <div className="grid gap-8 md:grid-cols-3">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <Card
                key={plan.name}
                className={`relative shadow-card hover:shadow-xl transition-all duration-300 border-0 bg-gradient-card ${
                  plan.popular ? "ring-2 ring-primary shadow-glow scale-105" : ""
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-primary border-0 shadow-glow text-base px-4 py-1">
                      ⭐ Mais Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center space-y-4 pt-8">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
                    <Icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="space-y-2">
                    <div className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                      R$ {plan.price.toFixed(2)}
                    </div>
                    <div className="text-base font-medium text-muted-foreground">
                      {plan.tokens} tokens
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 px-8 pb-8">
                  <Button
                    onClick={() => handlePurchase(plan.name)}
                    className={`w-full h-12 text-base shadow-lg hover:shadow-glow transition-all ${
                      plan.popular ? "bg-gradient-primary" : ""
                    }`}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    Comprar Agora
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default TokenManagement;
