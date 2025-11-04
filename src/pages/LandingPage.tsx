import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Radar, Search, TrendingUp, Download, Shield, Zap, BarChart, Users } from "lucide-react";
import LandingCarousel from "@/components/LandingCarousel";

const LandingPage = () => {
  const features = [
    {
      icon: Search,
      title: "Busca Inteligente",
      description: "Encontre leads qualificados com base em categoria e localização de forma rápida e precisa.",
    },
    {
      icon: TrendingUp,
      title: "Dados Atualizados",
      description: "Informações em tempo real sobre empresas: nome, endereço, avaliações, contatos e muito mais.",
    },
    {
      icon: Download,
      title: "Exportação Fácil",
      description: "Baixe seus relatórios em formatos compatíveis (CSV/XLSX) para usar em suas ferramentas.",
    },
    {
      icon: Shield,
      title: "Seguro e Confiável",
      description: "Seus dados estão protegidos com tecnologia de ponta e criptografia de última geração.",
    },
    {
      icon: Zap,
      title: "Rápido e Eficiente",
      description: "Consultas processadas em segundos, economizando seu tempo e aumentando produtividade.",
    },
    {
      icon: BarChart,
      title: "Métricas Detalhadas",
      description: "Acompanhe seu consumo de tokens, histórico de consultas e custo médio por lead.",
    },
  ];

  const stats = [
    { icon: Users, value: "10K+", label: "Usuários Ativos" },
    { icon: Search, value: "500K+", label: "Consultas Realizadas" },
    { icon: TrendingUp, value: "98%", label: "Taxa de Satisfação" },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
              <Radar className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Lead Radar</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/login">Entrar</Link>
            </Button>
            <Button asChild className="shadow-lg hover:shadow-glow">
              <Link to="/register">Começar Grátis</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 md:py-32">
        <div className="mx-auto max-w-4xl text-center space-y-8 animate-fade-in">
          <Badge className="bg-gradient-primary border-0 shadow-glow text-base px-4 py-1">
            🎉 Ganhe 15 tokens grátis no cadastro
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent leading-tight">
            Encontre Leads Qualificados em Segundos
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A plataforma completa para prospecção inteligente de empresas. 
            Economize tempo, aumente suas vendas e turbine seus resultados.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" asChild className="h-14 px-8 text-lg shadow-lg hover:shadow-glow">
              <Link to="/register">Criar Conta Grátis</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-14 px-8 text-lg">
              <Link to="/login">Já sou cliente</Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-8 md:grid-cols-3 mt-20 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <Card
              key={stat.label}
              className="border-0 bg-gradient-card shadow-card text-center"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="pt-8 pb-6">
                <stat.icon className="h-8 w-8 mx-auto mb-4 text-primary" />
                <div className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Recursos Poderosos
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tudo que você precisa para encontrar e conquistar novos clientes
          </p>
          {/* Carrossel pequeno logo abaixo do texto, sem substituir o conteúdo */}
          <div className="mt-6">
            <LandingCarousel />
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className="border-0 bg-gradient-card shadow-card hover:shadow-xl transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader>
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-primary shadow-glow mb-4">
                  <feature.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-6 py-20 bg-gradient-hero">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Como Funciona
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Simples, rápido e eficiente
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {[
            { step: "1", title: "Cadastre-se", description: "Crie sua conta e ganhe 15 tokens grátis para começar" },
            { step: "2", title: "Faça sua Busca", description: "Digite a categoria e localização desejada" },
            { step: "3", title: "Receba os Leads", description: "Baixe seus relatórios e comece a vender" },
          ].map((item, index) => (
            <Card
              key={item.step}
              className="border-0 bg-gradient-card shadow-card text-center"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="pt-12 pb-8">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary shadow-glow mb-6">
                  <span className="text-3xl font-bold text-primary-foreground">{item.step}</span>
                </div>
                <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <Card className="border-0 bg-gradient-primary shadow-xl text-center max-w-4xl mx-auto">
          <CardContent className="pt-16 pb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
              Pronto para Turbinar suas Vendas?
            </h2>
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Junte-se a milhares de profissionais que já estão usando o Lead Radar
            </p>
            <Button size="lg" variant="secondary" asChild className="h-14 px-8 text-lg shadow-lg">
              <Link to="/register">Começar Agora - É Grátis</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
                <Radar className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">Lead Radar</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Lead Radar. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
