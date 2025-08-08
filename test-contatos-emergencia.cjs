const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function testContatosEmergencia() {
  try {
    console.log('🧪 Testando funcionalidade de contatos de emergência...\n');

    // 1. Registrar um novo usuário
    console.log('1️⃣ Registrando novo usuário...');
    const email = `teste${Date.now()}@teste.com`;
    const password = '123456';
    
    const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
      email,
      password,
      nome: 'Usuário Teste Contatos',
      sobrenome: 'Silva',
      contato: '(11) 99999-9999'
    });

    console.log('✅ Usuário registrado com sucesso');
    console.log('📧 Email:', email);
    console.log('🔑 Senha:', password);
    console.log('📋 Resposta do registro:', JSON.stringify(registerResponse.data, null, 2));

    // 2. Fazer login
    console.log('\n2️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password
    });

    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso\n');

    // 3. Buscar um paciente existente
    console.log('3️⃣ Buscando pacientes...');
    const pacientesResponse = await axios.get(`${API_BASE_URL}/pacientes`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    let pacienteId;
    if (pacientesResponse.data.pacientes.length === 0) {
      console.log('❌ Nenhum paciente encontrado. Criando um paciente de teste...');
      
      const createPacienteResponse = await axios.post(`${API_BASE_URL}/pacientes`, {
        nome: 'PACIENTE TESTE CONTATOS',
        telefone: '(11) 99999-9999',
        nascimento: '1990-01-01',
        genero: 'Masculino'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      pacienteId = createPacienteResponse.data.id;
      console.log(`✅ Paciente criado com ID: ${pacienteId}\n`);
    } else {
      pacienteId = pacientesResponse.data.pacientes[0].id;
      console.log(`✅ Paciente encontrado com ID: ${pacienteId}\n`);
    }

    // 4. Atualizar paciente com contatos de emergência
    console.log('4️⃣ Atualizando paciente com contatos de emergência...');
    const contatosEmergencia = [
      {
        id: '1',
        nome: 'Maria Silva',
        telefone: '(11) 88888-8888'
      },
      {
        id: '2',
        nome: 'João Santos',
        telefone: '(11) 77777-7777'
      }
    ];

    const updateResponse = await axios.patch(`${API_BASE_URL}/pacientes/${pacienteId}`, {
      contatos_emergencia: contatosEmergencia,
      observacao_geral: 'Observação de teste para contatos de emergência'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Paciente atualizado com sucesso');
    console.log('📋 Dados retornados:', JSON.stringify(updateResponse.data, null, 2));

    // 5. Verificar se os dados foram salvos
    console.log('\n5️⃣ Verificando se os dados foram salvos...');
    const pacienteResponse = await axios.get(`${API_BASE_URL}/pacientes/${pacienteId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('📋 Dados do paciente após atualização:');
    console.log('   - Contatos de emergência:', JSON.stringify(pacienteResponse.data.contatos_emergencia, null, 2));
    console.log('   - Observação geral:', pacienteResponse.data.observacao_geral);

    if (pacienteResponse.data.contatos_emergencia && pacienteResponse.data.contatos_emergencia.length > 0) {
      console.log('✅ Contatos de emergência salvos com sucesso!');
    } else {
      console.log('❌ Contatos de emergência não foram salvos');
    }

    if (pacienteResponse.data.observacao_geral) {
      console.log('✅ Observação geral salva com sucesso!');
    } else {
      console.log('❌ Observação geral não foi salva');
    }

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.response?.data || error.message);
    
    if (error.response?.data) {
      console.error('📋 Detalhes do erro:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testContatosEmergencia();
