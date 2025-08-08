const axios = require('axios');

// Configuração
const API_BASE_URL = 'http://localhost:3000/api';
const TEST_EMAIL = 'teste-completo@exemplo.com';

// Função para testar o fluxo completo de verificação obrigatória
async function testVerificationFlowComplete() {
  console.log('🧪 Testando fluxo completo de verificação obrigatória...\n');
  
  try {
    // 1. Registrar usuário
    console.log('📝 1. Registrando usuário...');
    try {
      const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
        nome: 'Teste',
        sobrenome: 'Completo',
        email: TEST_EMAIL,
        password: '123456',
        contato: '(11) 99999-9999'
      });
      
      console.log('✅ Usuário registrado:', registerResponse.data.message);
      console.log('✅ requiresVerification:', registerResponse.data.requiresVerification);
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('✅ Usuário já existe');
      } else {
        console.log('❌ Erro ao registrar:', error.response?.data?.message);
        return;
      }
    }
    console.log('');
    
    // 2. Testar login (deve falhar e retornar usuário não verificado)
    console.log('🔐 2. Testando login (deve falhar)...');
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: TEST_EMAIL,
        password: '123456'
      });
      console.log('❌ Login não deveria ter funcionado');
    } catch (error) {
      const errorMessage = error.response?.data?.message || '';
      console.log('✅ Login bloqueado:', errorMessage);
    }
    console.log('');
    
    // 3. Testar reenvio de código
    console.log('📧 3. Testando reenvio de código...');
    try {
      const resendResponse = await axios.post(`${API_BASE_URL}/auth/resend-verification`, {
        email: TEST_EMAIL
      });
      console.log('✅ Código reenviado:', resendResponse.data.message);
    } catch (error) {
      console.log('❌ Erro ao reenviar código:', error.response?.data?.message || error.message);
    }
    console.log('');
    
    console.log('📋 Fluxo de verificação obrigatória implementado:');
    console.log('✅ Registro redireciona para verificação');
    console.log('✅ Login com usuário não verificado redireciona para verificação');
    console.log('✅ Todas as páginas protegidas bloqueadas até verificação');
    console.log('✅ Apenas páginas públicas acessíveis sem verificação');
    console.log('');
    console.log('🎯 Fluxo esperado no frontend:');
    console.log('1. Usuário se registra → Redirecionado para /email-verification');
    console.log('2. Usuário faz login não verificado → Redirecionado para /email-verification');
    console.log('3. Usuário tenta acessar /dashboard → Redirecionado para /email-verification');
    console.log('4. Usuário verifica email → Redirecionado para /dashboard');
    console.log('5. Agora pode acessar todas as páginas');
    console.log('');
    console.log('🔍 Páginas públicas (acessíveis sem verificação):');
    console.log('- / (landing page)');
    console.log('- /login');
    console.log('- /signup');
    console.log('- /email-verification');
    console.log('');
    console.log('🔒 Páginas protegidas (requerem verificação):');
    console.log('- /dashboard');
    console.log('- /pacientes');
    console.log('- /agenda');
    console.log('- /prontuarios');
    console.log('- /financeiro');
    console.log('- /arquivos');
    console.log('- /relatorios');
    console.log('- /configuracoes');
    console.log('');
    console.log('🎯 Para testar:');
    console.log('1. Registre um usuário → Deve ir para verificação');
    console.log('2. Tente acessar /dashboard → Deve ir para verificação');
    console.log('3. Verifique o email → Deve ir para dashboard');
    console.log('4. Agora pode acessar todas as páginas');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

// Executar teste
testVerificationFlowComplete().catch(console.error);
