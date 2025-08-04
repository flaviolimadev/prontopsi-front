import { Logo } from "@/components/ui/logo";
export function Footer() {
  return <footer className="bg-gradient-to-br from-primary/10 to-purple-600/10 border-t border-border/20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 mx-[100px]">
          {/* Logo */}
          <div className="flex items-center">
            <Logo size="sm" />
          </div>

          {/* Links de navegação */}
          <div className="flex items-center space-x-6">
            <a href="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">
              Termos
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">
              Privacidade
            </a>
            <a href="/login" className="text-muted-foreground hover:text-primary text-sm transition-colors">
              Login
            </a>
            <a href="/escolher-plano" className="text-muted-foreground hover:text-primary text-sm transition-colors">
              Registrar
            </a>
          </div>

          {/* Copyright */}
          <div className="text-center md:text-right">
            <p className="text-muted-foreground text-sm">
              © 2024 ProntuPsi • Todos os direitos reservados
            </p>
          </div>
        </div>
      </div>
    </footer>;
}