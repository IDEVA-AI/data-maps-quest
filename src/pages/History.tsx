import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Search, Calendar, Download, Loader2 } from "lucide-react";
import { historyService, HistoryEntry, HistoryStats } from "@/services";
import { toast } from "sonner";

const History = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [historyData, setHistoryData] = useState<HistoryEntry[]>([]);
  const [stats, setStats] = useState<HistoryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar dados do histórico
  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const [historyResponse, statsResponse] = await Promise.all([
        historyService.getHistory({ limit: 50 }),
        historyService.getHistoryStats()
      ]);

      if (historyResponse.success && historyResponse.data) {
        setHistoryData(historyResponse.data);
      } else {
        toast.error("Erro ao carregar histórico");
        setHistoryData([]);
      }

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
      if (error.message?.includes('ERR_CONNECTION_REFUSED') || error.message?.includes('fetch')) {
        toast.error("Servidor não está disponível. Verifique se o backend está rodando.");
      } else {
        toast.error("Erro ao conectar com o servidor: " + error.message);
      }
      setHistoryData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const filteredHistory = historyData.filter(item =>
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (action: string) => {
    switch (action) {
      case "create":
        return "bg-green-100 text-green-800";
      case "update":
        return "bg-blue-100 text-blue-800";
      case "delete":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case "create":
        return "Criado";
      case "update":
        return "Atualizado";
      case "delete":
        return "Removido";
      default:
        return action;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "consulta":
        return "Consulta";
      case "disparo":
        return "Disparo";
      case "template":
        return "Template";
      case "message":
        return "Mensagem";
      default:
        return type;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Histórico</h1>
          <p className="text-gray-600">Visualize o histórico de consultas executadas</p>
        </div>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nome da consulta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Filtrar por Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Histórico */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Carregando histórico...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {filteredHistory.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{item.description}</h3>
                        <Badge className={getStatusColor(item.action)}>
                          {getActionLabel(item.action)}
                        </Badge>
                        <Badge variant="outline">{getTypeLabel(item.type)}</Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Data de Execução:</strong> {new Date(item.created_at).toLocaleDateString('pt-BR')}</p>
                        <p><strong>Entidade:</strong> {item.entity_type} #{item.entity_id}</p>
                        {item.metadata?.resultados && (
                          <p><strong>Resultados:</strong> {item.metadata.resultados} registros</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Exportar
                      </Button>
                      <Button size="sm">
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredHistory.length === 0 && !isLoading && (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-gray-500">Nenhum item encontrado no histórico.</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default History;