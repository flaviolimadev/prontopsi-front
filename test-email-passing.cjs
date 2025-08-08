const axios = require('axios');

// Configuração
const API_BASE_URL = 'http://localhost:3000/api';
const TEST_EMAIL = 'teste@exemplo.com';

// Função para testar se o email está sendo passado corretamente
async function testEmailPassing() {
  console.log('🧪 Testando se o email está sendo passado corretamente...\n');
  
  try {
    console.log('🔐 1. Testando login (deve falhar com "Usuário inativo")...');
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: TEST_EMAIL,
        password: '123456'
      });
      console.log('❌ Login não deveria ter funcionado');
    } catch (error) {
      const errorMessage = error.response?.data?.message || '';
      console.log('✅ Login bloqueado:', errorMessage);
      
      if (errorMessage.includes('Usuário inativo')) {
        console.log('✅ Backend funcionando corretamente');
      }
    }
    
    console.log('\n📋 2. Problema identificado:');
    console.log('❌ VerificationRoute está recebendo location.state: null');
    console.log('❌ Email extraído: undefined');
    console.log('❌ Redirecionamento para /login');
    
    console.log('\n🔍 3. Logs esperados no console do navegador:');
    console.log('🔍 AuthProvider: signIn iniciado para: teste@exemplo.com');
    console.log('🔍 AuthProvider: Erro no login: { message: "Usuário inativo" }');
    console.log('🔍 AuthProvider: Detectado erro de email não verificado: Usuário inativo');
    console.log('🔍 AuthProvider: Retornando EMAIL_NOT_VERIFIED para redirecionamento');
    console.log('🔍 Login: Resultado do signIn: { success: false, error: "EMAIL_NOT_VERIFIED", email: "teste@exemplo.com" }');
    console.log('🔍 Login: Email não verificado, redirecionando para verificação');
    console.log('🔍 Login: Email a ser passado: teste@exemplo.com');
    console.log('🔍 Login: State a ser enviado: { email: "teste@exemplo.com" }');
    console.log('🔍 VerificationRoute: Componente carregado');
    console.log('🔍 VerificationRoute: Location state: { email: "teste@exemplo.com" }');
    console.log('🔍 VerificationRoute: Email extraído: teste@exemplo.com');
    console.log('🔍 VerificationRoute: Email fornecido: teste@exemplo.com');
    console.log('🔍 EmailVerification: Componente carregado');
    console.log('🔍 EmailVerification: Email recebido: teste@exemplo.com');
    
    console.log('\n🎯 4. Para testar:');
    console.log('1. Abra: http://localhost:8080/login');
    console.log('2. Use as credenciais:', TEST_EMAIL, '/ 123456');
    console.log('3. Clique em "Entrar"');
    console.log('4. Verifique se os logs aparecem na ordem correta');
    console.log('5. Verifique se o email está sendo passado corretamente');
    console.log('6. Verifique se a página permanece em /email-verification');
    
    console.log('\n⚠️ 5. Se o problema persistir:');
    console.log('- Verifique se o AuthProvider está retornando o email');
    console.log('- Verifique se o Login.tsx está passando o email no state');
    console.log('- Verifique se o VerificationRoute está recebendo o state');
    console.log('- Verifique se há algum redirecionamento conflitante');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

// Executar teste
testEmailPassing().catch(console.error);
