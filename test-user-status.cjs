const axios = require('axios');

// Configuração
const API_BASE_URL = 'http://localhost:3000/api';
const TEST_EMAIL = 'ctrlserr@gmail.com';

// Função para testar o status do usuário
async function testUserStatus() {
  console.log('🧪 Testando status do usuário...\n');
  
  try {
    // 1. Testar login com diferentes senhas
    console.log('🔐 1. Testando login com senha "123456"...');
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: TEST_EMAIL,
        password: '123456'
      });
      console.log('✅ Login bem-sucedido:', loginResponse.data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || '';
      console.log('❌ Login falhou:', errorMessage);
    }
    
    console.log('\n🔐 2. Testando login com senha "teste123"...');
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: TEST_EMAIL,
        password: 'teste123'
      });
      console.log('✅ Login bem-sucedido:', loginResponse.data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || '';
      console.log('❌ Login falhou:', errorMessage);
    }
    
    console.log('\n🔐 3. Testando login com senha "password"...');
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: TEST_EMAIL,
        password: 'password'
      });
      console.log('✅ Login bem-sucedido:', loginResponse.data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || '';
      console.log('❌ Login falhou:', errorMessage);
    }
    
    console.log('\n📋 Análise:');
    console.log('Se todas as tentativas falharam com "Credenciais inválidas",');
    console.log('significa que o usuário não existe ou a senha está incorreta.');
    console.log('');
    console.log('🎯 Próximos passos:');
    console.log('1. Verificar se o usuário existe no banco de dados');
    console.log('2. Verificar qual é a senha correta');
    console.log('3. Ou criar um novo usuário para teste');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

// Executar teste
testUserStatus().catch(console.error);
