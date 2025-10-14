import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Tag } from "lucide-react";

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


  return (
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
            <CardDescription className="text-base">Tokens Utilizados</CardDescription>
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
  );
};

export default History;
