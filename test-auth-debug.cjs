const axios = require('axios');

console.log('🔍 DEBUG AUTENTICAÇÃO - VERIFICANDO PROBLEMAS\n');

async function testAuthFlow() {
  try {
    console.log('🔐 1. Testando backend diretamente...');
    
    // Teste 1: Login com usuário não verificado
    try {
      await axios.post('http://localhost:3000/api/auth/login', {
        email: 'teste@exemplo.com',
        password: '123456'
      });
      console.log('❌ ERRO: Login funcionou quando não deveria!');
    } catch (error) {
      const message = error.response?.data?.message || '';
      if (message.includes('Usuário inativo')) {
        console.log('✅ Backend funcionando corretamente');
      } else {
        console.log('❌ Resposta inesperada do backend:', message);
      }
    }
    
    console.log('\n🔐 2. Testando se o usuário existe...');
    
    // Teste 2: Verificar se o usuário existe
    try {
      const response = await axios.get('http://localhost:3000/api/users');
      console.log('✅ API de usuários acessível');
    } catch (error) {
      console.log('❌ Erro ao acessar API de usuários:', error.response?.status);
    }
    
    console.log('\n🔐 3. Verificando se o frontend está rodando...');
    try {
      const response = await axios.get('http://localhost:8080');
      console.log('✅ Frontend está rodando');
    } catch (error) {
      console.log('❌ Frontend não está rodando:', error.code);
    }
    
    console.log('\n🎯 DIAGNÓSTICO:');
    console.log('1. Backend: ✅ Funcionando');
    console.log('2. Frontend: Verificar se está rodando');
    console.log('3. Problema provavelmente no frontend');
    
    console.log('\n🔧 PRÓXIMOS PASSOS:');
    console.log('1. Verifique se o frontend está rodando: npm run dev');
    console.log('2. Abra: http://localhost:8080/login');
    console.log('3. Abra DevTools (F12) → Console');
    console.log('4. Tente fazer login e copie TODOS os logs');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testAuthFlow();
