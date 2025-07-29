const express = require('express');
const path = require('path');
const OrganizationService = require('../services/organization-service');
const SyncService = require('../services/sync-service');
const DatabaseService = require('../services/database-service');

// Simula uma conexão de banco de dados
class MockDatabase {
  constructor() {
    this.data = {
      organizations: [
        {
          id: 1,
          uid: 'org_1',
          name: 'Empresa ABC Ltda',
          slug: 'empresa-abc',
          description: 'Empresa de tecnologia com múltiplos sites',
          status: 'active',
          is_active: true,
          sync_enabled: true,
          last_sync: new Date(),
          total_devices: 45,
          online_devices: 38,
          offline_devices: 7,
          total_sites: 8,
          active_sites: 7,
          total_alerts: 12,
          critical_alerts: 3,
          warning_alerts: 6,
          info_alerts: 3
        },
        {
          id: 2,
          uid: 'org_2',
          name: 'Consultoria XYZ',
          slug: 'consultoria-xyz',
          description: 'Consultoria em TI com foco em monitoramento',
          status: 'active',
          is_active: true,
          sync_enabled: true,
          last_sync: new Date(Date.now() - 3600000), // 1 hora atrás
          total_devices: 23,
          online_devices: 20,
          offline_devices: 3,
          total_sites: 4,
          active_sites: 4,
          total_alerts: 8,
          critical_alerts: 1,
          warning_alerts: 4,
          info_alerts: 3
        }
      ],
      devices: [
        {
          id: 1,
          organization_id: 1,
          uid: 'device_1',
          name: 'Servidor Principal',
          type: 'server',
          status: 'online',
          os: 'Windows Server 2019',
          ip_address: '192.168.1.100',
          site_name: 'Matriz'
        },
        {
          id: 2,
          organization_id: 1,
          uid: 'device_2',
          name: 'Workstation João',
          type: 'workstation',
          status: 'online',
          os: 'Windows 11',
          ip_address: '192.168.1.101',
          site_name: 'Matriz'
        },
        {
          id: 3,
          organization_id: 2,
          uid: 'device_3',
          name: 'Servidor Backup',
          type: 'server',
          status: 'offline',
          os: 'Linux Ubuntu',
          ip_address: '10.0.0.50',
          site_name: 'Filial'
        }
      ],
      alerts: [
        {
          id: 1,
          organization_id: 1,
          uid: 'alert_1',
          title: 'Disco cheio',
          message: 'Disco C: com 95% de uso',
          severity: 'critical',
          status: 'active',
          device_name: 'Servidor Principal',
          site_name: 'Matriz',
          created_at: new Date()
        },
        {
          id: 2,
          organization_id: 1,
          uid: 'alert_2',
          title: 'Memória alta',
          message: 'Uso de memória em 85%',
          severity: 'warning',
          status: 'active',
          device_name: 'Workstation João',
          site_name: 'Matriz',
          created_at: new Date()
        },
        {
          id: 3,
          organization_id: 2,
          uid: 'alert_3',
          title: 'Serviço parado',
          message: 'Serviço de backup não está rodando',
          severity: 'critical',
          status: 'active',
          device_name: 'Servidor Backup',
          site_name: 'Filial',
          created_at: new Date()
        }
      ]
    };
  }

  async query(sql, params = []) {
    // Simula consultas básicas
    if (sql.includes('SELECT * FROM organizations')) {
      return this.data.organizations;
    }
    if (sql.includes('SELECT * FROM devices WHERE organization_id')) {
      const orgId = params[0];
      return this.data.devices.filter(d => d.organization_id === orgId);
    }
    if (sql.includes('SELECT * FROM alerts WHERE organization_id')) {
      const orgId = params[0];
      return this.data.alerts.filter(a => a.organization_id === orgId);
    }
    return [];
  }
}

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Inicializa serviços
const database = new MockDatabase();
const organizationService = new OrganizationService(database);
const syncService = new SyncService(database);
const dbService = new DatabaseService(database);

// Rotas
app.get('/', async (req, res) => {
  try {
    const organizations = await organizationService.getOrganizations();
    const globalStats = await dbService.getGlobalStats();
    
    res.render('dashboard', {
      organizations,
      globalStats,
      title: 'Dashboard - Datto RMM Multitenancy'
    });
  } catch (error) {
    console.error('Erro ao carregar dashboard:', error);
    res.status(500).render('error', { error: error.message });
  }
});

app.get('/organization/:id', async (req, res) => {
  try {
    const organizationId = parseInt(req.params.id);
    const organization = await organizationService.getOrganization(organizationId);
    
    if (!organization) {
      return res.status(404).render('error', { error: 'Organização não encontrada' });
    }

    const devices = await dbService.getDevices(organizationId);
    const alerts = await dbService.getAlerts(organizationId);
    const stats = await dbService.getGeneralStats(organizationId);
    
    res.render('organization', {
      organization,
      devices,
      alerts,
      stats,
      title: `${organization.name} - Detalhes`
    });
  } catch (error) {
    console.error('Erro ao carregar organização:', error);
    res.status(500).render('error', { error: error.message });
  }
});

app.post('/organization/:id/sync', async (req, res) => {
  try {
    const organizationId = parseInt(req.params.id);
    const result = await syncService.syncOrganization(organizationId);
    
    res.json({ success: true, result });
  } catch (error) {
    console.error('Erro na sincronização:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/organizations', async (req, res) => {
  try {
    const organizations = await organizationService.getOrganizations();
    res.json(organizations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/organization/:id/stats', async (req, res) => {
  try {
    const organizationId = parseInt(req.params.id);
    const stats = await dbService.getGeneralStats(organizationId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota para exemplo de ícones
app.get('/icons', (req, res) => {
  res.render('example-icons', {
    title: 'Exemplo de Heroicons - Datto RMM'
  });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor web rodando em http://localhost:${PORT}`);
  console.log(`📊 Dashboard multitenancy disponível`);
  console.log(`🎨 Exemplo de ícones: http://localhost:${PORT}/icons`);
});

module.exports = app;