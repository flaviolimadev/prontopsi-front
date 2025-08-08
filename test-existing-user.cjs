const axios = require('axios');

// Configuração
const API_BASE_URL = 'http://localhost:3000/api';
const TEST_EMAIL = 'teste@exemplo.com';

// Função para testar usuário existente
async function testExistingUser() {
  console.log('🧪 Testando usuário existente...\n');
  
  try {
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
        console.log('✅ Erro correto detectado - email não verificado');
      } else if (errorMessage.includes('Credenciais inválidas')) {
        console.log('❌ Erro incorreto - credenciais inválidas');
      }
    }
    
    console.log('\n📋 Usuário de teste:');
    console.log('Email:', TEST_EMAIL);
    console.log('Senha: 123456');
    console.log('');
    console.log('🎯 Para testar no frontend:');
    console.log('1. Abra: http://localhost:8080/login');
    console.log('2. Use as credenciais:', TEST_EMAIL, '/ 123456');
    console.log('3. Clique em "Entrar"');
    console.log('4. Deve ser redirecionado para /email-verification');
    console.log('5. A página deve permanecer em /email-verification');
    console.log('6. NÃO deve voltar para /login');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

// Executar teste
testExistingUser().catch(console.error);
