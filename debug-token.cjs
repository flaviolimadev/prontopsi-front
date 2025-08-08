const axios = require('axios');

console.log('🔍 DEBUGANDO TOKEN E DADOS DO USUÁRIO\n');

async function debugToken() {
  try {
    console.log('🔐 Testando login para obter token...');
    
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'funcional@teste.com',
      password: '123456'
    });
    
    console.log('✅ Login bem-sucedido!');
    console.log('Token:', loginResponse.data.token);
    console.log('Dados do usuário:', {
      email: loginResponse.data.user.email,
      emailVerified: loginResponse.data.user.emailVerified,
      status: loginResponse.data.user.status
    });
    
    console.log('\n🔍 Testando endpoint /users/me/profile com token...');
    
    try {
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
      
      console.log('\n🎯 COMPARAÇÃO:');
      console.log('Login response - emailVerified:', loginResponse.data.user.emailVerified);
      console.log('Profile response - emailVerified:', profileResponse.data.emailVerified);
      
    } catch (error) {
      console.log('❌ Erro ao obter profile:', error.response?.data?.message);
    }
    
  } catch (error) {
    console.log('❌ Login falhou:', error.response?.data?.message);
  }
}

debugToken();
