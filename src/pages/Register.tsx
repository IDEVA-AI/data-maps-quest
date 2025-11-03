import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const Register = () => {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmPassword: "",
    cupom: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar
    };
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateName = (name: string) => {
    return name.trim().length >= 2;
  };

  const passwordValidation = validatePassword(formData.senha);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação dos campos
    if (!formData.nome || !formData.email || !formData.senha || !formData.confirmPassword) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    if (!validateName(formData.nome)) {
      toast.error("Nome deve ter pelo menos 2 caracteres");
      return;
    }

    if (!validateEmail(formData.email)) {
      toast.error("Por favor, insira um email válido");
      return;
    }

    if (!passwordValidation.isValid) {
      toast.error("A senha não atende aos critérios de segurança");
      return;
    }

    if (formData.senha !== formData.confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await register({
        nome: formData.nome.trim(),
        email: formData.email.toLowerCase().trim(),
        senha: formData.senha,
        cupom: formData.cupom?.trim()
      });
      
      if (success) {
        toast.success("Conta criada com sucesso! Redirecionando...");
        setTimeout(() => {
          navigate("/consulta");
        }, 1500);
      }
    } catch (error) {
      console.error("Register error:", error);
      toast.error("Erro interno do servidor");
    } finally {
      setIsLoading(false);
    }
  };

  const PasswordCriteria = ({ met, text }: { met: boolean; text: string }) => (
    <div className={`flex items-center space-x-2 text-sm ${met ? 'text-green-600' : 'text-gray-500'}`}>
      {met ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
      <span>{text}</span>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Criar Conta</CardTitle>
          <CardDescription className="text-center">
            Preencha os dados abaixo para criar sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seção: Dados pessoais */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Dados pessoais</h3>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  type="text"
                  placeholder="Seu nome completo"
                  value={formData.nome}
                  onChange={(e) => handleInputChange("nome", e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Seção: Dados de registro */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Dados de registro</h3>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <div className="relative">
                  <Input
                    id="senha"
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    value={formData.senha}
                    onChange={(e) => handleInputChange("senha", e.target.value)}
                    required
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {formData.senha && (
                  <div className="space-y-1 mt-2 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm font-medium text-gray-700">Critérios da senha:</p>
                    <PasswordCriteria met={passwordValidation.minLength} text="Mínimo 8 caracteres" />
                    <PasswordCriteria met={passwordValidation.hasUpperCase} text="Pelo menos 1 letra maiúscula" />
                    <PasswordCriteria met={passwordValidation.hasLowerCase} text="Pelo menos 1 letra minúscula" />
                    <PasswordCriteria met={passwordValidation.hasNumbers} text="Pelo menos 1 número" />
                    <PasswordCriteria met={passwordValidation.hasSpecialChar} text="Pelo menos 1 caractere especial" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirme sua senha"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    required
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {formData.confirmPassword && formData.senha !== formData.confirmPassword && (
                  <p className="text-sm text-red-600">As senhas não coincidem</p>
                )}
              </div>
            </div>

            {/* Seção: Cupom */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Cupom</h3>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="cupom">Cupom de desconto (opcional)</Label>
                <Input
                  id="cupom"
                  type="text"
                  placeholder="Insira seu cupom"
                  value={formData.cupom}
                  onChange={(e) => handleInputChange("cupom", e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !passwordValidation.isValid || formData.senha !== formData.confirmPassword}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                "Criar Conta"
              )}
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm">
            Já tem uma conta?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Faça login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
