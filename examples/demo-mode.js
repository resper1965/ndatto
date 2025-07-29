const MockDattoRMMClient = require('../src/mock-client');

class MockDeviceService {
  constructor() {
    this.client = new MockDattoRMMClient();
  }

  async listDevices(filters = {}) {
    return await this.client.get('/devices', filters);
  }

  async getDevice(deviceId) {
    const devices = await this.client.get('/devices');
    return devices.find(device => device.id === deviceId);
  }

  async getDevicesByType(deviceType) {
    const devices = await this.client.get('/devices');
    return devices.filter(device => device.type === deviceType);
  }

  async searchDevices(searchTerm) {
    const devices = await this.client.get('/devices');
    return devices.filter(device => 
      device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.os.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
}

class MockSiteService {
  constructor() {
    this.client = new MockDattoRMMClient();
  }

  async listSites(filters = {}) {
    return await this.client.get('/sites', filters);
  }

  async getSite(siteId) {
    const sites = await this.client.get('/sites');
    return sites.find(site => site.id === siteId);
  }

  async getSiteDevices(siteId) {
    const devices = await this.client.get('/devices');
    return devices.filter(device => device.siteId === siteId);
  }
}

class MockAlertService {
  constructor() {
    this.client = new MockDattoRMMClient();
  }

  async listAlerts(filters = {}) {
    return await this.client.get('/alerts', filters);
  }

  async getAlertsBySeverity(severity) {
    return await this.client.get('/alerts', { severity });
  }

  async getUnacknowledgedAlerts() {
    return await this.client.get('/alerts', { acknowledged: false });
  }
}

class MockDattoRMMAPI {
  constructor() {
    this.client = new MockDattoRMMClient();
    this.devices = new MockDeviceService();
    this.sites = new MockSiteService();
    this.alerts = new MockAlertService();
  }

  async testConnection() {
    try {
      const response = await this.client.get('/account');
      return {
        success: true,
        message: 'Conexão com a API estabelecida com sucesso (MODO DEMO)',
        data: response
      };
    } catch (error) {
      return {
        success: false,
        message: 'Falha na conexão com a API',
        error: error.message
      };
    }
  }

  async getAccountInfo() {
    return await this.client.get('/account');
  }

  async getStats() {
    return await this.client.get('/stats');
  }
}

async function demoMode() {
  console.log('🎭 Iniciando demonstração da API do Datto RMM (MODO DEMO)\n');
  console.log('📝 Este é um modo de demonstração com dados simulados');
  console.log('📝 Para usar com a API real, configure as credenciais corretas\n');

  try {
    const api = new MockDattoRMMAPI();

    // Testa a conexão
    console.log('📡 Testando conexão com a API...');
    const connectionTest = await api.testConnection();
    console.log('Status da conexão:', connectionTest);
    console.log('');

    // Obtém informações da conta
    console.log('👤 Obtendo informações da conta...');
    const accountInfo = await api.getAccountInfo();
    console.log('Informações da conta:', JSON.stringify(accountInfo, null, 2));
    console.log('');

    // Lista dispositivos
    console.log('💻 Listando dispositivos...');
    const devices = await api.devices.listDevices({ limit: 5 });
    console.log(`Encontrados ${devices.length} dispositivos:`);
    devices.forEach(device => {
      console.log(`  - ${device.name} (${device.type}) - ${device.status}`);
    });
    console.log('');

    // Busca dispositivos por tipo
    console.log('🔍 Buscando servidores...');
    const servers = await api.devices.getDevicesByType('server');
    console.log(`Servidores encontrados: ${servers.length}`);
    servers.forEach(server => {
      console.log(`  - ${server.name} (${server.os})`);
    });
    console.log('');

    // Lista sites
    console.log('🏢 Listando sites...');
    const sites = await api.sites.listSites();
    console.log(`Encontrados ${sites.length} sites:`);
    sites.forEach(site => {
      console.log(`  - ${site.name} (${site.deviceCount} dispositivos)`);
    });
    console.log('');

    // Lista alertas por severidade
    console.log('🚨 Listando alertas por severidade...');
    const criticalAlerts = await api.alerts.getAlertsBySeverity('critical');
    const warningAlerts = await api.alerts.getAlertsBySeverity('warning');
    console.log(`Alertas críticos: ${criticalAlerts.length}`);
    console.log(`Alertas de aviso: ${warningAlerts.length}`);
    console.log('');

    // Lista alertas não reconhecidos
    console.log('❌ Alertas não reconhecidos...');
    const unacknowledgedAlerts = await api.alerts.getUnacknowledgedAlerts();
    console.log(`Alertas não reconhecidos: ${unacknowledgedAlerts.length}`);
    unacknowledgedAlerts.forEach(alert => {
      console.log(`  - ${alert.title} (${alert.severity})`);
    });
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
  demoMode();
}

module.exports = { demoMode };