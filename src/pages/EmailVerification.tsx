import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Loader2, ArrowLeft, Sun, Moon, Mail, RefreshCw } from "lucide-react";
import { useDarkMode } from "../components/theme/DarkModeProvider";
import { useAuth } from "../components/auth/AuthProvider";
import apiService from "../services/api.service";

// Importar as logos
import logoWhite from "@/assets/img/ProntuPsi - Horizontal Principal Branco.svg";
import logoColor from "@/assets/img/ProntuPsi - Principal.svg";

export default function EmailVerification() {
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { authState } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Obter email da URL (compatível com HashRouter) ou da localização
  const search = location.search || (typeof window !== 'undefined' ? window.location.hash.split('?')[1] || '' : '');
  const urlParams = new URLSearchParams(search);
  const email = urlParams.get('email') || (location.state as any)?.email || "";

  console.log('🔧 EmailVerification: Componente carregado');
  console.log('🔧 EmailVerification: Email recebido:', email);
  console.log('🔧 EmailVerification: Auth state:', authState);

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    console.log('🔍 EmailVerification: Iniciando verificação de email:', { email, verificationCode });

    try {
      const response = await apiService.verifyEmail(email, verificationCode);
      
      console.log('🔍 EmailVerification: Verificação bem-sucedida:', response);
      setSuccess("Email verificado com sucesso! Redirecionando...");
      
      // Salvar token e dados do usuário
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Redirecionar para dashboard após 2 segundos
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 2000);
      
    } catch (err: any) {
      console.error('🔍 EmailVerification: Erro na verificação:', err.response?.data || err.message);
      setError(err.response?.data?.message || "Erro ao verificar email");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError("");
    setSuccess("");
    setResendLoading(true);

    console.log('🔍 EmailVerification: Reenviando código para:', email);

    try {
      const response = await apiService.resendVerificationCode(email);
      console.log('🔍 EmailVerification: Código reenviado:', response);
      setSuccess("Novo código de verificação enviado com sucesso!");
    } catch (err: any) {
      console.error('🔍 EmailVerification: Erro ao reenviar código:', err.response?.data || err.message);
      setError(err.response?.data?.message || "Erro ao reenviar código");
    } finally {
      setResendLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Botões de controle no topo */}
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackToLogin}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao Login
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
            Verificação de Email
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <CardTitle className="text-center">Verifique seu Email</CardTitle>
            <CardDescription className="text-center">
              Enviamos um código de verificação para <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="mb-4 border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
                <AlertDescription className="text-green-800 dark:text-green-200">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleVerifyEmail} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verificationCode">Código de Verificação</Label>
                <Input
                  id="verificationCode"
                  type="text"
                  placeholder="Digite o código de 6 dígitos"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || verificationCode.length !== 6}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  "Verificar Email"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Não recebeu o código?
              </p>
              <Button
                variant="outline"
                onClick={handleResendCode}
                disabled={resendLoading}
                className="w-full"
              >
                {resendLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reenviar Código
                  </>
                )}
              </Button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                📧 Dicas importantes:
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Verifique sua caixa de entrada e spam</li>
                <li>• O código é válido por 10 minutos</li>
                <li>• Digite apenas os 6 números do código</li>
                <li>• Não compartilhe este código com outras pessoas</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
