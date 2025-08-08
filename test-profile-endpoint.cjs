const axios = require('axios');

console.log('🔍 TESTANDO ENDPOINT /users/me/profile\n');

async function testProfileEndpoint() {
  try {
    console.log('🔐 Fazendo login para obter token...');
    
    try {
      const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
        email: 'verificado@teste.com',
        password: '123456'
      });
      
      console.log('✅ Login bem-sucedido!');
      console.log('Token obtido:', loginResponse.data.token.substring(0, 20) + '...');
      
      console.log('\n🔍 Testando endpoint /users/me/profile...');
      
      const profileResponse = await axios.get('http://localhost:3000/api/users/me/profile', {
        headers: {
          'Authorization': `Bearer ${loginResponse.data.token}`
        }
      });
      
      console.log('✅ Profile obtido com sucesso!');
      console.log('Dados do profile:', {
        email: profileResponse.data.email,
        emailVerified: profileResponse.data.emailVerified,
        status: profileResponse.data.status
      });
      
      console.log('\n🎯 VERIFICAÇÃO:');
      console.log('- emailVerified está presente?', 'emailVerified' in profileResponse.data);
      console.log('- emailVerified valor:', profileResponse.data.emailVerified);
      console.log('- emailVerified tipo:', typeof profileResponse.data.emailVerified);
      
      if (profileResponse.data.emailVerified === true) {
        console.log('✅ emailVerified é true - usuário verificado!');
      } else if (profileResponse.data.emailVerified === false) {
        console.log('❌ emailVerified é false - usuário não verificado');
      } else if (profileResponse.data.emailVerified === undefined) {
        console.log('⚠️ emailVerified é undefined - problema no backend');
      } else {
        console.log('❓ emailVerified valor inesperado:', profileResponse.data.emailVerified);
      }
      
    } catch (error) {
      if (error.response?.data?.message === 'Email não verificado') {
        console.log('❌ Login falhou: Email não verificado');
        console.log('O usuário precisa ser verificado primeiro');
      } else {
        console.log('❌ Erro:', error.response?.data?.message || error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testProfileEndpoint();
