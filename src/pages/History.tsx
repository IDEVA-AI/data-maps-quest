import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Tag, TrendingUp, HelpCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer } from "recharts";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const History = () => {
  // Mock data - will be replaced with real data from backend
  const searches = [
    {
      id: 1,
      date: "2024-03-15",
      category: "Restaurante",
      location: "São Paulo, SP",
      resultsCount: 25,
      tokensUsed: 15,
    },
    {
      id: 2,
      date: "2024-03-14",
      category: "Academia",
      location: "Rio de Janeiro, RJ",
      resultsCount: 18,
      tokensUsed: 15,
    },
    {
      id: 3,
      date: "2024-03-13",
      category: "Farmácia",
      location: "Belo Horizonte, MG",
      resultsCount: 32,
      tokensUsed: 15,
    },
  ];

  // Mock data - consumo dos últimos 30 dias
  const consumptionData = [
    { date: "01/03", tokens: 45 },
    { date: "05/03", tokens: 60 },
    { date: "10/03", tokens: 30 },
    { date: "15/03", tokens: 75 },
    { date: "20/03", tokens: 50 },
    { date: "25/03", tokens: 90 },
    { date: "30/03", tokens: 40 },
  ];

  return (
    <TooltipProvider>
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
          Histórico de Consumo
        </h1>
        <p className="text-muted-foreground text-lg">
          Acompanhe o uso de tokens nas suas consultas
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-card border-0 bg-gradient-card hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-3">
            <CardDescription className="text-base">Total de Consultas</CardDescription>
            <CardTitle className="text-4xl bg-gradient-primary bg-clip-text text-transparent">
              {searches.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-card border-0 bg-gradient-card hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CardDescription className="text-base">Tokens Utilizados</CardDescription>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Total de tokens consumidos em todas as consultas realizadas. Cada consulta utiliza 15 tokens.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <CardTitle className="text-4xl bg-gradient-primary bg-clip-text text-transparent">
              {searches.reduce((acc, s) => acc + s.tokensUsed, 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-card border-0 bg-gradient-card hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-3">
            <CardDescription className="text-base">Total de Resultados</CardDescription>
            <CardTitle className="text-4xl bg-gradient-primary bg-clip-text text-transparent">
              {searches.reduce((acc, s) => acc + s.resultsCount, 0)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Análise de Consumo */}
      <Card className="shadow-card border-0 bg-gradient-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
              <TrendingUp className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl">Consumo de Tokens - Últimos 30 Dias</CardTitle>
              <CardDescription className="text-base mt-1">
                Acompanhe seu uso diário de tokens
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={consumptionData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-sm"
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis 
                  className="text-sm"
                  stroke="hsl(var(--muted-foreground))"
                />
                <ChartTooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="tokens"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Resumidas */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-card border-0 bg-gradient-card">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Consumido (30 dias)</p>
              <p className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                390 tokens
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-0 bg-gradient-card">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Média Diária</p>
              <p className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                13 tokens
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-0 bg-gradient-card">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Pico de Consumo</p>
              <p className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                90 tokens
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Consultas Realizadas</h2>
        {searches.map((search) => (
          <Card key={search.id} className="shadow-card hover:shadow-lg transition-all duration-300 border-0 bg-gradient-card">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="outline" className="gap-1 border-primary/20 bg-primary/5">
                    <Tag className="h-3 w-3" />
                    {search.category}
                  </Badge>
                  <Badge variant="outline" className="gap-1 border-accent/20 bg-accent/5">
                    <MapPin className="h-3 w-3" />
                    {search.location}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(search.date).toLocaleDateString("pt-BR")}
                  </div>
                  <div>
                    {search.resultsCount} resultados encontrados
                  </div>
                  <div className="font-bold text-primary">
                    -{search.tokensUsed} tokens
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      </div>
    </TooltipProvider>
  );
};

export default History;
