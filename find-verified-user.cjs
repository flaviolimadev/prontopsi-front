const axios = require('axios');

console.log('🔍 PROCURANDO USUÁRIOS VERIFICADOS\n');

async function findVerifiedUsers() {
  try {
    console.log('🔐 Testando usuários comuns...');
    
    const testUsers = [
      { email: 'teste@exemplo.com', password: '123456' },
      { email: 'verificado@teste.com', password: '123456' },
      { email: 'admin@teste.com', password: '123456' },
      { email: 'user@teste.com', password: '123456' }
    ];
    
    for (const user of testUsers) {
      try {
        console.log(`\n🔍 Testando: ${user.email}`);
        const response = await axios.post('http://localhost:3000/api/auth/login', user);
        
        console.log('✅ LOGIN BEM-SUCEDIDO!');
        console.log('Usuário:', {
          email: response.data.user.email,
          emailVerified: response.data.user.emailVerified,
          status: response.data.user.status
        });
        
        if (response.data.user.emailVerified && response.data.user.status === 1) {
          console.log('🎉 USUÁRIO VERIFICADO ENCONTRADO!');
          console.log('Use este usuário para testar o dashboard:');
          console.log(`Email: ${user.email}`);
          console.log(`Senha: ${user.password}`);
          return;
        }
        
      } catch (error) {
        const message = error.response?.data?.message || '';
        console.log(`❌ ${message}`);
      }
    }
    
    console.log('\n💡 NENHUM USUÁRIO VERIFICADO ENCONTRADO');
    console.log('Você precisa verificar um usuário primeiro:');
    console.log('1. Acesse: http://localhost:8080/#/email-verification?email=teste@exemplo.com');
    console.log('2. Digite o código de verificação recebido no email');
    console.log('3. Após verificar, o dashboard funcionará');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

findVerifiedUsers();
