// Script de teste para verificar se a função updatePacienteColor está funcionando
import { apiService } from './src/services/api.service.ts';

console.log('🔧 Testando função updatePacienteColor...');

// Verificar se a função existe
if (typeof apiService.updatePacienteColor === 'function') {
  console.log('✅ Função updatePacienteColor existe no apiService');
  console.log('📝 Função:', apiService.updatePacienteColor.toString());
} else {
  console.log('❌ Função updatePacienteColor NÃO existe no apiService');
}

// Verificar outras funções relacionadas a pacientes
console.log('\n🔍 Verificando outras funções de pacientes:');
console.log('updatePaciente:', typeof apiService.updatePaciente);
console.log('getPaciente:', typeof apiService.getPaciente);
console.log('createPaciente:', typeof apiService.createPaciente);
console.log('deletePaciente:', typeof apiService.deletePaciente);
