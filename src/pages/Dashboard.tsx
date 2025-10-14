import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Loader2, Calendar, MapPin, Tag, ExternalLink, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterDate, setFilterDate] = useState("all");

  // Mock data - will be replaced with real data from backend
  const consultas = [
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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);

    // Mock search - simulate API call
    setTimeout(() => {
      setIsSearching(false);
      toast.success("Busca concluída! 15 tokens debitados.");
    }, 2000);
  };

  const handleDownload = (consultaId: number) => {
    toast.success("Download iniciado!");
  };

  const handleViewDetails = (consultaId: number) => {
    navigate(`/consulta/${consultaId}`);
  };

  // Filter consultas based on selected filters
  const filteredConsultas = consultas.filter((consulta) => {
    if (filterCategory !== "all" && consulta.category !== filterCategory) {
      return false;
    }
    if (filterDate !== "all") {
      const consultaDate = new Date(consulta.date);
      const today = new Date();
      if (filterDate === "today" && consultaDate.toDateString() !== today.toDateString()) {
        return false;
      }
      if (filterDate === "week") {
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (consultaDate < weekAgo) {
          return false;
        }
      }
      if (filterDate === "month") {
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (consultaDate < monthAgo) {
          return false;
        }
      }
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Consultas</h1>
        <p className="text-muted-foreground">
          Pesquise dados de empresas e gerencie suas consultas
        </p>
      </div>

      {/* Search Form */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Nova Consulta</CardTitle>
          <CardDescription>
            Cada busca consome 15 tokens do seu saldo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Input
                  id="category"
                  placeholder="Ex: restaurante, academia, farmácia"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Localização</Label>
                <Input
                  id="location"
                  placeholder="Ex: São Paulo, Rio de Janeiro"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full md:w-auto"
              disabled={isSearching}
            >
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Buscar Empresas
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Consultas List */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-semibold">
            Minhas Consultas ({filteredConsultas.length})
          </h2>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filtrar categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas categorias</SelectItem>
                <SelectItem value="Restaurante">Restaurante</SelectItem>
                <SelectItem value="Academia">Academia</SelectItem>
                <SelectItem value="Farmácia">Farmácia</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterDate} onValueChange={setFilterDate}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filtrar período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos períodos</SelectItem>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="week">Última semana</SelectItem>
                <SelectItem value="month">Último mês</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredConsultas.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Nenhuma consulta encontrada com os filtros selecionados.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredConsultas.map((consulta) => (
              <Card key={consulta.id} className="shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge variant="outline" className="gap-1">
                          <Tag className="h-3 w-3" />
                          {consulta.category}
                        </Badge>
                        <Badge variant="outline" className="gap-1">
                          <MapPin className="h-3 w-3" />
                          {consulta.location}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(consulta.date).toLocaleDateString("pt-BR")}
                        </div>
                        <div>
                          {consulta.resultsCount} resultados
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button
                        onClick={() => handleViewDetails(consulta.id)}
                        variant="outline"
                        className="w-full sm:w-auto"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Ver Detalhes
                      </Button>
                      <Button
                        onClick={() => handleDownload(consulta.id)}
                        variant="outline"
                        className="w-full sm:w-auto"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
