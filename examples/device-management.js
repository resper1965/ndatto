const { DeviceService } = require('../src/index');

async function exemploGerenciamentoDispositivos() {
  console.log('💻 Exemplo de Gerenciamento de Dispositivos\n');

  try {
    const deviceService = new DeviceService();

    // Lista todos os dispositivos
    console.log('📋 Listando todos os dispositivos...');
    const allDevices = await deviceService.listDevices();
    console.log(`Total de dispositivos: ${allDevices.length}`);
    console.log('');

    // Busca dispositivos por tipo
    console.log('🔍 Buscando dispositivos por tipo...');
    const servers = await deviceService.getDevicesByType('server');
    const workstations = await deviceService.getDevicesByType('workstation');
    console.log(`Servidores: ${servers.length}`);
    console.log(`Workstations: ${workstations.length}`);
    console.log('');

    // Busca dispositivos por termo
    console.log('🔎 Buscando dispositivos por termo...');
    const searchResults = await deviceService.searchDevices('server');
    console.log(`Dispositivos encontrados com "server": ${searchResults.length}`);
    console.log('');

    // Se houver dispositivos, mostra detalhes do primeiro
    if (allDevices.length > 0) {
      const firstDevice = allDevices[0];
      console.log('📱 Detalhes do primeiro dispositivo:');
      console.log(`ID: ${firstDevice.id}`);
      console.log(`Nome: ${firstDevice.name}`);
      console.log(`Tipo: ${firstDevice.type}`);
      console.log(`Status: ${firstDevice.status}`);
      console.log('');

      // Obtém status detalhado do dispositivo
      console.log('📊 Obtendo status detalhado...');
      const deviceStatus = await deviceService.getDeviceStatus(firstDevice.id);
      console.log('Status detalhado:', JSON.stringify(deviceStatus, null, 2));
      console.log('');

      // Exemplo de atualização (comentado para segurança)
      console.log('✏️ Exemplo de atualização (comentado):');
      console.log('// await deviceService.updateDevice(firstDevice.id, {');
      console.log('//   name: "Novo Nome do Dispositivo",');
      console.log('//   description: "Nova descrição"');
      console.log('// });');
      console.log('');
    }

  } catch (error) {
    console.error('❌ Erro durante a execução:', error.message);
  }
}

// Executa o exemplo se o arquivo for executado diretamente
if (require.main === module) {
  exemploGerenciamentoDispositivos();
}

module.exports = { exemploGerenciamentoDispositivos };