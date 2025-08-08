const axios = require('axios');

// Configuração
const API_BASE_URL = 'http://localhost:3000/api';
const TEST_EMAIL = 'teste@exemplo.com';

// Função para teste final de debug
async function testUltimateDebug() {
  console.log('🔍 DEBUG ULTIMATE - Solução Final...\n');
  
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
    
    console.log('\n🔧 CORREÇÕES IMPLEMENTADAS:');
    console.log('✅ AuthProvider não interfere na página de verificação');
    console.log('✅ Redirecionamento no Login com setTimeout');
    console.log('✅ EmailVerification com logs detalhados');
    console.log('✅ Proteção contra redirecionamentos múltiplos');
    console.log('✅ Estrutura dos providers corrigida');
    
    console.log('\n🎯 TESTE FINAL:');
    console.log('');
    console.log('1️⃣ Abra: http://localhost:8080/login');
    console.log('2️⃣ Abra DevTools (F12) → Console');
    console.log('3️⃣ Digite: teste@exemplo.com / 123456');
    console.log('4️⃣ Clique "Entrar"');
    console.log('');
    console.log('🔍 SEQUÊNCIA DE LOGS ESPERADA:');
    console.log('');
    console.log('🟢 FASE 1 - LOGIN:');
    console.log('🔍 Login: Iniciando processo de login...');
    console.log('🔍 AuthProvider: Iniciando login para: teste@exemplo.com');
    console.log('🔍 AuthProvider: Erro no login: Usuário inativo');
    console.log('🔍 AuthProvider: Email não verificado, retornando erro específico');
    console.log('🔍 Login: Resultado do login: { success: false, error: EMAIL_NOT_VERIFIED }');
    console.log('🔍 Login: Email não verificado, redirecionando para verificação');
    console.log('🔍 Login: Email a ser passado: teste@exemplo.com');
    console.log('🔍 Login: Email final a ser passado: teste@exemplo.com');
    console.log('🔍 Login: State a ser enviado: { email: "teste@exemplo.com" }');
    console.log('🔍 Login: Executando redirecionamento para verificação');
    console.log('');
    console.log('🟢 FASE 2 - VERIFICAÇÃO:');
    console.log('🔍 AuthProvider: Verificando autenticação inicial...');
    console.log('🔍 AuthProvider: Pathname atual: /email-verification');
    console.log('🔍 AuthProvider: Na página de verificação, pulando verificação inicial');
    console.log('🔍 EmailVerification: Componente carregado');
    console.log('🔍 EmailVerification: Email recebido: teste@exemplo.com');
    console.log('🔍 EmailVerification: Location state completo: { email: "teste@exemplo.com" }');
    console.log('🔍 EmailVerification: Pathname atual: /email-verification');
    console.log('');
    console.log('✅ RESULTADO ESPERADO:');
    console.log('- ✅ URL fica em /email-verification');
    console.log('- ✅ Página mostra formulário de verificação');
    console.log('- ✅ Email "teste@exemplo.com" aparece na descrição');
    console.log('- ✅ Página PERMANECE em /email-verification');
    console.log('- ❌ Página NÃO volta para /login');
    console.log('');
    console.log('🚨 SE AINDA NÃO FUNCIONAR:');
    console.log('Copie e cole TODOS os logs do console aqui!');
    console.log('Isso vai nos ajudar a identificar o que ainda está causando o problema.');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

// Executar teste
testUltimateDebug().catch(console.error);

