const axios = require('axios');

// Configuração
const API_BASE_URL = 'http://localhost:3000/api';
const TEST_EMAIL = 'teste@exemplo.com';

// Função para testar o fluxo de verificação
async function testVerificationFlow() {
  console.log('🧪 Testando fluxo de verificação...\n');
  
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
    
    console.log('\n📋 2. Fluxo esperado no frontend:');
    console.log('✅ Login → Backend retorna "Usuário inativo"');
    console.log('✅ AuthProvider detecta erro → Retorna EMAIL_NOT_VERIFIED');
    console.log('✅ Login.tsx recebe EMAIL_NOT_VERIFIED → Redireciona para /email-verification');
    console.log('✅ VerificationRoute verifica email no state → Renderiza EmailVerification');
    console.log('✅ Página permanece em /email-verification (NÃO volta para /login)');
    console.log('✅ Usuário insere código → Verificação bem-sucedida');
    console.log('✅ Redirecionamento para /dashboard');
    
    console.log('\n🔍 3. Logs esperados no console do navegador:');
    console.log('🔍 AuthProvider: signIn iniciado para: teste@exemplo.com');
    console.log('🔍 AuthProvider: Erro no login: { message: "Usuário inativo" }');
    console.log('🔍 AuthProvider: Detectado erro de email não verificado: Usuário inativo');
    console.log('🔍 AuthProvider: Retornando EMAIL_NOT_VERIFIED para redirecionamento');
    console.log('🔍 Login: Resultado do signIn: { success: false, error: "EMAIL_NOT_VERIFIED", email: "teste@exemplo.com" }');
    console.log('🔍 Login: Email não verificado, redirecionando para verificação');
    console.log('🔍 VerificationRoute: Componente carregado');
    console.log('🔍 VerificationRoute: Email fornecido: teste@exemplo.com');
    console.log('🔍 EmailVerification: Componente carregado');
    console.log('🔍 EmailVerification: Email recebido: teste@exemplo.com');
    console.log('🔍 EmailVerification: Iniciando verificação de email');
    console.log('🔍 EmailVerification: Verificação bem-sucedida');
    console.log('🔍 AuthProvider: Resetando verificação de autenticação');
    console.log('🔍 EmailVerification: Redirecionando para /dashboard');
    
    console.log('\n🎯 4. Para testar:');
    console.log('1. Abra: http://localhost:8080/login');
    console.log('2. Use as credenciais:', TEST_EMAIL, '/ 123456');
    console.log('3. Clique em "Entrar"');
    console.log('4. Verifique se é redirecionado para /email-verification');
    console.log('5. Verifique se a página permanece em /email-verification');
    console.log('6. Verifique se o email aparece no formulário');
    console.log('7. Insira um código de verificação (se tiver)');
    console.log('8. Verifique se é redirecionado para /dashboard após verificação');
    
    console.log('\n⚠️ 5. Problemas comuns:');
    console.log('- Página volta para /login após redirecionamento para /email-verification');
    console.log('- useEffect executado múltiplas vezes');
    console.log('- Token não salvo corretamente após verificação');
    console.log('- Redirecionamento não funcionando após verificação');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

// Executar teste
testVerificationFlow().catch(console.error);
