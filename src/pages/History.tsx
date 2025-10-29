import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Search, Clock, FileText, Zap, Calendar, TrendingUp, Activity, BarChart3, Download } from "lucide-react";
import { consultaService, Consulta } from "@/services";
import { toast } from "sonner";
import { downloadCSV, CSVColumn, validateCSVData, formatDateISO } from "@/utils/csvUtils";

interface HistoryEntry {
  id: number;
  type: 'consulta';
  action: string;
  description: string;
  entity_id: number;
  created_at: string;
  category?: string;
  location?: string;
  resultsCount?: number;
  tokensUsed?: number;
  status?: string;
}

interface HistoryStats {
  totalEntries: number;
  consultasCount: number;
  totalTokensUsed: number;
  totalResults: number;
  lastExecution?: string;
}

interface GroupedHistory {
  [date: string]: HistoryEntry[];
}

const History = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [historyData, setHistoryData] = useState<HistoryEntry[]>([]);
  const [stats, setStats] = useState<HistoryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar dados do histórico usando consultas do Supabase
  const loadHistory = async () => {
    try {
      setIsLoading(true);
      
      // Buscar todas as consultas para criar o histórico
      const consultasResponse = await consultaService.getConsultas({});
      
      if (consultasResponse.success && consultasResponse.data) {
        const consultas = consultasResponse.data;
        
        // Converter consultas em entradas de histórico
        const historyEntries: HistoryEntry[] = consultas.map((consulta: Consulta) => ({
          id: consulta.id,
          type: 'consulta' as const,
          action: 'create',
          description: `Busca por ${consulta.category} em ${consulta.location}`,
          entity_id: consulta.id,
          created_at: consulta.date,
          category: consulta.category,
          location: consulta.location,
          resultsCount: consulta.resultsCount,
          tokensUsed: consulta.tokensUsed,
          status: consulta.status
        }));

        // Ordenar por data mais recente primeiro
        historyEntries.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        
        setHistoryData(historyEntries);

        // Calcular estatísticas
        const totalTokensUsed = consultas.reduce((sum, c) => sum + (c.tokensUsed || 0), 0);
        const totalResults = consultas.reduce((sum, c) => sum + (c.resultsCount || 0), 0);
        const lastExecution = historyEntries.length > 0 ? historyEntries[0].created_at : undefined;
        
        setStats({
          totalEntries: consultas.length,
          consultasCount: consultas.length,
          totalTokensUsed,
          totalResults,
          lastExecution
        });
      } else {
        toast.error("Erro ao carregar histórico");
        setHistoryData([]);
      }
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
      toast.error("Erro ao carregar dados do histórico");
      setHistoryData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // Função para download CSV
  const handleDownloadCSV = () => {
    try {
      // Validar se há dados
      if (!validateCSVData(historyData)) {
        toast.error("Não há dados disponíveis para download");
        return;
      }

      toast.info("Gerando arquivo CSV...");

      // Definir colunas do CSV
      const columns: CSVColumn[] = [
        {
          header: 'Data da Consulta (ISO 8601)',
          key: 'created_at',
          formatter: (value: any) => value ? formatDateISO(value) : ''
        },
        {
          header: 'Hora da Consulta',
          key: 'created_at',
          formatter: (value: any) => {
            if (!value) return '';
            const date = new Date(value);
            return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          }
        },
        {
          header: 'Termo de Busca Utilizado',
          key: 'description',
          formatter: (value: any) => value || 'N/A'
        },
        {
          header: 'Quantidade de Tokens Utilizados',
          key: 'tokensUsed',
          formatter: (value: any) => value ? value.toString() : '0'
        },
        {
          header: 'Total de Resultados Encontrados',
          key: 'resultsCount',
          formatter: (value: any) => value ? value.toString() : '0'
        }
      ];

      // Preparar dados para CSV
      const csvData = historyData.map(entry => ({
        created_at: entry.created_at,
        description: entry.description,
        tokensUsed: entry.tokensUsed || 0,
        resultsCount: entry.resultsCount || 0
      }));

      // Gerar e baixar CSV
      downloadCSV(csvData, columns, {
        filename: 'historico_consultas.csv'
      });

      toast.success("Download concluído com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar CSV:", error);
      toast.error("Erro ao gerar arquivo CSV");
    }
  };

  const filteredHistory = historyData.filter(item =>
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Agrupar histórico por data
  const groupedHistory: GroupedHistory = filteredHistory.reduce((groups, item) => {
    const date = new Date(item.created_at).toLocaleDateString('pt-BR');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
    return groups;
  }, {} as GroupedHistory);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
                <div className="absolute inset-0 h-12 w-12 animate-pulse rounded-full bg-blue-100 opacity-20"></div>
              </div>
              <span className="text-slate-600 font-medium">Carregando histórico...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto p-6">
        {/* Header com gradiente */}
        <div className="mb-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 text-white shadow-xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Histórico de Consultas
              </h1>
              <p className="text-blue-100 text-lg">
                Acompanhe todas as suas consultas e análises realizadas
              </p>
            </div>
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-xl"></div>
            <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-white/5 blur-2xl"></div>
          </div>
        </div>

        {/* Cards de estatísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="group relative overflow-hidden border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Total de Consultas</p>
                    <p className="text-3xl font-bold text-slate-900">{stats.consultasCount}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Tokens Utilizados</p>
                    <p className="text-3xl font-bold text-slate-900">{stats.totalTokensUsed.toLocaleString()}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Registros Encontrados</p>
                    <p className="text-3xl font-bold text-slate-900">{stats.totalResults.toLocaleString()}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Barra de pesquisa moderna */}
        <Card className="mb-8 border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 text-slate-700 font-semibold">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-slate-600 to-slate-700 flex items-center justify-center">
                  <Search className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg">Filtrar histórico</span>
              </div>
              <div className="flex-1 relative">
                <Input
                  placeholder="Buscar por nome da consulta..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-md border-slate-200 bg-white/50 backdrop-blur-sm focus:bg-white transition-all duration-200 pl-4 pr-10"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
              <Button
                onClick={handleDownloadCSV}
                disabled={historyData.length === 0}
                className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Download className="h-4 w-4" />
                Baixar CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Histórico Agrupada por Data */}
        <div className="space-y-6">
          {Object.entries(groupedHistory).map(([date, entries], groupIndex) => {
            // Calcular totais da data
            const totalTokensDate = entries.reduce((sum, entry) => sum + (entry.tokensUsed || 0), 0);
            const totalRecordsDate = entries.reduce((sum, entry) => sum + (entry.resultsCount || 0), 0);
            
            return (
              <Card 
                key={date} 
                className="group relative overflow-hidden border-0 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 animate-in slide-in-from-bottom-4"
                style={{ animationDelay: `${groupIndex * 100}ms` }}
              >
                <CardContent className="p-0">
                  {/* Header do card com data e totais */}
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold">{date}</h2>
                          <p className="text-indigo-100">{entries.length} consulta{entries.length !== 1 ? 's' : ''} realizada{entries.length !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      
                      {/* Totais da data */}
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm text-indigo-100">Total de Tokens</p>
                          <p className="text-xl font-bold">{totalTokensDate.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-indigo-100">Total de Registros</p>
                          <p className="text-xl font-bold">{totalRecordsDate.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Lista de consultas */}
                  <div className="p-6">
                    <div className="space-y-4">
                      {entries.map((item, index) => (
                        <div 
                          key={item.id}
                          className="group/item flex items-center justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-all duration-200 border border-slate-200 hover:border-slate-300"
                        >
                          {/* Informações da consulta */}
                          <div className="flex-1">
                            <div className="flex items-start gap-3">
                              <div className="h-2 w-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 mt-2 flex-shrink-0"></div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-slate-900 group-hover/item:text-blue-600 transition-colors duration-200">
                                  {item.description}
                                </h3>
                                <div className="flex items-center gap-2 mt-1 text-sm text-slate-600">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatDateTime(item.created_at)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Métricas da consulta */}
                          <div className="flex items-center gap-4 ml-4">
                            <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-blue-100 border border-blue-200">
                              <FileText className="h-3 w-3 text-blue-600" />
                              <span className="text-blue-700 font-medium text-sm">
                                {item.resultsCount || 0}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-purple-100 border border-purple-200">
                              <Zap className="h-3 w-3 text-purple-600" />
                              <span className="text-purple-700 font-medium text-sm">
                                {item.tokensUsed || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
                
                {/* Efeito de hover no card */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </Card>
            );
          })}
        </div>

        {/* Estado vazio com design moderno */}
        {filteredHistory.length === 0 && !isLoading && (
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-16 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-r from-slate-200 to-slate-300 flex items-center justify-center">
                  <Activity className="h-8 w-8 text-slate-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-700 mb-2">Nenhum item encontrado</h3>
                  <p className="text-slate-500">Tente ajustar os filtros ou realize uma nova consulta.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default History;