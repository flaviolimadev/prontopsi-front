const axios = require('axios');

console.log('🔍 VERIFICANDO STATUS DO USUÁRIO\n');

async function checkUserStatus() {
  try {
    console.log('🔐 Verificando status do teste@exemplo.com...');
    
    // Primeiro, fazer login para obter token
    try {
      const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
        email: 'teste@exemplo.com',
        password: '123456'
      });
      
      console.log('✅ Login bem-sucedido!');
      console.log('Token:', loginResponse.data.token);
      console.log('Usuário:', {
        email: loginResponse.data.user.email,
        emailVerified: loginResponse.data.user.emailVerified,
        status: loginResponse.data.user.status
      });
      
      console.log('\n🎯 STATUS ATUAL:');
      console.log('- Email verificado:', loginResponse.data.user.emailVerified);
      console.log('- Status:', loginResponse.data.user.status);
      console.log('- Pode acessar dashboard:', loginResponse.data.user.emailVerified && loginResponse.data.user.status === 1);
      
    } catch (error) {
      console.log('❌ Login falhou:', error.response?.data?.message);
      
      if (error.response?.data?.message === 'Email não verificado') {
        console.log('\n💡 SOLUÇÃO:');
        console.log('O usuário precisa verificar o email primeiro');
        console.log('1. Acesse: http://localhost:8080/email-verification?email=teste@exemplo.com');
        console.log('2. Digite o código de verificação recebido no email');
        console.log('3. Após verificar, o dashboard funcionará corretamente');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

checkUserStatus();
