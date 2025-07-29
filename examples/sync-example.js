/**
 * Exemplo de Sincronização e Persistência de Dados
 * 
 * Demonstra como sincronizar dados da API do Datto RMM
 * e consultar dados persistidos localmente
 */

const { DattoRMMAPI } = require('../src/index');
const SyncService = require('../src/services/sync-service');
const DatabaseService = require('../src/services/database-service');

// Simula uma conexão de banco de dados (em produção, use MySQL, PostgreSQL, etc.)
class MockDatabase {
  constructor() {
    this.data = {
      devices: [],
      sites: [],
      alerts: [],
      sync_log: [],
      device_history: [],
      alert_history: []
    };
  }

  async query(sql, params = []) {
    console.log(`[DB] ${sql}`, params);
    
    // Simula operações básicas do banco
    if (sql.includes('INSERT INTO devices')) {
      const device = params[0];
      this.data.devices.push(device);
      return { insertId: this.data.devices.length };
    }
    
    if (sql.includes('SELECT * FROM devices')) {
      return this.data.devices;
    }
    
    if (sql.includes('UPDATE devices')) {
      const deviceUid = params[1];
      const deviceIndex = this.data.devices.findIndex(d => d.uid === deviceUid);
      if (deviceIndex !== -1) {
        this.data.devices[deviceIndex] = { ...this.data.devices[deviceIndex], ...params[0] };
      }
      return { affectedRows: 1 };
    }
    
    if (sql.includes('INSERT INTO sync_log')) {
      const log = params[0];
      this.data.sync_log.push(log);
      return { insertId: this.data.sync_log.length };
    }
    
    if (sql.includes('UPDATE sync_log')) {
      return { affectedRows: 1 };
    }
    
    return [];
  }
}

async function exemploSincronizacao() {
  console.log('🔄 Exemplo de Sincronização e Persistência de Dados');
  console.log('==================================================\n');

  // Inicializa serviços
  const database = new MockDatabase();
  const api = new DattoRMMAPI();
  const syncService = new SyncService(database);
  const dbService = new DatabaseService(database);

  try {
    // 1. Sincronização Completa
    console.log('📡 1. Sincronizando dados da API...');
    const syncResults = await syncService.syncAll();
    console.log('✅ Sincronização concluída:', syncResults);
    console.log('');

    // 2. Consultas Locais
    console.log('💾 2. Consultando dados persistidos...');
    
    // Dispositivos
    const devices = await dbService.getDevices();
    console.log(`📱 Dispositivos (${devices.length}):`);
    devices.forEach(device => {
      console.log(`  - ${device.name} (${device.type}) - ${device.status}`);
    });
    console.log('');

    // Sites
    const sites = await dbService.getSites();
    console.log(`🏢 Sites (${sites.length}):`);
    sites.forEach(site => {
      console.log(`  - ${site.name} - ${site.status}`);
    });
    console.log('');

    // Alertas
    const alerts = await dbService.getAlerts();
    console.log(`🚨 Alertas (${alerts.length}):`);
    alerts.forEach(alert => {
      console.log(`  - ${alert.title} (${alert.severity}) - ${alert.status}`);
    });
    console.log('');

    // 3. Filtros Avançados
    console.log('🔍 3. Consultas com filtros...');
    
    // Dispositivos online
    const onlineDevices = await dbService.getOnlineDevices();
    console.log(`🟢 Dispositivos online: ${onlineDevices.length}`);
    
    // Dispositivos offline
    const offlineDevices = await dbService.getOfflineDevices();
    console.log(`🔴 Dispositivos offline: ${offlineDevices.length}`);
    
    // Alertas críticos
    const criticalAlerts = await dbService.getAlertsBySeverity('critical');
    console.log(`🚨 Alertas críticos: ${criticalAlerts.length}`);
    
    // Alertas não reconhecidos
    const unacknowledgedAlerts = await dbService.getUnacknowledgedAlerts();
    console.log(`⚠️ Alertas não reconhecidos: ${unacknowledgedAlerts.length}`);
    console.log('');

    // 4. Estatísticas
    console.log('📊 4. Estatísticas gerais...');
    const stats = await dbService.getGeneralStats();
    console.log('Estatísticas:', {
      dispositivos: {
        total: stats.total_devices,
        online: stats.online_devices,
        offline: stats.offline_devices,
        inativos: stats.inactive_devices
      },
      sites: {
        total: stats.total_sites,
        ativos: stats.active_sites,
        inativos: stats.inactive_sites
      },
      alertas: {
        total: stats.total_alerts,
        críticos: stats.critical_alerts,
        avisos: stats.warning_alerts,
        info: stats.info_alerts,
        ativos: stats.active_alerts,
        resolvidos: stats.resolved_alerts,
        nãoReconhecidos: stats.unacknowledged_alerts
      }
    });
    console.log('');

    // 5. Pesquisa Global
    console.log('🔎 5. Pesquisa global...');
    const searchResults = await dbService.globalSearch('servidor');
    console.log(`Resultados da pesquisa "servidor": ${searchResults.total} itens encontrados`);
    console.log('');

    // 6. Relacionamentos
    console.log('🔗 6. Consultas com relacionamentos...');
    
    if (sites.length > 0) {
      const siteWithDetails = await dbService.getSiteWithDetails(sites[0].uid);
      console.log(`Site com detalhes: ${siteWithDetails.name}`);
      console.log(`  - Dispositivos: ${siteWithDetails.devices.length}`);
      console.log(`  - Alertas: ${siteWithDetails.alerts.length}`);
    }
    console.log('');

    // 7. Histórico
    console.log('📜 7. Histórico de mudanças...');
    const syncStats = await dbService.getSyncStats();
    console.log('Estatísticas de sincronização:', syncStats);
    console.log('');

    // 8. Simulação de Desativação
    console.log('🔄 8. Simulando desativação de itens...');
    console.log('(Em um cenário real, itens que não estão mais na API seriam marcados como inativos)');
    console.log('');

    console.log('✅ Exemplo concluído com sucesso!');
    console.log('');
    console.log('💡 Benefícios desta estrutura:');
    console.log('  - Dados sempre disponíveis, mesmo offline');
    console.log('  - Histórico completo de mudanças');
    console.log('  - Consultas rápidas e filtros avançados');
    console.log('  - Controle de status (ativo/inativo)');
    console.log('  - Relacionamentos entre entidades');
    console.log('  - Estatísticas em tempo real');

  } catch (error) {
    console.error('❌ Erro durante o exemplo:', error.message);
  }
}

// Executa o exemplo
if (require.main === module) {
  exemploSincronizacao();
}

module.exports = { exemploSincronizacao };