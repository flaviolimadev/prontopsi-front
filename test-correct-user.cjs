const axios = require('axios');

console.log('🔍 TESTE USUÁRIO CORRETO - teste@exemplo.com\n');

async function testCorrectUser() {
  try {
    console.log('🔐 Testando login com teste@exemplo.com...');
    
    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        email: 'teste@exemplo.com',
        password: '123456'
      });
      console.log('❌ ERRO: Login funcionou quando não deveria!');
      console.log('Resposta:', response.data);
    } catch (error) {
      console.log('✅ Backend retornou erro como esperado');
      console.log('Status:', error.response?.status);
      console.log('Mensagem:', error.response?.data?.message);
      console.log('Dados completos:', error.response?.data);
      
      const message = error.response?.data?.message || '';
      
      if (message.includes('Email não verificado')) {
        console.log('\n✅ SUCESSO! Backend funcionando corretamente');
        console.log('O backend está retornando "Email não verificado"');
        console.log('');
        console.log('🎯 AGORA TESTE NO FRONTEND:');
        console.log('1. Abra: http://localhost:8080/login');
        console.log('2. Digite: teste@exemplo.com / 123456');
        console.log('3. Abra DevTools (F12) → Console');
        console.log('4. Clique "Entrar"');
        console.log('5. Deve redirecionar para /email-verification');
        console.log('6. A página deve permanecer estável');
        console.log('');
        console.log('🔍 LOGS ESPERADOS:');
        console.log('🔧 Login: Iniciando login para: teste@exemplo.com');
        console.log('🔧 AuthProvider: Iniciando login para: teste@exemplo.com');
        console.log('🔧 AuthProvider: Erro no login: Email não verificado');
        console.log('🔧 AuthProvider: Email não verificado');
        console.log('🔧 AuthProvider: Estado atual: NEEDS_VERIFICATION');
        console.log('🔧 Login: Email precisa de verificação, redirecionando...');
      } else {
        console.log('\n❌ PROBLEMA: Backend retornou mensagem incorreta');
        console.log('Esperado: "Email não verificado"');
        console.log('Recebido:', message);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testCorrectUser();
