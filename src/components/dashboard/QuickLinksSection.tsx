import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Link, 
  Copy, 
  ExternalLink, 
  Share2, 
  Users, 
  Calendar,
  Loader2,
  CheckCircle,
  AlertCircle,
  Mail,
  MessageSquare,
  Smartphone,
  Clock,
  UserCheck,
  ArrowRight
} from 'lucide-react';
import { useCadastroLinks } from '@/hooks/useCadastroLinks';
import { useToast } from '@/hooks/use-toast';

interface QuickLinksSectionProps {
  className?: string;
}

export function QuickLinksSection({ className }: QuickLinksSectionProps) {
  const { links, submissions, loading, fetchLinks, fetchSubmissions } = useCadastroLinks();
  const { toast } = useToast();
  
  const [selectedLink, setSelectedLink] = useState<any>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareMethod, setShareMethod] = useState<'copy' | 'email' | 'whatsapp' | 'message'>('copy');
  const [emailData, setEmailData] = useState({
    to: '',
    subject: '',
    message: ''
  });
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [smsMessage, setSmsMessage] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {

    fetchLinks();
    fetchSubmissions();
  }, [fetchLinks, fetchSubmissions]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para a área de transferência.",
        variant: "default",
      });
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link automaticamente.",
        variant: "destructive",
      });
    }
  };

  const generatePublicUrl = (token: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/#/cadastro/${token}`;
  };

  const handleShare = (link: any) => {
    setSelectedLink(link);
    setIsShareModalOpen(true);
    
    // Preencher dados padrão
    const publicUrl = generatePublicUrl(link.token);
    const defaultSubject = `Convite para agendamento - ${link.title}`;
    const defaultMessage = `Olá! Aqui está o link para você agendar sua consulta: ${publicUrl}`;
    
    setEmailData({
      to: '',
      subject: defaultSubject,
      message: defaultMessage
    });
    setWhatsappMessage(defaultMessage);
    setSmsMessage(defaultMessage);
  };

  const handleEmailShare = () => {
    if (!emailData.to) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, preencha o email do destinatário.",
        variant: "destructive",
      });
      return;
    }

    const mailtoUrl = `mailto:${emailData.to}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.message)}`;
    window.open(mailtoUrl);
    setIsShareModalOpen(false);
    
    toast({
      title: "Email aberto!",
      description: "O cliente de email foi aberto com os dados preenchidos.",
      variant: "default",
    });
  };

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappUrl, '_blank');
    setIsShareModalOpen(false);
    
    toast({
      title: "WhatsApp aberto!",
      description: "O WhatsApp foi aberto com a mensagem preenchida.",
      variant: "default",
    });
  };

  const handleSMSShare = () => {
    if (!phoneNumber) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, preencha o número de telefone.",
        variant: "destructive",
      });
      return;
    }

    const smsUrl = `sms:${phoneNumber}?body=${encodeURIComponent(smsMessage)}`;
    window.open(smsUrl);
    setIsShareModalOpen(false);
    
    toast({
      title: "SMS aberto!",
      description: "O aplicativo de SMS foi aberto com a mensagem preenchida.",
      variant: "default",
    });
  };

  const getStatusBadge = (link: any) => {
    if (!link.isActive) {
      return <Badge variant="secondary" className="text-xs">Inativo</Badge>;
    }
    if (link.maxUses > 0 && link.currentUses >= link.maxUses) {
      return <Badge variant="destructive" className="text-xs">Esgotado</Badge>;
    }
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      return <Badge variant="destructive" className="text-xs">Expirado</Badge>;
    }
    return <Badge variant="default" className="text-xs">Ativo</Badge>;
  };

  const getUsageText = (link: any) => {
    if (link.maxUses === 0) {
      return `${link.currentUses} usos`;
    }
    return `${link.currentUses}/${link.maxUses} usos`;
  };

  const pendingSubmissions = submissions?.filter(sub => sub.status === 'pending') || [];
  const hasPendingSubmissions = pendingSubmissions.length > 0;

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="w-5 h-5" />
            Links de Indicação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2">Carregando links...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Link className="w-5 h-5" />
                Links de Indicação
              </CardTitle>
              <CardDescription>
                Acesse e compartilhe rapidamente seus links de cadastro
              </CardDescription>
            </div>
            {hasPendingSubmissions && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {pendingSubmissions.length} pendente{pendingSubmissions.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4 md:space-y-6 min-w-0">
          {/* Seção de Aprovações Pendentes - Compacta */}
          {hasPendingSubmissions && (
            <div className="p-2 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-3 h-3 text-amber-600" />
                  <span className="text-xs font-medium text-amber-800 dark:text-amber-200">
                    {pendingSubmissions.length} solicitação{pendingSubmissions.length !== 1 ? 'ões' : ''} pendente{pendingSubmissions.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <Button size="sm" variant="outline" asChild className="h-6 text-xs">
                  <a href="/#/pacientes#solicitacoes" className="flex items-center gap-1">
                    Ver
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </Button>
              </div>
            </div>
          )}

          {!links || links.length === 0 ? (
            <div className="text-center py-4">
              <Link className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-3">
                Você ainda não criou nenhum link de indicação
              </p>
              <Button size="sm" asChild>
                <a href="/#/pacientes#links">Criar primeiro link</a>
              </Button>
            </div>
          ) : (
            <div className="space-y-4 md:space-y-6">
              {links.slice(0, 2).map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">{link.title}</h4>
                      {getStatusBadge(link)}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {getUsageText(link)}
                      </span>
                      {link.expiresAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(link.expiresAt).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(generatePublicUrl(link.token))}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleShare(link)}
                      className="h-6 px-2 text-xs"
                    >
                      <Share2 className="w-3 h-3 mr-1" />
                      Compartilhar
                    </Button>
                  </div>
                </div>
              ))}
              
              {links.length > 2 && (
                <div className="text-center pt-1">
                  <Button variant="ghost" size="sm" asChild>
                    <a href="/#/pacientes#links">
                      Ver todos os {links.length} links
                    </a>
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Compartilhamento */}
      <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Compartilhar Link</DialogTitle>
            <DialogDescription>
              Escolha como deseja compartilhar o link "{selectedLink?.title}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Métodos de compartilhamento */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={shareMethod === 'copy' ? 'default' : 'outline'}
                onClick={() => setShareMethod('copy')}
                className="h-12"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copiar Link
              </Button>
              <Button
                variant={shareMethod === 'email' ? 'default' : 'outline'}
                onClick={() => setShareMethod('email')}
                className="h-12"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
              <Button
                variant={shareMethod === 'whatsapp' ? 'default' : 'outline'}
                onClick={() => setShareMethod('whatsapp')}
                className="h-12"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
              <Button
                variant={shareMethod === 'message' ? 'default' : 'outline'}
                onClick={() => setShareMethod('message')}
                className="h-12"
              >
                <Smartphone className="w-4 h-4 mr-2" />
                SMS
              </Button>
            </div>

            {/* Conteúdo específico do método */}
            {shareMethod === 'copy' && (
              <div className="space-y-3">
                <div>
                  <Label>Link para compartilhar</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={selectedLink ? generatePublicUrl(selectedLink.token) : ''}
                      readOnly
                      className="text-xs"
                    />
                    <Button
                      size="sm"
                      onClick={() => copyToClipboard(generatePublicUrl(selectedLink.token))}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Link copiado! Agora você pode colar em qualquer lugar.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {shareMethod === 'email' && (
              <div className="space-y-3">
                <div>
                  <Label>Email do destinatário *</Label>
                  <Input
                    type="email"
                    value={emailData.to}
                    onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
                    placeholder="destinatario@email.com"
                  />
                </div>
                <div>
                  <Label>Assunto</Label>
                  <Input
                    value={emailData.subject}
                    onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                    placeholder="Assunto do email"
                  />
                </div>
                <div>
                  <Label>Mensagem</Label>
                  <Textarea
                    value={emailData.message}
                    onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                    placeholder="Sua mensagem..."
                    rows={4}
                  />
                </div>
                <Button onClick={handleEmailShare} className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  Abrir Email
                </Button>
              </div>
            )}

            {shareMethod === 'whatsapp' && (
              <div className="space-y-3">
                <div>
                  <Label>Mensagem personalizada</Label>
                  <Textarea
                    value={whatsappMessage}
                    onChange={(e) => setWhatsappMessage(e.target.value)}
                    placeholder="Sua mensagem para o WhatsApp..."
                    rows={4}
                  />
                </div>
                <Button onClick={handleWhatsAppShare} className="w-full">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Abrir WhatsApp
                </Button>
              </div>
            )}

            {shareMethod === 'message' && (
              <div className="space-y-3">
                <div>
                  <Label>Número de telefone *</Label>
                  <Input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div>
                  <Label>Mensagem</Label>
                  <Textarea
                    value={smsMessage}
                    onChange={(e) => setSmsMessage(e.target.value)}
                    placeholder="Sua mensagem para SMS..."
                    rows={4}
                  />
                </div>
                <Button onClick={handleSMSShare} className="w-full">
                  <Smartphone className="w-4 h-4 mr-2" />
                  Abrir SMS
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
