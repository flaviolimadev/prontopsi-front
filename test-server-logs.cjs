const axios = require('axios');

// Configuração
const API_BASE_URL = 'http://localhost:3000/api';
const TEST_EMAIL = 'teste-logs@exemplo.com';

// Função para testar e verificar logs do servidor
async function testServerLogs() {
  console.log('🧪 Testando logs do servidor...\n');
  
  try {
    // 1. Registrar usuário
    console.log('📝 1. Registrando usuário...');
    console.log('🔍 Verifique os logs do servidor para ver o processo de registro');
    try {
      const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
        nome: 'Teste',
        sobrenome: 'Logs',
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
        return;
      }
    }
    console.log('');
    
    // 2. Testar login (deve falhar)
    console.log('🔐 2. Testando login (deve falhar)...');
    console.log('🔍 Verifique os logs do servidor para ver o processo de login');
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
    console.log('');
    
    // 3. Testar login com senha errada
    console.log('🔐 3. Testando login com senha errada...');
    console.log('🔍 Verifique os logs do servidor para ver validação de senha');
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: TEST_EMAIL,
        password: 'senhaerrada'
      });
      console.log('❌ Login não deveria ter funcionado');
    } catch (error) {
      const errorMessage = error.response?.data?.message || '';
      console.log('✅ Login bloqueado:', errorMessage);
    }
    console.log('');
    
    // 4. Testar verificação com código inválido
    console.log('📧 4. Testando verificação com código inválido...');
    console.log('🔍 Verifique os logs do servidor para ver processo de verificação');
    try {
      const verifyResponse = await axios.post(`${API_BASE_URL}/auth/verify-email`, {
        email: TEST_EMAIL,
        verificationCode: '000000'
      });
      console.log('❌ Verificação não deveria ter funcionado');
    } catch (error) {
      const errorMessage = error.response?.data?.message || '';
      console.log('✅ Verificação falhou:', errorMessage);
    }
    console.log('');
    
    console.log('📋 Logs esperados no servidor:');
    console.log('🔍 AuthService: Iniciando registro para email: [email]');
    console.log('✅ AuthService: Email disponível para registro: [email]');
    console.log('✅ AuthService: Usuário salvo no banco: {...}');
    console.log('✅ AuthService: Email de verificação enviado para: [email]');
    console.log('✅ AuthService: Registro concluído com sucesso para: [email]');
    console.log('');
    console.log('🔍 AuthService: Iniciando login para email: [email]');
    console.log('🔍 AuthService: Validando usuário para email: [email]');
    console.log('🔍 AuthService: Usuário encontrado no banco: {...}');
    console.log('🔍 AuthService: Senha válida: true');
    console.log('✅ AuthService: Validação bem-sucedida para: [email]');
    console.log('🔍 AuthService: Usuário encontrado: {...}');
    console.log('❌ AuthService: Usuário inativo (status: 0) para email: [email]');
    console.log('');
    console.log('🔍 AuthService: Iniciando verificação de email: [email]');
    console.log('🔍 AuthService: Código recebido: 000000');
    console.log('🔍 AuthService: Usuário encontrado: {...}');
    console.log('❌ AuthService: Código inválido para: [email]');
    console.log('');
    console.log('🎯 Para verificar os logs:');
    console.log('1. Abra o terminal onde o servidor está rodando');
    console.log('2. Execute este teste');
    console.log('3. Compare os logs com os esperados acima');
    console.log('4. Identifique onde está o problema');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

// Executar teste
testServerLogs().catch(console.error);
