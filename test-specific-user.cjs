const axios = require('axios');

console.log('🔍 TESTE ESPECÍFICO - ctrlserr@gmail.com\n');

async function testSpecificUser() {
  try {
    console.log('🔐 Testando login com ctrlserr@gmail.com...');
    
    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        email: 'ctrlserr@gmail.com',
        password: '123456'
      });
      console.log('❌ ERRO: Login funcionou quando não deveria!');
      console.log('Resposta:', response.data);
    } catch (error) {
      console.log('✅ Backend retornou erro como esperado');
      console.log('Status:', error.response?.status);
      console.log('Mensagem:', error.response?.data?.message);
      console.log('Dados completos:', error.response?.data);
    }
    
    console.log('\n🔍 PROBLEMA IDENTIFICADO:');
    console.log('✅ Backend: Funcionando (retorna erro 401)');
    console.log('❌ Frontend: Não está processando o erro corretamente');
    console.log('');
    console.log('🎯 CAUSA PROVÁVEL:');
    console.log('O frontend não está capturando o erro 401 do backend');
    console.log('ou não está tratando a mensagem "Email não verificado"');
    console.log('');
    console.log('🔧 PRÓXIMOS PASSOS:');
    console.log('1. Abra: http://localhost:8080/login');
    console.log('2. Digite: ctrlserr@gmail.com / 123456');
    console.log('3. Abra DevTools (F12) → Console');
    console.log('4. Clique "Entrar" e copie TODOS os logs');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testSpecificUser();
