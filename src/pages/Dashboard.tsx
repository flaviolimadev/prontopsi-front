
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { WeeklySchedule } from "@/components/dashboard/WeeklySchedule";
import { UpcomingBirthdays } from "@/components/dashboard/UpcomingBirthdays";
import { FinancialSummary } from "@/components/dashboard/FinancialSummary";
import { ActivePatients } from "@/components/dashboard/ActivePatients";
import { TrialBanner } from "@/components/dashboard/TrialBanner";
import { RecentPatients } from "@/components/dashboard/RecentPatients";
import { TodaySchedule } from "@/components/dashboard/TodaySchedule";
import { QuickLinksSection } from "@/components/dashboard/QuickLinksSection";

import { useAuth } from "@/components/auth/AuthProvider";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDataSync } from "@/hooks/useDataSync";
import { SyncIndicator } from "@/components/ui/sync-indicator";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

export default function Dashboard() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { syncAllData, syncStatus, lastSync } = useDataSync();
  
  // Função para obter saudação e ícone baseado no horário
  const getGreetingWithIcon = () => {
    const now = new Date();
    const hour = now.getHours();
    
    if (hour >= 0 && hour < 6) {
      return { greeting: "Ótima madrugada", icon: "🌙" };
    } else if (hour >= 6 && hour < 12) {
      return { greeting: "Bom dia", icon: "🌅" };
    } else if (hour >= 12 && hour < 18) {
      return { greeting: "Boa tarde", icon: "☀️" };
    } else {
      return { greeting: "Boa noite", icon: "🌆" };
    }
  };

  // Obter nome do usuário e dados de saudação
  const userName = user?.nome || user?.email?.split('@')[0] || 'Usuário';
  const { greeting, icon } = getGreetingWithIcon();

  // Sincronizar dados quando o dashboard é carregado
  useEffect(() => {
    syncAllData();
  }, [syncAllData]);
  
  return (
    <div className="space-y-4 md:space-y-6 w-full overflow-x-hidden p-4 md:p-6 min-h-screen">
      {/* Trial Banner */}
      <TrialBanner />

      {/* Welcome Header */}
      <div className="mb-4 md:mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className={cn(
            "font-bold text-foreground break-words",
            isMobile ? "text-xl" : "text-2xl md:text-3xl"
          )}>
            {greeting}, {userName}! Bem-vindo {icon}💜
          </h1>
          <SyncIndicator 
            status={syncStatus} 
            className="flex-shrink-0 ml-4"
          />
        </div>
        <p className={cn(
          "text-muted-foreground break-words",
          isMobile ? "text-sm" : "text-base md:text-lg"
        )}>
          Você está no controle da sua rotina. Vamos começar?
        </p>
        {lastSync && (
          <p className="text-xs text-muted-foreground mt-1">
            Última atualização: {lastSync.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Stats Cards */}
      <DashboardStats />

      {/* Quick Links Section - Agora um dos primeiros */}
      <QuickLinksSection />

      {/* Main Content Grid */}
      <div className={cn(
        "grid gap-4 md:gap-6 w-full",
        isMobile ? "grid-cols-1" : "lg:grid-cols-2"
      )}>
        {/* Left Column */}
        <div className="space-y-4 md:space-y-6 min-w-0">
          <TodaySchedule />
          <UpcomingBirthdays />
        </div>

        {/* Right Column */}
        <div className="space-y-4 md:space-y-6 min-w-0">
          <RecentPatients />
          <FinancialSummary />
        </div>
      </div>
    </div>
  );
}
