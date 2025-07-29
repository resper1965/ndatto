const { DattoRMMAPI } = require('../src/index');

async function exemploBasico() {
  console.log('🚀 Iniciando exemplo básico da API do Datto RMM...\n');

  try {
    // Inicializa o cliente da API
    const api = new DattoRMMAPI();

    // Testa a conexão
    console.log('📡 Testando conexão com a API...');
    const connectionTest = await api.testConnection();
    console.log('Status da conexão:', connectionTest);
    console.log('');

    if (!connectionTest.success) {
      console.error('❌ Falha na conexão. Verifique suas credenciais.');
      return;
    }

    // Obtém informações da conta
    console.log('👤 Obtendo informações da conta...');
    const accountInfo = await api.getAccountInfo();
    console.log('Informações da conta:', JSON.stringify(accountInfo, null, 2));
    console.log('');

    // Lista dispositivos
    console.log('💻 Listando dispositivos...');
    const devices = await api.devices.listDevices({ limit: 5 });
    console.log(`Encontrados ${devices.length} dispositivos`);
    console.log('');

    // Lista sites
    console.log('🏢 Listando sites...');
    const sites = await api.sites.listSites({ limit: 5 });
    console.log(`Encontrados ${sites.length} sites`);
    console.log('');

    // Lista alertas não reconhecidos
    console.log('🚨 Listando alertas não reconhecidos...');
    const alerts = await api.alerts.getUnacknowledgedAlerts();
    console.log(`Encontrados ${alerts.length} alertas não reconhecidos`);
    console.log('');

    // Obtém estatísticas gerais
    console.log('📊 Obtendo estatísticas gerais...');
    const stats = await api.getStats();
    console.log('Estatísticas:', JSON.stringify(stats, null, 2));

  } catch (error) {
    console.error('❌ Erro durante a execução:', error.message);
  }
}

// Executa o exemplo se o arquivo for executado diretamente
if (require.main === module) {
  exemploBasico();
}

module.exports = { exemploBasico };