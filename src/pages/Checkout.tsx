
import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../components/auth/AuthProvider';
import { useLocation } from 'react-router-dom';
import { validatePatientData } from '../utils/dataValidation';
import { QrCode, CreditCard, Copy, Download, CheckCircle, Clock } from 'lucide-react';

interface PixData {
  txid: string;
  valor: string;
  descricao: string;
  qrcode: string;
  qrcodeImage: string;
  devedor: {
    nome: string;
    cpf: string;
    email?: string;
  };
  expiredAt: Date;
  status: string;
  databaseId: string;
  isTest: boolean;
  isReal: boolean;
  isPublicTest: boolean;
  sdkVersion?: string;
  integrationType?: string;
  realPixError?: string;
  instructions?: string[];
}

interface ApiStatus {
  status: 'online' | 'offline';
  message: string;
  details?: any;
}

export default function Checkout() {
  const { toast } = useToast();
  const { user } = useAuth();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix');
  const [cardData, setCardData] = useState({
    cardholderName: `${user?.nome ?? ''} ${user?.sobrenome ?? ''}`.trim(),
    cardNumber: '',
    expiry: '',
    cvv: ''
  });
  const [formData, setFormData] = useState({
    valor: '',
    descricao: '',
    nomePagador: `${user?.nome ?? ''} ${user?.sobrenome ?? ''}`.trim(),
    cpfPagador: '',
    emailPagador: user?.email || ''
  });
  const [isAmountLocked, setIsAmountLocked] = useState<boolean>(false);

  // Verificar status da API ao carregar a página
  useEffect(() => {
    checkApiStatus();
    // Preencher valor a partir dos parâmetros (planos)
    const params = new URLSearchParams(location.search);
    const amount = params.get('amount');
    const plan = params.get('plan');
    if (amount) {
      const cents = parseInt(amount, 10);
      if (!isNaN(cents)) {
        const planLabel = plan === 'advanced' ? 'Advanced' : plan === 'pro' ? 'Pro' : (plan || '').toString();
        setFormData(prev => ({
          ...prev,
          valor: (cents / 100).toFixed(2),
          descricao: plan ? `Assinatura Plano ${planLabel} • ProntuPsi (mensal)` : prev.descricao,
        }));
        setIsAmountLocked(true);
      }
    }
  }, []);

  // Atualizar nome/email quando usuário carregar
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        nomePagador: prev.nomePagador || `${user?.nome ?? ''} ${user?.sobrenome ?? ''}`.trim(),
        emailPagador: prev.emailPagador || user.email || ''
      }));
    }
  }, [user]);

  // Atualiza contagem regressiva de expiração
  useEffect(() => {
    if (!pixData?.expiredAt) return;
    const tick = () => {
      const diff = Math.max(0, Math.floor((new Date(pixData.expiredAt).getTime() - Date.now()) / 1000));
      setRemainingSeconds(diff);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [pixData?.expiredAt]);

  const checkApiStatus = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/pix/status-publico');
      const status = await response.json();
      // Ocultar mensagem detalhada em produção
      setApiStatus({ status: status.status, message: status.status === 'online' ? '' : status.message });
    } catch (error) {
      console.error('Erro ao verificar status da API:', error);
      setApiStatus({
        status: 'offline',
        message: 'Não foi possível conectar ao backend'
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Bloquear alteração de campos não editáveis
    if (name === 'valor' || name === 'nomePagador' || name === 'emailPagador' || name === 'descricao') {
      return;
    }
    // Máscara simples para CPF
    if (name === 'cpfPagador') {
      const digits = value.replace(/\D/g, '').slice(0, 11);
      const masked = digits
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      setFormData(prev => ({ ...prev, [name]: masked }));
      return;
    }
    // Cartão: máscaras
    if (name === 'cardNumber') {
      const digits = value.replace(/\D/g, '').slice(0, 16);
      const masked = digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
      setCardData(prev => ({ ...prev, cardNumber: masked }));
      return;
    }
    if (name === 'expiry') {
      const digits = value.replace(/\D/g, '').slice(0, 4);
      const masked = digits.replace(/(\d{2})(\d{1,2})?/, (m, g1, g2) => (g2 ? `${g1}/${g2}` : g1));
      setCardData(prev => ({ ...prev, expiry: masked }));
      return;
    }
    if (name === 'cvv') {
      const digits = value.replace(/\D/g, '').slice(0, 4);
      setCardData(prev => ({ ...prev, cvv: digits }));
      return;
    }
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.valor || !formData.descricao) {
      toast({
        title: "Erro",
        description: "Preencha o valor e descrição",
        variant: "destructive"
      });
      return;
    }

    if (!isAmountLocked) {
      toast({ title: 'Plano não selecionado', description: 'Escolha um plano em /planos para definir o valor.', variant: 'destructive' });
      return;
    }

    const valorEmCentavos = Math.round(parseFloat(formData.valor) * 100);
    
    if (isNaN(valorEmCentavos) || valorEmCentavos <= 0) {
      toast({
        title: "Erro",
        description: "Valor inválido",
        variant: "destructive"
      });
      return;
    }

    // Fluxo de cartão (placeholder)
    if (paymentMethod === 'card') {
      if (!cardData.cardholderName || cardData.cardholderName.trim().length < 3) {
        toast({ title: 'Erro', description: 'Informe o nome impresso no cartão', variant: 'destructive' });
        return;
      }
      const numberDigits = cardData.cardNumber.replace(/\D/g, '');
      if (numberDigits.length < 13) {
        toast({ title: 'Erro', description: 'Número do cartão inválido', variant: 'destructive' });
        return;
      }
      if (!/^\d{2}\/\d{2}$/.test(cardData.expiry)) {
        toast({ title: 'Erro', description: 'Validade no formato MM/AA', variant: 'destructive' });
        return;
      }
      if (cardData.cvv.length < 3) {
        toast({ title: 'Erro', description: 'CVV inválido', variant: 'destructive' });
        return;
      }
      toast({ title: 'Cartão de crédito', description: 'Processamento será habilitado em breve.' });
      return;
    }

    // validar CPF se preenchido (Pix)
    if (formData.cpfPagador) {
      const cleanCPF = formData.cpfPagador.replace(/\D/g, '');
      // reuse validator
      const isValid = (cleanCPF.length === 11) && (function(cpf:string){
        if (/^(\d)\1{10}$/.test(cpf)) return false;
        let sum=0; for (let i=0;i<9;i++) sum+=parseInt(cpf[i])* (10-i);
        let r=(sum*10)%11; if (r===10||r===11) r=0; if (r!==parseInt(cpf[9])) return false;
        sum=0; for (let i=0;i<10;i++) sum+=parseInt(cpf[i])*(11-i);
        r=(sum*10)%11; if (r===10||r===11) r=0; if (r!==parseInt(cpf[10])) return false; return true;
      })(cleanCPF);
      if (!isValid) {
        toast({ title: 'CPF inválido', description: 'Informe um CPF válido.', variant: 'destructive' });
        return;
      }
    }

    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:3000/api/pix/teste-publico', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          valor: valorEmCentavos,
          descricao: formData.descricao,
          nomePagador: formData.nomePagador || undefined,
          cpfPagador: formData.cpfPagador || undefined,
          emailPagador: formData.emailPagador || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setPixData(result.data);
        
        // Toast personalizado baseado no tipo de Pix
        if (result.data.isReal) {
          toast({
            title: "🎉 Pix REAL criado!",
            description: "Pix criado via SDK oficial da Efí. QR Code válido e funcional!",
          });
        } else {
          toast({
            title: "✅ Pix gerado!",
            description: "Pix simulado criado. Use para testes e demonstrações.",
          });
        }
      } else {
        throw new Error(result.message || 'Erro ao gerar Pix');
      }
      
    } catch (error) {
      console.error('Erro ao gerar Pix:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao gerar Pix",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Texto copiado para a área de transferência",
    });
  };

  const downloadQRCode = () => {
    if (pixData?.qrcodeImage) {
      const link = document.createElement('a');
      link.href = pixData.qrcodeImage;
      link.download = `pix-qrcode-${pixData.txid}.png`;
      link.click();
    }
  };

  const formatCurrency = (value: string) => {
    const valor = parseFloat(value) / 100;
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const fillTestData = () => {
    setFormData({
      valor: '10.50',
      descricao: 'Teste de checkout - R$ 10,50',
      nomePagador: 'João Teste Checkout',
      cpfPagador: '12345678901',
      emailPagador: 'joao.checkout@teste.com'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
              Checkout de Pagamento
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Gere seu Pix e pague de forma rápida e segura
            </p>
            
            {/* Status suprimido em produção para interface limpa */}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Formulário */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Dados do Pagamento
                </CardTitle>
                <CardDescription>
                  Escolha a forma de pagamento e preencha os dados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Escolha de método */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button type="button" variant={paymentMethod === 'pix' ? 'default' : 'outline'} onClick={() => setPaymentMethod('pix')}>Pix</Button>
                    <Button type="button" variant={paymentMethod === 'card' ? 'default' : 'outline'} onClick={() => setPaymentMethod('card')}>Cartão de crédito</Button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Valor (R$)
                    </label>
                    <Input
                      type="text"
                      name="valor"
                      value={formData.valor}
                      onChange={handleInputChange}
                      placeholder="0,00"
                      required
                      readOnly
                      disabled
                      className="w-full bg-slate-100 dark:bg-slate-800 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Descrição
                    </label>
                    <Textarea
                      name="descricao"
                      value={formData.descricao}
                      onChange={handleInputChange}
                      placeholder="Descrição do pagamento"
                      required
                      readOnly
                      disabled
                      className="w-full bg-slate-100 dark:bg-slate-800 cursor-not-allowed"
                    />
                  </div>

                  <Separator />

                  {paymentMethod === 'pix' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Dados do Pagador
                    </h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Nome Completo
                      </label>
                      <Input
                        type="text"
                        name="nomePagador"
                        value={formData.nomePagador}
                        onChange={handleInputChange}
                        placeholder="Nome do pagador"
                        required
                        readOnly
                        disabled
                        className="w-full bg-slate-100 dark:bg-slate-800 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        CPF
                      </label>
                      <Input
                        type="text"
                        name="cpfPagador"
                        value={formData.cpfPagador}
                        onChange={handleInputChange}
                        placeholder="000.000.000-00"
                        required
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Email
                      </label>
                      <Input
                        type="email"
                        name="emailPagador"
                        value={formData.emailPagador}
                        onChange={handleInputChange}
                        placeholder="email@exemplo.com"
                        required
                        readOnly
                        disabled
                        className="w-full bg-slate-100 dark:bg-slate-800 cursor-not-allowed"
                      />
                    </div>
                  </div>
                  )}

                  {paymentMethod === 'card' && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Dados do Cartão</h3>
                      {/* Visual do cartão */}
                      <div className="mx-auto w-[340px] h-[200px] rounded-xl bg-gradient-to-br from-slate-800 to-slate-600 text-white p-5 shadow-md">
                        <div className="text-xs opacity-70">ProntuPsi • Cartão</div>
                        <div className="mt-8 tracking-widest text-lg font-mono">{cardData.cardNumber || '•••• •••• •••• ••••'}</div>
                        <div className="mt-6 flex justify-between text-sm">
                          <div>
                            <div className="opacity-60 text-xs">TITULAR</div>
                            <div className="uppercase">{cardData.cardholderName || 'NOME DO TITULAR'}</div>
                          </div>
                          <div>
                            <div className="opacity-60 text-xs">VALIDADE</div>
                            <div>{cardData.expiry || 'MM/AA'}</div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nome impresso no cartão</label>
                        <Input type="text" name="cardholderName" value={cardData.cardholderName} onChange={(e)=>setCardData({...cardData, cardholderName: e.target.value})} placeholder="Como está no cartão" className="w-full" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Número do cartão</label>
                        <Input type="text" name="cardNumber" value={cardData.cardNumber} onChange={handleInputChange} placeholder="0000 0000 0000 0000" className="w-full" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Validade (MM/AA)</label>
                          <Input type="text" name="expiry" value={cardData.expiry} onChange={handleInputChange} placeholder="MM/AA" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">CVV</label>
                          <Input type="text" name="cvv" value={cardData.cvv} onChange={handleInputChange} placeholder="•••" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="flex-1"
                    >
                      {loading ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          {paymentMethod === 'pix' ? 'Gerando Pix...' : 'Validando cartão...'}
                        </>
                      ) : (
                        <>
                          <QrCode className="h-4 w-4 mr-2" />
                          {paymentMethod === 'pix' ? 'Gerar Pix' : 'Pagar com cartão'}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Resultado do Pix (limpo para pagamento) */}
            {pixData && (
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="h-5 w-5" />
                    Pix Gerado
                  </CardTitle>
                  <CardDescription>Use o QR Code ou Pix Copia e Cola para pagar.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Informações essenciais apenas */}
                  <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                    <p>🆔 TXID: {pixData.txid}</p>
                  </div>

                  {/* Valor e Descrição */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Valor
                      </label>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {pixData.valor}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Descrição
                      </label>
                      <p className="text-slate-700 dark:text-slate-300">
                        {pixData.descricao}
                      </p>
                    </div>
                  </div>

                  {/* Dados do pagador removidos da tela de pagamento */}

                  {/* QR Code */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      QR Code
                    </label>
                    <div className="flex justify-center">
                      <img 
                        src={pixData.qrcodeImage}
                        alt="QR Code Pix" 
                        className="w-60 h-60 border rounded-xl shadow-sm bg-white"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => copyToClipboard(pixData.qrcode)}
                        className="flex-1"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar Código
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={downloadQRCode}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>

                    {/* Pix Copia e Cola visível */}
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Pix Copia e Cola
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          readOnly
                          value={pixData.qrcode}
                          className="font-mono text-xs"
                        />
                        <Button variant="secondary" size="sm" onClick={() => copyToClipboard(pixData.qrcode)}>
                          <Copy className="h-4 w-4 mr-1" /> Copiar
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Instruções básicas */}
                  <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                    <p>• Abra o app do seu banco e escaneie o QR Code ou use o Pix Copia e Cola.</p>
                    <p>• Confirme o valor e conclua o pagamento.</p>
                  </div>

                  {/* Expiração */}
                  <div className="text-center text-xs text-slate-500 dark:text-slate-400">
                    {remainingSeconds > 0 ? (
                      <p>⏰ Expira em: {String(Math.floor(remainingSeconds/60)).padStart(2,'0')}:{String(remainingSeconds%60).padStart(2,'0')}</p>
                    ) : (
                      <p>⏰ Expirado</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Informações adicionais */}
          {!pixData && (
            <Card className="mt-8">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="font-medium text-slate-900 dark:text-white">Seguro</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Pagamento criptografado e seguro
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto">
                      <QrCode className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-medium text-slate-900 dark:text-white">Rápido</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Pagamento instantâneo via Pix
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto">
                      <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="font-medium text-slate-900 dark:text-white">24/7</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Disponível a qualquer momento
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
