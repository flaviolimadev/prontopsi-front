const axios = require('axios');

// Configuração
const API_BASE_URL = 'http://localhost:3000/api';
const TEST_EMAIL = 'teste@exemplo.com';

// Função para debug detalhado
async function debugRedirectIssue() {
  console.log('🔍 Debug detalhado do problema de redirecionamento...\n');
  
  try {
    console.log('🔐 1. Testando login com usuário de teste...');
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: TEST_EMAIL,
        password: '123456'
      });
      console.log('❌ Login não deveria ter funcionado');
    } catch (error) {
      const errorMessage = error.response?.data?.message || '';
      const statusCode = error.response?.status;
      
      console.log('✅ Login bloqueado:', errorMessage);
      console.log('📊 Status code:', statusCode);
      console.log('📋 Resposta completa:', error.response?.data);
      
      if (errorMessage.includes('Email não verificado')) {
        console.log('✅ Erro correto detectado - email não verificado');
      } else if (errorMessage.includes('Usuário inativo')) {
        console.log('✅ Erro correto detectado - usuário inativo');
      } else if (errorMessage.includes('Credenciais inválidas')) {
        console.log('❌ Erro incorreto - credenciais inválidas');
      }
    }
    
    console.log('\n🔍 2. Verificando se o frontend está detectando o erro corretamente...');
    console.log('📋 Logs esperados no console do navegador:');
    console.log('- "🔍 AuthProvider: useEffect executado, pathname: /login"');
    console.log('- "🔍 AuthProvider: Página atual: /login"');
    console.log('- "🔍 AuthProvider: É página pública? true"');
    console.log('- "🔍 AuthProvider: Página pública detectada, pulando verificação"');
    console.log('- "🔍 AuthProvider: Erro no login: { message: \"Usuário inativo\" }"');
    console.log('- "🔍 AuthProvider: Detectado erro de email não verificado"');
    console.log('- Redirecionamento para /email-verification');
    console.log('');
    console.log('- "🔍 VerificationRoute: Email fornecido: teste@exemplo.com"');
    console.log('- "🔍 EmailVerification: Componente carregado"');
    console.log('- "🔍 EmailVerification: Email recebido: teste@exemplo.com"');
    console.log('- Página de verificação deve permanecer carregada');
    
    console.log('\n🎯 3. Possíveis causas do problema:');
    console.log('❌ AuthProvider não está detectando o erro corretamente');
    console.log('❌ VerificationRoute não está funcionando');
    console.log('❌ EmailVerification não está recebendo o email');
    console.log('❌ useEffect está sendo executado múltiplas vezes');
    console.log('❌ Redirecionamento está sendo sobrescrito');
    
    console.log('\n🔧 4. Soluções para testar:');
    console.log('1. Verificar se o AuthProvider está detectando "Usuário inativo"');
    console.log('2. Verificar se o VerificationRoute está sendo executado');
    console.log('3. Verificar se o email está sendo passado corretamente');
    console.log('4. Verificar se há redirecionamentos conflitantes');
    
  } catch (error) {
    console.error('❌ Erro no debug:', error.response?.data || error.message);
  }
}

// Executar debug
debugRedirectIssue().catch(console.error);
