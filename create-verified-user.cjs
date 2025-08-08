const axios = require('axios');

console.log('🔧 CRIANDO USUÁRIO VERIFICADO\n');

async function createVerifiedUser() {
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
      console.log('3. Ou use o usuário teste@exemplo.com se já foi verificado');
      
    } catch (error) {
      if (error.response?.data?.message?.includes('já cadastrado')) {
        console.log('✅ Usuário já existe!');
        console.log('Agora teste o login:');
        console.log('Email: verificado@teste.com');
        console.log('Senha: 123456');
        console.log('');
        console.log('💡 SE NÃO FUNCIONAR:');
        console.log('O usuário pode não estar verificado ainda');
        console.log('Verifique o email e complete a verificação');
      } else {
        console.log('❌ Erro ao criar usuário:', error.response?.data?.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

createVerifiedUser();
