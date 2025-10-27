import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import TokenManagement from "./pages/TokenManagement";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RegisterWithPlan from "./pages/RegisterWithPlan";
import LandingPage from "./pages/LandingPage";
import ConsultaDetalhes from "./pages/ConsultaDetalhes";
import Disparo from "./pages/Disparo";
import DisparoConsulta from "./pages/DisparoConsulta";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/home" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register-plan" element={<RegisterWithPlan />} />
          <Route path="/" element={<Navigate to="/consulta" replace />} />
          <Route path="/consulta" element={<Layout><Dashboard /></Layout>} />
          <Route path="/consulta/:id" element={<Layout><ConsultaDetalhes /></Layout>} />
          <Route path="/disparo" element={<Layout><Disparo /></Layout>} />
          <Route path="/disparo/:id" element={<Layout><DisparoConsulta /></Layout>} />
          <Route path="/history" element={<Layout><History /></Layout>} />
          <Route path="/tokens" element={<Layout><TokenManagement /></Layout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
