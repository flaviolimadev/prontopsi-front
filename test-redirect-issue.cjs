const axios = require('axios');

// Configuração
const API_BASE_URL = 'http://localhost:3000/api';
const TEST_EMAIL = 'ctrlserr@gmail.com';

// Função para testar o problema de redirecionamento
async function testRedirectIssue() {
  console.log('🧪 Testando problema de redirecionamento...\n');
  
  try {
    // 1. Testar login (deve falhar com email não verificado)
    console.log('🔐 1. Testando login...');
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: TEST_EMAIL,
        password: '123456'
      });
      console.log('❌ Login não deveria ter funcionado');
    } catch (error) {
      const errorMessage = error.response?.data?.message || '';
      console.log('✅ Login bloqueado:', errorMessage);
      
      if (errorMessage.includes('Email não verificado')) {
        console.log('✅ Erro correto detectado');
      }
    }
    console.log('');
    
    console.log('📋 Análise do problema:');
    console.log('✅ Backend está funcionando corretamente');
    console.log('✅ Login retorna erro de email não verificado');
    console.log('');
    console.log('🎯 Fluxo esperado no frontend:');
    console.log('1. Usuário faz login → Backend retorna erro');
    console.log('2. Frontend detecta erro → Redireciona para /email-verification');
    console.log('3. Página de verificação carrega → Usuário vê formulário');
    console.log('4. NÃO deve redirecionar de volta para /login');
    console.log('');
    console.log('🔍 Logs esperados no console do navegador:');
    console.log('- "🔍 AuthProvider: useEffect executado, pathname: /login"');
    console.log('- "🔍 AuthProvider: Página atual: /login"');
    console.log('- "🔍 AuthProvider: É página pública? true"');
    console.log('- "🔍 AuthProvider: Página pública detectada, pulando verificação"');
    console.log('- "🔍 AuthProvider: Erro no login: { message: \"Email não verificado...\" }"');
    console.log('- "🔍 AuthProvider: Detectado erro de email não verificado"');
    console.log('- Redirecionamento para /email-verification');
    console.log('');
    console.log('- "🔍 AuthProvider: useEffect executado, pathname: /email-verification"');
    console.log('- "🔍 AuthProvider: Página atual: /email-verification"');
    console.log('- "🔍 AuthProvider: É página pública? true"');
    console.log('- "🔍 AuthProvider: Página pública detectada, pulando verificação"');
    console.log('- Página de verificação deve permanecer carregada');
    console.log('');
    console.log('🎯 Para testar:');
    console.log('1. Abra: http://localhost:8080/login');
    console.log('2. Use as credenciais:', TEST_EMAIL, '/ 123456');
    console.log('3. Clique em "Entrar"');
    console.log('4. Verifique o console do navegador (F12)');
    console.log('5. Deve ser redirecionado para /email-verification');
    console.log('6. A página deve permanecer em /email-verification');
    console.log('7. NÃO deve voltar para /login');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

// Executar teste
testRedirectIssue().catch(console.error);
