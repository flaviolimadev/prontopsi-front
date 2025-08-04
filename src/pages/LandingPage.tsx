import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Check, Calendar, Brain, MessageSquare, CreditCard, Shield, FolderOpen, Clock, Users, Star, ArrowRight, Zap, Heart, Sparkles, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import LandingNavbar from "@/components/landing/LandingNavbar";
import PricingSection from "@/components/landing/PricingSection";
import DashboardMockup from "@/components/landing/DashboardMockup";
import { Footer } from "@/components/layout/Footer";
const LandingPage = () => {
  const features = [{
    icon: Calendar,
    title: "Agenda Inteligente",
    description: "Gerencie sessões com poucos cliques."
  }, {
    icon: Brain,
    title: "Prontuários Seguros",
    description: "Anotações criptografadas e organizadas."
  }, {
    icon: MessageSquare,
    title: "Lembretes automáticos",
    description: "Redução de faltas via WhatsApp ou SMS."
  }, {
    icon: CreditCard,
    title: "Controle Financeiro",
    description: "Veja o que entra, sai e quem está devendo."
  }, {
    icon: Shield,
    title: "Segurança LGPD",
    description: "Seus dados e de seus pacientes totalmente protegidos."
  }, {
    icon: FolderOpen,
    title: "Arquivos organizados",
    description: "Guarde documentos por paciente."
  }];
  return <div className="min-h-screen bg-background">
      <LandingNavbar />
      
      {/* Header / Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/5 to-background"></div>
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">

          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Organização, segurança e <br />
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              tranquilidade
            </span> na rotina do psicólogo.
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed">
            A única plataforma que <strong className="text-foreground">realmente entende</strong> psicólogos autônomos. 
            <br />Menos burocracia, mais cuidado, resultados comprovados.
          </p>

          {/* Social Proof */}
          <div className="flex justify-center items-center gap-6 mb-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-success" />
              <span>70% menos faltas</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span>3h/semana economizadas</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              <span>99% satisfação</span>
            </div>
          </div>
          
          <div className="flex justify-center mb-12">
            <Button size="lg" className="text-lg px-10 py-6 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-2xl shadow-primary/25 hover:shadow-primary/40 transition-all duration-500 rounded-3xl border border-white/20 backdrop-blur-sm group hover:scale-105" asChild>
              <a href="#planos">
                <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                Testar Grátis 
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </a>
            </Button>
          </div>

          
          <div className="relative max-w-5xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none"></div>
            <DashboardMockup />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-purple-600">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[{
            number: "98%",
            label: "Taxa de satisfação",
            icon: Heart
          }, {
            number: "70%",
            label: "Redução de faltas",
            icon: TrendingUp
          }, {
            number: "3h",
            label: "Economizadas/semana",
            icon: Clock
          }].map((stat, index) => <div key={index} className="flex flex-col items-center">
                <div className="p-4 rounded-full bg-white/20 mb-4">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-white/90 font-medium">{stat.label}</div>
              </div>)}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="como-funciona" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-2">
              <Zap className="w-4 h-4 mr-2" />
              Funcionalidades Poderosas
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Desenvolvido especialmente <br />
              para <span className="text-primary">psicólogos autônomos</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Cada funcionalidade foi pensada para resolver problemas reais da sua rotina clínica
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => <Card key={index} className="group border-2 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-3 relative overflow-hidden rounded-3xl backdrop-blur-sm hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="text-center relative z-10 pb-4">
                  <div className="mx-auto mb-6 p-5 rounded-3xl bg-gradient-to-br from-primary/10 to-purple-500/10 w-fit group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                    <feature.icon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors duration-300">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 pb-6">
                  <p className="text-muted-foreground text-center leading-relaxed">{feature.description}</p>
                </CardContent>
                <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-t-lg"></div>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-purple-500/10 via-background to-primary/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-8">
              Benefícios para o <span className="text-primary">psicólogo</span>
            </h2>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 relative">
              {/* Connection lines */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-full h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 hidden md:block"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="h-full w-0.5 bg-gradient-to-b from-primary/20 via-primary/40 to-primary/20"></div>
              </div>
              
              {[{
              icon: Clock,
              text: "Menos tempo em planilhas e papel."
            }, {
              icon: Shield,
              text: "Mais segurança e organização profissional."
            }, {
              icon: Users,
              text: "Interface intuitiva que não exige treinamento."
            }, {
              icon: Brain,
              text: "Desenvolvido com foco real na prática clínica."
            }].map((benefit, index) => <div key={index} className="relative z-10 flex flex-col items-center text-center p-8 bg-background/80 backdrop-blur-sm rounded-3xl border hover:border-primary/20 transition-all duration-500 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-2 group">
                  <div className="p-5 rounded-full bg-gradient-to-r from-primary/10 to-purple-500/10 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                    <benefit.icon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <p className="text-lg text-foreground group-hover:text-primary transition-colors duration-300">{benefit.text}</p>
                </div>)}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="depoimentos" className="py-20 px-6 bg-gradient-to-r from-purple-500/5 to-primary/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-2">
              <Heart className="w-4 h-4 mr-2" />
              Depoimentos Reais
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Resultados que <span className="text-primary">transformam</span> práticas
            </h2>
            <p className="text-xl text-muted-foreground">
              Veja como psicólogos estão revolucionando suas rotinas
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[{
            quote: "O ProntuPsi salvou minha rotina. Eu finalmente consigo focar nos meus pacientes sem me perder em burocracia. É incrível como algo tão simples fez tanta diferença!",
            author: "Dra. Mariana Sampaio",
            role: "Psicóloga Clínica • 8 anos de experiência",
            image: "/src/assets/testimonial-mariana.jpg",
            rating: 5,
            highlight: "Economia de 4h/semana"
          }, {
            quote: "A interface é tão intuitiva que não precisei de treinamento. Em uma semana já estava usando todas as funcionalidades. Meus pacientes elogiam a organização!",
            author: "Dr. Carlos Eduardo",
            role: "Psicólogo Organizacional • 12 anos",
            image: "/src/assets/testimonial-carlos.jpg",
            rating: 5,
            highlight: "Setup em 1 semana"
          }, {
            quote: "Os lembretes automáticos reduziram as faltas em 70%. Minha agenda nunca esteve tão organizada e minha renda mensal aumentou significativamente.",
            author: "Dra. Ana Beatriz",
            role: "Psicóloga Comportamental • 6 anos",
            image: "/src/assets/testimonial-ana.jpg",
            rating: 5,
            highlight: "-70% faltas"
          }].map((testimonial, index) => <Card key={index} className="group border-2 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden rounded-3xl backdrop-blur-sm hover:scale-105">
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="bg-success/10 text-success border-success/20 rounded-2xl">
                    {testimonial.highlight}
                  </Badge>
                </div>
                
                <CardContent className="p-6">
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                  </div>
                  
                  <p className="text-foreground mb-6 italic leading-relaxed text-lg">
                    "{testimonial.quote}"
                  </p>
                  
                  <div className="border-t pt-4 flex items-center gap-4">
                    <div className="relative">
                     <img src={testimonial.image} alt={testimonial.author} className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/20 group-hover:scale-110 transition-transform duration-300" />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success rounded-full border-2 border-background"></div>
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-lg">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>)}
          </div>

          {/* Additional Social Proof */}
          <div className="mt-16 text-center">
            <p className="text-muted-foreground mb-6">Junte-se a centenas de psicólogos que já transformaram suas práticas</p>
            <div className="flex justify-center items-center gap-8 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-500 border-2 border-background"></div>)}
                </div>
                <span className="text-sm text-muted-foreground">+500 psicólogos</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-bold text-foreground">4.9/5</span>
                <span className="text-sm text-muted-foreground">(127 avaliações)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* FAQ Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Perguntas <span className="text-primary">Frequentes</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Tire suas dúvidas sobre o ProntuPsi
            </p>
          </div>
          
          <Accordion type="single" collapsible className="space-y-4">
            {[{
            question: "O plano Essencial é realmente gratuito?",
            answer: "Sim! O plano Essencial é completamente gratuito e inclui acesso total à plataforma, suporte por e-mail e até 10 pacientes ativos. Não cobramos cartão de crédito no cadastro."
          }, {
            question: "Meus dados estão seguros?",
            answer: "Sim! O ProntuPsi é totalmente compatível com a LGPD. Todos os dados são criptografados e armazenados em servidores seguros no Brasil. Sua privacidade e a dos seus pacientes é nossa prioridade."
          }, {
            question: "Posso mudar de plano a qualquer momento?",
            answer: "Claro! Você pode fazer upgrade do seu plano gratuito para Profissional ou Premium a qualquer momento. As mudanças são aplicadas imediatamente e você não perde nenhum dado."
          }, {
            question: "Como funciona o suporte?",
            answer: "Oferecemos suporte por e-mail para todos os planos, incluindo o gratuito, com resposta em até 24h. No plano Premium, você tem prioridade no atendimento."
          }, {
            question: "Posso usar em vários dispositivos?",
            answer: "Sim! O ProntuPsi funciona em qualquer dispositivo com internet: computador, tablet ou smartphone. Seus dados ficam sincronizados em tempo real."
          }, {
            question: "Existe alguma limitação no plano gratuito?",
            answer: "O plano Essencial gratuito permite até 10 pacientes ativos. Se você precisar de mais pacientes ou funcionalidades avançadas como lembretes automáticos, pode fazer upgrade para os planos pagos."
          }, {
            question: "Como faço para cancelar minha conta?",
            answer: "Você pode cancelar sua conta a qualquer momento através das configurações. No plano gratuito, não há cobrança. Nos planos pagos, oferecemos garantia de 30 dias."
          }].map((faq, index) => <AccordionItem key={index} value={`item-${index}`} className="border-2 rounded-2xl px-6 hover:border-primary/20 transition-all duration-300 hover:shadow-lg backdrop-blur-sm">
                <AccordionTrigger className="text-left text-lg hover:text-primary transition-colors duration-300">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>)}
          </Accordion>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-6 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/10 to-background"></div>
        <div className="absolute top-10 left-10 w-64 h-64 bg-primary/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Badge variant="outline" className="mb-6 px-6 py-3 text-lg">
            <Sparkles className="w-5 h-5 mr-2" />
            Última Chance - Oferta Especial
          </Badge>
          
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Sua prática clínica <br />
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              revolucionada
            </span> <br />
            em 7 dias
          </h2>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            <strong className="text-foreground">Mais de 500 psicólogos</strong> já economizam 3h/semana e reduziram faltas em 70%. 
            <br />Chegou a sua vez.
          </p>

          {/* Urgency Timer Visual */}
          <div className="flex justify-center items-center gap-4 mb-8 p-4 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-2xl border border-red-500/20 max-w-md mx-auto">
            <Clock className="w-5 h-5 text-red-500 animate-pulse" />
            <span className="font-bold text-foreground">Teste gratuito limitado</span>
            <Badge variant="destructive" className="animate-pulse">Últimas vagas</Badge>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" className="text-xl px-12 py-8 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all duration-500 group rounded-3xl border border-white/20 backdrop-blur-sm hover:scale-105" asChild>
              <a href="#planos">
                <Sparkles className="w-6 h-6 mr-3 group-hover:rotate-180 transition-transform duration-500" />
                Testar Grátis
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform duration-300" />
              </a>
            </Button>
          </div>


          {/* Money Back Guarantee */}
          
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>;
};
export default LandingPage;