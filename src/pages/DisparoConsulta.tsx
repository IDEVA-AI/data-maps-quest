import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, 
  FileText, 
  Loader2,
  Send,
  MessageSquare,
  Phone,
  Mail,
  Globe,
  Edit,
  Check,
  X,
  Wand2,
  SendHorizontal
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { consultaService, resultadoService, Resultado, authService } from "@/services";

// Interface para contatos baseada nos resultados
interface ContatoFromResultado {
  id: number;
  empresa: string;
  telefone: string;
  email?: string;
  website?: string;
  endereco: string;
  rating?: number;
  template: string;
  status: 'Pendente' | 'Enviado' | 'Erro';
}

const DisparoConsulta = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [contatos, setContatos] = useState<ContatoFromResultado[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [consulta, setConsulta] = useState<any>(null);
  const [editingTemplate, setEditingTemplate] = useState<number | null>(null);
  const [tempTemplate, setTempTemplate] = useState("");
  const [isGeneratingTemplate, setIsGeneratingTemplate] = useState<number | null>(null);
  const [isSendingMessage, setIsSendingMessage] = useState<number | null>(null);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [isSendingAll, setIsSendingAll] = useState(false);
  const [canViewUserNames, setCanViewUserNames] = useState(false);

  // Converter resultados em contatos
  const convertResultadosToContatos = (resultados: Resultado[]): ContatoFromResultado[] => {
    return resultados.map((resultado) => {
      const rawTemplate = (resultado as any).template ??
        "Olá, \n \n Nossa equipe preparou um novo site para a sua empresa e gostaríamos de apresentá-lo, sem nenhum custo ou compromisso. \n \n Qual seria o melhor horário para agendarmos uma breve demonstração? \n \n Atenciosamente, \n Equipe IDEVA(Especialistas em Automação de Sistemas)";
      const normalizedTemplate = rawTemplate.replace(/\\r?\\n/g, "\n");
      return {
        id: (resultado as any).id_resultado ?? (resultado as any).id,
        empresa: (resultado as any).nomeempresa ?? (resultado as any).empresa ?? "",
        email: (resultado as any).email ?? "",
        telefone: (resultado as any).telefone ?? "",
        endereco: (resultado as any).endereco ?? "",
        template: normalizedTemplate,
        status: 'Pendente'
      };
    });
  };



  // Check user permissions
  const checkPermissions = async () => {
    try {
      const canView = await authService.canViewUserNames();
      setCanViewUserNames(canView);
    } catch (error) {
      console.error("Erro ao verificar permissões:", error);
      setCanViewUserNames(false);
    }
  };

  // Load data from database
  const loadData = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const consultaId = parseInt(id);
      
      // Load consulta details
      const consultaResponse = await consultaService.getConsultaById(consultaId);
      if (consultaResponse.success && consultaResponse.data) {
        setConsulta(consultaResponse.data);
      }

      // Load resultados for this consulta
      const resultadosResponse = await resultadoService.getResultadosByConsultaId(consultaId);
      if (resultadosResponse.success && resultadosResponse.data) {
        setResultados(resultadosResponse.data);
        const contatosFromResultados = convertResultadosToContatos(resultadosResponse.data);
        setContatos(contatosFromResultados);
      } else {
        console.error("Erro ao carregar resultados:", resultadosResponse.error);
        setResultados([]);
        setContatos([]);
      }
    } catch (error) {
      console.error("Erro ao conectar com o servidor:", error);
      toast.error("Erro ao conectar com o servidor");
    } finally {
      setIsLoading(false);
    }
  };

  // Funções de template e disparo
  const handleGenerateTemplate = async (contatoId: number) => {
    setIsGeneratingTemplate(contatoId);
    try {
      const contato = contatos.find(c => c.id === contatoId);
      if (!contato) return;

      // Simular geração de template personalizado
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newTemplate = `Olá! Sou da [Sua Empresa] e notei que ${contato.empresa} está localizada em ${contato.endereco}. ${contato.rating ? `Com uma excelente avaliação de ${contato.rating} estrelas, ` : ''}gostaria de apresentar nossos serviços que podem agregar ainda mais valor ao seu negócio. Podemos agendar uma conversa rápida?`;
      
      setContatos(prev => prev.map(c => 
        c.id === contatoId ? { ...c, template: newTemplate } : c
      ));
      
      toast.success("Template gerado com sucesso!");
    } catch (error) {
      toast.error("Erro ao gerar template");
    } finally {
      setIsGeneratingTemplate(null);
    }
  };

  const handleGenerateAllTemplates = async () => {
    setIsGeneratingAll(true);
    try {
      // Simular geração de templates para todos
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setContatos(prev => prev.map(contato => ({
        ...contato,
        template: `Olá! Sou da [Sua Empresa] e notei que ${contato.empresa} está localizada em ${contato.endereco}. ${contato.rating ? `Com uma excelente avaliação de ${contato.rating} estrelas, ` : ''}gostaria de apresentar nossos serviços que podem agregar ainda mais valor ao seu negócio. Podemos agendar uma conversa rápida?`
      })));
      
      toast.success(`Templates gerados para ${contatos.length} contatos!`);
    } catch (error) {
      toast.error("Erro ao gerar templates");
    } finally {
      setIsGeneratingAll(false);
    }
  };

  const handleSendMessage = async (contatoId: number) => {
    setIsSendingMessage(contatoId);
    try {
      // Simular envio de mensagem
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setContatos(prev => prev.map(c => 
        c.id === contatoId ? { ...c, status: 'Enviado' as const } : c
      ));
      
      toast.success("Mensagem enviada com sucesso!");
    } catch (error) {
      toast.error("Erro ao enviar mensagem");
    } finally {
      setIsSendingMessage(null);
    }
  };

  const handleSendAllMessages = async () => {
    setIsSendingAll(true);
    try {
      const pendingContatos = contatos.filter(c => c.status === 'Pendente');
      
      // Simular envio de todas as mensagens
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setContatos(prev => prev.map(contato => 
        contato.status === 'Pendente' ? { ...contato, status: 'Enviado' as const } : contato
      ));
      
      toast.success(`${pendingContatos.length} mensagens enviadas com sucesso!`);
    } catch (error) {
      toast.error("Erro ao enviar mensagens");
    } finally {
      setIsSendingAll(false);
    }
  };

  const handleEditTemplate = (contatoId: number, template: string) => {
    setEditingTemplate(contatoId);
    const normalized = template.replace(/\\r?\\n/g, "\n");
    setTempTemplate(normalized);
  };

  const handleSaveTemplate = async (contatoId: number) => {
    try {
      if (!contatoId) {
        toast.error("ID do contato inválido para salvar template.");
        return;
      }

      const hasColumn = await resultadoService.hasTemplateColumn();
      if (!hasColumn) {
        toast.error("Coluna 'template' não disponível no banco. Aplique a migração e atualize o schema do Supabase.");
        return;
      }

      const resp = await resultadoService.updateResultadoTemplate(contatoId, tempTemplate);
      if (resp.success) {
        setContatos(prev => prev.map(c => 
          c.id === contatoId ? { ...c, template: tempTemplate } : c
        ));
        toast.success("Template salvo no banco!");
      } else {
        toast.error("Erro ao salvar template: " + (resp.error || "Erro desconhecido"));
        return;
      }
    } catch (error) {
      console.error("Erro ao salvar template:", error);
      toast.error("Erro ao conectar com o servidor");
      return;
    } finally {
      setEditingTemplate(null);
      setTempTemplate("");
    }
  };

  const handleCancelEdit = () => {
    setEditingTemplate(null);
    setTempTemplate("");
  };

  useEffect(() => {
    loadData();
    checkPermissions();
  }, [id]);

  const stats = {
    total: contatos.length,
    pendentes: contatos.filter(c => c.status === 'Pendente').length,
    enviados: contatos.filter(c => c.status === 'Enviado').length,
    comTelefone: contatos.filter(c => c.telefone).length,
    comEmail: contatos.filter(c => c.email).length,
    comWebsite: contatos.filter(c => c.website).length
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate("/disparo")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Disparo de Consulta #{id}</h1>
          <p className="text-muted-foreground">
            Gerencie templates e envie mensagens para os contatos encontrados
          </p>
          {canViewUserNames && consulta?.usuario_nome && (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground">
                Por: {consulta.usuario_nome}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Carregando contatos...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Contatos</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  Empresas com telefone
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendentes}</div>
                <p className="text-xs text-muted-foreground">
                  Aguardando envio
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Enviados</CardTitle>
                <Send className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.enviados}</div>
                <p className="text-xs text-muted-foreground">
                  Mensagens enviadas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Com Email</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.comEmail}</div>
                <p className="text-xs text-muted-foreground">
                  Contatos com email
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={handleGenerateAllTemplates}
              disabled={isGeneratingAll || contatos.length === 0}
              className="gap-2"
            >
              {isGeneratingAll ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4" />
              )}
              {isGeneratingAll ? "Gerando..." : "Gerar Templates para Todos"}
            </Button>
            
            <Button 
              onClick={handleSendAllMessages}
              disabled={isSendingAll || stats.pendentes === 0}
              variant="default"
              className="gap-2"
            >
              {isSendingAll ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SendHorizontal className="h-4 w-4" />
              )}
              {isSendingAll ? "Enviando..." : `Disparar para Todos (${stats.pendentes})`}
            </Button>
          </div>

          {/* Contatos Table */}
          <Card>
            <CardHeader>
              <CardTitle>Contatos para Disparo</CardTitle>
              <CardDescription>
                {contatos.length} contatos encontrados com telefone para disparo de mensagens
              </CardDescription>
            </CardHeader>
            <CardContent>
              {contatos.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Empresa</TableHead>
                        <TableHead>Contato</TableHead>
                        <TableHead>Template</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contatos.map((contato) => (
                        <TableRow key={contato.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">{contato.empresa}</div>
                              <div className="text-sm text-muted-foreground">
                                {contato.endereco}
                              </div>
                              <div className="flex gap-1">
                                {contato.rating && (
                                  <Badge variant="secondary" className="text-xs">
                                    ⭐ {contato.rating}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-sm">
                                <Phone className="h-3 w-3" />
                                {contato.telefone}
                              </div>
                              {contato.email && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Mail className="h-3 w-3" />
                                  Email disponível
                                </div>
                              )}
                              {contato.website && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Globe className="h-3 w-3" />
                                  Website disponível
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-md">
                            {editingTemplate === contato.id ? (
                              <div className="space-y-2">
                                <Textarea
                                  value={tempTemplate}
                                  onChange={(e) => setTempTemplate(e.target.value)}
                                  className="min-h-[80px]"
                                  placeholder="Digite o template da mensagem..."
                                />
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleSaveTemplate(contato.id)}
                                    className="gap-1"
                                  >
                                    <Check className="h-3 w-3" />
                                    Salvar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleCancelEdit}
                                    className="gap-1"
                                  >
                                    <X className="h-3 w-3" />
                                    Cancelar
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <p className="text-sm line-clamp-3 whitespace-pre-line cursor-help">{contato.template}</p>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-md p-3">
                                    <p className="whitespace-pre-line text-sm">{contato.template}</p>
                                  </TooltipContent>
                                </Tooltip>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditTemplate(contato.id, contato.template)}
                                  className="gap-1 h-6 px-2"
                                >
                                  <Edit className="h-3 w-3" />
                                  Editar
                                </Button>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                contato.status === 'Enviado' ? 'default' : 
                                contato.status === 'Erro' ? 'destructive' : 'secondary'
                              }
                            >
                              {contato.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleGenerateTemplate(contato.id)}
                                disabled={isGeneratingTemplate === contato.id}
                                className="gap-1"
                              >
                                {isGeneratingTemplate === contato.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Wand2 className="h-3 w-3" />
                                )}
                                Template
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleSendMessage(contato.id)}
                                disabled={
                                  isSendingMessage === contato.id || 
                                  contato.status === 'Enviado' ||
                                  !contato.template.trim()
                                }
                                className="gap-1"
                              >
                                {isSendingMessage === contato.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Send className="h-3 w-3" />
                                )}
                                Enviar
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Nenhum contato com telefone encontrado para esta consulta.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate(`/consulta/${id}`)}
                    className="mt-4 gap-2"
                  >
                    Ver Resultados da Consulta
                    <ArrowLeft className="h-4 w-4 rotate-180" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
      </div>
    </TooltipProvider>
  );
};

export default DisparoConsulta;