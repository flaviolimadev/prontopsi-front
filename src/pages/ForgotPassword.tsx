import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Loader2, ArrowLeft, Sun, Moon, Mail } from "lucide-react";
import { useDarkMode } from "../components/theme/DarkModeProvider";
import apiService from "../services/api.service";
import { useToast } from "../hooks/use-toast";

// Importar as logos
import logoWhite from "@/assets/img/ProntuPsi - Horizontal Principal Branco.svg";
import logoColor from "@/assets/img/ProntuPsi - Principal.svg";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const { darkMode, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await apiService.requestPasswordReset(email);
      
      if (response.message) {
        setSuccess(true);
        toast({
          title: "Email enviado!",
          description: "Verifique sua caixa de entrada para o código de recuperação.",
        });
      }
    } catch (err: any) {
      console.error('Erro ao solicitar reset de senha:', err);
      setError(err.response?.data?.message || "Erro ao enviar email de recuperação");
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
          onClick={() => navigate("/login")}
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
            Recupere sua senha
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Esqueceu sua senha?
            </CardTitle>
            <CardDescription>
              Digite seu email e enviaremos um código de recuperação
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="space-y-4">
                <Alert>
                  <AlertDescription>
                    Enviamos um código de recuperação para <strong>{email}</strong>. 
                    Verifique sua caixa de entrada e spam.
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <Button
                    onClick={() => navigate("/reset-password", { state: { email } })}
                    className="w-full"
                  >
                    Continuar para Reset de Senha
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSuccess(false);
                      setEmail("");
                    }}
                    className="w-full"
                  >
                    Enviar novo código
                  </Button>
                </div>
              </div>
            ) : (
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

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar Código de Recuperação"
                  )}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Lembrou sua senha?{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto font-semibold"
                  onClick={() => navigate("/login")}
                >
                  Fazer login
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}










