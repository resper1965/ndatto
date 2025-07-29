const express = require('express');
const path = require('path');
require('dotenv').config();

// Importa serviços
const DattoApiService = require('../services/datto-api-service');
const MockDatabase = require('../mock-client');
const OrganizationService = require('../services/organization-service');
const SyncService = require('../services/sync-service');
const DatabaseService = require('../services/database-service');

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
const dattoApi = new DattoApiService();
const database = new MockDatabase();
const organizationService = new OrganizationService(database);
const syncService = new SyncService(database);
const dbService = new DatabaseService(database);

// Testa conexão com Datto API
async function testDattoConnection() {
  try {
    const isConnected = await dattoApi.testConnection();
    if (isConnected) {
      console.log('✅ Conectado com sucesso à API Datto RMM');
    } else {
      console.log('⚠️  Não foi possível conectar à API Datto RMM - usando dados simulados');
    }
  } catch (error) {
    console.log('⚠️  Erro ao conectar com API Datto RMM - usando dados simulados');
  }
}

// Rotas
app.get('/', async (req, res) => {
  try {
    let organizations = [];
    let globalStats = {};

    // Tenta obter dados reais da Datto
    try {
      organizations = await dattoApi.getOrganizations();
      globalStats = await dattoApi.getGlobalStats();
      
      // Formata os dados para o template
      organizations = organizations.map(org => ({
        id: org.uid,
        name: org.name,
        description: org.description || 'Sem descrição',
        is_active: org.status === 'active',
        last_sync: new Date().toISOString(),
        total_devices: 0, // Será calculado individualmente
        online_devices: 0,
        total_alerts: 0,
        critical_alerts: 0
      }));

      // Calcula estatísticas para cada organização
      for (let org of organizations) {
        try {
          const stats = await dattoApi.getOrganizationStats(org.uid);
          org.total_devices = stats.total_devices;
          org.online_devices = stats.online_devices;
          org.total_alerts = stats.total_alerts;
          org.critical_alerts = stats.critical_alerts;
        } catch (error) {
          console.error(`Erro ao obter stats da org ${org.uid}:`, error.message);
        }
      }
    } catch (error) {
      console.log('Usando dados simulados devido a erro na API:', error.message);
      // Fallback para dados simulados
      organizations = await organizationService.getOrganizations();
      globalStats = await dbService.getGlobalStats();
    }
    
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
    const organizationId = req.params.id;
    let organization, devices, alerts, stats;

    // Tenta obter dados reais da Datto
    try {
      organization = await dattoApi.getOrganization(organizationId);
      devices = await dattoApi.getDevices(organizationId);
      alerts = await dattoApi.getAlerts(organizationId);
      stats = await dattoApi.getOrganizationStats(organizationId);

      // Formata os dados para o template
      organization = {
        id: organization.uid,
        name: organization.name,
        description: organization.description || 'Sem descrição',
        is_active: organization.status === 'active'
      };

      devices = devices.map(device => ({
        name: device.name,
        type: device.type || 'unknown',
        status: device.status || 'offline',
        os: device.os || 'Unknown',
        ip_address: device.ip_address || 'N/A',
        site_name: device.site_name || 'N/A'
      }));

      alerts = alerts.map(alert => ({
        title: alert.title,
        severity: alert.severity || 'info',
        status: alert.status || 'active',
        device_name: alert.device_name || 'N/A',
        site_name: alert.site_name || 'N/A',
        created_at: alert.created_at || new Date().toISOString()
      }));
    } catch (error) {
      console.log('Usando dados simulados devido a erro na API:', error.message);
      // Fallback para dados simulados
      organization = await organizationService.getOrganization(parseInt(organizationId));
      devices = await dbService.getDevices(parseInt(organizationId));
      alerts = await dbService.getAlerts(parseInt(organizationId));
      stats = await dbService.getGeneralStats(parseInt(organizationId));
    }
    
    if (!organization) {
      return res.status(404).render('error', { error: 'Organização não encontrada' });
    }

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
    const organizationId = req.params.id;
    let result;

    // Tenta sincronizar com a API real
    try {
      result = await dattoApi.syncOrganization(organizationId);
    } catch (error) {
      console.log('Usando sincronização simulada devido a erro na API:', error.message);
      result = await syncService.syncOrganization(parseInt(organizationId));
    }
    
    res.json({ success: true, result });
  } catch (error) {
    console.error('Erro na sincronização:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/organizations', async (req, res) => {
  try {
    let organizations;
    try {
      organizations = await dattoApi.getOrganizations();
    } catch (error) {
      organizations = await organizationService.getOrganizations();
    }
    res.json(organizations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/organization/:id/stats', async (req, res) => {
  try {
    const organizationId = req.params.id;
    let stats;
    try {
      stats = await dattoApi.getOrganizationStats(organizationId);
    } catch (error) {
      stats = await dbService.getGeneralStats(parseInt(organizationId));
    }
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
  
  // Testa conexão com Datto API
  testDattoConnection();
});

module.exports = app;