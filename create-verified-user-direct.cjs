const axios = require('axios');

console.log('🔧 CRIANDO USUÁRIO VERIFICADO DIRETAMENTE\n');

async function createVerifiedUserDirect() {
  try {
    console.log('🔐 Criando usuário verificado...');
    
    const userData = {
      nome: 'Usuário',
      sobrenome: 'Verificado',
      email: 'verificado@teste.com',
      password: '123456',
      contato: '11999999999'
    };
    
    try {
      const response = await axios.post('http://localhost:3000/api/auth/register', userData);
      console.log('✅ Usuário criado com sucesso!');
      console.log('Resposta:', response.data);
      
      console.log('\n🔧 PRÓXIMOS PASSOS:');
      console.log('1. Verifique o email: verificado@teste.com');
      console.log('2. Use o código de verificação recebido');
      console.log('3. Ou teste o login sem verificar (deve redirecionar para verificação)');
      
    } catch (error) {
      if (error.response?.data?.message?.includes('já cadastrado')) {
        console.log('✅ Usuário já existe!');
        console.log('Agora teste o login:');
        console.log('Email: verificado@teste.com');
        console.log('Senha: 123456');
        console.log('');
        console.log('💡 TESTE:');
        console.log('1. Acesse: http://localhost:8080/#/login');
        console.log('2. Digite: verificado@teste.com / 123456');
        console.log('3. Deve redirecionar para verificação');
        console.log('4. Complete a verificação');
        console.log('5. Teste o dashboard');
      } else {
        console.log('❌ Erro ao criar usuário:', error.response?.data?.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

createVerifiedUserDirect();
