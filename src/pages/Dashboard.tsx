import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Loader2, Calendar, MapPin, Tag, ExternalLink, Filter, Zap, TrendingUp, Target, HelpCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { consultaService, Consulta, ConsultaStats, authService } from "@/services";

const Dashboard = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterDate, setFilterDate] = useState("all");
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [stats, setStats] = useState<ConsultaStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [canViewUserNames, setCanViewUserNames] = useState(false);

  // Load data from database
  useEffect(() => {
    checkPermissions();
    loadConsultas();
    loadStats();
  }, [filterCategory, filterDate]);

  const checkPermissions = async () => {
    try {
      const canView = await authService.canViewUserNames();
      setCanViewUserNames(canView);
    } catch (error) {
      console.error("Erro ao verificar permissões:", error);
      setCanViewUserNames(false);
    }
  };

  const loadConsultas = async () => {
    try {
      setIsLoading(true);
      const filters = {
        category: filterCategory !== "all" ? filterCategory : undefined,
        // Add date filtering logic based on filterDate
      };
      
      const response = await consultaService.getConsultas(filters);
      if (response.success && response.data) {
        setConsultas(response.data);
      } else {
        toast.error("Erro ao carregar consultas: " + (response.error || "Erro desconhecido"));
        setConsultas([]);
      }
    } catch (error) {
      console.error("Erro ao carregar consultas:", error);
      toast.error("Erro ao conectar com o servidor");
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await consultaService.getConsultaStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category.trim() || !location.trim()) {
      toast.error("Por favor, preencha categoria e localização");
      return;
    }

    setIsSearching(true);
    toast.info("Conectando com o servidor...");

    try {
      // Obter o ID do usuário logado
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        toast.error("Usuário não autenticado");
        setIsSearching(false);
        return;
      }

      // Gerar identificador único para evitar duplicações
      const requestId = `${currentUser.id_usuario}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create new consulta PRIMEIRO (para evitar duplicação do webhook)
      const newConsulta = {
        category: category.trim(),
        location: location.trim(),
        date: new Date().toISOString().split('T')[0],
        resultsCount: 0,
        tokensUsed: 15,
        status: "Em andamento",
        description: `Busca por ${category} em ${location}`
      };

      const response = await consultaService.createConsulta(newConsulta);
      
      if (response.success && response.data) {
        // Enviar para webhook APÓS criar a consulta, incluindo o ID da consulta criada
        try {
          await fetch('https://n8n.ideva.ai/webhook/consulta', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              category: category.trim(), 
              location: location.trim(),
              id_usuario: currentUser.id_usuario,
              consulta_id: response.data.id,
              request_id: requestId
            })
          });
        } catch (whErr) {
          console.warn('Falha ao enviar webhook:', whErr);
        }

        toast.success("Busca iniciada! 15 tokens debitados.");
        setCategory("");
        setLocation("");
        // Reload consultas to show the new one
        loadConsultas();
        loadStats();
      } else {
        toast.error("Erro ao iniciar busca: " + (response.error || "Erro desconhecido"));
      }
    } catch (error) {
      console.error("Erro ao criar consulta:", error);
      if ((error as any).message?.includes('ERR_CONNECTION_REFUSED') || (error as any).message?.includes('fetch')) {
        toast.error("Servidor não está disponível. Verifique se o backend está rodando.");
      } else {
        toast.error("Erro ao conectar com o servidor: " + (error as any).message);
      }
    } finally {
      setIsSearching(false);
    }
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

  // Ordenar por data desc (mais recentes primeiro)
  const sortedConsultas = [...filteredConsultas].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Calculate metrics
  const userTokens = 15; // This should come from AuthContext or user service
  const totalConsultas = stats?.totalConsultas || filteredConsultas.length;
  const totalSpent = stats?.totalTokensUsados || filteredConsultas.reduce((sum, c) => sum + c.tokensUsed, 0);
  const totalLeads = stats?.totalResultados || filteredConsultas.reduce((sum, c) => sum + c.resultsCount, 0);
  const consultasHoje = stats?.consultasHoje || filteredConsultas.filter(c => {
    const today = new Date().toDateString();
    const consultaDate = new Date(c.date).toDateString();
    return consultaDate === today;
  }).length;

  return (
    <TooltipProvider>
      <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
          Consultas
        </h1>
        <p className="text-muted-foreground text-lg">
          Pesquise dados de empresas e gerencie suas consultas
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="shadow-card border-0 bg-gradient-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Saldo de Tokens</p>
                <p className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  {userTokens}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
                <Zap className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0 bg-gradient-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Consultas</p>
                <p className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  {totalConsultas}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
                <Search className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0 bg-gradient-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Gasto</p>
                <p className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  {totalSpent}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
                <TrendingUp className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card border-0 bg-gradient-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-muted-foreground">Custo Médio por Lead</p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Custo médio em tokens dividido pelo número total de leads encontrados. Ajuda a medir a eficiência das suas consultas.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  {totalLeads > 0 ? (totalSpent / totalLeads).toFixed(1) : "0"}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
                <Target className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Form */}
      <Card className="shadow-card border-0 bg-gradient-card">
        <CardHeader>
          <CardTitle className="text-2xl">Nova Consulta</CardTitle>
          <CardDescription className="text-base">
            Cada busca consome 15 tokens do seu saldo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-base">Categoria</Label>
                <Input
                  id="category"
                  placeholder="Ex: restaurante, academia, farmácia"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-11"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="text-base">Localização</Label>
                <Input
                  id="location"
                  placeholder="Ex: São Paulo, Rio de Janeiro"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-11"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full md:w-auto h-11 px-8 shadow-lg hover:shadow-glow transition-all"
              disabled={isSearching}
            >
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-5 w-5" />
                  Buscar Empresas
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Consultas List */}
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-semibold">
            Minhas Consultas ({filteredConsultas.length})
          </h2>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px] h-11">
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
              <SelectTrigger className="w-[180px] h-11">
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

        {isLoading ? (
          <Card className="shadow-card border-0">
            <CardContent className="py-12 text-center text-muted-foreground">
              <Loader2 className="mx-auto h-12 w-12 opacity-50 mb-4 animate-spin" />
              <p className="text-lg">Carregando consultas...</p>
            </CardContent>
          </Card>
        ) : filteredConsultas.length === 0 ? (
          <Card className="shadow-card border-0">
            <CardContent className="py-12 text-center text-muted-foreground">
              <Search className="mx-auto h-12 w-12 opacity-20 mb-4" />
              <p className="text-lg">Nenhuma consulta encontrada com os filtros selecionados.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {sortedConsultas.map((consulta) => (
              <Card key={consulta.id} className="shadow-card hover:shadow-lg transition-all duration-300 border-0 bg-gradient-card group">
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge variant="outline" className="gap-1 border-primary/20 bg-primary/5">
                          <Tag className="h-3 w-3" />
                          {consulta.category}
                        </Badge>
                        <Badge variant="outline" className="gap-1 border-accent/20 bg-accent/5">
                          <MapPin className="h-3 w-3" />
                          {consulta.location}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(consulta.date).toLocaleDateString("pt-BR")}
                        </div>
                        <div className="font-medium">
                          {consulta.resultsCount} resultados
                        </div>
                        {canViewUserNames && consulta.usuario_nome && (
                          <div className="flex items-center gap-1 text-xs bg-muted/50 px-2 py-1 rounded">
                            <span>Por: {consulta.usuario_nome}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      {consulta.resultsCount > 0 ? (
                        <Button
                          onClick={() => handleViewDetails(consulta.id)}
                          variant="outline"
                          className="w-full sm:w-auto group-hover:border-primary/30 transition-colors"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Ver Detalhes
                        </Button>
                      ) : (
                        <Button disabled className="w-full sm:w-auto" variant="outline">
                          Não possui dados
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      </div>
    </TooltipProvider>
  );
};

export default Dashboard;
