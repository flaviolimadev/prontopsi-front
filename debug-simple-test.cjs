const axios = require('axios');

// Teste simples e direto
async function testSimple() {
  console.log('🔍 TESTE SIMPLES - Verificando se o problema está no login...\n');
  
  try {
    console.log('🔐 Testando login direto no backend...');
    const response = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'teste@exemplo.com',
      password: '123456'
    });
    
    console.log('❌ ERRO: Login funcionou quando não deveria!', response.data);
    
  } catch (error) {
    const errorData = error.response?.data || {};
    const errorMessage = errorData.message || '';
    
    console.log('✅ Login bloqueado como esperado');
    console.log('📋 Resposta do servidor:', errorData);
    console.log('📝 Mensagem:', errorMessage);
    
    // Verificar se a mensagem contém as palavras-chave esperadas
    if (errorMessage.includes('Usuário inativo') || 
        errorMessage.includes('Email não verificado') ||
        errorMessage.includes('email não verificado')) {
      console.log('✅ Mensagem de erro correta para email não verificado');
    } else {
      console.log('❌ Mensagem de erro inesperada:', errorMessage);
    }
  }
  
  console.log('\n🎯 PRÓXIMOS PASSOS:');
  console.log('1. Abra http://localhost:8080/login');
  console.log('2. Abra DevTools (F12)');
  console.log('3. Digite: teste@exemplo.com / 123456');
  console.log('4. Clique "Entrar"');
  console.log('5. Cole TODOS os logs do console aqui');
  console.log('\n💡 FOQUE ESPECIFICAMENTE EM:');
  console.log('- Se aparece "🔍 Login: Iniciando processo de login..."');
  console.log('- Se aparece "🔍 AuthProvider: Erro no login:"');
  console.log('- Se aparece "🔍 Login: Email não verificado"');
  console.log('- Se aparece algum erro ou problema');
}

testSimple().catch(console.error);

