import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, MapPin, Star, Phone, Mail, Globe, Building, BarChart3 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";

const ConsultaDetalhes = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [phoneFilter, setPhoneFilter] = useState("all");
  const [emailFilter, setEmailFilter] = useState("all");
  const [websiteFilter, setWebsiteFilter] = useState("all");

  // Mock data - will be replaced with real data from backend
  const consulta = {
    id: Number(id),
    date: "2024-03-15",
    category: "Restaurante",
    location: "São Paulo, SP",
    results: [
      {
        id: 1,
        nome: "Restaurante Exemplo 1",
        endereco: "Rua das Flores, 123 - São Paulo, SP",
        rating: 4.5,
        ratingCount: 250,
        tipo: "Restaurante Italiano",
        site: "www.exemplo1.com.br",
        numero: "(11) 98765-4321",
        email: "contato@exemplo1.com.br",
        regiao: "Centro",
      },
      {
        id: 2,
        nome: "Restaurante Exemplo 2",
        endereco: "Av. Paulista, 456 - São Paulo, SP",
        rating: 4.8,
        ratingCount: 380,
        tipo: "Restaurante Japonês",
        site: "www.exemplo2.com.br",
        numero: "(11) 98765-1234",
        email: "contato@exemplo2.com.br",
        regiao: "Paulista",
      },
      {
        id: 3,
        nome: "Restaurante Exemplo 3",
        endereco: "Rua Augusta, 789 - São Paulo, SP",
        rating: 4.2,
        ratingCount: 180,
        tipo: "Restaurante Brasileiro",
        site: "www.exemplo3.com.br",
        numero: "(11) 98765-5678",
        email: "contato@exemplo3.com.br",
        regiao: "Augusta",
      },
    ],
  };

  const handleDownload = () => {
    toast.success("Download iniciado!");
  };

  // Filter results based on selected filters
  const filteredResults = consulta.results.filter((result) => {
    if (phoneFilter === "possui" && !result.numero) return false;
    if (phoneFilter === "vazio" && result.numero) return false;
    if (emailFilter === "possui" && !result.email) return false;
    if (emailFilter === "vazio" && result.email) return false;
    if (websiteFilter === "possui" && !result.site) return false;
    if (websiteFilter === "vazio" && result.site) return false;
    return true;
  });

  // Calculate statistics
  const totalEstabelecimentos = consulta.results.length;
  const totalTelefones = consulta.results.filter(r => r.numero).length;
  const totalEmails = consulta.results.filter(r => r.email).length;
  const totalWebsites = consulta.results.filter(r => r.site).length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-2 -ml-2 hover:bg-accent/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Consultas
          </Button>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
            Detalhes da Consulta
          </h1>
          <div className="flex items-center gap-3 text-muted-foreground">
            <Badge variant="outline" className="border-primary/20 bg-primary/5">{consulta.category}</Badge>
            <Badge variant="outline" className="border-accent/20 bg-accent/5">{consulta.location}</Badge>
            <span className="text-sm">
              {new Date(consulta.date).toLocaleDateString("pt-BR")}
            </span>
          </div>
        </div>
        <Button onClick={handleDownload} className="shadow-lg hover:shadow-glow transition-all">
          <Download className="mr-2 h-4 w-4" />
          Baixar Relatório
        </Button>
      </div>

      {/* Statistics Module */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="shadow-card border-0 bg-gradient-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Estabelecimentos</p>
                <p className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  {totalEstabelecimentos}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
                <Building className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0 bg-gradient-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Telefones</p>
                <p className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  {totalTelefones}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
                <Phone className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0 bg-gradient-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total E-mails</p>
                <p className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  {totalEmails}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
                <Mail className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0 bg-gradient-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Websites</p>
                <p className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  {totalWebsites}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
                <Globe className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-2xl font-semibold">
            Resultados ({filteredResults.length} de {consulta.results.length})
          </h2>

          {/* Advanced Filters */}
          <div className="flex flex-wrap gap-3">
            <Select value={phoneFilter} onValueChange={setPhoneFilter}>
              <SelectTrigger className="w-[150px] h-10">
                <Phone className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Telefone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="possui">Possui</SelectItem>
                <SelectItem value="vazio">Vazio</SelectItem>
              </SelectContent>
            </Select>

            <Select value={emailFilter} onValueChange={setEmailFilter}>
              <SelectTrigger className="w-[150px] h-10">
                <Mail className="mr-2 h-4 w-4" />
                <SelectValue placeholder="E-mail" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="possui">Possui</SelectItem>
                <SelectItem value="vazio">Vazio</SelectItem>
              </SelectContent>
            </Select>

            <Select value={websiteFilter} onValueChange={setWebsiteFilter}>
              <SelectTrigger className="w-[150px] h-10">
                <Globe className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Website" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="possui">Possui</SelectItem>
                <SelectItem value="vazio">Vazio</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredResults.length === 0 ? (
          <Card className="shadow-card border-0">
            <CardContent className="py-12 text-center text-muted-foreground">
              <BarChart3 className="mx-auto h-12 w-12 opacity-20 mb-4" />
              <p className="text-lg">Nenhum resultado encontrado com os filtros selecionados.</p>
            </CardContent>
          </Card>
        ) : (
          filteredResults.map((result) => (
          <Card key={result.id} className="shadow-card hover:shadow-lg transition-all duration-300 border-0 bg-gradient-card">
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">{result.nome}</h3>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                      {result.tipo}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-gradient-primary px-4 py-2 shadow-glow">
                    <Star className="h-5 w-5 fill-primary-foreground text-primary-foreground" />
                    <span className="font-bold text-primary-foreground text-lg">
                      {result.rating}
                    </span>
                    <span className="text-sm text-primary-foreground/80">
                      ({result.ratingCount})
                    </span>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-start gap-3 rounded-lg bg-background/50 p-4 border">
                    <MapPin className="mt-0.5 h-5 w-5 text-primary" />
                    <div>
                      <div className="font-semibold text-sm text-muted-foreground mb-1">Endereço</div>
                      <div className="font-medium">{result.endereco}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg bg-background/50 p-4 border">
                    <Building className="mt-0.5 h-5 w-5 text-primary" />
                    <div>
                      <div className="font-semibold text-sm text-muted-foreground mb-1">Região</div>
                      <div className="font-medium">{result.regiao}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg bg-background/50 p-4 border">
                    <Phone className="mt-0.5 h-5 w-5 text-primary" />
                    <div>
                      <div className="font-semibold text-sm text-muted-foreground mb-1">Telefone</div>
                      <div className="font-medium">{result.numero}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg bg-background/50 p-4 border">
                    <Mail className="mt-0.5 h-5 w-5 text-primary" />
                    <div>
                      <div className="font-semibold text-sm text-muted-foreground mb-1">E-mail</div>
                      <div className="font-medium">{result.email}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg bg-background/50 p-4 border md:col-span-2">
                    <Globe className="mt-0.5 h-5 w-5 text-primary" />
                    <div>
                      <div className="font-semibold text-sm text-muted-foreground mb-1">Website</div>
                      <a
                        href={`https://${result.site}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-medium"
                      >
                        {result.site}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ConsultaDetalhes;
