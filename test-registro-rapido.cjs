const axios = require('axios');

console.log('🔧 TESTANDO REGISTRO RÁPIDO DE PACIENTES\n');

async function testRegistroRapido() {
  try {
    console.log('🔐 Fazendo login para obter token...');
    
    // Primeiro, fazer login para obter token
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'testefinal@teste.com',
      password: '123456'
    });
    
    console.log('✅ Login bem-sucedido!');
    const token = loginResponse.data.token;
    
    console.log('\n🔧 Testando registro rápido...');
    
    // Dados do registro rápido
    const pacienteData = {
      nome: 'João Silva',
      telefone: '(11) 99999-9999',
      nascimento: '1990-01-01',
      genero: 'Masculino'
    };
    
    console.log('Dados sendo enviados:', pacienteData);
    
    // Criar paciente com registro rápido
    const createResponse = await axios.post('http://localhost:3000/api/pacientes', pacienteData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Paciente criado com sucesso!');
    console.log('Resposta:', createResponse.data);
    
    console.log('\n🎉 REGISTRO RÁPIDO FUNCIONANDO!');
    console.log('Agora você pode testar no frontend:');
    console.log('1. Acesse: http://localhost:8080/#/pacientes');
    console.log('2. Clique em "Registro Rápido"');
    console.log('3. Preencha apenas nome, telefone, data de nascimento e gênero');
    console.log('4. Clique em "Salvar"');
    
  } catch (error) {
    console.log('❌ Erro:', error.response?.data?.message || error.message);
    
    if (error.response?.data?.message?.includes('Email não verificado')) {
      console.log('\n💡 SOLUÇÃO:');
      console.log('Você precisa verificar um usuário primeiro');
      console.log('Execute: node create-and-verify.cjs');
    }
  }
}

testRegistroRapido();
