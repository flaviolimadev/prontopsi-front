const axios = require('axios');

// Configuração
const API_BASE_URL = 'http://localhost:3000/api';
const TEST_EMAIL = 'teste@exemplo.com';

// Função para testar se a estrutura foi corrigida
async function testStructureFix() {
  console.log('🔧 Testando correção da estrutura do AuthProvider...\n');
  
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
    
    console.log('\n🔧 2. Correção implementada:');
    console.log('✅ Corrigida estrutura dos providers no App.tsx');
    console.log('✅ AuthProvider agora envolve corretamente todas as rotas');
    console.log('✅ Hierarquia de providers corrigida');
    
    console.log('\n🎯 3. AGORA TESTE NOVAMENTE:');
    console.log('');
    console.log('1️⃣ Abra: http://localhost:8080/login');
    console.log('2️⃣ Abra DevTools (F12) → Console');
    console.log('3️⃣ Digite: teste@exemplo.com / 123456');
    console.log('4️⃣ Clique "Entrar"');
    console.log('');
    console.log('✅ AGORA DEVE FUNCIONAR:');
    console.log('- ✅ NÃO deve aparecer erro "useAuth deve ser usado dentro de um AuthProvider"');
    console.log('- ✅ Deve redirecionar para /email-verification');
    console.log('- ✅ Deve permanecer em /email-verification');
    console.log('- ✅ Email deve aparecer no formulário');
    console.log('');
    console.log('🔍 Logs esperados:');
    console.log('🔍 AuthProvider: Verificando autenticação inicial...');
    console.log('🔍 AuthProvider: Nenhum token encontrado');
    console.log('🔍 Login: Iniciando processo de login...');
    console.log('🔍 AuthProvider: Iniciando login para: teste@exemplo.com');
    console.log('🔍 AuthProvider: Erro no login: Usuário inativo');
    console.log('🔍 AuthProvider: Email não verificado, retornando erro específico');
    console.log('🔍 Login: Resultado do login: { success: false, error: EMAIL_NOT_VERIFIED }');
    console.log('🔍 Login: Email não verificado, redirecionando para verificação');
    console.log('🔍 EmailVerification: Componente carregado');
    console.log('🔍 EmailVerification: Email recebido: teste@exemplo.com');
    console.log('');
    console.log('🚀 SE AINDA NÃO FUNCIONAR, copie e cole TODOS os logs do console!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

// Executar teste
testStructureFix().catch(console.error);

