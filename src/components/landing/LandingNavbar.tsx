import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useDarkMode } from "@/components/theme/DarkModeProvider";
import { Sun, Moon } from "lucide-react";

// Importar as logos
import logoWhite from "@/assets/img/ProntuPsi - Horizontal Principal Branco.svg";
import logoColor from "@/assets/img/ProntuPsi - Principal.svg";

const LandingNavbar = () => {
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src={darkMode ? logoWhite : logoColor} 
              alt="ProntoPsi" 
              className="h-9 w-auto"
            />
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#como-funciona" className="text-muted-foreground hover:text-foreground transition-colors">
              Como Funciona
            </a>
            <a href="#planos" className="text-muted-foreground hover:text-foreground transition-colors">
              Planos
            </a>
            <a href="#depoimentos" className="text-muted-foreground hover:text-foreground transition-colors">
              Depoimentos
            </a>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              className="h-8 w-8 p-0"
            >
              {darkMode ? (
                <Sun className="h-4 w-4 text-yellow-500" />
              ) : (
                <Moon className="h-4 w-4 text-gray-600" />
              )}
            </Button>
            
            <Button variant="ghost" asChild>
              <Link to="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <a href="#planos">Testar Grátis</a>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default LandingNavbar;