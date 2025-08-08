const axios = require('axios');

console.log('🔧 TESTANDO MODAL DE EDIÇÃO DE PACIENTES\n');

async function testEditModal() {
  try {
    console.log('🔐 Fazendo login para obter token...');
    
    // Primeiro, fazer login para obter token
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'testefinal@teste.com',
      password: '123456'
    });
    
    console.log('✅ Login bem-sucedido!');
    const token = loginResponse.data.token;
    
    console.log('\n🔧 Buscando pacientes...');
    
    // Buscar pacientes
    const pacientesResponse = await axios.get('http://localhost:3000/api/pacientes?page=1&limit=5', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Pacientes encontrados:', pacientesResponse.data.pacientes.length);
    
    if (pacientesResponse.data.pacientes.length > 0) {
      const paciente = pacientesResponse.data.pacientes[0];
      console.log('📋 Paciente para edição:', {
        id: paciente.id,
        nome: paciente.nome,
        email: paciente.email,
        telefone: paciente.telefone
      });
      
      console.log('\n🔧 Testando atualização de paciente...');
      
      // Dados para atualização
      const updateData = {
        nome: paciente.nome + ' (Editado)',
        email: paciente.email,
        telefone: paciente.telefone,
        nascimento: paciente.nascimento,
        endereco: 'Endereço atualizado via modal',
        profissao: 'Profissão atualizada',
        contato_emergencia: 'Contato de emergência atualizado',
        observacao_geral: 'Observações atualizadas via modal de edição',
        cpf: paciente.cpf,
        genero: paciente.genero,
        status: paciente.status
      };
      
      console.log('Dados sendo enviados:', updateData);
      
      // Atualizar paciente
      const updateResponse = await axios.put(`http://localhost:3000/api/pacientes/${paciente.id}`, updateData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Paciente atualizado com sucesso!');
      console.log('Resposta:', updateResponse.data);
      
      console.log('\n🎉 MODAL DE EDIÇÃO FUNCIONANDO!');
      console.log('Agora você pode testar no frontend:');
      console.log('1. Acesse: http://localhost:8080/#/pacientes');
      console.log('2. Clique no ícone de editar (lápis) em qualquer paciente');
      console.log('3. O modal de edição deve abrir com os dados do paciente');
      console.log('4. Faça as alterações e clique em "Salvar Alterações"');
      
    } else {
      console.log('❌ Nenhum paciente encontrado para testar');
      console.log('Crie um paciente primeiro usando o registro rápido');
    }
    
  } catch (error) {
    console.log('❌ Erro:', error.response?.data?.message || error.message);
    
    if (error.response?.data?.message?.includes('Email não verificado')) {
      console.log('\n💡 SOLUÇÃO:');
      console.log('Você precisa verificar um usuário primeiro');
      console.log('Execute: node create-and-verify.cjs');
    }
  }
}

testEditModal();
