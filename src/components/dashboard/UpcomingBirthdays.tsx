
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Cake, Gift, Users } from "lucide-react";
import { usePatients } from "@/hooks/usePatients";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface BirthdayPatient {
  id: string;
  name: string;
  birth_date: string;
  daysUntil: number;
  age: number;
  isToday: boolean;
}

export function UpcomingBirthdays() {
  const { patients } = usePatients();
  const navigate = useNavigate();

  const upcomingBirthdays = useMemo(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    
    const patientsWithBirthdays = patients
      .filter(p => p.birth_date && p.status === "ativo")
      .map(patient => {
        const birthDate = new Date(patient.birth_date!);
        const thisYearBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
        
        // Se o aniversário já passou este ano, considerar o próximo ano
        if (thisYearBirthday < today) {
          thisYearBirthday.setFullYear(currentYear + 1);
        }
        
        const daysUntil = Math.ceil((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const age = currentYear - birthDate.getFullYear();
        
        return {
          id: patient.id,
          name: patient.name,
          birth_date: patient.birth_date!,
          daysUntil,
          age: thisYearBirthday.getFullYear() === currentYear ? age : age + 1,
          isToday: daysUntil === 0
        };
      })
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 4);

    return patientsWithBirthdays;
  }, [patients]);

  const formatDaysUntil = (days: number) => {
    if (days === 0) return "Hoje!";
    if (days === 1) return "Amanhã";
    if (days <= 7) return `${days} dias`;
    if (days <= 30) return `${Math.ceil(days / 7)} semana${Math.ceil(days / 7) > 1 ? 's' : ''}`;
    return `${Math.ceil(days / 30)} mês${Math.ceil(days / 30) > 1 ? 'es' : ''}`;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card to-card/50 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm border border-border/50">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="relative pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className="rounded-full p-2 bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Cake className="w-5 h-5 text-primary" />
          </div>
          Próximos Aniversariantes
        </CardTitle>
      </CardHeader>
      <CardContent className="relative space-y-4">
        {upcomingBirthdays.length > 0 ? (
          <div className="space-y-3">
            {upcomingBirthdays.map((patient) => (
              <div 
                key={patient.id} 
                className={cn(
                  "flex items-center gap-3 p-4 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-md",
                  patient.isToday 
                    ? "bg-primary/10 border-primary/20 hover:bg-primary/15" 
                    : "bg-card border-border hover:bg-muted/20 hover:border-primary/20"
                )}
                onClick={() => navigate(`/pacientes/${patient.id}`)}
              >
                <Avatar className="h-12 w-12 border border-border">
                  <AvatarFallback className={cn(
                    "font-semibold",
                    patient.isToday 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-accent text-accent-foreground"
                  )}>
                    {getInitials(patient.name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-foreground truncate">{patient.name}</p>
                    {patient.isToday && (
                      <Gift className="w-4 h-4 text-primary animate-pulse" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{patient.age} anos</span>
                    <span>•</span>
                    <span>
                      {new Date(patient.birth_date).toLocaleDateString('pt-BR', { 
                        day: '2-digit', 
                        month: 'short' 
                      })}
                    </span>
                  </div>
                </div>
                
                <Badge 
                  variant={patient.isToday ? "default" : "secondary"}
                  className={cn(
                    "text-xs font-medium",
                    patient.isToday && "bg-primary text-primary-foreground animate-pulse"
                  )}
                >
                  {formatDaysUntil(patient.daysUntil)}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Cake className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">
              Nenhum aniversário próximo
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Cadastre as datas de nascimento dos seus pacientes para receber lembretes
            </p>
            <Button 
              className="bg-primary hover:bg-primary/90 text-primary-foreground" 
              onClick={() => navigate("/pacientes")}
            >
              <Users className="w-4 h-4 mr-2" />
              Gerenciar Pacientes
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
