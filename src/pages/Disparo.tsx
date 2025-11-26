import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, MapPin, Tag, Filter, Send, Loader2, Zap, Target, TrendingUp, Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { consultaService, Consulta, authService } from "@/services";
import { toast } from "sonner";

const Disparo = () => {
  const navigate = useNavigate();
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterDate, setFilterDate] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [canViewUserNames, setCanViewUserNames] = useState(false);

  // Load consultas from database
  const loadConsultas = async () => {
    try {
      setIsLoading(true);
      const response = await consultaService.getConsultas();
      
      if (response.success && response.data) {
        setConsultas(response.data);
      } else {
        console.error("Erro ao carregar consultas:", response.error);
        toast.error("Erro ao carregar consultas");
        setConsultas([]);
      }
    } catch (error) {
      console.error("Erro ao conectar com o servidor:", error);
      if (error.message?.includes('ERR_CONNECTION_REFUSED') || error.message?.includes('fetch')) {
        toast.error("Servidor não está disponível. Verifique se o backend está rodando.");
      } else {
        toast.error("Erro ao conectar com o servidor: " + error.message);
      }
      setConsultas([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkPermissions();
    loadConsultas();
  }, []);

  const checkPermissions = async () => {
    try {
      const canView = await authService.canViewUserNames();
      setCanViewUserNames(canView);
    } catch (error) {
      console.error("Erro ao verificar permissões:", error);
      setCanViewUserNames(false);
    }
  };

  const filteredConsultas = consultas.filter(consulta => {
    const matchesCategory = filterCategory === "all" || consulta.category.toLowerCase().includes(filterCategory.toLowerCase());
    const matchesSearch = searchTerm === "" || 
      consulta.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consulta.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consulta.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  // Ordenar por data desc (mais recentes primeiro)
  const sortedConsultas = [...filteredConsultas].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const handleSelectConsulta = (consultaId: number) => {
    navigate(`/disparo/${consultaId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Loading state with modern design
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-pulse"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Carregando consultas</h3>
              <p className="text-sm text-gray-500">Aguarde um momento...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="space-y-8 p-6 max-w-7xl mx-auto">
        {/* Modern Header with gradient */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 text-white shadow-xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Zap className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">Disparo de Consultas</h1>
                <p className="text-blue-100 text-lg mt-1">
                  Selecione uma consulta para iniciar campanhas direcionadas
                </p>
              </div>
            </div>
            
            {/* Quick stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-blue-200" />
                  <div>
                    <p className="text-sm text-blue-200">Total de Consultas</p>
                    <p className="text-2xl font-bold">{consultas.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-green-200" />
                  <div>
                    <p className="text-sm text-green-200">Com Resultados</p>
                    <p className="text-2xl font-bold">{consultas.filter(c => c.resultsCount > 0).length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-purple-200" />
                  <div>
                    <p className="text-sm text-purple-200">Total de Leads</p>
                    <p className="text-2xl font-bold">{consultas.reduce((acc, c) => acc + c.resultsCount, 0)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        </div>

        {/* Modern Filters */}
        <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <Filter className="h-5 w-5 text-white" />
              </div>
              Filtrar Consultas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Buscar</label>
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    placeholder="Categoria, localização ou descrição..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Categoria</label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200">
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    <SelectItem value="restaurante">Restaurante</SelectItem>
                    <SelectItem value="academia">Academia</SelectItem>
                    <SelectItem value="farmácia">Farmácia</SelectItem>
                    <SelectItem value="clínica">Clínica Médica</SelectItem>
                    <SelectItem value="loja">Loja de Roupas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Período</label>
                <Select value={filterDate} onValueChange={setFilterDate}>
                  <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200">
                    <SelectValue placeholder="Todos os períodos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os períodos</SelectItem>
                    <SelectItem value="today">Hoje</SelectItem>
                    <SelectItem value="week">Esta semana</SelectItem>
                    <SelectItem value="month">Este mês</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results with modern cards */}
        {filteredConsultas.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-4">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma consulta encontrada</h3>
            <p className="text-gray-500">Tente ajustar os filtros para encontrar consultas disponíveis.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sortedConsultas.map((consulta, index) => (
              <Card 
                 key={consulta.id} 
                 className="group cursor-pointer border-0 shadow-lg bg-card/90 backdrop-blur-sm hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden animate-in fade-in slide-in-from-bottom-4"
                 style={{
                   animationDelay: `${index * 100}ms`
                 }}
               >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <CardHeader className="relative z-10 pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                        <CardTitle className="text-lg font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                          {consulta.category}
                        </CardTitle>
                      </div>
                      <CardDescription className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4 text-primary" />
                        {consulta.location}
                      </CardDescription>
                      <CardDescription className="text-sm text-gray-500 line-clamp-2">
                        {consulta.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="relative z-10 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="p-1.5 bg-blue-100 rounded-lg">
                        <Calendar className="h-3.5 w-3.5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Data</p>
                        <p className="font-medium text-foreground">{formatDate(consulta.date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="p-1.5 bg-green-100 rounded-lg">
                        <Target className="h-3.5 w-3.5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Resultados</p>
                        <p className="font-medium text-gray-900">{consulta.resultsCount}</p>
                      </div>
                    </div>
                  </div>
                  
                  {canViewUserNames && consulta.usuario_nome && (
                    <div className="px-3 py-2 rounded-lg border border-border bg-secondary">
                      <p className="text-xs text-foreground">
                        <Users className="h-3 w-3 inline mr-1 text-foreground" />
                        Criado por: {consulta.usuario_nome}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-purple-100 rounded-lg">
                        <Zap className="h-3.5 w-3.5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Tokens</p>
                        <p className="font-semibold text-gray-900">{consulta.tokensUsed}</p>
                      </div>
                    </div>
                    
                    {consulta.resultsCount > 0 ? (
                      <Button 
                        onClick={() => handleSelectConsulta(consulta.id)}
                        size="sm"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 gap-2"
                      >
                        <Send className="h-4 w-4" />
                        Selecionar
                      </Button>
                    ) : (
                      <Button 
                        disabled 
                        size="sm" 
                        variant="outline" 
                        className="gap-2 border-gray-200 text-gray-400"
                      >
                        Sem dados
                      </Button>
                    )}
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

export default Disparo;
