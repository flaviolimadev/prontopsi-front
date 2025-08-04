const axios = require('axios');

async function testAPI() {
  const baseURL = 'http://localhost:3001/api';
  
  console.log('🔍 Testando conexão com a API do backend...');
  console.log(`📍 URL: ${baseURL}`);
  
  try {
    // Teste 1: Verificar se o servidor está rodando
    console.log('\n1️⃣ Testando se o servidor está rodando...');
    const healthResponse = await axios.get(`${baseURL}/auth`);
    console.log('✅ Servidor está rodando!');
    
    // Teste 2: Tentar registrar um usuário
    console.log('\n2️⃣ Testando registro de usuário...');
    const testUser = {
      nome: 'Teste',
      sobrenome: 'Usuário',
      email: 'teste@email.com',
      password: '123456',
      contato: '(11) 99999-9999'
    };
    
    const registerResponse = await axios.post(`${baseURL}/auth/register`, testUser);
    console.log('✅ Usuário registrado com sucesso!');
    console.log('📧 Email:', registerResponse.data.user.email);
    console.log('🆔 ID:', registerResponse.data.user.id);
    
    // Teste 3: Tentar fazer login
    console.log('\n3️⃣ Testando login...');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'teste@email.com',
      password: '123456'
    });
    console.log('✅ Login realizado com sucesso!');
    console.log('🔑 Token recebido:', loginResponse.data.token ? 'Sim' : 'Não');
    
    // Teste 4: Verificar usuário atual
    console.log('\n4️⃣ Testando verificação de usuário atual...');
    const token = loginResponse.data.token;
    const userResponse = await axios.get(`${baseURL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Usuário atual verificado!');
    console.log('👤 Nome:', userResponse.data.nome);
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔧 O backend não está rodando!');
      console.log('💡 Execute: cd backEnd/backprontupsi && npm start');
    } else if (error.response) {
      console.log('\n📊 Detalhes do erro:');
      console.log('Status:', error.response.status);
      console.log('Mensagem:', error.response.data?.message || error.response.data);
    }
  }
}

testAPI(); 