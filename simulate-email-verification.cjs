const axios = require('axios');

console.log('🔧 SIMULANDO VERIFICAÇÃO DE EMAIL\n');

async function simulateEmailVerification() {
  try {
    console.log('🔐 Simulando verificação de email...');
    
    // Primeiro, vamos tentar fazer login para obter o código de verificação
    try {
      const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
        email: 'verificado@teste.com',
        password: '123456'
      });
      
      console.log('✅ Login bem-sucedido!');
      console.log('Usuário já está verificado!');
      
    } catch (error) {
      if (error.response?.data?.message === 'Email não verificado') {
        console.log('❌ Usuário não verificado');
        console.log('Vamos simular a verificação...');
        
        // Vamos tentar verificar com um código comum
        const commonCodes = ['123456', '000000', '111111', '999999'];
        
        for (const code of commonCodes) {
          try {
            console.log(`\n🔍 Tentando código: ${code}`);
            
            const verifyResponse = await axios.post('http://localhost:3000/api/auth/verify-email', {
              email: 'verificado@teste.com',
              verificationCode: code
            });
            
            console.log('✅ Verificação bem-sucedida!');
            console.log('Resposta:', verifyResponse.data);
            
            // Agora vamos testar o login novamente
            console.log('\n🔍 Testando login após verificação...');
            
            const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
              email: 'verificado@teste.com',
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
            console.log('2. Digite: verificado@teste.com / 123456');
            console.log('3. Deve ir direto para o dashboard');
            console.log('4. Teste recarregar a página');
            
            return;
            
          } catch (verifyError) {
            console.log(`❌ Código ${code} não funcionou:`, verifyError.response?.data?.message);
          }
        }
        
        console.log('\n❌ Nenhum código comum funcionou');
        console.log('Você precisa verificar o email manualmente');
        console.log('1. Verifique o email: verificado@teste.com');
        console.log('2. Use o código de verificação recebido');
        console.log('3. Ou acesse: http://localhost:8080/#/email-verification?email=verificado@teste.com');
        
      } else {
        console.log('❌ Erro:', error.response?.data?.message || error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

simulateEmailVerification();
