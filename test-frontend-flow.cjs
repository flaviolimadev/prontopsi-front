const axios = require('axios');

// Configuração
const API_BASE_URL = 'http://localhost:3000/api';
const FRONTEND_URL = 'http://localhost:8080';
const TEST_EMAIL = 'teste-frontend@exemplo.com';

// Função para testar o fluxo completo
async function testFrontendFlow() {
  console.log('🧪 Testando fluxo completo do frontend...\n');
  
  try {
    // 1. Registrar usuário
    console.log('📝 1. Registrando usuário...');
    try {
      const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
        nome: 'Teste',
        sobrenome: 'Frontend',
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
    
    // 2. Testar login (deve falhar)
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
      
      if (errorMessage.includes('Usuário inativo')) {
        console.log('✅ Erro correto detectado');
      }
    }
    console.log('');
    
    console.log('📋 Fluxo esperado no frontend:');
    console.log('1. Usuário acessa: http://localhost:8080/login');
    console.log('2. Insere email:', TEST_EMAIL);
    console.log('3. Insere senha: 123456');
    console.log('4. Clica em "Entrar"');
    console.log('5. Backend retorna: "Usuário inativo"');
    console.log('6. Frontend detecta erro e redireciona para: http://localhost:8080/email-verification');
    console.log('7. Usuário vê página de verificação com email:', TEST_EMAIL);
    console.log('');
    console.log('🔍 Logs esperados no console do navegador:');
    console.log('- "🔍 AuthProvider: useEffect executado, pathname: /login"');
    console.log('- "🔍 AuthProvider: Verificando autenticação..."');
    console.log('- "🔍 AuthProvider: Nenhum token encontrado"');
    console.log('- "🔍 AuthProvider: Erro no login: { message: \"Usuário inativo\" }"');
    console.log('- "🔍 AuthProvider: Detectado erro de email não verificado: Usuário inativo"');
    console.log('- Redirecionamento para /email-verification');
    console.log('');
    console.log('🎯 Para testar:');
    console.log('1. Abra: http://localhost:8080/login');
    console.log('2. Use as credenciais acima');
    console.log('3. Verifique o console do navegador (F12)');
    console.log('4. Deve ser redirecionado para /email-verification');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

// Executar teste
testFrontendFlow().catch(console.error);
