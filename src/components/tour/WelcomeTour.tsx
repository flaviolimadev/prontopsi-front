import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ChevronLeft, X, Users, Calendar, FileText, Settings, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TourStep {
  id: string;
  title: string;
  description: string;
  target?: string;
  icon: React.ReactNode;
  position: "center" | "left" | "right" | "top" | "bottom";
}

const tourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "Bem-vindo ao ProntuPsi! 🎉",
    description: "Vamos fazer um tour rápido para você conhecer as principais funcionalidades da plataforma. Você pode pular a qualquer momento.",
    icon: <Users className="w-6 h-6" />,
    position: "center"
  },
  {
    id: "trial",
    title: "Período de Teste Gratuito",
    description: "Você tem 7 dias gratuitos para explorar todas as funcionalidades. O contador no topo mostra quantos dias restam.",
    icon: <CreditCard className="w-6 h-6" />,
    position: "top"
  },
  {
    id: "patients",
    title: "Gerenciar Pacientes",
    description: "Na aba 'Pacientes' você pode cadastrar novos pacientes, editar informações e acompanhar o histórico de sessões.",
    icon: <Users className="w-6 h-6" />,
    position: "left"
  },
  {
    id: "schedule",
    title: "Agenda de Consultas",
    description: "Use a 'Agenda' para organizar seus horários, marcar consultas e visualizar sua programação semanal.",
    icon: <Calendar className="w-6 h-6" />,
    position: "left"
  },
  {
    id: "records",
    title: "Prontuários Digitais",
    description: "Mantenha registros seguros de suas sessões na seção 'Prontuários'. Tudo fica organizado por paciente.",
    icon: <FileText className="w-6 h-6" />,
    position: "left"
  },
  {
    id: "settings",
    title: "Configurações",
    description: "Personalize sua conta e configure preferências na aba 'Configurações'.",
    icon: <Settings className="w-6 h-6" />,
    position: "left"
  },
  {
    id: "upgrade",
    title: "Assinar Plano",
    description: "Quando estiver pronto, use o botão 'Assinar Agora' para escolher seu plano e continuar usando a plataforma.",
    icon: <CreditCard className="w-6 h-6" />,
    position: "right"
  }
];

interface WelcomeTourProps {
  onComplete: () => void;
}

export function WelcomeTour({ onComplete }: WelcomeTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(true);
  const { toast } = useToast();

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    toast({
      title: "Tour ignorado",
      description: "Você pode acessar a ajuda a qualquer momento nas configurações.",
    });
    handleComplete();
  };

  const handleComplete = () => {
    setIsOpen(false);
    onComplete();
    toast({
      title: "Tour concluído! 🎉",
      description: "Agora você está pronto para usar o ProntuPsi. Bem-vindo!",
    });
  };

  const currentTourStep = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              {currentTourStep.icon}
              {currentTourStep.title}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Step Counter */}
          <div className="flex justify-center">
            <Badge variant="secondary">
              {currentStep + 1} de {tourSteps.length}
            </Badge>
          </div>

          {/* Content */}
          <div className="text-center space-y-4">
            <DialogDescription className="text-base leading-relaxed">
              {currentTourStep.description}
            </DialogDescription>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-4">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>

            <Button variant="ghost" onClick={handleSkip}>
              Pular Tour
            </Button>

            <Button 
              onClick={handleNext}
              className="flex items-center gap-2"
            >
              {currentStep === tourSteps.length - 1 ? "Concluir" : "Próximo"}
              {currentStep !== tourSteps.length - 1 && <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}