const axios = require('axios');

console.log('🔧 CRIANDO E VERIFICANDO USUÁRIO\n');

async function createAndVerify() {
  try {
    console.log('🔐 Criando usuário novo...');
    
    const userData = {
      nome: 'Teste',
      sobrenome: 'Final',
      email: 'testefinal@teste.com',
      password: '123456',
      contato: '11999999999'
    };
    
    try {
      const response = await axios.post('http://localhost:3000/api/auth/register', userData);
      console.log('✅ Usuário criado com sucesso!');
      console.log('Código de verificação:', response.data.user.code);
      console.log('Email:', response.data.user.email);
      
      console.log('\n🔧 VERIFICANDO EMAIL...');
      
      // Agora vamos verificar com o código correto
      try {
        const verifyResponse = await axios.post('http://localhost:3000/api/auth/verify-email', {
          email: 'testefinal@teste.com',
          verificationCode: response.data.user.code
        });
        
        console.log('✅ Verificação bem-sucedida!');
        console.log('Resposta:', verifyResponse.data);
        
        // Testar login após verificação
        console.log('\n🔍 Testando login após verificação...');
        
        const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
          email: 'testefinal@teste.com',
          password: '123456'
        });
        
        console.log('✅ Login bem-sucedido após verificação!');
        console.log('Dados do usuário:', {
          email: loginResponse.data.user.email,
          emailVerified: loginResponse.data.user.emailVerified,
          status: loginResponse.data.user.status
        });
        
        console.log('\n🎉 USUÁRIO VERIFICADO COM SUCESSO!');
        console.log('Agora você pode testar o dashboard:');
        console.log('1. Acesse: http://localhost:8080/#/login');
        console.log('2. Digite: testefinal@teste.com / 123456');
        console.log('3. Deve ir direto para o dashboard');
        console.log('4. Teste recarregar a página');
        
      } catch (verifyError) {
        console.log('❌ Erro na verificação:', verifyError.response?.data?.message);
      }
      
    } catch (error) {
      if (error.response?.data?.message?.includes('já cadastrado')) {
        console.log('✅ Usuário já existe!');
        console.log('Tente com outro email ou verifique manualmente');
      } else {
        console.log('❌ Erro ao criar usuário:', error.response?.data?.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

createAndVerify();
