import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Bell, Calendar, DollarSign, Shield, Crown, CreditCard as CreditCardIcon, Key, Trash2, Download, Eye, EyeOff } from "lucide-react";
import { ProfileSection } from "@/components/profile/ProfileSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/components/auth/AuthProvider";
import apiService from "@/services/api.service";

export default function Configuracoes() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscription, loading: subscriptionLoading } = useSubscription();
  const { user } = useAuth();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isExportingData, setIsExportingData] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const [profileForm, setProfileForm] = useState({
    name: user?.nome || "Dr. João Silva",
    crp: "06/123456",
    email: user?.email || "joao@prontupsi.com"
  });

  const [scheduleSettings, setScheduleSettings] = useState({
    workDays: [1, 2, 3, 4, 5], // Monday to Friday
    startTime: "08:00",
    endTime: "18:00"
  });

  const [financialSettings, setFinancialSettings] = useState({
    defaultValue: "180.00",
    paymentMethods: {
      pix: true,
      card: true,
      cash: true,
      transfer: false
    }
  });

  const [notifications, setNotifications] = useState({
    whatsapp: true,
    email: true,
    push: false
  });

  // Get plan info from subscription context
  const getPlanInfo = () => {
    if (!subscription) return { name: "Carregando...", price: "...", features: [] };
    
    const planNames = {
      essencial: "Essencial",
      profissional: "Profissional", 
      premium: "Premium"
    };
    
    const planPrices = {
      essencial: "Gratuito",
      profissional: "R$ 59,00/mês",
      premium: "R$ 99,00/mês"
    };
    
    const planFeatures = {
      essencial: ["Até 5 pacientes", "Funcionalidades básicas"],
      profissional: ["Tudo do Essencial +", "Lembretes automáticos", "Backup automatizado", "Até 30 pacientes"],
      premium: ["Tudo do Profissional +", "Relatórios avançados", "Suporte prioritário", "Pacientes ilimitados"]
    };
    
    return {
      name: planNames[subscription.plan_type as keyof typeof planNames] || subscription.plan_type,
      price: planPrices[subscription.plan_type as keyof typeof planPrices] || "...",
      features: planFeatures[subscription.plan_type as keyof typeof planFeatures] || [],
      status: subscription.status,
      trialDaysRemaining: subscription.trial_days_remaining
    };
  };

  const currentPlan = getPlanInfo();

  const handleSaveProfile = () => {
    toast({
      title: "Perfil atualizado!",
      description: "Suas informações profissionais foram salvas."
    });
  };

  const handleSaveSchedule = () => {
    toast({
      title: "Configurações salvas!",
      description: "Suas configurações de agenda foram atualizadas."
    });
  };

  const handleSaveFinancial = () => {
    toast({
      title: "Configurações financeiras salvas!",
      description: "Suas preferências de pagamento foram atualizadas."
    });
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive"
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A nova senha deve ter pelo menos 6 caracteres.",
        variant: "destructive"
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      await apiService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      
      toast({
        title: "Senha alterada!",
        description: "Sua senha foi atualizada com sucesso."
      });
      setIsPasswordModalOpen(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Não foi possível alterar a senha.",
        variant: "destructive"
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleUpgradePlan = () => {
    // Redirecionar para página de checkout
    navigate("/checkout", { replace: true });
  };

  const handleChangeCard = () => {
    toast({
      title: "Redirecionando",
      description: "Você será redirecionado para atualizar seu cartão."
    });
    // Aqui seria integrada a funcionalidade do Stripe para atualizar cartão
  };

  const handleExportData = async () => {
    setIsExportingData(true);
    try {
      const data = await apiService.exportUserData();
      
      toast({
        title: "Dados exportados!",
        description: "Seus dados foram preparados e estão prontos para download."
      });
      
      // Criar link de download para o arquivo
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prontupsi-dados-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Não foi possível exportar seus dados.",
        variant: "destructive"
      });
    } finally {
      setIsExportingData(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await apiService.deleteAccount();
      
      toast({
        title: "Conta excluída",
        description: "Sua conta foi marcada para exclusão. Você receberá um email de confirmação.",
        variant: "destructive"
      });
      setIsDeleteAccountModalOpen(false);
      
      // Redirecionar para logout após alguns segundos
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 3000);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Não foi possível excluir sua conta.",
        variant: "destructive"
      });
    }
  };

  const toggleWorkDay = (day: number) => {
    const newWorkDays = scheduleSettings.workDays.includes(day)
      ? scheduleSettings.workDays.filter(d => d !== day)
      : [...scheduleSettings.workDays, day];
    
    setScheduleSettings({...scheduleSettings, workDays: newWorkDays});
  };

  const togglePaymentMethod = (method: string) => {
    setFinancialSettings({
      ...financialSettings,
      paymentMethods: {
        ...financialSettings.paymentMethods,
        [method]: !financialSettings.paymentMethods[method as keyof typeof financialSettings.paymentMethods]
      }
    });
  };

  const workDaysLabels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground">
          Personalize sua experiência no ProntuPsi
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Section Combinado */}
        <div className="lg:col-span-2">
          <ProfileSection />
        </div>

        {/* Plan & Subscription Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Plano e Assinatura
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Plano Atual</Label>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">{currentPlan.name}</p>
                    {subscription?.status === 'trial' && (
                      <Badge variant="outline" className="text-xs">
                        Trial - {subscription.trial_days_remaining} dias restantes
                      </Badge>
                    )}
                  </div>
                </div>
                <Badge variant="secondary">{currentPlan.price}</Badge>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Recursos inclusos:</Label>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {currentPlan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-primary rounded-full"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="space-y-2">
              <Button onClick={handleUpgradePlan} className="w-full">
                Fazer Upgrade do Plano
              </Button>
              <Button variant="outline" onClick={handleChangeCard} className="w-full">
                <CreditCardIcon className="h-4 w-4 mr-2" />
                Alterar Cartão de Crédito
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Key className="h-4 w-4 mr-2" />
                  Alterar Senha
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Alterar Senha</DialogTitle>
                  <DialogDescription>Digite sua senha atual e a nova senha</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Senha Atual *</Label>
                    <div className="relative">
                      <Input
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="Digite sua senha atual"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                        disabled={isChangingPassword}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        disabled={isChangingPassword}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Nova Senha *</Label>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Digite a nova senha"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                        disabled={isChangingPassword}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        disabled={isChangingPassword}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Confirmar Nova Senha *</Label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirme a nova senha"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                        disabled={isChangingPassword}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isChangingPassword}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsPasswordModalOpen(false)} disabled={isChangingPassword}>
                      Cancelar
                    </Button>
                    <Button onClick={handleChangePassword} disabled={isChangingPassword}>
                      {isChangingPassword ? "Alterando..." : "Alterar Senha"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" className="w-full" onClick={handleExportData} disabled={isExportingData}>
              <Download className="h-4 w-4 mr-2" />
              {isExportingData ? "Exportando..." : "Exportar Dados"}
            </Button>
            
            <AlertDialog open={isDeleteAccountModalOpen} onOpenChange={setIsDeleteAccountModalOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Conta
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir Conta</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza de que deseja excluir sua conta? Esta ação não pode ser desfeita.
                    Todos os seus dados, incluindo pacientes e sessões, serão permanentemente removidos.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Excluir Permanentemente
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}