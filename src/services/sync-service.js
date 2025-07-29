const DeviceService = require('./devices');
const SiteService = require('./sites');
const AlertService = require('./alerts');

/**
 * Serviço de Sincronização para Persistência de Dados da API Datto RMM
 * 
 * Gerencia a sincronização entre a API do Datto e o banco de dados local,
 * mantendo histórico e controle de status sem perder dados existentes.
 * Suporte completo a multitenancy com organizações.
 */
class SyncService {
  constructor(database) {
    this.database = database;
    this.deviceService = new DeviceService();
    this.siteService = new SiteService();
    this.alertService = new AlertService();
  }

  /**
   * Sincroniza todos os dados de uma organização específica
   * @param {number} organizationId - ID da organização
   * @returns {Promise<Object>} - Resultado da sincronização
   */
  async syncOrganization(organizationId) {
    const syncId = await this.startSyncLog(organizationId, 'full');
    
    try {
      console.log(`🔄 Iniciando sincronização da organização ${organizationId}...`);
      
      const results = {
        sites: await this.syncSites(organizationId),
        devices: await this.syncDevices(organizationId),
        alerts: await this.syncAlerts(organizationId)
      };
      
      await this.completeSyncLog(syncId, 'success', results);
      
      console.log(`✅ Sincronização da organização ${organizationId} finalizada`);
      return results;
    } catch (error) {
      await this.completeSyncLog(syncId, 'error', { error: error.message });
      throw error;
    }
  }

  /**
   * Sincroniza todas as organizações que precisam de sincronização
   * @returns {Promise<Array>} - Resultados das sincronizações
   */
  async syncAllOrganizations() {
    const organizations = await this.database.query(`
      SELECT * FROM organizations 
      WHERE is_active = 1 
        AND sync_enabled = 1 
        AND status = 'active'
        AND (
          last_sync IS NULL 
          OR last_sync < DATE_SUB(NOW(), INTERVAL sync_interval_minutes MINUTE)
        )
      ORDER BY last_sync ASC
    `);

    const results = [];
    
    for (const organization of organizations) {
      try {
        console.log(`🔄 Sincronizando organização: ${organization.name} (${organization.id})`);
        const result = await this.syncOrganization(organization.id);
        results.push({
          organization_id: organization.id,
          organization_name: organization.name,
          success: true,
          result: result
        });
      } catch (error) {
        console.error(`❌ Erro ao sincronizar organização ${organization.name}:`, error.message);
        results.push({
          organization_id: organization.id,
          organization_name: organization.name,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Sincroniza apenas dispositivos de uma organização
   * @param {number} organizationId - ID da organização
   * @returns {Promise<Object>} - Resultado da sincronização
   */
  async syncDevices(organizationId) {
    const syncId = await this.startSyncLog(organizationId, 'devices');
    
    try {
      console.log(`💻 Sincronizando dispositivos da organização ${organizationId}...`);
      
      // Obtém configurações da organização
      const organization = await this.database.query(
        'SELECT * FROM organizations WHERE id = ?',
        [organizationId]
      );

      if (!organization[0] || !organization[0].sync_devices) {
        console.log(`⏭️ Sincronização de dispositivos desabilitada para organização ${organizationId}`);
        return { created: 0, updated: 0, deactivated: 0, total: 0 };
      }

      // Configura o cliente com as credenciais da organização
      this.configureClientForOrganization(organization[0]);
      
      // Busca dispositivos da API
      const apiDevices = await this.deviceService.listDevices();
      const apiDeviceUids = new Set(apiDevices.map(d => d.uid));
      
      // Busca dispositivos do banco para esta organização
      const dbDevices = await this.database.query(
        'SELECT uid, is_active FROM devices WHERE organization_id = ?',
        [organizationId]
      );
      const dbDeviceUids = new Set(dbDevices.map(d => d.uid));
      
      let created = 0;
      let updated = 0;
      let deactivated = 0;
      
      // Processa dispositivos da API
      for (const device of apiDevices) {
        const exists = await this.database.query(
          'SELECT uid FROM devices WHERE organization_id = ? AND uid = ?',
          [organizationId, device.uid]
        );
        
        if (exists.length === 0) {
          // Novo dispositivo
          await this.createDevice(organizationId, device);
          created++;
        } else {
          // Atualiza dispositivo existente
          await this.updateDevice(organizationId, device);
          updated++;
        }
      }
      
      // Desativa dispositivos que não estão mais na API
      const devicesToDeactivate = dbDevices.filter(d => 
        d.is_active && !apiDeviceUids.has(d.uid)
      );
      
      for (const device of devicesToDeactivate) {
        await this.deactivateDevice(organizationId, device.uid);
        deactivated++;
      }
      
      const result = { created, updated, deactivated, total: apiDevices.length };
      await this.completeSyncLog(syncId, 'success', result);
      
      console.log(`✅ Dispositivos da organização ${organizationId} sincronizados: ${created} criados, ${updated} atualizados, ${deactivated} desativados`);
      return result;
    } catch (error) {
      await this.completeSyncLog(syncId, 'error', { error: error.message });
      throw error;
    }
  }

  /**
   * Sincroniza apenas sites de uma organização
   * @param {number} organizationId - ID da organização
   * @returns {Promise<Object>} - Resultado da sincronização
   */
  async syncSites(organizationId) {
    const syncId = await this.startSyncLog(organizationId, 'sites');
    
    try {
      console.log(`🏢 Sincronizando sites da organização ${organizationId}...`);
      
      // Obtém configurações da organização
      const organization = await this.database.query(
        'SELECT * FROM organizations WHERE id = ?',
        [organizationId]
      );

      if (!organization[0] || !organization[0].sync_sites) {
        console.log(`⏭️ Sincronização de sites desabilitada para organização ${organizationId}`);
        return { created: 0, updated: 0, deactivated: 0, total: 0 };
      }

      // Configura o cliente com as credenciais da organização
      this.configureClientForOrganization(organization[0]);
      
      // Busca sites da API
      const apiSites = await this.siteService.listSites();
      const apiSiteUids = new Set(apiSites.map(s => s.uid));
      
      // Busca sites do banco para esta organização
      const dbSites = await this.database.query(
        'SELECT uid, is_active FROM sites WHERE organization_id = ?',
        [organizationId]
      );
      const dbSiteUids = new Set(dbSites.map(s => s.uid));
      
      let created = 0;
      let updated = 0;
      let deactivated = 0;
      
      // Processa sites da API
      for (const site of apiSites) {
        const exists = await this.database.query(
          'SELECT uid FROM sites WHERE organization_id = ? AND uid = ?',
          [organizationId, site.uid]
        );
        
        if (exists.length === 0) {
          // Novo site
          await this.createSite(organizationId, site);
          created++;
        } else {
          // Atualiza site existente
          await this.updateSite(organizationId, site);
          updated++;
        }
      }
      
      // Desativa sites que não estão mais na API
      const sitesToDeactivate = dbSites.filter(s => 
        s.is_active && !apiSiteUids.has(s.uid)
      );
      
      for (const site of sitesToDeactivate) {
        await this.deactivateSite(organizationId, site.uid);
        deactivated++;
      }
      
      const result = { created, updated, deactivated, total: apiSites.length };
      await this.completeSyncLog(syncId, 'success', result);
      
      console.log(`✅ Sites da organização ${organizationId} sincronizados: ${created} criados, ${updated} atualizados, ${deactivated} desativados`);
      return result;
    } catch (error) {
      await this.completeSyncLog(syncId, 'error', { error: error.message });
      throw error;
    }
  }

  /**
   * Sincroniza apenas alertas de uma organização
   * @param {number} organizationId - ID da organização
   * @returns {Promise<Object>} - Resultado da sincronização
   */
  async syncAlerts(organizationId) {
    const syncId = await this.startSyncLog(organizationId, 'alerts');
    
    try {
      console.log(`🚨 Sincronizando alertas da organização ${organizationId}...`);
      
      // Obtém configurações da organização
      const organization = await this.database.query(
        'SELECT * FROM organizations WHERE id = ?',
        [organizationId]
      );

      if (!organization[0] || !organization[0].sync_alerts) {
        console.log(`⏭️ Sincronização de alertas desabilitada para organização ${organizationId}`);
        return { created: 0, updated: 0, deactivated: 0, total: 0 };
      }

      // Configura o cliente com as credenciais da organização
      this.configureClientForOrganization(organization[0]);
      
      // Busca alertas da API
      const apiAlerts = await this.alertService.listAlerts();
      const apiAlertUids = new Set(apiAlerts.map(a => a.uid));
      
      // Busca alertas do banco para esta organização
      const dbAlerts = await this.database.query(
        'SELECT uid, is_active FROM alerts WHERE organization_id = ?',
        [organizationId]
      );
      const dbAlertUids = new Set(dbAlerts.map(a => a.uid));
      
      let created = 0;
      let updated = 0;
      let deactivated = 0;
      
      // Processa alertas da API
      for (const alert of apiAlerts) {
        const exists = await this.database.query(
          'SELECT uid FROM alerts WHERE organization_id = ? AND uid = ?',
          [organizationId, alert.uid]
        );
        
        if (exists.length === 0) {
          // Novo alerta
          await this.createAlert(organizationId, alert);
          created++;
        } else {
          // Atualiza alerta existente
          await this.updateAlert(organizationId, alert);
          updated++;
        }
      }
      
      // Desativa alertas que não estão mais na API
      const alertsToDeactivate = dbAlerts.filter(a => 
        a.is_active && !apiAlertUids.has(a.uid)
      );
      
      for (const alert of alertsToDeactivate) {
        await this.deactivateAlert(organizationId, alert.uid);
        deactivated++;
      }
      
      const result = { created, updated, deactivated, total: apiAlerts.length };
      await this.completeSyncLog(syncId, 'success', result);
      
      console.log(`✅ Alertas da organização ${organizationId} sincronizados: ${created} criados, ${updated} atualizados, ${deactivated} desativados`);
      return result;
    } catch (error) {
      await this.completeSyncLog(syncId, 'error', { error: error.message });
      throw error;
    }
  }

  // ========================================
  // MÉTODOS AUXILIARES - DISPOSITIVOS
  // ========================================

  /**
   * Cria um novo dispositivo no banco para uma organização
   * @param {number} organizationId - ID da organização
   * @param {Object} deviceData - Dados do dispositivo da API
   */
  async createDevice(organizationId, deviceData) {
    const device = {
      organization_id: organizationId,
      uid: deviceData.uid,
      datto_id: deviceData.id || deviceData.uid,
      name: deviceData.name,
      type: deviceData.type,
      status: deviceData.status || 'inactive',
      is_active: true,
      last_seen_api: deviceData.lastSeen ? new Date(deviceData.lastSeen) : null,
      os: deviceData.os,
      os_version: deviceData.osVersion,
      ip_address: deviceData.ip,
      mac_address: deviceData.macAddress,
      hostname: deviceData.hostname,
      site_uid: deviceData.siteUid,
      site_name: deviceData.siteName,
      metadata: JSON.stringify(deviceData),
      custom_fields: '{}'
    };

    await this.database.query(
      `INSERT INTO devices SET ?`,
      [device]
    );

    // Registra no histórico
    await this.recordDeviceHistory(organizationId, device.uid, 'created', null, deviceData);
  }

  /**
   * Atualiza um dispositivo existente de uma organização
   * @param {number} organizationId - ID da organização
   * @param {Object} deviceData - Dados atualizados do dispositivo
   */
  async updateDevice(organizationId, deviceData) {
    const oldData = await this.database.query(
      'SELECT * FROM devices WHERE organization_id = ? AND uid = ?',
      [organizationId, deviceData.uid]
    );

    if (oldData.length === 0) return;

    const oldDevice = oldData[0];
    const newDevice = {
      name: deviceData.name,
      type: deviceData.type,
      status: deviceData.status || oldDevice.status,
      is_active: true,
      last_seen_api: deviceData.lastSeen ? new Date(deviceData.lastSeen) : oldDevice.last_seen_api,
      os: deviceData.os || oldDevice.os,
      os_version: deviceData.osVersion || oldDevice.os_version,
      ip_address: deviceData.ip || oldDevice.ip_address,
      mac_address: deviceData.macAddress || oldDevice.mac_address,
      hostname: deviceData.hostname || oldDevice.hostname,
      site_uid: deviceData.siteUid || oldDevice.site_uid,
      site_name: deviceData.siteName || oldDevice.site_name,
      metadata: JSON.stringify(deviceData),
      last_sync: new Date()
    };

    await this.database.query(
      'UPDATE devices SET ? WHERE organization_id = ? AND uid = ?',
      [newDevice, organizationId, deviceData.uid]
    );

    // Registra mudanças no histórico
    const changedFields = this.getChangedFields(oldDevice, newDevice);
    if (Object.keys(changedFields).length > 0) {
      await this.recordDeviceHistory(organizationId, deviceData.uid, 'updated', oldDevice, deviceData);
    }
  }

  /**
   * Desativa um dispositivo de uma organização (não está mais na API)
   * @param {number} organizationId - ID da organização
   * @param {string} deviceUid - UID do dispositivo
   */
  async deactivateDevice(organizationId, deviceUid) {
    const oldData = await this.database.query(
      'SELECT * FROM devices WHERE organization_id = ? AND uid = ?',
      [organizationId, deviceUid]
    );

    if (oldData.length === 0) return;

    const oldDevice = oldData[0];
    
    await this.database.query(
      'UPDATE devices SET is_active = false, status = "inactive" WHERE organization_id = ? AND uid = ?',
      [organizationId, deviceUid]
    );

    // Registra desativação no histórico
    await this.recordDeviceHistory(organizationId, deviceUid, 'deactivated', oldDevice, { status: 'inactive', is_active: false });
  }

  // ========================================
  // MÉTODOS AUXILIARES - SITES
  // ========================================

  /**
   * Cria um novo site no banco para uma organização
   * @param {number} organizationId - ID da organização
   * @param {Object} siteData - Dados do site da API
   */
  async createSite(organizationId, siteData) {
    const site = {
      organization_id: organizationId,
      uid: siteData.uid,
      datto_id: siteData.id || siteData.uid,
      name: siteData.name,
      description: siteData.description,
      status: siteData.status || 'inactive',
      is_active: true,
      address: siteData.address,
      contact_name: siteData.contactName,
      contact_email: siteData.contactEmail,
      contact_phone: siteData.contactPhone,
      device_count: siteData.deviceCount || 0,
      online_devices: siteData.onlineDevices || 0,
      offline_devices: siteData.offlineDevices || 0,
      metadata: JSON.stringify(siteData),
      custom_fields: '{}'
    };

    await this.database.query(
      'INSERT INTO sites SET ?',
      [site]
    );
  }

  /**
   * Atualiza um site existente de uma organização
   * @param {number} organizationId - ID da organização
   * @param {Object} siteData - Dados atualizados do site
   */
  async updateSite(organizationId, siteData) {
    const oldData = await this.database.query(
      'SELECT * FROM sites WHERE organization_id = ? AND uid = ?',
      [organizationId, siteData.uid]
    );

    if (oldData.length === 0) return;

    const oldSite = oldData[0];
    const newSite = {
      name: siteData.name,
      description: siteData.description,
      status: siteData.status || oldSite.status,
      is_active: true,
      address: siteData.address || oldSite.address,
      contact_name: siteData.contactName || oldSite.contact_name,
      contact_email: siteData.contactEmail || oldSite.contact_email,
      contact_phone: siteData.contactPhone || oldSite.contact_phone,
      device_count: siteData.deviceCount || oldSite.device_count,
      online_devices: siteData.onlineDevices || oldSite.online_devices,
      offline_devices: siteData.offlineDevices || oldSite.offline_devices,
      metadata: JSON.stringify(siteData),
      last_sync: new Date()
    };

    await this.database.query(
      'UPDATE sites SET ? WHERE organization_id = ? AND uid = ?',
      [newSite, organizationId, siteData.uid]
    );
  }

  /**
   * Desativa um site de uma organização (não está mais na API)
   * @param {number} organizationId - ID da organização
   * @param {string} siteUid - UID do site
   */
  async deactivateSite(organizationId, siteUid) {
    await this.database.query(
      'UPDATE sites SET is_active = false, status = "inactive" WHERE organization_id = ? AND uid = ?',
      [organizationId, siteUid]
    );
  }

  // ========================================
  // MÉTODOS AUXILIARES - ALERTAS
  // ========================================

  /**
   * Cria um novo alerta no banco para uma organização
   * @param {number} organizationId - ID da organização
   * @param {Object} alertData - Dados do alerta da API
   */
  async createAlert(organizationId, alertData) {
    const alert = {
      organization_id: organizationId,
      uid: alertData.uid,
      datto_id: alertData.id || alertData.uid,
      title: alertData.title || alertData.message,
      message: alertData.message,
      severity: alertData.severity,
      category: alertData.category,
      source: alertData.source,
      status: alertData.status || 'active',
      is_active: true,
      acknowledged: alertData.acknowledged || false,
      resolved: alertData.resolved || false,
      device_uid: alertData.deviceUid,
      device_name: alertData.deviceName,
      site_uid: alertData.siteUid,
      site_name: alertData.siteName,
      acknowledged_at: alertData.acknowledgedAt ? new Date(alertData.acknowledgedAt) : null,
      resolved_at: alertData.resolvedAt ? new Date(alertData.resolvedAt) : null,
      metadata: JSON.stringify(alertData),
      custom_fields: '{}'
    };

    await this.database.query(
      'INSERT INTO alerts SET ?',
      [alert]
    );

    // Registra no histórico
    await this.recordAlertHistory(organizationId, alert.uid, 'created', null, alertData);
  }

  /**
   * Atualiza um alerta existente de uma organização
   * @param {number} organizationId - ID da organização
   * @param {Object} alertData - Dados atualizados do alerta
   */
  async updateAlert(organizationId, alertData) {
    const oldData = await this.database.query(
      'SELECT * FROM alerts WHERE organization_id = ? AND uid = ?',
      [organizationId, alertData.uid]
    );

    if (oldData.length === 0) return;

    const oldAlert = oldData[0];
    const newAlert = {
      title: alertData.title || oldAlert.title,
      message: alertData.message || oldAlert.message,
      severity: alertData.severity || oldAlert.severity,
      category: alertData.category || oldAlert.category,
      source: alertData.source || oldAlert.source,
      status: alertData.status || oldAlert.status,
      is_active: true,
      acknowledged: alertData.acknowledged || oldAlert.acknowledged,
      resolved: alertData.resolved || oldAlert.resolved,
      device_uid: alertData.deviceUid || oldAlert.device_uid,
      device_name: alertData.deviceName || oldAlert.device_name,
      site_uid: alertData.siteUid || oldAlert.site_uid,
      site_name: alertData.siteName || oldAlert.site_name,
      acknowledged_at: alertData.acknowledgedAt ? new Date(alertData.acknowledgedAt) : oldAlert.acknowledged_at,
      resolved_at: alertData.resolvedAt ? new Date(alertData.resolvedAt) : oldAlert.resolved_at,
      metadata: JSON.stringify(alertData),
      last_sync: new Date()
    };

    await this.database.query(
      'UPDATE alerts SET ? WHERE organization_id = ? AND uid = ?',
      [newAlert, organizationId, alertData.uid]
    );

    // Registra mudanças no histórico
    const changedFields = this.getChangedFields(oldAlert, newAlert);
    if (Object.keys(changedFields).length > 0) {
      await this.recordAlertHistory(organizationId, alertData.uid, 'updated', oldAlert, alertData);
    }
  }

  /**
   * Desativa um alerta de uma organização (não está mais na API)
   * @param {number} organizationId - ID da organização
   * @param {string} alertUid - UID do alerta
   */
  async deactivateAlert(organizationId, alertUid) {
    const oldData = await this.database.query(
      'SELECT * FROM alerts WHERE organization_id = ? AND uid = ?',
      [organizationId, alertUid]
    );

    if (oldData.length === 0) return;

    const oldAlert = oldData[0];
    
    await this.database.query(
      'UPDATE alerts SET is_active = false, status = "inactive" WHERE organization_id = ? AND uid = ?',
      [organizationId, alertUid]
    );

    // Registra desativação no histórico
    await this.recordAlertHistory(organizationId, alertUid, 'deactivated', oldAlert, { status: 'inactive', is_active: false });
  }

  // ========================================
  // MÉTODOS AUXILIARES - HISTÓRICO
  // ========================================

  /**
   * Registra mudança no histórico de dispositivos
   */
  async recordDeviceHistory(organizationId, deviceUid, action, oldData, newData) {
    const history = {
      organization_id: organizationId,
      device_uid: deviceUid,
      action: action,
      old_status: oldData?.status || null,
      new_status: newData?.status || null,
      old_data: oldData ? JSON.stringify(oldData) : null,
      new_data: JSON.stringify(newData),
      changed_fields: JSON.stringify(this.getChangedFields(oldData || {}, newData))
    };

    await this.database.query(
      'INSERT INTO device_history SET ?',
      [history]
    );
  }

  /**
   * Registra mudança no histórico de alertas
   */
  async recordAlertHistory(organizationId, alertUid, action, oldData, newData) {
    const history = {
      organization_id: organizationId,
      alert_uid: alertUid,
      action: action,
      old_status: oldData?.status || null,
      new_status: newData?.status || null,
      old_data: oldData ? JSON.stringify(oldData) : null,
      new_data: JSON.stringify(newData),
      changed_fields: JSON.stringify(this.getChangedFields(oldData || {}, newData))
    };

    await this.database.query(
      'INSERT INTO alert_history SET ?',
      [history]
    );
  }

  // ========================================
  // MÉTODOS AUXILIARES - LOG DE SINCRONIZAÇÃO
  // ========================================

  /**
   * Inicia um log de sincronização
   */
  async startSyncLog(organizationId, syncType) {
    const log = {
      organization_id: organizationId,
      sync_type: syncType,
      status: 'running',
      started_at: new Date()
    };

    const result = await this.database.query(
      'INSERT INTO sync_log SET ?',
      [log]
    );

    return result.insertId;
  }

  /**
   * Completa um log de sincronização
   */
  async completeSyncLog(syncId, status, results) {
    const duration = Math.floor((Date.now() - new Date()) / 1000);
    
    const update = {
      status: status,
      items_processed: results.total || 0,
      items_updated: results.updated || 0,
      items_created: results.created || 0,
      items_deactivated: results.deactivated || 0,
      error_message: results.error || null,
      completed_at: new Date(),
      duration_seconds: duration
    };

    await this.database.query(
      'UPDATE sync_log SET ? WHERE id = ?',
      [update, syncId]
    );
  }

  // ========================================
  // MÉTODOS AUXILIARES - CONFIGURAÇÃO
  // ========================================

  /**
   * Configura o cliente da API para uma organização específica
   * @param {Object} organization - Dados da organização
   */
  configureClientForOrganization(organization) {
    // Atualiza as configurações dos serviços com as credenciais da organização
    if (organization.datto_api_url) {
      this.deviceService.client.baseURL = organization.datto_api_url;
      this.siteService.client.baseURL = organization.datto_api_url;
      this.alertService.client.baseURL = organization.datto_api_url;
    }

    if (organization.datto_api_key && organization.datto_api_secret) {
      this.deviceService.client.apiKey = organization.datto_api_key;
      this.deviceService.client.apiSecret = organization.datto_api_secret;
      this.siteService.client.apiKey = organization.datto_api_key;
      this.siteService.client.apiSecret = organization.datto_api_secret;
      this.alertService.client.apiKey = organization.datto_api_key;
      this.alertService.client.apiSecret = organization.datto_api_secret;
    }
  }

  // ========================================
  // MÉTODOS AUXILIARES - UTILITÁRIOS
  // ========================================

  /**
   * Compara dois objetos e retorna os campos que mudaram
   */
  getChangedFields(oldData, newData) {
    const changes = {};
    
    for (const key in newData) {
      if (oldData[key] !== newData[key]) {
        changes[key] = {
          old: oldData[key],
          new: newData[key]
        };
      }
    }
    
    return changes;
  }

  /**
   * Obtém estatísticas de sincronização por organização
   */
  async getSyncStats(organizationId = null) {
    let query = `
      SELECT 
        organization_id,
        sync_type,
        status,
        COUNT(*) as count,
        AVG(duration_seconds) as avg_duration,
        MAX(started_at) as last_sync,
        SUM(items_processed) as total_processed,
        SUM(items_created) as total_created,
        SUM(items_updated) as total_updated,
        SUM(items_deactivated) as total_deactivated
      FROM sync_log 
    `;

    const params = [];
    if (organizationId) {
      query += ' WHERE organization_id = ?';
      params.push(organizationId);
    }

    query += ' GROUP BY organization_id, sync_type, status ORDER BY organization_id, sync_type, last_sync DESC';

    return await this.database.query(query, params);
  }

  /**
   * Obtém status dos dados sincronizados por organização
   */
  async getDataStatus(organizationId = null) {
    let query = `
      SELECT 
        organization_id,
        'devices' as table_name,
        COUNT(*) as total,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'online' THEN 1 ELSE 0 END) as online,
        SUM(CASE WHEN status = 'offline' THEN 1 ELSE 0 END) as offline,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive
      FROM devices
    `;

    const params = [];
    if (organizationId) {
      query += ' WHERE organization_id = ?';
      params.push(organizationId);
    }

    query += `
      GROUP BY organization_id
      UNION ALL
      SELECT 
        organization_id,
        'sites' as table_name,
        COUNT(*) as total,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as online,
        0 as offline,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive
      FROM sites
    `;

    if (organizationId) {
      query += ' WHERE organization_id = ?';
      params.push(organizationId);
    }

    query += `
      GROUP BY organization_id
      UNION ALL
      SELECT 
        organization_id,
        'alerts' as table_name,
        COUNT(*) as total,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as online,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as offline,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive
      FROM alerts
    `;

    if (organizationId) {
      query += ' WHERE organization_id = ?';
      params.push(organizationId);
    }

    query += ' GROUP BY organization_id';

    return await this.database.query(query, params);
  }
}

module.exports = SyncService;