const axios = require('axios');

console.log('🔍 VERIFICANDO DETALHES DO USUÁRIO ctrlserr@gmail.com\n');

async function checkUserDetails() {
  try {
    console.log('🔐 Fazendo login para obter dados completos...');
    
    try {
      const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
        email: 'ctrlserr@gmail.com',
        password: '123456'
      });
      
      console.log('✅ Login bem-sucedido!');
      console.log('Dados completos do usuário:', JSON.stringify(loginResponse.data.user, null, 2));
      
      console.log('\n🎯 ANÁLISE:');
      console.log('- emailVerified:', loginResponse.data.user.emailVerified);
      console.log('- status:', loginResponse.data.user.status);
      console.log('- emailVerified é undefined?', loginResponse.data.user.emailVerified === undefined);
      console.log('- emailVerified é false?', loginResponse.data.user.emailVerified === false);
      console.log('- emailVerified é true?', loginResponse.data.user.emailVerified === true);
      
    } catch (error) {
      console.log('❌ Login falhou:', error.response?.data?.message);
      
      if (error.response?.data?.message === 'Email não verificado') {
        console.log('\n💡 PROBLEMA IDENTIFICADO:');
        console.log('O usuário ctrlserr@gmail.com não está verificado no banco');
        console.log('Você precisa verificar este usuário primeiro');
        console.log('');
        console.log('🔧 SOLUÇÃO:');
        console.log('1. Acesse: http://localhost:8080/#/email-verification?email=ctrlserr@gmail.com');
        console.log('2. Digite o código de verificação recebido no email');
        console.log('3. Após verificar, o dashboard funcionará');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

checkUserDetails();
