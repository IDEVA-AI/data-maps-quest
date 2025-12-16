import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
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
import ConsultaApi from "./pages/ConsultaApi";
import NotFound from "./pages/NotFound";
import Maintenance from "./pages/Maintenance";
import SeedCupom from "./pages/SeedCupom";
import PaymentCallback from "./pages/PaymentCallback";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <BrowserRouter>
          <Routes>
            <Route path="/home" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin/seed-cupom" element={<SeedCupom />} />
            <Route path="/payment/callback" element={<PaymentCallback />} />
            <Route path="/register-plan" element={<RegisterWithPlan />} />
            <Route path="/" element={<LandingPage />} />
            <Route path="/maintenance" element={
              <ProtectedRoute>
                <Maintenance />
              </ProtectedRoute>
            } />
            <Route path="/consulta" element={
              <ProtectedRoute>
                <Layout><Dashboard /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/consulta-api" element={
              <ProtectedRoute>
                <Layout><ConsultaApi /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/consulta/:id" element={
              <ProtectedRoute>
                <Layout><ConsultaDetalhes /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/disparo" element={
              <ProtectedRoute>
                <Layout><Disparo /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/disparo/:id" element={
              <ProtectedRoute>
                <Layout><DisparoConsulta /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/history" element={
              <ProtectedRoute>
                <Layout><History /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/tokens" element={
              <ProtectedRoute>
                <Layout><TokenManagement /></Layout>
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </ThemeProvider>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
