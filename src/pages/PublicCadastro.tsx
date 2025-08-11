import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Loader2, AlertCircle, User, UserCircle, MapPin, Search } from 'lucide-react';
import { useAddressSearch } from '@/hooks/useAddressSearch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { apiService } from '@/services/api.service';

interface CadastroLink {
  id: string;
  title: string;
  description: string | null;
  token: string;
  isActive: boolean;
  expiresAt: Date | null;
  maxUses: number;
  currentUses: number;
}

interface FormData {
  // Etapa 1 - Dados Obrigatórios
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  nascimento: Date | null;
  genero: string;
  responsavelNome?: string;
  responsavelTelefone?: string;
  responsavelEmail?: string;
  responsavelParentesco?: string;

  // Etapa 2 - Dados Complementares
  enderecoLogradouro?: string;
  enderecoNumero?: string;
  enderecoBairro?: string;
  enderecoCidade?: string;
  enderecoEstado?: string;
  enderecoCep?: string;
  profissao?: string;
  contatoEmergenciaNome?: string;
  contatoEmergenciaTelefone?: string;
  contatoEmergenciaRelacao?: string;

  // Etapa 3 - Sugestão de data/hora e avatar
  dataConsulta: Date | null;
  horaConsulta: string;
  avatarBase64?: string;
}

const PublicCadastro: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [link, setLink] = useState<CadastroLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<number>(1);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [nascimentoText, setNascimentoText] = useState<string>("");
  const { loading: addressLoading, searchByCEP, searchByStreet, clearAddress } = useAddressSearch();
  const [addressSearchType, setAddressSearchType] = useState<'cep' | 'street'>('cep');
  const [addressSearchData, setAddressSearchData] = useState({
    cep: '',
    street: '',
    city: '',
    state: ''
  });
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    email: '',
    cpf: '',
    telefone: '',
    nascimento: null,
    genero: '',
    menorDeIdade: false,
    dataConsulta: null,
    horaConsulta: '',
  });

  useEffect(() => {
    if (token) {
      fetchLink();
    }
  }, [token]);

  const fetchLink = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPublicCadastroLink(token!);
      setLink(response);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar o link de cadastro');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validação final mínima (mantendo funcionalidades atuais)
    if (!formData.nome || !formData.email || !formData.cpf || !formData.telefone) {
      setError('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      
      // Enviar campos completos (backend já aceita os adicionais)
      const payload: any = {
        token: token!,
        nome: formData.nome,
        email: formData.email,
        cpf: formData.cpf,
        telefone: formData.telefone,
        dataConsulta: formData.dataConsulta ? format(formData.dataConsulta, 'yyyy-MM-dd') : undefined,
        horaConsulta: formData.horaConsulta || undefined,
        // Adicionais
        nascimento: formData.nascimento ? format(formData.nascimento, 'yyyy-MM-dd') : undefined,
        genero: formData.genero || undefined,
        enderecoLogradouro: formData.enderecoLogradouro || undefined,
        enderecoNumero: formData.enderecoNumero || undefined,
        enderecoBairro: formData.enderecoBairro || undefined,
        enderecoCidade: formData.enderecoCidade || undefined,
        enderecoEstado: formData.enderecoEstado || undefined,
        enderecoCep: formData.enderecoCep || undefined,
        profissao: formData.profissao || undefined,
        contatoEmergenciaNome: formData.contatoEmergenciaNome || undefined,
        contatoEmergenciaTelefone: formData.contatoEmergenciaTelefone || undefined,
        contatoEmergenciaRelacao: formData.contatoEmergenciaRelacao || undefined,
        avatar: formData.avatarBase64 || undefined,
      };

      await apiService.createPublicCadastroSubmission(payload);
      navigate('/cadastro-sucesso');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao enviar o cadastro');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | Date | boolean | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 11);
    if (numbers.length === 0) return '';
    if (numbers.length <= 2) return `(${numbers}`;
    if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  };

  // Compressão simples de imagem para evitar payloads grandes
  const compressImageToBase64 = (file: File, maxWidth = 512, targetKB = 90): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, maxWidth / img.width);
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { URL.revokeObjectURL(objectUrl); return reject(new Error('Canvas context not available')); }
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.9;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);
        // Reduz qualidade até ficar abaixo do alvo (aprox.)
        while (dataUrl.length / 1024 > targetKB && quality > 0.4) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }
        URL.revokeObjectURL(objectUrl);
        resolve(dataUrl);
      };
      img.onerror = (e) => { URL.revokeObjectURL(objectUrl); reject(e); };
      img.src = objectUrl;
    });
  };

  const handleAvatarChange = async (file: File | null) => {
    if (!file) {
      setAvatarPreview(null);
      setFormData(prev => ({ ...prev, avatarBase64: undefined }));
      return;
    }
    try {
      const dataUrl = await compressImageToBase64(file, 512, 90); // ~<100KB
      setAvatarPreview(dataUrl);
      setFormData(prev => ({ ...prev, avatarBase64: dataUrl }));
    } catch (e) {
      // fallback sem compressão
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setAvatarPreview(result);
        setFormData(prev => ({ ...prev, avatarBase64: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Helpers para data de nascimento (input dinâmico dd/mm/aaaa)
  const formatDateTextBR = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8 + 2); // até 8 dígitos
    const parts = [] as string[];
    if (digits.length > 0) parts.push(digits.slice(0, 2));
    if (digits.length > 2) parts.push(digits.slice(2, 4));
    if (digits.length > 4) parts.push(digits.slice(4, 8));
    return parts.join('/');
  };

  const parseDateTextBR = (text: string): Date | null => {
    const m = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!m) return null;
    const day = parseInt(m[1], 10);
    const month = parseInt(m[2], 10) - 1;
    const year = parseInt(m[3], 10);
    const d = new Date(year, month, day);
    if (d.getFullYear() === year && d.getMonth() === month && d.getDate() === day) return d;
    return null;
  };

  useEffect(() => {
    if (formData.nascimento) {
      const d = formData.nascimento;
      const text = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
      setNascimentoText(text);
    }
  }, [formData.nascimento]);

  const handleNascimentoTextChange = (raw: string) => {
    const masked = formatDateTextBR(raw);
    setNascimentoText(masked);
    const parsed = parseDateTextBR(masked);
    if (parsed) {
      handleInputChange('nascimento', parsed);
    }
  };

  const onlyDigits = (value: string, maxLen?: number) => {
    const d = value.replace(/\D/g, '');
    return typeof maxLen === 'number' ? d.slice(0, maxLen) : d;
  };

  const isMinor = (() => {
    if (!formData.nascimento) return false;
    const today = new Date();
    const birth = formData.nascimento;
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age < 18;
  })();

  const nextStep = () => {
    // Validação da etapa 1
    if (step === 1) {
      if (!formData.nome || !formData.email || !formData.cpf || !formData.telefone || !formData.nascimento || !formData.genero) {
        setError('Preencha todos os campos obrigatórios da etapa.');
        return;
      }
      if (isMinor && !formData.responsavelNome) {
        setError('Informe os dados do responsável.');
        return;
      }
    }
    setError(null);
    setStep(s => Math.min(3, s + 1));
  };

  const prevStep = () => setStep(s => Math.max(1, s - 1));

  // Validações por etapa (para habilitar/desabilitar botões de avanço)
  const step1Valid = !!(
    formData.nome &&
    formData.email &&
    formData.cpf &&
    formData.telefone &&
    formData.nascimento &&
    formData.genero &&
    (!isMinor || formData.responsavelNome)
  );
  const step2Valid = !!(
    (formData.enderecoLogradouro || '').trim() &&
    (formData.enderecoNumero || '').trim() &&
    (formData.enderecoBairro || '').trim() &&
    (formData.enderecoCidade || '').trim() &&
    (formData.enderecoEstado || '').trim() &&
    (formData.enderecoCep || '').trim() &&
    (formData.profissao || '').trim() &&
    (formData.contatoEmergenciaNome || '').trim() &&
    (formData.contatoEmergenciaTelefone || '').trim()
  );
  const isNextDisabled = (step === 1 && !step1Valid) || (step === 2 && !step2Valid);

  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 8; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        times.push(time);
      }
    }
    return times;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Carregando...</span>
        </div>
      </div>
    );
  }

  if (error && !link) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Erro</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }


  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando formulário de cadastro...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="p-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!link) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Link não encontrado</h2>
              <p className="text-gray-600">O link de cadastro não foi encontrado ou pode ter expirado.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{link.title}</CardTitle>
            {link.description && (
              <CardDescription>{link.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
              {error && (
              <div className="mb-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            )}

            {/* Stepper simples */}
            <div className="flex items-center justify-between mb-6">
              {[1,2,3].map((s) => (
                <div key={s} className="flex-1 flex items-center">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border ${step>=s ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground border-border'}`}>{s}</div>
                  {s<3 && <div className={`h-0.5 flex-1 mx-2 ${step> s ? 'bg-primary' : 'bg-border'}`}></div>}
                </div>
              ))}
            </div>

            <form
              onSubmit={(e)=>{ e.preventDefault(); }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              className="space-y-6"
            >
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">Dados Obrigatórios</h3>
                    <p className="text-sm text-muted-foreground">Preencha seus dados básicos para prosseguir.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome Completo <span className="text-red-500">*</span></Label>
                      <Input value={formData.nome} onChange={(e)=>handleInputChange('nome', e.target.value)} placeholder="Seu nome" />
                    </div>
                    <div className="space-y-2">
                      <Label>Data de Nascimento <span className="text-red-500">*</span></Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="dd/mm/aaaa"
                          value={nascimentoText}
                          onChange={(e)=>handleNascimentoTextChange(e.target.value)}
                          inputMode="numeric"
                          maxLength={10}
                        />
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" type="button">
                              <CalendarIcon className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={formData.nascimento}
                              onSelect={(date)=>handleInputChange('nascimento', date)}
                              disabled={(date)=> date > new Date()}
                              captionLayout="dropdown"
                              fromYear={1900}
                              toYear={new Date().getFullYear()}
                              locale={ptBR}
                              classNames={{
                                caption: 'flex items-center justify-between px-2 py-1',
                                caption_label: 'hidden',
                                dropdowns: 'flex items-center gap-2',
                                dropdown: 'h-9 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20',
                                dropdown_month: 'h-9 rounded-md border border-input bg-background px-2 text-sm',
                                dropdown_year: 'h-9 rounded-md border border-input bg-background px-2 text-sm',
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>E-mail <span className="text-red-500">*</span></Label>
                      <Input type="email" value={formData.email} onChange={(e)=>handleInputChange('email', e.target.value)} placeholder="seu@email.com" />
                    </div>
                    <div className="space-y-2">
                      <Label>CPF <span className="text-red-500">*</span></Label>
                      <Input
                        value={formData.cpf}
                        maxLength={14}
                        onChange={(e)=>handleInputChange('cpf', formatCPF(e.target.value))}
                        placeholder="000.000.000-00"
                        inputMode="numeric"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                      <Label>Telefone <span className="text-red-500">*</span></Label>
                <Input
                        value={formData.telefone}
                        onChange={(e)=>handleInputChange('telefone', formatPhone(e.target.value))}
                        inputMode="numeric"
                        maxLength={15}
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Gênero <span className="text-red-500">*</span></Label>
                      <Select value={formData.genero} onValueChange={(v)=>handleInputChange('genero', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="feminino">Feminino</SelectItem>
                          <SelectItem value="masculino">Masculino</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Status</Label>
                      <div className="text-sm text-muted-foreground">
                        {isMinor ? 'Menor de idade (preencha os dados do responsável)' : 'Maior de idade'}
                      </div>
                    </div>
              </div>

              <div className="space-y-2">
                    <Label>Foto de Perfil (opcional)</Label>
                    <div className="flex items-center gap-4">
                      <Avatar className="w-16 h-16 ring-2 ring-border">
                        <AvatarImage src={avatarPreview || ''} />
                        <AvatarFallback>FP</AvatarFallback>
                      </Avatar>
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={()=>fileInputRef.current?.click()}>Selecionar imagem</Button>
                        {avatarPreview && (
                          <Button type="button" variant="ghost" onClick={()=>{ setAvatarPreview(null); setFormData(prev=>({...prev, avatarBase64: undefined })); }}>Remover</Button>
                        )}
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleAvatarChange(e.target.files?.[0] || null)}
                />
              </div>

                  {isMinor && (
                    <div className="mt-2 rounded-md border p-4 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Responsável - Nome <span className="text-red-500">*</span></Label>
                          <Input value={formData.responsavelNome || ''} onChange={(e)=>handleInputChange('responsavelNome', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Responsável - Telefone</Label>
                          <Input value={formData.responsavelTelefone || ''} onChange={(e)=>handleInputChange('responsavelTelefone', formatPhone(e.target.value))} />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Responsável - E-mail</Label>
                          <Input type="email" value={formData.responsavelEmail || ''} onChange={(e)=>handleInputChange('responsavelEmail', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Parentesco</Label>
                          <Input value={formData.responsavelParentesco || ''} onChange={(e)=>handleInputChange('responsavelParentesco', e.target.value)} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2"><MapPin className="w-4 h-4" />Dados Complementares</h3>
                    <p className="text-sm text-muted-foreground">Endereço, profissão e contato de emergência.</p>
                  </div>
              <div className="space-y-2">
                    <Label className="text-sm font-medium">Como deseja buscar o endereço?</Label>
                    <div className="flex gap-2">
                      <Button type="button" variant={addressSearchType==='cep' ? 'default' : 'outline'} size="sm" onClick={()=>setAddressSearchType('cep')}>Por CEP</Button>
                      <Button type="button" variant={addressSearchType==='street' ? 'default' : 'outline'} size="sm" onClick={()=>setAddressSearchType('street')}>Por Rua</Button>
                      <Button type="button" variant="outline" size="sm" onClick={()=>{ setAddressSearchData({ cep:'', street:'', city:'', state:'' }); clearAddress?.(); }}>Limpar</Button>
                    </div>
                  </div>

                  {addressSearchType === 'cep' ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <Label>CEP</Label>
                <Input
                          placeholder="00000-000"
                          value={addressSearchData.cep}
                          onChange={(e)=>setAddressSearchData({...addressSearchData, cep: e.target.value})}
                />
              </div>
                      <div className="flex items-end">
                        <Button type="button" className="w-full gap-2" onClick={async()=>{
                          const result = await searchByCEP(addressSearchData.cep.replace(/\D/g, ''));
                          if (result) {
                            setFormData(prev => ({
                              ...prev,
                              enderecoLogradouro: result.logradouro || '',
                              enderecoBairro: result.bairro || '',
                              enderecoCidade: result.localidade || '',
                              enderecoEstado: result.uf || '',
                              enderecoCep: result.cep || addressSearchData.cep,
                            }));
                          }
                        }} disabled={!addressSearchData.cep}>
                          {addressLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Buscar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <Label>Rua</Label>
                        <Input value={addressSearchData.street} onChange={(e)=>setAddressSearchData({...addressSearchData, street: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Cidade</Label>
                        <Input value={addressSearchData.city} onChange={(e)=>setAddressSearchData({...addressSearchData, city: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>UF</Label>
                        <Input value={addressSearchData.state} onChange={(e)=>setAddressSearchData({...addressSearchData, state: e.target.value})} />
                      </div>
                      <div className="md:col-span-4 flex items-end">
                        <Button type="button" className="w-full gap-2" onClick={async()=>{
                          if (!addressSearchData.street || !addressSearchData.city || !addressSearchData.state) return;
                          const result = await searchByStreet(addressSearchData.street, addressSearchData.city, addressSearchData.state);
                          if (result) {
                            setFormData(prev => ({
                              ...prev,
                              enderecoLogradouro: result.logradouro || '',
                              enderecoBairro: result.bairro || '',
                              enderecoCidade: result.localidade || '',
                              enderecoEstado: result.uf || '',
                              enderecoCep: result.cep || '',
                            }));
                          }
                        }} disabled={!addressSearchData.street || !addressSearchData.city || !addressSearchData.state}>
                          {addressLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Buscar
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Endereço - Logradouro</Label>
                      <Input value={formData.enderecoLogradouro || ''} onChange={(e)=>handleInputChange('enderecoLogradouro', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Número</Label>
                      <Input
                        value={formData.enderecoNumero || ''}
                        onChange={(e)=>handleInputChange('enderecoNumero', onlyDigits(e.target.value, 6))}
                        inputMode="numeric"
                        pattern="\\d*"
                        placeholder="Ex: 123"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Bairro</Label>
                      <Input value={formData.enderecoBairro || ''} onChange={(e)=>handleInputChange('enderecoBairro', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Cidade</Label>
                      <Input value={formData.enderecoCidade || ''} onChange={(e)=>handleInputChange('enderecoCidade', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Estado</Label>
                      <Input value={formData.enderecoEstado || ''} onChange={(e)=>handleInputChange('enderecoEstado', e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>CEP</Label>
                      <Input value={formData.enderecoCep || ''} onChange={(e)=>handleInputChange('enderecoCep', e.target.value)} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Profissão</Label>
                      <Input value={formData.profissao || ''} onChange={(e)=>handleInputChange('profissao', e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label>Contato de Emergência - Nome</Label>
                      <Input value={formData.contatoEmergenciaNome || ''} onChange={(e)=>handleInputChange('contatoEmergenciaNome', e.target.value)} />
                    </div>
              <div className="space-y-2">
                      <Label>Contato de Emergência - Telefone</Label>
                <Input
                        value={formData.contatoEmergenciaTelefone || ''}
                        onChange={(e)=>handleInputChange('contatoEmergenciaTelefone', formatPhone(e.target.value))}
                        inputMode="numeric"
                        maxLength={15}
                  placeholder="(00) 00000-0000"
                />
              </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Relação com o contato de emergência</Label>
                    <Input value={formData.contatoEmergenciaRelacao || ''} onChange={(e)=>handleInputChange('contatoEmergenciaRelacao', e.target.value)} />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
              <div className="space-y-2">
                    <Label>Sugestão de Data</Label>
                <Popover>
                  <PopoverTrigger asChild>
                        <Button type="button" variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.dataConsulta ? format(formData.dataConsulta, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecione uma data'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.dataConsulta}
                          onSelect={(date)=>handleInputChange('dataConsulta', date)}
                          disabled={(date)=> date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                    <Label>Horário</Label>
                    <Select value={formData.horaConsulta} onValueChange={(v)=>handleInputChange('horaConsulta', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um horário" />
                  </SelectTrigger>
                  <SelectContent>
                    {generateTimeOptions().map((time) => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

                  <div className="space-y-2">
                    <Label>Foto de Perfil (opcional)</Label>
                    {avatarPreview && (
                      <img src={avatarPreview} alt="Pré-visualização" className="w-20 h-20 rounded-full object-cover mb-2" />
                    )}
                    <Input type="file" accept="image/*" onChange={(e)=>handleAvatarChange(e.target.files?.[0] || null)} />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <Button type="button" variant="outline" onClick={prevStep} disabled={step===1}>Voltar</Button>
                {step < 3 ? (
                  <Button type="button" onClick={nextStep} disabled={isNextDisabled} className={isNextDisabled ? 'opacity-70 cursor-not-allowed' : ''}>
                    Continuar
                  </Button>
                ) : (
                  <Button type="button" onClick={handleSubmit} disabled={submitting || !formData.nome || !formData.email || !formData.cpf || !formData.telefone}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar Cadastro'
                )}
              </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublicCadastro;
