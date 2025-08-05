import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { useDarkMode } from "../theme/DarkModeProvider";
import { useSubscription } from "../../contexts/SubscriptionContext";
import { useSidebar } from "../../contexts/SidebarContext";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { cn } from "@/lib/utils";
import {
  Calendar,
  FileText,
  Home,
  Menu,
  MessageSquare,
  Settings,
  Users,
  Wallet,
  X,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Sparkles,
  Crown,
  Clock,
} from "lucide-react";

// Importar as logos
import logoWhite from "@/assets/img/ProntuPsi - Horizontal Principal Branco.svg";
import logoColor from "@/assets/img/ProntuPsi - Principal.svg";
import logoSymbol from "@/assets/img/Simbolo - Principal.svg";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home, description: "Visão geral" },
  { name: "Pacientes", href: "/pacientes", icon: Users, description: "Gerenciar pacientes" },
  { name: "Agenda", href: "/agenda", icon: Calendar, description: "Agendamentos" },
  { name: "Prontuários", href: "/prontuarios", icon: FileText, description: "Prontuários psicológicos" },
  { name: "Financeiro", href: "/financeiro", icon: Wallet, description: "Controle financeiro" },
  { name: "Arquivos", href: "/arquivos", icon: MessageSquare, description: "Documentos" },
  { name: "Relatórios", href: "/relatorios", icon: FileText, description: "Análises" },
  { name: "Configurações", href: "/configuracoes", icon: Settings, description: "Preferências" },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { subscription } = useSubscription();
  const { isCollapsed, setIsCollapsed } = useSidebar();



  // Calcular progresso da assinatura
  const getSubscriptionProgress = () => {
    if (!subscription) return 0;
    
    if (subscription.status === 'trial' && subscription.trial_days_remaining !== undefined) {
      const totalTrialDays = 7; // Assumindo 7 dias de trial
      const remainingDays = subscription.trial_days_remaining;
      return Math.max(0, ((totalTrialDays - remainingDays) / totalTrialDays) * 100);
    }
    
    if (subscription.current_period_start && subscription.current_period_end) {
      const start = new Date(subscription.current_period_start);
      const end = new Date(subscription.current_period_end);
      const now = new Date();
      const total = end.getTime() - start.getTime();
      const elapsed = now.getTime() - start.getTime();
      return Math.min(100, Math.max(0, (elapsed / total) * 100));
    }
    
    return 0;
  };

  const getDaysRemaining = () => {
    if (!subscription) return 0;
    
    if (subscription.status === 'trial' && subscription.trial_days_remaining !== undefined) {
      return subscription.trial_days_remaining;
    }
    
    if (subscription.current_period_end) {
      const end = new Date(subscription.current_period_end);
      const now = new Date();
      const diff = end.getTime() - now.getTime();
      return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }
    
    return 0;
  };

  return (
    <div className={cn(
      "flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700",
      isCollapsed ? "w-20" : "w-64",
      "transition-all duration-300 ease-in-out",
      className
    )}>
      {/* Header */}
      <div className={cn(
        "p-4 border-b border-gray-200 dark:border-gray-700",
        isCollapsed ? "flex flex-col" : "flex items-center justify-between"
      )}>
        {!isCollapsed && (
          <div className="flex items-center justify-center py-6">
            <img 
              src={darkMode ? logoWhite : logoColor} 
              alt="ProntoPsi" 
              className="h-16 w-auto"
            />
          </div>
        )}
        
        {isCollapsed && (
          <div className="flex justify-center py-4">
            <img 
              src={logoSymbol} 
              alt="ProntoPsi" 
              className="h-12 w-auto"
            />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2">
        <div className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "group relative flex flex-col px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                  "hover:scale-[1.02] active:scale-[0.98]",
                  isActive
                    ? "bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-900/40 dark:to-purple-800/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700/50 shadow-md"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                )}
              >
                <div className="flex items-center">
                  <div className={cn(
                    "relative flex items-center justify-center transition-all duration-200",
                    isCollapsed 
                      ? "w-10 h-10 rounded-full" 
                      : "p-2 rounded-lg",
                    isCollapsed && isActive
                      ? "text-purple-600 dark:text-purple-400"  // Apenas cor quando minimizado e ativo
                      : isActive 
                      ? "bg-purple-100 dark:bg-purple-800/50 text-purple-600 dark:text-purple-400"  // Background + cor quando expandido e ativo
                      : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"  // Estado normal
                  )}>
                    <Icon className={cn(
                      "flex-shrink-0",
                      isCollapsed ? "h-5 w-5" : "h-4 w-4"
                    )} />
                  </div>
                  
                  {!isCollapsed && (
                    <div className="ml-3 flex-1">
                      <div className="font-semibold">{item.name}</div>
                      <div className={cn(
                        "text-xs transition-all duration-200",
                        isActive 
                          ? "text-purple-600/70 dark:text-purple-400/70" 
                          : "text-gray-500/70 dark:text-gray-400/70 group-hover:text-gray-600/80 dark:group-hover:text-gray-300/80"
                      )}>
                        {item.description}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Indicador de página ativa */}
                {isActive && !isCollapsed && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full animate-pulse" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Card do Plano */}
      {!isCollapsed && subscription && (
        <div className="p-3 mx-2 mb-2">
          <div className={cn(
            "group relative p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02]",
            "shadow-sm hover:shadow-md",
            subscription.status === 'trial' 
              ? "bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 dark:from-yellow-900/20 dark:via-orange-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-700/50"
              : "bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-700/50"
          )}>
            {/* Badge de status */}
            <div className="absolute -top-2 -right-2">
              <div className={cn(
                "px-2 py-1 rounded-full text-xs font-medium shadow-sm",
                subscription.status === 'trial'
                  ? "bg-yellow-500 text-yellow-900 dark:bg-yellow-400 dark:text-yellow-900"
                  : "bg-purple-500 text-white dark:bg-purple-400 dark:text-purple-900"
              )}>
                {subscription.status === 'trial' ? 'TRIAL' : subscription.status.toUpperCase()}
              </div>
            </div>

            {/* Header do card */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={cn(
                  "p-2 rounded-xl shadow-sm transition-all duration-200 group-hover:scale-110",
                  subscription.status === 'trial'
                    ? "bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-800/50 dark:to-orange-800/50"
                    : "bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-800/50 dark:to-blue-800/50"
                )}>
                  {subscription.status === 'trial' ? (
                    <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  ) : (
                    <Crown className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-gray-900 dark:text-white capitalize truncate">
                    {subscription.plan_type}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {subscription.status === 'trial' ? 'Período de teste' : 'Plano ativo'}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Progresso e informações */}
            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {subscription.status === 'trial' ? 'Dias restantes' : 'Período atual'}
                    </span>
                    <span className={cn(
                      "text-sm font-bold whitespace-nowrap",
                      subscription.status === 'trial'
                        ? "text-yellow-700 dark:text-yellow-300"
                        : "text-purple-700 dark:text-purple-300"
                    )}>
                      {getDaysRemaining()} dias
                    </span>
                  </div>
              
              <div className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap">Progresso</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {Math.round(getSubscriptionProgress())}%
                      </span>
                    </div>
                <Progress 
                  value={getSubscriptionProgress()} 
                  className={cn(
                    "h-2",
                    subscription.status === 'trial'
                      ? "[&>div]:bg-gradient-to-r [&>div]:from-yellow-500 [&>div]:to-orange-500 dark:[&>div]:from-yellow-400 dark:[&>div]:to-orange-400"
                      : "[&>div]:bg-gradient-to-r [&>div]:from-purple-500 [&>div]:to-blue-500 dark:[&>div]:from-purple-400 dark:[&>div]:to-blue-400"
                  )}
                />
              </div>
              
                                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                      <span className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {subscription.patient_limit} pacientes
                      </span>
                    </div>
                    {subscription.status === 'trial' && (
                      <Link
                        to="/planos"
                        className="block w-full text-center text-xs text-yellow-600 dark:text-yellow-400 font-medium hover:text-yellow-700 dark:hover:text-yellow-300 transition-colors duration-200 py-1 px-2 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 hover:border-yellow-300 dark:hover:border-yellow-600/50"
                      >
                        Upgrade disponível
                      </Link>
                    )}
                  </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { subscription } = useSubscription();
  const { isCollapsed } = useSidebar();



  // Calcular progresso da assinatura (mesma lógica do desktop)
  const getSubscriptionProgress = () => {
    if (!subscription) return 0;
    
    if (subscription.status === 'trial' && subscription.trial_days_remaining !== undefined) {
      const totalTrialDays = 7;
      const remainingDays = subscription.trial_days_remaining;
      return Math.max(0, ((totalTrialDays - remainingDays) / totalTrialDays) * 100);
    }
    
    if (subscription.current_period_start && subscription.current_period_end) {
      const start = new Date(subscription.current_period_start);
      const end = new Date(subscription.current_period_end);
      const now = new Date();
      const total = end.getTime() - start.getTime();
      const elapsed = now.getTime() - start.getTime();
      return Math.min(100, Math.max(0, (elapsed / total) * 100));
    }
    
    return 0;
  };

  const getDaysRemaining = () => {
    if (!subscription) return 0;
    
    if (subscription.status === 'trial' && subscription.trial_days_remaining !== undefined) {
      return subscription.trial_days_remaining;
    }
    
    if (subscription.current_period_end) {
      const end = new Date(subscription.current_period_end);
      const now = new Date();
      const diff = end.getTime() - now.getTime();
      return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }
    
    return 0;
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center">
              <img 
                src={darkMode ? logoWhite : logoColor} 
                alt="ProntoPsi" 
                className="h-8 w-auto"
              />
            </div>
            
            <div className="flex items-center space-x-1">
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
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-2">
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "group relative flex flex-col px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                      "hover:scale-[1.02] active:scale-[0.98]",
                      isActive
                        ? "bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-900/40 dark:to-purple-800/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700/50 shadow-md"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                    )}
                  >
                    <div className="flex items-center">
                      <div className={cn(
                        "relative p-2 rounded-lg transition-all duration-200",
                        isActive 
                          ? "bg-purple-100 dark:bg-purple-800/50 text-purple-600 dark:text-purple-400" 
                          : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
                      )}>
                        <Icon className="h-4 w-4 flex-shrink-0" />
                      </div>
                      
                      <div className="ml-3 flex-1">
                        <div className="font-semibold">{item.name}</div>
                        <div className={cn(
                          "text-xs transition-all duration-200",
                          isActive 
                            ? "text-purple-600/70 dark:text-purple-400/70" 
                            : "text-gray-500/70 dark:text-gray-400/70 group-hover:text-gray-600/80 dark:group-hover:text-gray-300/80"
                        )}>
                          {item.description}
                        </div>
                      </div>
                    </div>
                    
                    {/* Indicador de página ativa */}
                    {isActive && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full animate-pulse" />
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Card do Plano */}
          {subscription && (
            <div className="p-3 mx-2 mb-2">
              <div className={cn(
                "group relative p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02]",
                "shadow-sm hover:shadow-md",
                subscription.status === 'trial' 
                  ? "bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 dark:from-yellow-900/20 dark:via-orange-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-700/50"
                  : "bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-700/50"
              )}>
                {/* Badge de status */}
                <div className="absolute -top-2 -right-2">
                  <div className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium shadow-sm",
                    subscription.status === 'trial'
                      ? "bg-yellow-500 text-yellow-900 dark:bg-yellow-400 dark:text-yellow-900"
                      : "bg-purple-500 text-white dark:bg-purple-400 dark:text-purple-900"
                  )}>
                    {subscription.status === 'trial' ? 'TRIAL' : subscription.status.toUpperCase()}
                  </div>
                </div>

                {/* Header do card */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "p-2 rounded-xl shadow-sm transition-all duration-200 group-hover:scale-110",
                      subscription.status === 'trial'
                        ? "bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-800/50 dark:to-orange-800/50"
                        : "bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-800/50 dark:to-blue-800/50"
                    )}>
                      {subscription.status === 'trial' ? (
                        <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      ) : (
                        <Crown className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-gray-900 dark:text-white capitalize truncate">
                        {subscription.plan_type}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {subscription.status === 'trial' ? 'Período de teste' : 'Plano ativo'}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Progresso e informações */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {subscription.status === 'trial' ? 'Dias restantes' : 'Período atual'}
                    </span>
                    <span className={cn(
                      "text-sm font-bold whitespace-nowrap",
                      subscription.status === 'trial'
                        ? "text-yellow-700 dark:text-yellow-300"
                        : "text-purple-700 dark:text-purple-300"
                    )}>
                      {getDaysRemaining()} dias
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap">Progresso</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {Math.round(getSubscriptionProgress())}%
                      </span>
                    </div>
                    <Progress 
                      value={getSubscriptionProgress()} 
                      className={cn(
                        "h-2",
                        subscription.status === 'trial'
                          ? "[&>div]:bg-gradient-to-r [&>div]:from-yellow-500 [&>div]:to-orange-500 dark:[&>div]:from-yellow-400 dark:[&>div]:to-orange-400"
                          : "[&>div]:bg-gradient-to-r [&>div]:from-purple-500 [&>div]:to-blue-500 dark:[&>div]:from-purple-400 dark:[&>div]:to-blue-400"
                      )}
                    />
                  </div>
                  
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                      <span className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {subscription.patient_limit} pacientes
                      </span>
                    </div>
                    {subscription.status === 'trial' && (
                      <Link
                        to="/planos"
                        onClick={() => setOpen(false)}
                        className="block w-full text-center text-xs text-yellow-600 dark:text-yellow-400 font-medium hover:text-yellow-700 dark:hover:text-yellow-300 transition-colors duration-200 py-1 px-2 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 hover:border-yellow-300 dark:hover:border-yellow-600/50"
                      >
                        Upgrade disponível
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}


        </div>
      </SheetContent>
    </Sheet>
  );
}
