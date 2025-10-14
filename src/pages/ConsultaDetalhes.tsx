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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-2 -ml-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Consultas
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            Detalhes da Consulta
          </h1>
          <div className="flex items-center gap-3 text-muted-foreground">
            <Badge variant="outline">{consulta.category}</Badge>
            <Badge variant="outline">{consulta.location}</Badge>
            <span className="text-sm">
              {new Date(consulta.date).toLocaleDateString("pt-BR")}
            </span>
          </div>
        </div>
        <Button onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Baixar Relatório
        </Button>
      </div>

      {/* Results */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Resultados ({consulta.results.length})
        </h2>

        {consulta.results.map((result) => (
          <Card key={result.id} className="shadow-sm">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold">{result.nome}</h3>
                    <Badge variant="secondary">{result.tipo}</Badge>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span className="font-medium text-primary">
                      {result.rating}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({result.ratingCount})
                    </span>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Endereço</div>
                      <div className="text-muted-foreground">{result.endereco}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-sm">
                    <Building className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Região</div>
                      <div className="text-muted-foreground">{result.regiao}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-sm">
                    <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Telefone</div>
                      <div className="text-muted-foreground">{result.numero}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-sm">
                    <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">E-mail</div>
                      <div className="text-muted-foreground">{result.email}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-sm md:col-span-2">
                    <Globe className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Website</div>
                      <a
                        href={`https://${result.site}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
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
