const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testCheckout() {
  console.log('🧪 Testando página de checkout...\n');

  try {
    // 1. Testar status da API
    console.log('1️⃣ Testando status da API...');
    const statusResponse = await axios.get(`${BASE_URL}/api/pix/status-publico`);
    console.log('✅ Status:', statusResponse.data.status);
    console.log('📝 Mensagem:', statusResponse.data.message);
    console.log('🔧 SDK Version:', statusResponse.data.details?.sdkVersion);
    console.log('🌐 Integration Type:', statusResponse.data.details?.integrationType);
    console.log('');

    // 2. Testar geração de Pix
    console.log('2️⃣ Testando geração de Pix...');
    const pixData = {
      valor: 100, // R$ 1,00 em centavos
      descricao: 'Teste de checkout - R$ 1,00',
      nomePagador: 'João Teste Checkout',
      cpfPagador: '12345678901',
      emailPagador: 'joao.checkout@teste.com'
    };

    const pixResponse = await axios.post(`${BASE_URL}/api/pix/teste-publico`, pixData);
    
    if (pixResponse.data.success) {
      console.log('✅ Pix gerado com sucesso!');
      console.log('🆔 TXID:', pixResponse.data.data.txid);
      console.log('💰 Valor:', pixResponse.data.data.valor);
      console.log('📝 Descrição:', pixResponse.data.data.descricao);
      console.log('🔍 É Real:', pixResponse.data.data.isReal);
      console.log('🧪 É Teste:', pixResponse.data.data.isTest);
      console.log('🔧 SDK Version:', pixResponse.data.data.sdkVersion);
      console.log('🌐 Integration Type:', pixResponse.data.data.integrationType);
      
      if (pixResponse.data.data.instructions) {
        console.log('📋 Instruções:');
        pixResponse.data.data.instructions.forEach((instruction, index) => {
          console.log(`   ${index + 1}. ${instruction}`);
        });
      }
      
      if (pixResponse.data.data.realPixError) {
        console.log('⚠️ Erro Real:', pixResponse.data.data.realPixError);
      }
    } else {
      console.log('❌ Erro ao gerar Pix:', pixResponse.data.message);
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📝 Dados:', error.response.data);
    }
  }
}

// Executar teste
testCheckout();




