import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Loader2, ArrowLeft, Sun, Moon } from "lucide-react";
import { useDarkMode } from "../components/theme/DarkModeProvider";
import { useAuth } from "../components/auth/AuthProvider";

// Importar as logos
import logoWhite from "@/assets/img/ProntuPsi - Horizontal Principal Branco.svg";
import logoColor from "@/assets/img/ProntuPsi - Principal.svg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { signIn, authState, isAuthenticated, needsVerification, loading: authLoading } = useAuth();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirecionar para a página de origem ou dashboard
  const from = location.state?.from?.pathname || "/dashboard";

  console.log('🔧 Login: Estado de autenticação:', authState);
  console.log('🔧 Login: isAuthenticated:', isAuthenticated);
  console.log('🔧 Login: needsVerification:', needsVerification);

  // Controle de redirecionamento baseado no estado
  React.useEffect(() => {
    if (authState === 'AUTHENTICATED') {
      console.log('🔧 Login: Usuário autenticado e verificado, redirecionando para dashboard');
      navigate(from, { replace: true });
    }
  }, [authState, navigate, from]);

  // Mostrar loading enquanto inicializa
  if (authState === 'INITIALIZING') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    console.log('🔧 Login: Iniciando login para:', email);

    try {
      const result = await signIn(email, password);
      
      console.log('🔧 Login: Resultado:', result);
      
      if (result.success) {
        console.log('🔧 Login: Login bem-sucedido');
        // O redirecionamento será feito pelo useEffect baseado no authState
                        } else if (result.requiresVerification) {
                    console.log('🔧 Login: Email precisa de verificação, redirecionando...');
                    
                    // Forçar redirecionamento
                    window.location.href = `/email-verification?email=${encodeURIComponent(result.email || email)}`;
                  } else {
        console.log('🔧 Login: Erro:', result.error);
        setError(result.error || "Erro ao fazer login");
      }
    } catch (err) {
      console.error('🔧 Login: Erro interno:', err);
      setError("Erro interno do servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Botões de controle no topo */}
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>
      
      <div className="absolute top-4 right-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleDarkMode}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>

      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src={darkMode ? logoWhite : logoColor} 
              alt="ProntoPsi" 
              className="h-16 w-auto"
            />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Faça login na sua conta
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Entre com suas credenciais para acessar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  required
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Não tem uma conta?{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto font-semibold"
                  onClick={() => navigate("/signup")}
                >
                  Cadastre-se
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}