# 🛒 Página de Checkout - ProntuPsi

## 📋 **Visão Geral**

A página `/checkout` é uma interface completa para geração de pagamentos Pix, integrada com a **SDK oficial da Efí (Gerencianet)**. Ela permite que usuários gerem Pix reais ou simulados para testes.

## 🚀 **Funcionalidades**

### **✅ Geração de Pix**
- **Pix Real**: Integração completa com SDK oficial da Efí
- **Pix Simulado**: Fallback inteligente quando SDK não está disponível
- **Validação**: Validação de campos obrigatórios
- **Formatação**: Conversão automática de valores

### **🎨 Interface**
- **Design Responsivo**: Funciona em desktop e mobile
- **Tema Escuro/Claro**: Suporte completo a temas
- **Indicadores Visuais**: Badges para mostrar tipo de Pix
- **QR Code**: Exibição e download do QR Code
- **Código Pix**: Código copia e cola
- **Status da API**: Indicador visual do status da integração

### **🔧 Integração**
- **Backend**: Comunica com `/api/pix/teste-publico`
- **SDK Oficial**: Usa `sdk-node-apis-efi`
- **Fallback Inteligente**: Simulação quando SDK falha
- **Logs**: Informações detalhadas sobre integração

## 📱 **Como Usar**

### **1. Acessar a Página**
```
http://localhost:8080/#/checkout
```

### **2. Verificar Status da API**
- **Badge Verde**: API funcionando perfeitamente
- **Badge Vermelho**: API com problemas
- **Mensagem**: Descrição detalhada do status

### **3. Preencher Dados**
- **Valor**: Valor em reais (ex: 10.50)
- **Descrição**: Descrição do pagamento
- **Dados do Pagador** (opcional):
  - Nome completo
  - CPF
  - Email

### **4. Gerar Pix**
- Clicar em "Gerar Pix"
- Aguardar processamento
- Visualizar resultado

### **5. Pagar**
- **QR Code**: Escanear com app do banco
- **Código**: Copiar e colar no app
- **Download**: Baixar QR Code para uso offline

## 🔍 **Tipos de Pix**

### **🟢 Pix Real (SDK Oficial)**
- ✅ Criado via API real da Efí
- ✅ QR Code válido e funcional
- ✅ Webhook configurado
- ✅ Integração completa
- ✅ Badge "🚀 REAL"

### **🟡 Pix Simulado (Fallback)**
- ⚠️ Estrutura idêntica ao real
- ⚠️ QR Code funcional para testes
- ⚠️ Não processado pela Efí
- ⚠️ Para demonstrações
- ⚠️ Badge "🧪 SIMULADO"

## 🛠️ **Configuração Técnica**

### **Backend**
```typescript
// Rota pública para testes
POST /api/pix/teste-publico

// Status da API
GET /api/pix/status-publico
```

### **Frontend**
```typescript
// Interface PixData
interface PixData {
  txid: string;
  valor: string;
  descricao: string;
  qrcode: string;
  qrcodeImage: string;
  devedor: { nome: string; cpf: string; email?: string; };
  expiredAt: Date;
  status: string;
  databaseId: string;
  isTest: boolean;
  isReal: boolean;
  sdkVersion?: string;
  integrationType?: string;
  instructions?: string[];
}

// Interface ApiStatus
interface ApiStatus {
  status: 'online' | 'offline';
  message: string;
  details?: any;
}
```

## 🧪 **Testes**

### **Script de Teste**
```bash
cd frontEnd
node test-checkout.js
```

### **Teste Manual**
1. Acessar `/checkout`
2. Verificar status da API
3. Clicar em "🧪 Teste" para preencher dados
4. Gerar Pix
5. Verificar resultado e tipo (real/simulado)

## 🔧 **Troubleshooting**

### **Erro de Conexão**
- Verificar se backend está rodando
- Verificar porta 3000
- Verificar logs do backend

### **SDK Não Funciona**
- Verificar certificado P12
- Verificar credenciais da Efí
- Verificar variáveis de ambiente
- Verificar status da API no frontend

### **Pix Não Gera**
- Verificar logs do console
- Verificar resposta da API
- Verificar validação de campos

## 📊 **Monitoramento**

### **Status da API**
- **Online**: SDK funcionando perfeitamente
- **Offline**: Problemas de configuração ou conexão
- **Detalhes**: Informações técnicas sobre o erro

### **Logs do Frontend**
- Requisições para API
- Respostas recebidas
- Erros de validação
- Status da integração

## 🎯 **Próximos Passos**

1. **Webhook**: Configurar notificações de pagamento
2. **Histórico**: Página de transações
3. **Relatórios**: Estatísticas de pagamentos
4. **Notificações**: Email/SMS de confirmação

## 📚 **Referências**

- [SDK Oficial Efí](https://github.com/efipay/sdk-node-apis-efi)
- [Documentação Efí](https://dev.efipay.com.br/docs/api-pix)
- [Componentes UI](https://ui.shadcn.com/)
- [React Router](https://reactrouter.com/)

## 🔄 **Changelog**

### **v2.0.0 - Integração Real com Gerencianet**
- ✅ SDK oficial da Efí integrada
- ✅ Fallback inteligente para simulação
- ✅ Indicador visual de status da API
- ✅ Interface melhorada com badges informativos
- ✅ Melhor tratamento de erros
- ✅ Logs detalhados da integração

### **v1.0.0 - Versão Simulada**
- ✅ Interface básica de checkout
- ✅ Geração de Pix simulados
- ✅ QR Code funcional para testes
- ✅ Validação de campos


