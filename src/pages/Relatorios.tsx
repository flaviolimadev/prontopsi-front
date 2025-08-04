
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { FeatureGuard } from "@/components/subscription/FeatureGuard";
import { 
  MessageSquare, 
  Settings, 
  Send, 
  Smartphone,
  Clock,
  CheckCircle,
  Users,
  Calendar,
  CreditCard
} from "lucide-react";

export default function Relatorios() {
  const { toast } = useToast();
  const { profile, loading, updateWhatsAppConfig, updateReportConfig } = useProfile();
  
  const [whatsappConfig, setWhatsappConfig] = useState({
    phone: profile?.whatsapp_number || "",
    enabled: profile?.whatsapp_reports_enabled || false,
    time: profile?.whatsapp_report_time || "08:00"
  });

  const [reportConfig, setReportConfig] = useState({
    includeTodaySchedule: profile?.report_config?.includeTodaySchedule || true,
    includeBirthdays: profile?.report_config?.includeBirthdays || true,
    includeOverdue: profile?.report_config?.includeOverdue || true,
    customMessage: profile?.report_config?.customMessage || ""
  });

  const handleSaveConfig = async () => {
    if (!whatsappConfig.phone) {
      toast({
        title: "Erro",
        description: "Por favor, informe o número do WhatsApp.",
        variant: "destructive"
      });
      return;
    }

    // Validar formato do telefone
    const phoneRegex = /^\+55\s?\d{2}\s?\d{4,5}-?\d{4}$/;
    if (!phoneRegex.test(whatsappConfig.phone)) {
      toast({
        title: "Número inválido",
        description: "Use o formato: +55 11 99999-9999",
        variant: "destructive"
      });
      return;
    }

    try {
      await updateWhatsAppConfig(whatsappConfig);
      await updateReportConfig(reportConfig);
      
      toast({
        title: "Configuração salva!",
        description: "O AlertaPsi! foi configurado com sucesso."
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive"
      });
    }
  };

  const handleTestReport = async () => {
    if (!whatsappConfig.phone) {
      toast({
        title: "Erro",
        description: "Configure o número do WhatsApp primeiro.",
        variant: "destructive"
      });
      return;
    }

    try {
      toast({
        title: "Teste enviado com sucesso! ✅",
        description: `AlertaPsi! enviado para ${whatsappConfig.phone}`
      });
    } catch (error) {
      toast({
        title: "Erro no teste",
        description: "Não foi possível enviar o teste. Verifique suas configurações.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <FeatureGuard 
      feature="reports" 
      featureName="AlertaPsi!"
    >
      <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">AlertaPsi!</h1>
        <p className="text-muted-foreground">
          Receba alertas diários automáticos via WhatsApp com suas informações mais importantes
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Configuração do WhatsApp */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" />
              Configuração WhatsApp
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Número do WhatsApp *</Label>
              <Input
                placeholder="+55 11 99999-9999"
                value={whatsappConfig.phone}
                onChange={(e) => setWhatsappConfig({...whatsappConfig, phone: e.target.value})}
              />
              <p className="text-xs text-muted-foreground">
                Formato obrigatório: +55 11 99999-9999 (com código do país)
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Alertas automáticos</Label>
                <p className="text-sm text-muted-foreground">
                  Enviar AlertaPsi! diariamente
                </p>
              </div>
              <Switch
                checked={whatsappConfig.enabled}
                onCheckedChange={(enabled) => setWhatsappConfig({...whatsappConfig, enabled})}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Horário de envio
              </Label>
              <Select value={whatsappConfig.time} onValueChange={(time) => setWhatsappConfig({...whatsappConfig, time})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="06:00">06:00 - Muito cedo</SelectItem>
                  <SelectItem value="07:00">07:00 - Cedo</SelectItem>
                  <SelectItem value="08:00">08:00 - Manhã</SelectItem>
                  <SelectItem value="09:00">09:00 - Manhã</SelectItem>
                  <SelectItem value="10:00">10:00 - Manhã</SelectItem>
                  <SelectItem value="12:00">12:00 - Meio-dia</SelectItem>
                  <SelectItem value="18:00">18:00 - Final do dia</SelectItem>
                  <SelectItem value="19:00">19:00 - Noite</SelectItem>
                  <SelectItem value="20:00">20:00 - Noite</SelectItem>
                  <SelectItem value="21:00">21:00 - Noite</SelectItem>
                  <SelectItem value="22:00">22:00 - Tarde da noite</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Fuso horário: São Paulo (GMT-3)
              </p>
            </div>

            <Separator />

            <div className="flex gap-2">
              <Button onClick={handleSaveConfig} className="flex-1">
                <Settings className="w-4 h-4 mr-2" />
                Salvar Configuração
              </Button>
              <Button variant="outline" onClick={handleTestReport}>
                <Send className="w-4 h-4 mr-2" />
                Testar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Configuração do Conteúdo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Conteúdo do Alerta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Agenda do dia
                  </Label>
                  <p className="text-xs text-muted-foreground">Suas sessões agendadas para hoje</p>
                </div>
                <Switch
                  checked={reportConfig.includeTodaySchedule}
                  onCheckedChange={(checked) => setReportConfig({...reportConfig, includeTodaySchedule: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Aniversariantes
                  </Label>
                  <p className="text-xs text-muted-foreground">Pacientes que fazem aniversário hoje</p>
                </div>
                <Switch
                  checked={reportConfig.includeBirthdays}
                  onCheckedChange={(checked) => setReportConfig({...reportConfig, includeBirthdays: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Pagamentos em atraso
                  </Label>
                  <p className="text-xs text-muted-foreground">Alertas de pagamentos pendentes</p>
                </div>
                <Switch
                  checked={reportConfig.includeOverdue}
                  onCheckedChange={(checked) => setReportConfig({...reportConfig, includeOverdue: checked})}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Mensagem personalizada</Label>
              <Textarea
                placeholder="Ex: Bom dia! Aqui está seu resumo diário..."
                value={reportConfig.customMessage}
                onChange={(e) => setReportConfig({...reportConfig, customMessage: e.target.value})}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Mensagem que será exibida no início do alerta
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview do Alerta */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            Preview do AlertaPsi!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">AlertaPsi!</p>
                  <p className="text-xs text-muted-foreground">Hoje às {whatsappConfig.time}</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                {reportConfig.customMessage && (
                  <p className="text-foreground">{reportConfig.customMessage}</p>
                )}
                
                {reportConfig.includeTodaySchedule && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>📅 3 sessões agendadas para hoje</span>
                  </div>
                )}
                
                {reportConfig.includeBirthdays && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span>🎂 Maria Silva faz aniversário hoje</span>
                  </div>
                )}
                
                {reportConfig.includeOverdue && (
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-primary" />
                    <span>💰 2 pagamentos em atraso (R$ 300,00)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </FeatureGuard>
  );
}
