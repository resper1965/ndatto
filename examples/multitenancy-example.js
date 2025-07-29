/**
 * Exemplo de Sistema Multitenancy com Organizações
 * 
 * Demonstra como gerenciar múltiplas organizações
 * com dados separados e configurações específicas
 */

const OrganizationService = require('../src/services/organization-service');
const SyncService = require('../src/services/sync-service');
const DatabaseService = require('../src/services/database-service');

// Simula uma conexão de banco de dados (em produção, use MySQL, PostgreSQL, etc.)
class MockDatabase {
  constructor() {
    this.data = {
      organizations: [],
      users: [],
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
    if (sql.includes('INSERT INTO organizations')) {
      const org = params[0];
      this.data.organizations.push(org);
      return { insertId: this.data.organizations.length };
    }
    
    if (sql.includes('SELECT * FROM organizations')) {
      return this.data.organizations;
    }
    
    if (sql.includes('INSERT INTO devices')) {
      const device = params[0];
      this.data.devices.push(device);
      return { insertId: this.data.devices.length };
    }
    
    if (sql.includes('SELECT * FROM devices WHERE organization_id')) {
      const orgId = params[0];
      return this.data.devices.filter(d => d.organization_id === orgId);
    }
    
    if (sql.includes('INSERT INTO sync_log')) {
      const log = params[0];
      this.data.sync_log.push(log);
      return { insertId: this.data.sync_log.length };
    }
    
    return [];
  }
}

async function exemploMultitenancy() {
  console.log('🏢 Exemplo de Sistema Multitenancy com Organizações');
  console.log('==================================================\n');

  // Inicializa serviços
  const database = new MockDatabase();
  const organizationService = new OrganizationService(database);
  const syncService = new SyncService(database);
  const dbService = new DatabaseService(database);

  try {
    // 1. Criando Organizações
    console.log('📋 1. Criando organizações...');
    
    const org1 = await organizationService.createOrganization({
      name: 'Empresa ABC Ltda',
      description: 'Empresa de tecnologia com múltiplos sites',
      datto_api_url: 'https://abc-api.centrastage.net',
      datto_api_key: 'ABC123KEY',
      datto_api_secret: 'ABC123SECRET',
      datto_platform: 'vidal',
      sync_interval_minutes: 30,
      max_devices: 500,
      max_sites: 50,
      contact_name: 'João Silva',
      contact_email: 'joao@empresaabc.com',
      contact_phone: '(11) 99999-9999'
    });

    const org2 = await organizationService.createOrganization({
      name: 'Consultoria XYZ',
      description: 'Consultoria em TI com foco em monitoramento',
      datto_api_url: 'https://xyz-api.centrastage.net',
      datto_api_key: 'XYZ456KEY',
      datto_api_secret: 'XYZ456SECRET',
      datto_platform: 'merlot',
      sync_interval_minutes: 60,
      max_devices: 200,
      max_sites: 20,
      contact_name: 'Maria Santos',
      contact_email: 'maria@consultoriaxyz.com',
      contact_phone: '(21) 88888-8888'
    });

    console.log(`✅ Organizações criadas:`);
    console.log(`  - ${org1.name} (ID: ${org1.id})`);
    console.log(`  - ${org2.name} (ID: ${org2.id})`);
    console.log('');

    // 2. Configurando Sincronização
    console.log('⚙️ 2. Configurando sincronização...');
    
    // Atualiza configurações de sincronização da Org 1
    await organizationService.updateSyncConfig(org1.id, {
      sync_enabled: true,
      sync_interval_minutes: 30,
      sync_devices: true,
      sync_sites: true,
      sync_alerts: true
    });

    // Atualiza configurações de sincronização da Org 2
    await organizationService.updateSyncConfig(org2.id, {
      sync_enabled: true,
      sync_interval_minutes: 60,
      sync_devices: true,
      sync_sites: false, // Org 2 não sincroniza sites
      sync_alerts: true
    });

    console.log('✅ Configurações de sincronização atualizadas');
    console.log('');

    // 3. Sincronizando Organizações
    console.log('🔄 3. Sincronizando organizações...');
    
    // Sincroniza organização específica
    console.log(`📡 Sincronizando organização: ${org1.name}`);
    const syncResult1 = await syncService.syncOrganization(org1.id);
    console.log('Resultado:', syncResult1);
    console.log('');

    // Sincroniza todas as organizações que precisam
    console.log('📡 Sincronizando todas as organizações...');
    const allSyncResults = await syncService.syncAllOrganizations();
    console.log('Resultados:', allSyncResults);
    console.log('');

    // 4. Consultando Dados por Organização
    console.log('💾 4. Consultando dados por organização...');
    
    // Estatísticas da Org 1
    const stats1 = await dbService.getGeneralStats(org1.id);
    console.log(`📊 Estatísticas da ${org1.name}:`, {
      dispositivos: {
        total: stats1.total_devices,
        online: stats1.online_devices,
        offline: stats1.offline_devices,
        inativos: stats1.inactive_devices
      },
      sites: {
        total: stats1.total_sites,
        ativos: stats1.active_sites,
        inativos: stats1.inactive_sites
      },
      alertas: {
        total: stats1.total_alerts,
        críticos: stats1.critical_alerts,
        avisos: stats1.warning_alerts,
        info: stats1.info_alerts
      }
    });
    console.log('');

    // Estatísticas da Org 2
    const stats2 = await dbService.getGeneralStats(org2.id);
    console.log(`📊 Estatísticas da ${org2.name}:`, {
      dispositivos: {
        total: stats2.total_devices,
        online: stats2.online_devices,
        offline: stats2.offline_devices,
        inativos: stats2.inactive_devices
      },
      sites: {
        total: stats2.total_sites,
        ativos: stats2.active_sites,
        inativos: stats2.inactive_sites
      },
      alertas: {
        total: stats2.total_alerts,
        críticos: stats2.critical_alerts,
        avisos: stats2.warning_alerts,
        info: stats2.info_alerts
      }
    });
    console.log('');

    // 5. Consultas Específicas por Organização
    console.log('🔍 5. Consultas específicas por organização...');
    
    // Dispositivos online da Org 1
    const onlineDevices1 = await dbService.getOnlineDevices(org1.id);
    console.log(`🟢 Dispositivos online da ${org1.name}: ${onlineDevices1.length}`);
    
    // Alertas críticos da Org 2
    const criticalAlerts2 = await dbService.getAlertsBySeverity(org2.id, 'critical');
    console.log(`🚨 Alertas críticos da ${org2.name}: ${criticalAlerts2.length}`);
    console.log('');

    // 6. Verificando Limites
    console.log('📏 6. Verificando limites das organizações...');
    
    const limits1 = await organizationService.checkLimits(org1.id);
    console.log(`Limites da ${org1.name}:`, limits1);
    
    const limits2 = await organizationService.checkLimits(org2.id);
    console.log(`Limites da ${org2.name}:`, limits2);
    console.log('');

    // 7. Estatísticas Globais (Admin)
    console.log('🌍 7. Estatísticas globais (admin)...');
    
    const globalStats = await dbService.getGlobalStats();
    console.log('Estatísticas globais:', globalStats);
    
    const statsByOrg = await dbService.getStatsByOrganization();
    console.log('Estatísticas por organização:', statsByOrg);
    console.log('');

    // 8. Pesquisa Global por Organização
    console.log('🔎 8. Pesquisa global por organização...');
    
    const search1 = await dbService.globalSearch(org1.id, 'servidor');
    console.log(`Resultados da pesquisa "servidor" na ${org1.name}: ${search1.total} itens`);
    
    const search2 = await dbService.globalSearch(org2.id, 'alerta');
    console.log(`Resultados da pesquisa "alerta" na ${org2.name}: ${search2.total} itens`);
    console.log('');

    // 9. Gerenciamento de Organizações
    console.log('⚙️ 9. Gerenciamento de organizações...');
    
    // Lista organizações ativas
    const activeOrgs = await organizationService.getActiveOrganizations();
    console.log(`Organizações ativas: ${activeOrgs.length}`);
    
    // Organizações que precisam de sincronização
    const orgsForSync = await organizationService.getOrganizationsForSync();
    console.log(`Organizações para sincronizar: ${orgsForSync.length}`);
    console.log('');

    // 10. Simulação de Desativação
    console.log('🔄 10. Simulando desativação de organização...');
    console.log('(Em um cenário real, organizações inativas teriam sincronização desabilitada)');
    console.log('');

    console.log('✅ Exemplo de multitenancy concluído com sucesso!');
    console.log('');
    console.log('💡 Benefícios do sistema multitenancy:');
    console.log('  - Dados completamente separados por organização');
    console.log('  - Configurações específicas por tenant');
    console.log('  - Controle de limites e recursos');
    console.log('  - Sincronização independente');
    console.log('  - Segurança e isolamento de dados');
    console.log('  - Escalabilidade para múltiplos clientes');
    console.log('  - Relatórios e estatísticas por organização');

  } catch (error) {
    console.error('❌ Erro durante o exemplo:', error.message);
  }
}

// Executa o exemplo
if (require.main === module) {
  exemploMultitenancy();
}

module.exports = { exemploMultitenancy };