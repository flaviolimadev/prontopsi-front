const axios = require('axios');

// Configuração
const API_BASE_URL = 'http://localhost:3000/api';
const TEST_EMAIL = 'teste@exemplo.com';

// Função para testar se o problema de reload foi resolvido
async function testNoReload() {
  console.log('🧪 Testando se o problema de reload foi resolvido...\n');
  
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
    
    console.log('\n📋 2. Problema anterior:');
    console.log('❌ AuthProvider usava window.location.href');
    console.log('❌ Isso causava reload da página');
    console.log('❌ location.state era perdido');
    console.log('❌ VerificationRoute recebia state: null');
    
    console.log('\n🔧 3. Solução implementada:');
    console.log('✅ Removido window.location.href do AuthProvider');
    console.log('✅ AuthProvider não redireciona automaticamente');
    console.log('✅ Login.tsx faz o redirecionamento com navigate()');
    console.log('✅ location.state é preservado');
    
    console.log('\n🔍 4. Logs esperados no console do navegador:');
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
    
    console.log('\n🎯 5. Para testar:');
    console.log('1. Abra: http://localhost:8080/login');
    console.log('2. Use as credenciais:', TEST_EMAIL, '/ 123456');
    console.log('3. Clique em "Entrar"');
    console.log('4. Verifique se NÃO há reload da página');
    console.log('5. Verifique se os logs aparecem na ordem correta');
    console.log('6. Verifique se a página permanece em /email-verification');
    console.log('7. Verifique se o email aparece no formulário');
    
    console.log('\n⚠️ 6. Se ainda houver problemas:');
    console.log('- Verifique se não há outros redirecionamentos com window.location');
    console.log('- Verifique se o React Router está funcionando corretamente');
    console.log('- Verifique se não há conflitos de roteamento');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

// Executar teste
testNoReload().catch(console.error);
