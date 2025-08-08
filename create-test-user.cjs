const axios = require('axios');

console.log('🔍 CRIANDO USUÁRIO DE TESTE\n');

async function createTestUser() {
  try {
    console.log('🔐 Criando usuário de teste...');
    
    const userData = {
      nome: 'Teste',
      sobrenome: 'Usuário',
      email: 'teste@exemplo.com',
      password: '123456',
      contato: '11999999999'
    };
    
    try {
      const response = await axios.post('http://localhost:3000/api/auth/register', userData);
      console.log('✅ Usuário criado com sucesso!');
      console.log('Resposta:', response.data);
      
      console.log('\n🔧 PRÓXIMOS PASSOS:');
      console.log('1. Verifique o email: teste@exemplo.com');
      console.log('2. Use o código de verificação recebido');
      console.log('3. Ou teste o login sem verificar (deve redirecionar para verificação)');
      
    } catch (error) {
      if (error.response?.data?.message?.includes('já cadastrado')) {
        console.log('✅ Usuário já existe!');
        console.log('Agora teste o login:');
        console.log('Email: teste@exemplo.com');
        console.log('Senha: 123456');
      } else {
        console.log('❌ Erro ao criar usuário:', error.response?.data?.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

createTestUser();
