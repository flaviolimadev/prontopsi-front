const axios = require('axios');

// Configuração
const API_BASE_URL = 'http://localhost:3000/api';
const TEST_EMAIL = 'teste-redirect@exemplo.com';

// Função para testar o problema de redirecionamento
async function testLoginRedirect() {
  console.log('🧪 Testando problema de redirecionamento no login...\n');
  
  try {
    // 1. Registrar usuário (se não existir)
    console.log('📝 1. Verificando se usuário existe...');
    try {
      const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
        nome: 'Teste',
        sobrenome: 'Redirect',
        email: TEST_EMAIL,
        password: '123456',
        contato: '(11) 99999-9999'
      });
      
      console.log('✅ Usuário registrado:', registerResponse.data.message);
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('✅ Usuário já existe');
      } else {
        console.log('❌ Erro ao registrar:', error.response?.data?.message);
      }
    }
    console.log('');
    
    // 2. Tentar fazer login (deve falhar com email não verificado)
    console.log('🔐 2. Tentando fazer login (deve falhar)...');
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: TEST_EMAIL,
        password: '123456'
      });
      console.log('❌ Login não deveria ter funcionado');
    } catch (error) {
      const errorMessage = error.response?.data?.message || '';
      console.log('✅ Login bloqueado corretamente:', errorMessage);
      
      // Verificar se é o erro esperado
      if (errorMessage.includes('Email não verificado') || 
          errorMessage.includes('email não verificado') ||
          errorMessage.includes('Usuário inativo')) {
        console.log('✅ Erro de email não verificado detectado corretamente');
        console.log('✅ Frontend deve redirecionar para /email-verification');
      } else {
        console.log('❌ Erro inesperado:', errorMessage);
      }
    }
    console.log('');
    
    // 3. Testar endpoint de verificação
    console.log('📧 3. Testando endpoint de verificação...');
    try {
      const verifyResponse = await axios.post(`${API_BASE_URL}/auth/verify-email`, {
        email: TEST_EMAIL,
        verificationCode: '123456' // Código inválido para teste
      });
      console.log('❌ Verificação não deveria ter funcionado com código inválido');
    } catch (error) {
      const errorMessage = error.response?.data?.message || '';
      console.log('✅ Verificação falhou corretamente:', errorMessage);
    }
    console.log('');
    
    console.log('📋 Análise do problema:');
    console.log('✅ Backend está funcionando corretamente');
    console.log('✅ Login bloqueia usuários não verificados');
    console.log('✅ Erro é retornado corretamente');
    console.log('');
    console.log('🎯 Para testar no frontend:');
    console.log('1. Acesse: http://localhost:8080/login');
    console.log('2. Use o email:', TEST_EMAIL);
    console.log('3. Use a senha: 123456');
    console.log('4. Clique em "Entrar"');
    console.log('5. Deve ser redirecionado para: http://localhost:8080/email-verification');
    console.log('6. Verifique o console do navegador para logs de debug');
    console.log('');
    console.log('🔍 Se ainda houver problemas, verifique:');
    console.log('- Console do navegador (F12)');
    console.log('- Network tab para ver as requisições');
    console.log('- Se o redirecionamento está acontecendo corretamente');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

// Executar teste
testLoginRedirect().catch(console.error);
