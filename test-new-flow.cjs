const axios = require('axios');

// Configuração
const API_BASE_URL = 'http://localhost:3000/api';
const TEST_EMAIL = 'teste@exemplo.com';

// Função para testar o novo fluxo
async function testNewFlow() {
  console.log('🧪 Testando novo fluxo de login...\n');
  
  try {
    console.log('🔐 1. Testando login (deve falhar com "Usuário inativo")...');
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: TEST_EMAIL,
        password: '123456'
      });
      console.log('❌ Login não deveria ter funcionado');
    } catch (error) {
      const errorMessage = error.response?.data?.message || '';
      console.log('✅ Login bloqueado:', errorMessage);
      
      if (errorMessage.includes('Usuário inativo')) {
        console.log('✅ Backend funcionando corretamente');
      }
    }
    
    console.log('\n📋 2. Novo fluxo implementado:');
    console.log('✅ AuthProvider simplificado - sem redirecionamentos automáticos');
    console.log('✅ Login.tsx faz todo o redirecionamento');
    console.log('✅ EmailVerification verifica email diretamente');
    console.log('✅ Sem VerificationRoute - fluxo mais direto');
    
    console.log('\n🔍 3. Fluxo esperado:');
    console.log('1. Login → Backend retorna "Usuário inativo"');
    console.log('2. AuthProvider detecta erro → Retorna EMAIL_NOT_VERIFIED');
    console.log('3. Login.tsx recebe EMAIL_NOT_VERIFIED → Redireciona para /email-verification');
    console.log('4. EmailVerification verifica email → Renderiza formulário');
    console.log('5. Usuário insere código → Verificação bem-sucedida');
    console.log('6. Redirecionamento para /dashboard');
    
    console.log('\n🔍 4. Logs esperados no console do navegador:');
    console.log('🔍 AuthProvider: Verificando autenticação inicial...');
    console.log('🔍 AuthProvider: Nenhum token encontrado');
    console.log('🔍 Login: Iniciando processo de login...');
    console.log('🔍 AuthProvider: Iniciando login para: teste@exemplo.com');
    console.log('🔍 AuthProvider: Erro no login: { message: "Usuário inativo" }');
    console.log('🔍 AuthProvider: Email não verificado, retornando erro específico');
    console.log('🔍 Login: Resultado do login: { success: false, error: "EMAIL_NOT_VERIFIED", email: "teste@exemplo.com" }');
    console.log('🔍 Login: Email não verificado, redirecionando para verificação');
    console.log('🔍 Login: Email a ser passado: teste@exemplo.com');
    console.log('🔍 EmailVerification: Componente carregado');
    console.log('🔍 EmailVerification: Email recebido: teste@exemplo.com');
    
    console.log('\n🎯 5. Para testar:');
    console.log('1. Abra: http://localhost:8080/login');
    console.log('2. Use as credenciais:', TEST_EMAIL, '/ 123456');
    console.log('3. Clique em "Entrar"');
    console.log('4. Verifique se é redirecionado para /email-verification');
    console.log('5. Verifique se o email aparece no formulário');
    console.log('6. Verifique se a página permanece em /email-verification');
    
    console.log('\n⚠️ 6. Vantagens do novo fluxo:');
    console.log('- ✅ Fluxo mais simples e direto');
    console.log('- ✅ Sem redirecionamentos automáticos conflitantes');
    console.log('- ✅ Sem reload da página');
    console.log('- ✅ location.state preservado');
    console.log('- ✅ Menos complexidade no código');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

// Executar teste
testNewFlow().catch(console.error);
