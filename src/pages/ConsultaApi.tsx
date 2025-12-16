import { useEffect, useMemo, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, MapPin, Globe, Mail, Phone, Calendar, Tag, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import { consultaService, Consulta, authService } from "@/services";
import { searchGooglePlaces } from "@/services/googlePlacesService";

interface ApiResult {
  nome?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  website?: string;
  rating?: number;
}

const LIMIT_MIN = 1;
const LIMIT_MAX = 60;

const ConsultaApi = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [termo, setTermo] = useState("");
  const [localizacao, setLocalizacao] = useState("");
  const [limite, setLimite] = useState<number>(20);
  const [isSearching, setIsSearching] = useState(false);

  // Estados para listagem
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [isLoadingConsultas, setIsLoadingConsultas] = useState(true);
  const [canViewUserNames, setCanViewUserNames] = useState(false);
  const [isAnalyst, setIsAnalyst] = useState(false);

  useEffect(() => {
    const qpTermo = searchParams.get("termo") || "";
    const qpLocal = searchParams.get("localizacao") || "";
    const qpLimite = parseInt(searchParams.get("limite") || "20", 10);
    if (qpTermo) setTermo(qpTermo);
    if (qpLocal) setLocalizacao(qpLocal);
    if (!Number.isNaN(qpLimite)) {
      setLimite(Math.min(LIMIT_MAX, Math.max(LIMIT_MIN, qpLimite)));
    }
  }, [searchParams]);

  // Carregar consultas e permissões
  const loadConsultas = useCallback(async () => {
    try {
      setIsLoadingConsultas(true);
      const canView = await authService.canViewUserNames();
      setCanViewUserNames(canView);
      setIsAnalyst(authService.isAnalyst());

      const response = await consultaService.getConsultas();
      if (response.success && response.data) {
        setConsultas(response.data);
      } else {
        toast.error("Erro ao carregar consultas: " + (response.error || "Erro desconhecido"));
      }
    } catch (error) {
      console.error("Erro ao carregar consultas:", error);
      toast.error("Erro ao conectar com o servidor");
    } finally {
      setIsLoadingConsultas(false);
    }
  }, []);

  useEffect(() => {
    loadConsultas();
  }, [loadConsultas]);

  const isLimitValid = useMemo(() => limite >= LIMIT_MIN && limite <= LIMIT_MAX, [limite]);
  const canSubmit = useMemo(
    () => termo.trim().length > 0 && localizacao.trim().length > 0 && isLimitValid,
    [termo, localizacao, isLimitValid]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      toast.error("Preencha termo e localização");
      return;
    }
    if (!isLimitValid) {
      toast.error(`O limite deve estar entre ${LIMIT_MIN} e ${LIMIT_MAX}.`);
      return;
    }
    setIsSearching(true);
    try {
      // 1. Criar a consulta no banco
      const consultaRes = await consultaService.createConsulta({
        category: termo.trim(),
        location: localizacao.trim(),
        tipo_consulta: 'API'
      });

      if (!consultaRes.success || !consultaRes.data) {
        throw new Error(consultaRes.error || "Erro ao criar consulta. Verifique seu saldo.");
      }

      const consultaId = consultaRes.data.id;
      toast.info("Consulta iniciada, buscando dados...");

      // 2. Buscar no Google
      const limitToUse = Math.min(LIMIT_MAX, Math.max(LIMIT_MIN, Number(limite) || LIMIT_MIN));
      const data = await searchGooglePlaces(termo.trim(), localizacao.trim(), limitToUse);

      const mappedResults: ApiResult[] = data.map(item => ({
        nome: item.nome,
        endereco: item.endereco,
        telefone: item.telefone,
        website: item.site,
        rating: item.nota,
      }));

      // 3. Salvar resultados no banco
      if (mappedResults.length > 0) {
        const saveRes = await consultaService.saveResults(consultaId, mappedResults);
        if (!saveRes.success) {
          toast.warning("Resultados encontrados, mas houve erro ao salvar no banco: " + saveRes.error);
        } else {
          toast.success(`Sucesso! ${mappedResults.length} estabelecimentos salvos.`);
          // 4. Redirecionar para a página de detalhes
          navigate(`/consulta/${consultaId}`);
        }
      } else {
        toast.info("Nenhum resultado encontrado para salvar.");
        // Mesmo sem resultados, recarrega a lista ou redireciona
        loadConsultas();
      }

    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Erro: ${msg}`);
    } finally {
      setIsSearching(false);
    }
  };

  const handleViewDetails = (consultaId: number) => {
    navigate(`/consulta/${consultaId}`);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">Consultas API</h1>
        <p className="text-muted-foreground text-lg">Consultar diretamente a API externa</p>
      </div>

      <Card className="shadow-card border-0 bg-gradient-card">
        <CardHeader>
          <CardTitle className="text-2xl">Nova Consulta via API</CardTitle>
          <CardDescription className="text-base">Preencha os campos e enviaremos para a API externa</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="termo" className="text-base">Termo</Label>
                <Input id="termo" placeholder="Ex: Academia" value={termo} onChange={(e) => setTermo(e.target.value)} className="h-11" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="localizacao" className="text-base">Localização</Label>
                <Input id="localizacao" placeholder="Ex: Centro, SP" value={localizacao} onChange={(e) => setLocalizacao(e.target.value)} className="h-11" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="limite" className="text-base">Limite (máx. {LIMIT_MAX})</Label>
                <Input
                  id="limite"
                  type="number"
                  min={LIMIT_MIN}
                  max={LIMIT_MAX}
                  value={limite}
                  onChange={(e) => {
                    const parsed = parseInt(e.target.value || String(LIMIT_MIN), 10);
                    if (Number.isNaN(parsed)) {
                      setLimite(LIMIT_MIN);
                      return;
                    }
                    setLimite(Math.min(LIMIT_MAX, Math.max(LIMIT_MIN, parsed)));
                  }}
                  className="h-11"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="submit" className="h-11 px-8 shadow-lg hover:shadow-glow transition-all" disabled={isSearching || !canSubmit}>
                {isSearching ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" />Consultando...</>) : (<><Search className="mr-2 h-5 w-5" />Buscar via API</>)}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Listagem de Consultas */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Minhas Consultas ({consultas.length})</h2>

        {isLoadingConsultas ? (
          <Card className="shadow-card border-0">
            <CardContent className="py-12 text-center text-muted-foreground">
              <Loader2 className="mx-auto h-12 w-12 opacity-50 mb-4 animate-spin" />
              <p className="text-lg">Carregando consultas...</p>
            </CardContent>
          </Card>
        ) : consultas.length === 0 ? (
          <Card className="shadow-card border-0">
            <CardContent className="py-12 text-center text-muted-foreground">
              <Search className="mx-auto h-12 w-12 opacity-20 mb-4" />
              <p className="text-lg">Nenhuma consulta encontrada.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {consultas.map((consulta) => (
              <Card key={consulta.id} className="shadow-card hover:shadow-lg transition-all duration-300 border-0 bg-gradient-card group">
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge variant="outline" className="gap-1 border-primary/20 bg-primary/5">
                          <Tag className="h-3 w-3" />
                          {consulta.category}
                        </Badge>
                        <Badge variant="outline" className="gap-1 border-accent/20 bg-accent/5 text-foreground">
                          <MapPin className="h-3 w-3 text-primary" />
                          {consulta.location}
                        </Badge>
                        {isAnalyst && (
                          <Badge variant="secondary" className="gap-1 border border-secondary/50">
                            Origem: {consulta.tipo_consulta === 'API' ? 'API' : 'N8N'}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-[0.95rem] text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(consulta.date).toLocaleDateString("pt-BR")}
                        </div>
                        <div className="font-medium text-[0.95rem] text-foreground">
                          {consulta.resultsCount} resultados
                        </div>
                        {canViewUserNames && consulta.usuario_nome && (
                          <div className="flex items-center gap-1 text-xs bg-muted/50 px-2 py-1 rounded">
                            <span className="text-muted-foreground">Por:</span>
                            <span className="text-foreground">{consulta.usuario_nome}</span>
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
  );
};

export default ConsultaApi;
