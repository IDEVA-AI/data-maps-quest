import { useState } from "react";
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
import { Zap, Rocket, Crown, Download, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { downloadCSV, CSVColumn, validateCSVData, formatDateISO, formatCurrency } from "@/utils/csvUtils";
import { tokenService } from "@/services/tokenService";
import { paymentService } from "@/services/paymentService";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

import { productService, Produto } from "@/services/productService";
import { transacaoService, Transacao } from "@/services/transacaoService";

const TokenManagement = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { user } = useAuth();
  const [userTokens, setUserTokens] = useState<number>(0);
  const [products, setProducts] = useState<Produto[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [transactions, setTransactions] = useState<Transacao[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  useEffect(() => {
    const loadBalance = async () => {
      if (user) {
        const resp = await tokenService.getBalance(user.id_usuario)
        if (resp.success && resp.data) setUserTokens(resp.data.tokens)
      }
    }
    loadBalance()
  }, [user])

  useEffect(() => {
    const loadProducts = async () => {
      setLoadingProducts(true);
      const resp = await productService.getProducts();
      if (resp.success && resp.data) {
        setProducts(resp.data);
      } else {
        toast.error("Erro ao carregar produtos");
      }
      setLoadingProducts(false);
    };
    loadProducts();
  }, []);

  useEffect(() => {
    const loadTransactions = async () => {
      if (user) {
        setLoadingTransactions(true);
        const resp = await transacaoService.getByUserId(user.id_usuario);
        if (resp.success && resp.data) {
          setTransactions(resp.data);
        }
        setLoadingTransactions(false);
      }
    };
    loadTransactions();
  }, [user]);



  const handlePurchase = async (productId: string) => {
    setSelectedPlan(productId)
    const plan = products.find(p => p.id === productId)
    if (!plan) {
      console.log({ level: 'error', action: 'checkout', reason: 'invalid_plan', productId })
      toast.error("Plano inválido")
      return
    }
    if (!user) {
      console.log({ level: 'error', action: 'checkout', reason: 'no_user_session', plan })
      toast.error("Faça login para comprar")
      return
    }

    // Validação de dados do usuário
    if (!user.cpf || !user.telefone) {
      toast.error("Por favor, atualize seu cadastro com CPF e Telefone para continuar.")
      // TODO: Redirecionar para perfil ou abrir modal de atualização
      return
    }

    const req = {
      frequency: 'ONE_TIME' as const,
      methods: ['PIX'] as ('PIX' | 'CARD')[],
      returnUrl: `${window.location.origin}/payment/callback?product_id=${encodeURIComponent(plan.id.toString())}`,
      completionUrl: `${window.location.origin}/tokens`,
      products: [
        {
          externalId: plan.external_id || plan.id,
          name: plan.nome,
          quantity: 1,
          price: Math.round(plan.preco * 100), // Em centavos
          description: `Compra de ${plan.qtd_tokens} tokens`
        }
      ],
      customer: {
        name: user.nome,
        email: user.email,
        cellphone: user.telefone.replace(/\D/g, ''),
        taxId: user.cpf.replace(/\D/g, '')
      }
    }

    try {
      console.log({ level: 'info', action: 'checkout_request', req })
      const resp = await paymentService.createCheckout(req)
      if (!resp.success || !resp.data) {
        console.log({ level: 'error', action: 'checkout_response_error', resp })
        toast.error(resp.error || "Falha ao iniciar pagamento")
        return
      }
      const url = resp.data.checkoutUrl
      if (!url) {
        console.log({ level: 'error', action: 'checkout_missing_url', resp })
        toast.error("URL de checkout inválida")
        return
      }
      console.log({ level: 'info', action: 'checkout_redirect', url, transactionId: resp.data.transactionId })
      window.location.href = url
    } catch (e) {
      console.log({ level: 'error', action: 'checkout_exception', error: e })
      toast.error("Erro inesperado ao iniciar pagamento")
    }
  }

  const handleDownloadHistory = () => {
    try {
      // Validar se há dados
      if (!validateCSVData(transactions)) {
        toast.error("Não há dados disponíveis para download");
        return;
      }

      toast.info("Gerando arquivo CSV...");

      // Definir colunas do CSV
      const columns: CSVColumn[] = [
        {
          header: 'Data de Registro (ISO 8601)',
          key: 'date',
          formatter: (value: any) => value ? formatDateISO(value) : ''
        },
        {
          header: 'Quantidade de Tokens',
          key: 'qtd_tokens',
          formatter: (value: any) => value ? value.toString() + ' tokens' : '0'
        },
        {
          header: 'Valor Pago',
          key: 'valor',
          formatter: (value: any) => value ? formatCurrency(value) : 'R$ 0,00'
        },
        {
          header: 'Método de Pagamento',
          key: 'metodo_pagamento',
          formatter: (value: any) => value || 'N/A'
        }
      ];

      // Preparar dados para CSV
      const csvData = transactions.map(tx => ({
        date: tx.created_at,
        qtd_tokens: tx.qtd_tokens,
        valor: tx.valor,
        metodo_pagamento: tx.metodo_pagamento
      }));

      // Gerar e baixar CSV
      downloadCSV(csvData, columns, {
        filename: 'registro_tokens.csv'
      });

      toast.success("Download concluído com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar CSV:", error);
      toast.error("Erro ao gerar arquivo CSV");
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
            Recargas
          </h1>
          <p className="text-lg text-muted-foreground">
            Gerencie seus tokens e acompanhe seu histórico de recargas
          </p>
        </div>

        {/* Token Balance - Small */}
        <Card className="border-0 bg-gradient-hero shadow-card">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">Saldo Atual de Tokens</p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Quantidade de tokens disponíveis para realizar consultas. Cada consulta consome 15 tokens.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                {userTokens} tokens
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Histórico de Recargas */}
        <Card className="shadow-card border-0 bg-gradient-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Histórico de Recargas</CardTitle>
                <CardDescription className="text-base mt-2">
                  Todas as suas compras de tokens
                </CardDescription>
              </div>
              <Button variant="outline" onClick={handleDownloadHistory}>
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead className="text-right">Tokens</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingTransactions ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Carregando histórico...
                    </TableCell>
                  </TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Nenhuma transação encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((tx) => (
                    <TableRow key={tx.id_transacao}>
                      <TableCell className="font-medium">
                        {new Date(tx.created_at!).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-primary/10 border-primary/20">
                          {tx.qtd_tokens} tokens
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {tx.qtd_tokens} tokens
                      </TableCell>
                      <TableCell className="text-right font-semibold text-primary">
                        R$ {tx.valor.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Info Banner */}
        <Card className="border-0 bg-gradient-hero shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 mb-4">
              <p className="mb-2">
                Saldo: <span className="font-mono">{userTokens}</span> tokens
              </p>
              <Button variant="outline" size="sm" onClick={async () => {
                if (user) {
                  const resp = await tokenService.getBalance(user.id_usuario);
                  if (resp.success && resp.data) setUserTokens(resp.data.tokens);
                  else toast.error('Erro ao atualizar saldo');
                }
              }}>
                Atualizar
              </Button>
            </div>
            <div className="text-center space-y-2">
              <p className="text-base font-semibold">
                Cada consulta consome <span className="font-bold text-primary text-lg">15 tokens</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Escolha o plano ideal para suas necessidades e aumente seu potencial de vendas
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Cards */}
        <div className="grid gap-8 md:grid-cols-3">
          {loadingProducts ? (
            <div className="col-span-3 text-center py-12 text-muted-foreground">
              Carregando planos...
            </div>
          ) : (
            products.map((product, index) => {
              // Determine icon based on tokens or price (simple logic for now)
              const Icon = product.qtd_tokens < 500 ? Zap : product.qtd_tokens < 1500 ? Rocket : Crown;

              return (
                <Card
                  key={product.id}
                  className={`relative shadow-card hover:shadow-xl transition-all duration-300 border-0 bg-gradient-card ${product.eh_popular ? "ring-2 ring-primary shadow-glow scale-105" : ""
                    }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {product.eh_popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gradient-primary border-0 shadow-glow text-base px-4 py-1">
                        ⭐ Mais Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center space-y-4 pt-8">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
                      <Icon className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-2xl">{product.nome}</CardTitle>
                    <CardDescription className="space-y-2">
                      <div className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                        R$ {product.preco.toFixed(2)}
                      </div>
                      <div className="text-base font-medium text-muted-foreground">
                        {product.qtd_tokens} tokens
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 px-8 pb-8">
                    <div
                      className="space-y-2 text-sm text-muted-foreground [&>ul]:space-y-2 [&>ul>li]:flex [&>ul>li]:items-center [&>ul>li]:gap-2 [&>ul>li]:before:content-['•']"
                      dangerouslySetInnerHTML={{ __html: product.beneficios_html }}
                    />
                    <Button
                      onClick={() => handlePurchase(product.id)}
                      className={`w-full h-12 text-base shadow-lg hover:shadow-glow transition-all ${product.eh_popular ? "bg-gradient-primary" : ""
                        }`}
                      variant={product.eh_popular ? "default" : "outline"}
                    >
                      Comprar Agora
                    </Button>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default TokenManagement;
