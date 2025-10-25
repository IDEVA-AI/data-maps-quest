import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, MapPin, Star, Phone, Mail, Globe, Building, BarChart3, HelpCircle, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { resultadoService, consultaService, Resultado } from "@/services";

const ConsultaDetalhes = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [phoneFilter, setPhoneFilter] = useState("all");
  const [emailFilter, setEmailFilter] = useState("all");
  const [websiteFilter, setWebsiteFilter] = useState("all");
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [consulta, setConsulta] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const consultaId = parseInt(id);
        
        const consultaResponse = await consultaService.getConsultaById(consultaId);
        if (consultaResponse.success && consultaResponse.data) {
          setConsulta(consultaResponse.data);
        }
        
        const resultadosResponse = await resultadoService.getResultadosByConsultaId(consultaId);
        if (resultadosResponse.success && resultadosResponse.data) {
          setResultados(resultadosResponse.data);
        }
        
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados da consulta');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [id]);

  const handleDownload = () => {
    toast.success("Download iniciado!");
  };

  const filteredResults = resultados.filter((result) => {
    if (phoneFilter === "possui" && !result.telefone) return false;
    if (phoneFilter === "vazio" && result.telefone) return false;
    if (emailFilter === "possui" && !result.email) return false;
    if (emailFilter === "vazio" && result.email) return false;
    if (websiteFilter === "possui" && !result.website) return false;
    if (websiteFilter === "vazio" && result.website) return false;
    return true;
  });

  const totalEstabelecimentos = resultados.length;
  const totalTelefones = resultados.filter(r => r.telefone).length;
  const totalEmails = resultados.filter(r => r.email).length;
  const totalWebsites = resultados.filter(r => r.website).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate("/consulta")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Consulta #{id}</h1>
                <p className="text-muted-foreground">
                  {consulta?.parametrocategoria} em {consulta?.parametrolocalidade}
                </p>
              </div>
            </div>
          </div>
          <Button onClick={handleDownload} className="gap-2">
            <Download className="h-4 w-4" />
            Exportar Dados
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Estabelecimentos</p>
                  <p className="text-2xl font-bold">{totalEstabelecimentos}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Phone className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Com Telefone</p>
                  <p className="text-2xl font-bold">{totalTelefones}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Mail className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Com Email</p>
                  <p className="text-2xl font-bold">{totalEmails}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Globe className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Com Website</p>
                  <p className="text-2xl font-bold">{totalWebsites}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Filtros</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Telefone</label>
                <Select value={phoneFilter} onValueChange={setPhoneFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="possui">Possui telefone</SelectItem>
                    <SelectItem value="vazio">Sem telefone</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Select value={emailFilter} onValueChange={setEmailFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="possui">Possui email</SelectItem>
                    <SelectItem value="vazio">Sem email</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Website</label>
                <Select value={websiteFilter} onValueChange={setWebsiteFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="possui">Possui website</SelectItem>
                    <SelectItem value="vazio">Sem website</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredResults.map((resultado) => (
            <Card key={resultado.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg leading-tight">
                      {resultado.nomeempresa}
                    </h3>
                    {resultado.rating && (
                      <Badge variant="secondary" className="gap-1">
                        <Star className="h-3 w-3 fill-current" />
                        {resultado.rating}
                      </Badge>
                    )}
                  </div>

                  {resultado.endereco && (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{resultado.endereco}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {resultado.telefone && (
                      <Badge variant="outline" className="gap-1">
                        <Phone className="h-3 w-3" />
                        Telefone
                      </Badge>
                    )}
                    {resultado.email && (
                      <Badge variant="outline" className="gap-1">
                        <Mail className="h-3 w-3" />
                        Email
                      </Badge>
                    )}
                    {resultado.website && (
                      <Badge variant="outline" className="gap-1">
                        <Globe className="h-3 w-3" />
                        Website
                      </Badge>
                    )}
                  </div>

                  <div className="pt-2 border-t">
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      {resultado.telefone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono">{resultado.telefone}</span>
                        </div>
                      )}
                      {resultado.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono text-xs">{resultado.email}</span>
                        </div>
                      )}
                      {resultado.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono text-xs truncate">{resultado.website}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredResults.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  <Building className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Nenhum resultado encontrado</h3>
                  <p className="text-muted-foreground">
                    Tente ajustar os filtros para ver mais resultados.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
};

export default ConsultaDetalhes;
