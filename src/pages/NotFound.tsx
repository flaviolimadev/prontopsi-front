
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { useAuth } from "@/components/auth/AuthProvider";

const NotFound = () => {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  // Redirect authenticated users to dashboard, unauthenticated users to home
  const redirectPath = user ? "/dashboard" : "/";
  const buttonText = user ? "Voltar ao Dashboard" : "Voltar ao Início";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <Logo size="lg" className="justify-center mb-8" />
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">404</h1>
          <p className="text-xl text-muted-foreground">Página não encontrada</p>
          <p className="text-sm text-muted-foreground">
            A página que você está procurando não existe.
          </p>
        </div>
        <Button asChild>
          <Link to={redirectPath} className="inline-flex items-center gap-2">
            <Home className="w-4 h-4" />
            {buttonText}
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
