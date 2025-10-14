import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Loader2, MapPin, Star } from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);

    // Mock search - simulate API call
    setTimeout(() => {
      const mockResults = [
        {
          id: 1,
          name: "Restaurante Exemplo 1",
          address: "Rua das Flores, 123 - São Paulo, SP",
          rating: 4.5,
          category: category,
          phone: "(11) 98765-4321",
        },
        {
          id: 2,
          name: "Restaurante Exemplo 2",
          address: "Av. Paulista, 456 - São Paulo, SP",
          rating: 4.8,
          category: category,
          phone: "(11) 98765-1234",
        },
        {
          id: 3,
          name: "Restaurante Exemplo 3",
          address: "Rua Augusta, 789 - São Paulo, SP",
          rating: 4.2,
          category: category,
          phone: "(11) 98765-5678",
        },
      ];
      setResults(mockResults);
      setIsSearching(false);
      toast.success("Busca concluída! 15 tokens debitados.");
    }, 2000);
  };

  const handleExport = () => {
    toast.success("Relatório exportado com sucesso!");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Pesquise dados de empresas por categoria e localização
        </p>
      </div>

      {/* Search Form */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Nova Consulta</CardTitle>
          <CardDescription>
            Cada busca consome 15 tokens do seu saldo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Input
                  id="category"
                  placeholder="Ex: restaurante, academia, farmácia"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Localização</Label>
                <Input
                  id="location"
                  placeholder="Ex: São Paulo, Rio de Janeiro"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full md:w-auto"
              disabled={isSearching}
            >
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Buscar Empresas
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">
              Resultados ({results.length})
            </h2>
            <Button onClick={handleExport} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          </div>

          <div className="grid gap-4">
            {results.map((result) => (
              <Card key={result.id} className="shadow-sm">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{result.name}</h3>
                        <Badge variant="secondary" className="mt-1">
                          {result.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1">
                        <Star className="h-4 w-4 fill-primary text-primary" />
                        <span className="font-medium text-primary">
                          {result.rating}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {result.address}
                      </div>
                      <div className="font-medium text-foreground">
                        {result.phone}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
