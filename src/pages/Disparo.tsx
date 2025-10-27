import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, MapPin, Tag, Filter, Send, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { consultaService, Consulta } from "@/services";
import { toast } from "sonner";

const Disparo = () => {
  const navigate = useNavigate();
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterDate, setFilterDate] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    loadConsultas();
  }, []);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Disparo de Consultas</h1>
          <p className="text-muted-foreground">
            Selecione uma consulta para iniciar o processo de disparo de mensagens
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por categoria, localização ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Categoria" />
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
            <Select value={filterDate} onValueChange={setFilterDate}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os períodos</SelectItem>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="week">Esta semana</SelectItem>
                <SelectItem value="month">Este mês</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Carregando consultas...</span>
          </div>
        </div>
      ) : filteredConsultas.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhuma consulta encontrada.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedConsultas.map((consulta) => (
          <Card key={consulta.id} className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{consulta.category}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {consulta.location}
                  </CardDescription>
                  <CardDescription className="text-xs">
                    {consulta.description}
                  </CardDescription>
                </div>
                <Badge variant="secondary">{consulta.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(consulta.date)}
                </div>
                <div className="flex items-center gap-1">
                  <Tag className="h-4 w-4" />
                  {consulta.resultsCount} resultados
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="text-muted-foreground">Tokens usados: </span>
                  <span className="font-medium">{consulta.tokensUsed}</span>
                </div>
                {consulta.resultsCount > 0 ? (
                  <Button 
                    onClick={() => handleSelectConsulta(consulta.id)}
                    size="sm"
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Selecionar
                  </Button>
                ) : (
                  <Button disabled size="sm" variant="outline" className="gap-2">
                    Não possui dados
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Disparo;