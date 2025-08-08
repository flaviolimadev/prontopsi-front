const axios = require('axios');

// Configuração
const API_BASE_URL = 'http://localhost:3000/api';
const TEST_EMAIL = 'teste@exemplo.com';

// Função para debug específico do bug
async function debugRedirectBug() {
  console.log('🔍 Debug específico do bug de redirecionamento...\n');
  
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
    }
    
    console.log('\n💡 INSTRUÇÕES ESPECÍFICAS PARA DEBUG:');
    console.log('');
    console.log('1️⃣ Abra o navegador em: http://localhost:8080/login');
    console.log('2️⃣ Abra o DevTools (F12) → Aba Console');
    console.log('3️⃣ Digite as credenciais:');
    console.log('   📧 Email: teste@exemplo.com');
    console.log('   🔐 Senha: 123456');
    console.log('4️⃣ Clique em "Entrar"');
    console.log('5️⃣ OBSERVE ATENTAMENTE o console e me diga:');
    console.log('');
    console.log('📋 CHECKLIST DE LOGS:');
    console.log('');
    console.log('✅ Deve aparecer: "🔍 Login: Iniciando processo de login..."');
    console.log('✅ Deve aparecer: "🔍 AuthProvider: Iniciando login para: teste@exemplo.com"');
    console.log('✅ Deve aparecer: "🔍 AuthProvider: Erro no login: Usuário inativo"');
    console.log('✅ Deve aparecer: "🔍 AuthProvider: Email não verificado, retornando erro específico"');
    console.log('✅ Deve aparecer: "🔍 Login: Resultado do login: { success: false, error: EMAIL_NOT_VERIFIED }"');
    console.log('✅ Deve aparecer: "🔍 Login: Email não verificado, redirecionando para verificação"');
    console.log('✅ Deve aparecer: "🔍 Login: Email a ser passado: teste@exemplo.com"');
    console.log('✅ Deve aparecer: "🔍 EmailVerification: Componente carregado"');
    console.log('✅ Deve aparecer: "🔍 EmailVerification: Email recebido: teste@exemplo.com"');
    console.log('');
    console.log('🚨 LOGS PROBLEMÁTICOS (se aparecerem, me diga):');
    console.log('❌ "🔍 Login: Usuário já autenticado, redirecionando..."');
    console.log('❌ "🔍 AuthProvider: Verificando autenticação inicial..." (múltiplas vezes)');
    console.log('❌ "🔍 EmailVerification: Nenhum email fornecido, redirecionando para login"');
    console.log('❌ Qualquer erro em vermelho');
    console.log('❌ Mensagens sobre Navigate ou redirecionamento não esperado');
    console.log('');
    console.log('🎯 COMPORTAMENTO ESPERADO:');
    console.log('✅ URL deve mudar de /login para /email-verification');
    console.log('✅ Página deve mostrar formulário de verificação');
    console.log('✅ Email "teste@exemplo.com" deve aparecer na descrição');
    console.log('✅ Página deve PERMANECER em /email-verification');
    console.log('❌ Página NÃO deve voltar para /login');
    console.log('');
    console.log('📝 COPIE E COLE TODOS OS LOGS DO CONSOLE AQUI:');
    console.log('(Isso vai ajudar a identificar exatamente onde está o problema)');
    
  } catch (error) {
    console.error('❌ Erro no debug:', error.response?.data || error.message);
  }
}

// Executar debug
debugRedirectBug().catch(console.error);

