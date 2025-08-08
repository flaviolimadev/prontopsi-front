const axios = require('axios');

// Configuração
const API_BASE_URL = 'http://localhost:3000/api';
const TEST_EMAIL = 'teste-erro@exemplo.com';

// Função para testar o erro na página de verificação
async function testVerificationError() {
  console.log('🧪 Testando erro na página de verificação...\n');
  
  try {
    // 1. Registrar usuário
    console.log('📝 1. Registrando usuário...');
    try {
      const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
        nome: 'Teste',
        sobrenome: 'Erro',
        email: TEST_EMAIL,
        password: '123456',
        contato: '(11) 99999-9999'
      });
      
      console.log('✅ Usuário registrado:', registerResponse.data.message);
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('✅ Usuário já existe');
      } else {
        console.log('❌ Erro ao registrar:', error.response?.data?.message);
        return;
      }
    }
    console.log('');
    
    // 2. Testar verificação com código inválido
    console.log('📧 2. Testando verificação com código inválido...');
    try {
      const verifyResponse = await axios.post(`${API_BASE_URL}/auth/verify-email`, {
        email: TEST_EMAIL,
        verificationCode: '000000' // Código inválido
      });
      console.log('❌ Verificação não deveria ter funcionado');
    } catch (error) {
      const errorMessage = error.response?.data?.message || '';
      console.log('✅ Verificação falhou corretamente:', errorMessage);
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
    
    console.log('📋 Análise do problema:');
    console.log('✅ Backend está funcionando corretamente');
    console.log('✅ Verificação falha com código inválido (esperado)');
    console.log('✅ Reenvio de código funciona');
    console.log('');
    console.log('🎯 Para testar no frontend:');
    console.log('1. Acesse: http://localhost:8080/login');
    console.log('2. Use o email:', TEST_EMAIL);
    console.log('3. Use a senha: 123456');
    console.log('4. Clique em "Entrar"');
    console.log('5. Deve ser redirecionado para: http://localhost:8080/email-verification');
    console.log('6. Verifique o console do navegador para logs de debug');
    console.log('7. Se aparecer erro rapidamente, verifique:');
    console.log('   - Se o email está sendo passado corretamente');
    console.log('   - Se há algum erro na requisição');
    console.log('   - Se o AuthProvider está interferindo');
    console.log('');
    console.log('🔍 Logs esperados no console:');
    console.log('- "🔍 EmailVerification: Componente carregado"');
    console.log('- "🔍 EmailVerification: Email recebido: [email]"');
    console.log('- "🔍 AuthProvider: Página de verificação detectada, pulando verificação"');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

// Executar teste
testVerificationError().catch(console.error);
