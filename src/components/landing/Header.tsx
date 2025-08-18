import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/prontupsi-logo.png";

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/10 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img src={logo} alt="ProntuPsi" className="h-8 w-auto" />
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
            Produtos
          </a>
          <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
            Preço
          </a>
          <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">
            Contato
          </a>
        </nav>

        <div className="flex items-center space-x-4">
          <Link to="/login">
            <Button variant="ghost" className="hidden sm:inline-flex">
              Acessar
            </Button>
          </Link>
          <Link to="/signup">
            <Button className="bg-gradient-hero hover:opacity-90 shadow-glow-primary border-0">
              Cadastre-se
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;


