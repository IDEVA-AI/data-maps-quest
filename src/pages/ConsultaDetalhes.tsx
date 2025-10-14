import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, MapPin, Star, Phone, Mail, Globe, Building } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";

const ConsultaDetalhes = () => {
  const navigate = useNavigate();
  const { id } = useParams();

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

      {/* Results */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">
            Resultados ({consulta.results.length})
          </h2>
        </div>

        {consulta.results.map((result) => (
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
        ))}
      </div>
    </div>
  );
};

export default ConsultaDetalhes;
