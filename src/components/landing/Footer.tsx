import { Github, Twitter, Linkedin, Mail } from "lucide-react";

export const Footer = () => {
  const links = {
    product: [
      { name: "Funcionalidades", href: "#features" },
      { name: "Planos", href: "#pricing" },
      { name: "Demonstração", href: "#demo" },
      { name: "Ajuda", href: "#" },
    ],
    company: [
      { name: "Sobre o ProntuPsi", href: "#" },
      { name: "Blog", href: "#" },
      { name: "Carreiras", href: "#" },
      { name: "Contato", href: "#contact" },
    ],
    legal: [
      { name: "Política de Privacidade", href: "#" },
      { name: "Termos de Uso", href: "#" },
      { name: "Segurança e LGPD", href: "#" },
      { name: "Status do Sistema", href: "#" },
    ],
  };

  return (
    <footer className="border-t border-border/10 py-16">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-5 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-hero"></div>
              <span className="font-heading font-bold text-lg">ProntuPsi</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">A plataforma pensada para psicólogos que desejam mais organização, segurança e tempo para focar no que importa: cuidar de pessoas.</p>
            <div className="flex space-x-3">
              <a href="#" className="p-2 rounded-lg bg-gradient-card border border-primary/10 hover:border-primary/30 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-gradient-card border border-primary/10 hover:border-primary/30 transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-gradient-card border border-primary/10 hover:border-primary/30 transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="mailto:contato@prontupsi.com" className="p-2 rounded-lg bg-gradient-card border border-primary/10 hover:border-primary/30 transition-colors">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-heading font-semibold mb-3 text-sm">Produto</h3>
            <ul className="space-y-2">
              {links.product.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-semibold mb-3 text-sm">Empresa</h3>
            <ul className="space-y-2">
              {links.company.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-semibold mb-3 text-sm">Legal</h3>
            <ul className="space-y-2">
              {links.legal.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-border/10 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-xs">© {new Date().getFullYear()} ProntuPsi. Todos os direitos reservados.</p>
          <p className="text-muted-foreground text-xs mt-3 md:mt-0">Desenvolvido com ❤️ pela ProntuPsi</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


