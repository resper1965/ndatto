/**
 * Cliente Mock para demonstração da API do Datto RMM
 * Simula respostas da API real para fins de demonstração
 */
class MockDattoRMMClient {
  constructor() {
    this.mockData = {
      account: {
        id: 'acc-001',
        name: 'Empresa Exemplo Ltda',
        email: 'admin@empresa.com',
        plan: 'Professional',
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        deviceLimit: 100,
        currentDevices: 23
      },
      devices: [
        {
          uid: 'dev-001',
          name: 'Servidor Principal',
          type: 'server',
          status: 'online',
          os: 'Windows Server 2019',
          ip: '192.168.1.100',
          siteUid: 'site-001',
          lastSeen: '2024-01-15T10:30:00Z'
        },
        {
          uid: 'dev-002',
          name: 'Workstation-01',
          type: 'workstation',
          status: 'online',
          os: 'Windows 10 Pro',
          ip: '192.168.1.101',
          siteUid: 'site-001',
          lastSeen: '2024-01-15T10:25:00Z'
        },
        {
          uid: 'dev-003',
          name: 'Servidor Backup',
          type: 'server',
          status: 'offline',
          os: 'Ubuntu 20.04',
          ip: '192.168.1.102',
          siteUid: 'site-002',
          lastSeen: '2024-01-15T08:15:00Z'
        }
      ],
      sites: [
        {
          uid: 'site-001',
          name: 'Escritório Principal',
          description: 'Sede da empresa',
          status: 'active',
          deviceCount: 15,
          address: 'Rua das Flores, 123',
          contact: 'contato@empresa.com'
        },
        {
          uid: 'site-002',
          name: 'Filial Norte',
          description: 'Filial regional',
          status: 'active',
          deviceCount: 8,
          address: 'Av. Norte, 456',
          contact: 'norte@empresa.com'
        }
      ],
      alerts: [
        {
          uid: 'alert-001',
          deviceUid: 'dev-001',
          siteUid: 'site-001',
          severity: 'critical',
          message: 'Serviço parou de responder',
          status: 'active',
          acknowledged: false,
          createdAt: '2024-01-15T10:20:00Z'
        },
        {
          uid: 'alert-002',
          deviceUid: 'dev-003',
          siteUid: 'site-002',
          severity: 'warning',
          message: 'Disco rígido com pouco espaço',
          status: 'active',
          acknowledged: false,
          createdAt: '2024-01-15T09:45:00Z'
        },
        {
          uid: 'alert-003',
          deviceUid: 'dev-002',
          siteUid: 'site-001',
          severity: 'info',
          message: 'Atualização disponível',
          status: 'active',
          acknowledged: false,
          createdAt: '2024-01-15T10:00:00Z'
        }
      ],
      stats: {
        totalDevices: 23,
        onlineDevices: 21,
        offlineDevices: 2,
        totalSites: 2,
        activeAlerts: 2,
        criticalAlerts: 1,
        warningAlerts: 1,
        infoAlerts: 0,
        uptime: 99.8
      }
    };
  }

  /**
   * Simula uma requisição GET para a API
   * @param {string} path - Caminho da requisição
   * @param {Object} params - Parâmetros de query
   * @returns {Promise<Object>} - Dados simulados
   */
  async get(path, params = {}) {
    console.log(`[MOCK REQUEST] GET ${path}`);
    
    // Simula delay de rede
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const pathParts = path.split('/').filter(part => part);
    
    // Roteamento baseado no caminho
    if (pathParts[0] === 'account') {
      return this.mockData.account;
    }
    
    if (pathParts[0] === 'device') {
      if (pathParts[1]) {
        // Dispositivo específico
        const device = this.mockData.devices.find(d => d.uid === pathParts[1]);
        if (!device) {
          throw new Error('Device not found');
        }
        return device;
      } else {
        // Lista de dispositivos com filtros
        let devices = [...this.mockData.devices];
        
        if (params.type) {
          devices = devices.filter(d => d.type === params.type);
        }
        
        if (params.status) {
          devices = devices.filter(d => d.status === params.status);
        }
        
        if (params.search) {
          const searchTerm = params.search.toLowerCase();
          devices = devices.filter(d => 
            d.name.toLowerCase().includes(searchTerm) ||
            d.os.toLowerCase().includes(searchTerm)
          );
        }
        
        return devices;
      }
    }
    
    if (pathParts[0] === 'site') {
      if (pathParts[1]) {
        if (pathParts[2] === 'device') {
          // Dispositivos de um site
          return this.mockData.devices.filter(d => d.siteUid === pathParts[1]);
        } else {
          // Site específico
          const site = this.mockData.sites.find(s => s.uid === pathParts[1]);
          if (!site) {
            throw new Error('Site not found');
          }
          return site;
        }
      } else {
        // Lista de sites com filtros
        let sites = [...this.mockData.sites];
        
        if (params.status) {
          sites = sites.filter(s => s.status === params.status);
        }
        
        if (params.search) {
          const searchTerm = params.search.toLowerCase();
          sites = sites.filter(s => 
            s.name.toLowerCase().includes(searchTerm) ||
            s.description.toLowerCase().includes(searchTerm)
          );
        }
        
        return sites;
      }
    }
    
    if (pathParts[0] === 'alert') {
      if (pathParts[1]) {
        // Alerta específico
        const alert = this.mockData.alerts.find(a => a.uid === pathParts[1]);
        if (!alert) {
          throw new Error('Alert not found');
        }
        return alert;
      } else {
        // Lista de alertas com filtros
        let alerts = [...this.mockData.alerts];
        
        if (params.severity) {
          alerts = alerts.filter(a => a.severity === params.severity);
        }
        
        if (params.deviceUid) {
          alerts = alerts.filter(a => a.deviceUid === params.deviceUid);
        }
        
        if (params.siteUid) {
          alerts = alerts.filter(a => a.siteUid === params.siteUid);
        }
        
        if (params.acknowledged !== undefined) {
          alerts = alerts.filter(a => a.acknowledged === params.acknowledged);
        }
        
        if (params.status) {
          alerts = alerts.filter(a => a.status === params.status);
        }
        
        if (params.search) {
          const searchTerm = params.search.toLowerCase();
          alerts = alerts.filter(a => 
            a.message.toLowerCase().includes(searchTerm)
          );
        }
        
        return alerts;
      }
    }
    
    if (pathParts[0] === 'stats') {
      return this.mockData.stats;
    }
    
    // Endpoint não encontrado
    throw new Error('Endpoint not found');
  }
}

module.exports = MockDattoRMMClient;