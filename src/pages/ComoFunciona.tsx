import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Target, MessageSquare, Clock8 } from "lucide-react";

const ComoFunciona = () => {
  const highlights = [
    {
      title: "Consultas e Leads",
      description:
        "A cada 5 leads obtidos em uma consulta via API consumimos 5 tokens. O consumo é proporcional ao total capturado no lote.",
      icon: Target,
      badge: "Consultas API"
    },
    {
      title: "Disparos",
      description:
        "Cada disparo enviado consome 1 token. Isso garante previsibilidade no custo das campanhas e mantém o histórico organizado.",
      icon: Zap,
      badge: "Envio de Mensagens"
    },
    {
      title: "Templates",
      description:
        "Toda vez que você gera ou utiliza um template personalizado descontamos 1 token. Otimize o conteúdo para aproveitar melhor seus créditos.",
      icon: MessageSquare,
      badge: "Conteúdo Personalizado"
    },
    {
      title: "Validade",
      description:
        "Os tokens têm validade de 2 meses a partir da data da recarga. Utilize-os dentro desse período para evitar expiração.",
      icon: Clock8,
      badge: "Regras de Expiração"
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
          Como Funcionam os Tokens
        </h1>
        <p className="text-muted-foreground text-lg">
          Entenda como calculamos o consumo de créditos em cada etapa da plataforma.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {highlights.map((item) => (
          <Card key={item.title} className="shadow-card border-0 bg-gradient-card hover:shadow-lg transition-all duration-300">
            <CardHeader className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
                  <item.icon className="h-6 w-6" />
                </div>
                <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">
                  {item.badge}
                </Badge>
              </div>
              <CardTitle className="text-2xl">{item.title}</CardTitle>
              <CardDescription className="text-base text-muted-foreground">{item.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card className="border-0 bg-gradient-hero shadow-card">
        <CardContent className="p-6 space-y-3 text-center">
          <h2 className="text-2xl font-semibold">Dica</h2>
          <p className="text-muted-foreground text-base">
            Planeje suas consultas e disparos pensando em blocos de leads para aproveitar cada token ao máximo.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComoFunciona;

