const axios = require('axios');

console.log('🔍 TESTE DETALHADO - VERIFICANDO USUÁRIO\n');

async function testUserDetails() {
  try {
    console.log('🔐 1. Testando com senha incorreta...');
    
    try {
      await axios.post('http://localhost:3000/api/auth/login', {
        email: 'ctrlserr@gmail.com',
        password: 'senhaerrada'
      });
      console.log('❌ ERRO: Login funcionou com senha errada!');
    } catch (error) {
      const message = error.response?.data?.message || '';
      console.log('✅ Senha errada retornou:', message);
    }
    
    console.log('\n🔐 2. Testando com email inexistente...');
    
    try {
      await axios.post('http://localhost:3000/api/auth/login', {
        email: 'naoexiste@email.com',
        password: '123456'
      });
      console.log('❌ ERRO: Login funcionou com email inexistente!');
    } catch (error) {
      const message = error.response?.data?.message || '';
      console.log('✅ Email inexistente retornou:', message);
    }
    
    console.log('\n🔐 3. Testando com ctrlserr@gmail.com / 123456...');
    
    try {
      await axios.post('http://localhost:3000/api/auth/login', {
        email: 'ctrlserr@gmail.com',
        password: '123456'
      });
      console.log('❌ ERRO: Login funcionou quando não deveria!');
    } catch (error) {
      const message = error.response?.data?.message || '';
      console.log('✅ ctrlserr@gmail.com retornou:', message);
      
      if (message === 'Credenciais inválidas') {
        console.log('\n🎯 PROBLEMA IDENTIFICADO:');
        console.log('O usuário ctrlserr@gmail.com está retornando "Credenciais inválidas"');
        console.log('Isso significa que:');
        console.log('1. Ou a senha está errada');
        console.log('2. Ou o usuário não existe');
        console.log('3. Ou há um problema no validateUser');
        console.log('');
        console.log('🔧 SOLUÇÃO:');
        console.log('Precisamos verificar se o usuário existe e qual é a senha correta');
        console.log('');
        console.log('💡 SUGESTÃO:');
        console.log('1. Verifique no banco de dados se o usuário ctrlserr@gmail.com existe');
        console.log('2. Verifique se a senha está correta');
        console.log('3. Ou crie um novo usuário de teste');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testUserDetails();
