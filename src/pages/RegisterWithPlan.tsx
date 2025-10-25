import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Radar, Gift, Check, Zap, Rocket, Crown, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRateLimit } from "@/hooks/useRateLimit";
import { useAuth } from "@/contexts/AuthContext";

const RegisterWithPlan = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { isInCooldown, remainingTime, startCooldown } = useRateLimit(60);

  const plans = [
    {
      id: "starter",
      name: "Starter",
      tokens: 100,
      price: 49.90,
      icon: Zap,
      features: ["100 tokens", "~6 consultas", "Válido por 30 dias"],
    },
    {
      id: "professional",
      name: "Professional",
      tokens: 500,
      price: 199.90,
      icon: Rocket,
      popular: true,
      features: ["500 tokens", "~33 consultas", "Válido por 90 dias", "Suporte prioritário"],
    },
    {
      id: "enterprise",
      name: "Enterprise",
      tokens: 2000,
      price: 699.90,
      icon: Crown,
      features: ["2000 tokens", "~133 consultas", "Válido por 1 ano", "Suporte 24/7"],
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem!");
      return;
    }

    if (!selectedPlan) {
      toast.error("Por favor, selecione um plano!");
      return;
    }

    try {
      // Mock registration - will be replaced with real authentication
      toast.success("Conta criada com sucesso! Redirecionando para pagamento...");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error: any) {
      if (error.message && error.message.includes("aguardar 60 segundos")) {
        startCooldown(60);
      }
      toast.error(error.message || "Erro ao criar conta. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-4">
      <div className="container mx-auto py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
              <Radar className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">Lead Radar</span>
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
            Crie sua Conta
          </h1>
          <p className="text-lg text-muted-foreground">
            Escolha seu plano e comece a gerar leads agora mesmo
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Formulário de Cadastro */}
          <Card className="shadow-xl border-0 bg-gradient-card h-fit">
            <CardHeader className="space-y-4">
              <div className="space-y-2">
                <CardTitle className="text-2xl">Dados da Conta</CardTitle>
                <CardDescription className="text-base">
                  Preencha seus dados para criar sua conta
                </CardDescription>
              </div>
              
              {/* Free Tokens Banner */}
              <div className="flex items-center gap-3 rounded-xl border-0 bg-gradient-hero p-4 shadow-card">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary shadow-glow">
                  <Gift className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="text-sm">
                  <p className="font-semibold">Bônus de Boas-vindas</p>
                  <p className="text-muted-foreground">15 tokens grátis no cadastro 🎉</p>
                </div>
              </div>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-base">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-base">Confirmar Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-11"
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-11 shadow-lg hover:shadow-glow transition-all text-base"
                  disabled={!selectedPlan || isInCooldown}
                >
                  {isInCooldown ? (
                    <>
                      <Clock className="mr-2 h-4 w-4" />
                      Aguarde {remainingTime}s
                    </>
                  ) : selectedPlan ? (
                    "Criar Conta e Pagar"
                  ) : (
                    "Selecione um Plano"
                  )}
                </Button>
                
                {isInCooldown && (
                  <div className="text-center text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                    <Clock className="inline mr-1 h-4 w-4" />
                    Por segurança, aguarde {remainingTime} segundos antes de tentar novamente.
                  </div>
                )}
                
                <p className="text-center text-sm text-muted-foreground">
                  Já tem uma conta?{" "}
                  <Link to="/login" className="font-semibold text-primary hover:underline">
                    Faça login
                  </Link>
                </p>
              </CardContent>
            </form>
          </Card>

          {/* Seleção de Planos */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Escolha seu Plano</h2>
              <p className="text-muted-foreground">
                Selecione o plano que melhor atende suas necessidades
              </p>
            </div>

            {plans.map((plan) => {
              const Icon = plan.icon;
              const isSelected = selectedPlan === plan.id;
              
              return (
                <Card
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`cursor-pointer shadow-card hover:shadow-xl transition-all duration-300 border-0 bg-gradient-card ${
                    isSelected ? "ring-2 ring-primary shadow-glow scale-105" : ""
                  } ${plan.popular ? "relative" : ""}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 right-4">
                      <Badge className="bg-gradient-primary border-0 shadow-glow px-3 py-1">
                        ⭐ Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardContent className="pt-6 pb-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow flex-shrink-0">
                        <Icon className="h-6 w-6 text-primary-foreground" />
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="text-xl font-bold">{plan.name}</h3>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                              R$ {plan.price.toFixed(2)}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              / {plan.tokens} tokens
                            </span>
                          </div>
                        </div>
                        
                        <ul className="space-y-2">
                          {plan.features.map((feature) => (
                            <li key={feature} className="flex items-center gap-2 text-sm">
                              <Check className="h-4 w-4 text-primary flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {isSelected && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary flex-shrink-0">
                          <Check className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterWithPlan;
