const axios = require('axios');

console.log('🔧 VERIFICANDO USUÁRIO\n');

async function verifyUser() {
  try {
    console.log('🔐 Verificando usuário...');
    
    // Primeiro, vamos tentar fazer login para ver se o usuário existe
    try {
      const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
        email: 'verificado@teste.com',
        password: '123456'
      });
      
      console.log('✅ Login bem-sucedido!');
      console.log('Usuário já está verificado!');
      console.log('Dados:', {
        email: loginResponse.data.user.email,
        emailVerified: loginResponse.data.user.emailVerified,
        status: loginResponse.data.user.status
      });
      
    } catch (error) {
      if (error.response?.data?.message === 'Email não verificado') {
        console.log('❌ Usuário não verificado');
        console.log('Você precisa verificar o email primeiro');
        console.log('');
        console.log('🔧 INSTRUÇÕES:');
        console.log('1. Verifique o email: verificado@teste.com');
        console.log('2. Use o código de verificação recebido');
        console.log('3. Ou acesse: http://localhost:8080/#/email-verification?email=verificado@teste.com');
        console.log('4. Digite o código de 6 dígitos');
        console.log('5. Clique "Verificar Email"');
        console.log('');
        console.log('💡 SE NÃO RECEBEU O EMAIL:');
        console.log('Execute: node create-verified-user-direct.cjs');
        console.log('Isso criará um novo usuário e enviará o email');
      } else {
        console.log('❌ Erro:', error.response?.data?.message || error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

verifyUser();
