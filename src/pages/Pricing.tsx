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
    <div className="space-y-12 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
          Planos e Preços
        </h1>
        <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
          Escolha o plano ideal para suas necessidades e potencialize suas vendas
        </p>
      </div>

      {/* Info Banner */}
      <Card className="border-0 bg-gradient-hero shadow-card">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <p className="text-base font-semibold">
              Cada consulta consome <span className="font-bold text-primary text-lg">15 tokens</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Você recebeu 15 tokens grátis no cadastro para testar a plataforma 🎉
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
              <CardContent className="space-y-6 px-8">
                <ul className="space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                        <Check className="h-4 w-4 text-primary font-bold" />
                      </div>
                      <span className="text-sm font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="px-8 pb-8">
                <Button
                  onClick={() => handlePurchase(plan.name)}
                  className={`w-full h-12 text-base shadow-lg hover:shadow-glow transition-all ${
                    plan.popular ? "bg-gradient-primary" : ""
                  }`}
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
      <Card className="shadow-card border-0 bg-gradient-card">
        <CardHeader>
          <CardTitle className="text-3xl">Perguntas Frequentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Como funcionam os tokens?</h3>
            <p className="text-base text-muted-foreground leading-relaxed">
              Cada consulta na plataforma consome 15 tokens do seu saldo. Você pode
              comprar mais tokens a qualquer momento através dos nossos planos.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Os tokens expiram?</h3>
            <p className="text-base text-muted-foreground leading-relaxed">
              Sim, cada plano tem um período de validade específico. Após esse período,
              os tokens não utilizados expiram.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Posso cancelar minha assinatura?</h3>
            <p className="text-base text-muted-foreground leading-relaxed">
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
