import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Rocket, Crown } from "lucide-react";
import { toast } from "sonner";

const Pricing = () => {
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

  const handlePurchase = (planName: string) => {
    toast.success(`Redirecionando para pagamento do plano ${planName}...`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Planos e Preços</h1>
        <p className="mt-2 text-muted-foreground">
          Escolha o plano ideal para suas necessidades
        </p>
      </div>

      {/* Info Banner */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm font-medium">
              Cada consulta consome <span className="font-bold text-primary">15 tokens</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Você recebeu 15 tokens grátis no cadastro para testar a plataforma
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Cards */}
      <div className="grid gap-8 md:grid-cols-3">
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <Card
              key={plan.name}
              className={`relative shadow-lg ${
                plan.popular ? "border-primary shadow-glow" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-primary border-0">
                    Mais Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="mt-4">{plan.name}</CardTitle>
                <CardDescription>
                  <div className="mt-2 text-3xl font-bold text-foreground">
                    R$ {plan.price.toFixed(2)}
                  </div>
                  <div className="mt-1 text-sm">
                    {plan.tokens} tokens
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 flex-shrink-0 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => handlePurchase(plan.name)}
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                >
                  Comprar Agora
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Perguntas Frequentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">Como funcionam os tokens?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Cada consulta na plataforma consome 15 tokens do seu saldo. Você pode
              comprar mais tokens a qualquer momento através dos nossos planos.
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Os tokens expiram?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Sim, cada plano tem um período de validade específico. Após esse período,
              os tokens não utilizados expiram.
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Posso cancelar minha assinatura?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Não trabalhamos com assinaturas. Você compra pacotes de tokens que são
              válidos pelo período especificado em cada plano.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Pricing;
