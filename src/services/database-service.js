/**
 * Serviço de Banco de Dados para Consultas Locais
 * 
 * Fornece métodos para consultar dados persistidos localmente
 * com filtros e ordenação avançados
 * Suporte completo a multitenancy com organizações
 */
class DatabaseService {
  constructor(database) {
    this.database = database;
  }

  // ========================================
  // CONSULTAS DE DISPOSITIVOS
  // ========================================

  /**
   * Lista dispositivos com filtros
   * @param {number} organizationId - ID da organização
   * @param {Object} filters - Filtros de consulta
   * @returns {Promise<Array>} - Lista de dispositivos
   */
  async getDevices(organizationId, filters = {}) {
    let query = 'SELECT * FROM devices WHERE organization_id = ?';
    const params = [organizationId];

    // Filtros
    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.type) {
      query += ' AND type = ?';
      params.push(filters.type);
    }

    if (filters.is_active !== undefined) {
      query += ' AND is_active = ?';
      params.push(filters.is_active);
    }

    if (filters.site_uid) {
      query += ' AND site_uid = ?';
      params.push(filters.site_uid);
    }

    if (filters.search) {
      query += ' AND (name LIKE ? OR hostname LIKE ? OR ip_address LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Ordenação
    query += ' ORDER BY ';
    if (filters.orderBy) {
      query += filters.orderBy;
    } else {
      query += 'name ASC';
    }

    // Paginação
    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(filters.limit));
    }

    if (filters.offset) {
      query += ' OFFSET ?';
      params.push(parseInt(filters.offset));
    }

    return await this.database.query(query, params);
  }

  /**
   * Obtém dispositivo específico
   * @param {number} organizationId - ID da organização
   * @param {string} deviceUid - UID do dispositivo
   * @returns {Promise<Object>} - Dispositivo
   */
  async getDevice(organizationId, deviceUid) {
    const devices = await this.database.query(
      'SELECT * FROM devices WHERE organization_id = ? AND uid = ?',
      [organizationId, deviceUid]
    );
    return devices[0] || null;
  }

  /**
   * Obtém dispositivos online
   * @param {number} organizationId - ID da organização
   * @returns {Promise<Array>} - Dispositivos online
   */
  async getOnlineDevices(organizationId) {
    return await this.database.query(
      'SELECT * FROM devices WHERE organization_id = ? AND status = "online" AND is_active = 1',
      [organizationId]
    );
  }

  /**
   * Obtém dispositivos offline
   * @param {number} organizationId - ID da organização
   * @returns {Promise<Array>} - Dispositivos offline
   */
  async getOfflineDevices(organizationId) {
    return await this.database.query(
      'SELECT * FROM devices WHERE organization_id = ? AND status = "offline" AND is_active = 1',
      [organizationId]
    );
  }

  /**
   * Obtém dispositivos inativos
   * @param {number} organizationId - ID da organização
   * @returns {Promise<Array>} - Dispositivos inativos
   */
  async getInactiveDevices(organizationId) {
    return await this.database.query(
      'SELECT * FROM devices WHERE organization_id = ? AND (status = "inactive" OR is_active = 0)',
      [organizationId]
    );
  }

  /**
   * Obtém dispositivos por site
   * @param {number} organizationId - ID da organização
   * @param {string} siteUid - UID do site
   * @returns {Promise<Array>} - Dispositivos do site
   */
  async getDevicesBySite(organizationId, siteUid) {
    return await this.database.query(
      'SELECT * FROM devices WHERE organization_id = ? AND site_uid = ? ORDER BY name ASC',
      [organizationId, siteUid]
    );
  }

  /**
   * Obtém histórico de um dispositivo
   * @param {number} organizationId - ID da organização
   * @param {string} deviceUid - UID do dispositivo
   * @param {Object} filters - Filtros opcionais
   * @returns {Promise<Array>} - Histórico do dispositivo
   */
  async getDeviceHistory(organizationId, deviceUid, filters = {}) {
    let query = 'SELECT * FROM device_history WHERE organization_id = ? AND device_uid = ?';
    const params = [organizationId, deviceUid];

    if (filters.action) {
      query += ' AND action = ?';
      params.push(filters.action);
    }

    query += ' ORDER BY created_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(filters.limit));
    }

    return await this.database.query(query, params);
  }

  // ========================================
  // CONSULTAS DE SITES
  // ========================================

  /**
   * Lista sites com filtros
   * @param {number} organizationId - ID da organização
   * @param {Object} filters - Filtros de consulta
   * @returns {Promise<Array>} - Lista de sites
   */
  async getSites(organizationId, filters = {}) {
    let query = 'SELECT * FROM sites WHERE organization_id = ?';
    const params = [organizationId];

    // Filtros
    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.is_active !== undefined) {
      query += ' AND is_active = ?';
      params.push(filters.is_active);
    }

    if (filters.search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm);
    }

    // Ordenação
    query += ' ORDER BY ';
    if (filters.orderBy) {
      query += filters.orderBy;
    } else {
      query += 'name ASC';
    }

    // Paginação
    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(filters.limit));
    }

    if (filters.offset) {
      query += ' OFFSET ?';
      params.push(parseInt(filters.offset));
    }

    return await this.database.query(query, params);
  }

  /**
   * Obtém site específico
   * @param {number} organizationId - ID da organização
   * @param {string} siteUid - UID do site
   * @returns {Promise<Object>} - Site
   */
  async getSite(organizationId, siteUid) {
    const sites = await this.database.query(
      'SELECT * FROM sites WHERE organization_id = ? AND uid = ?',
      [organizationId, siteUid]
    );
    return sites[0] || null;
  }

  /**
   * Obtém sites ativos
   * @param {number} organizationId - ID da organização
   * @returns {Promise<Array>} - Sites ativos
   */
  async getActiveSites(organizationId) {
    return await this.database.query(
      'SELECT * FROM sites WHERE organization_id = ? AND status = "active" AND is_active = 1',
      [organizationId]
    );
  }

  /**
   * Obtém sites inativos
   * @param {number} organizationId - ID da organização
   * @returns {Promise<Array>} - Sites inativos
   */
  async getInactiveSites(organizationId) {
    return await this.database.query(
      'SELECT * FROM sites WHERE organization_id = ? AND (status = "inactive" OR is_active = 0)',
      [organizationId]
    );
  }

  // ========================================
  // CONSULTAS DE ALERTAS
  // ========================================

  /**
   * Lista alertas com filtros
   * @param {number} organizationId - ID da organização
   * @param {Object} filters - Filtros de consulta
   * @returns {Promise<Array>} - Lista de alertas
   */
  async getAlerts(organizationId, filters = {}) {
    let query = 'SELECT * FROM alerts WHERE organization_id = ?';
    const params = [organizationId];

    // Filtros
    if (filters.severity) {
      query += ' AND severity = ?';
      params.push(filters.severity);
    }

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.acknowledged !== undefined) {
      query += ' AND acknowledged = ?';
      params.push(filters.acknowledged);
    }

    if (filters.resolved !== undefined) {
      query += ' AND resolved = ?';
      params.push(filters.resolved);
    }

    if (filters.is_active !== undefined) {
      query += ' AND is_active = ?';
      params.push(filters.is_active);
    }

    if (filters.device_uid) {
      query += ' AND device_uid = ?';
      params.push(filters.device_uid);
    }

    if (filters.site_uid) {
      query += ' AND site_uid = ?';
      params.push(filters.site_uid);
    }

    if (filters.search) {
      query += ' AND (title LIKE ? OR message LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm);
    }

    // Ordenação
    query += ' ORDER BY ';
    if (filters.orderBy) {
      query += filters.orderBy;
    } else {
      query += 'created_at DESC';
    }

    // Paginação
    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(filters.limit));
    }

    if (filters.offset) {
      query += ' OFFSET ?';
      params.push(parseInt(filters.offset));
    }

    return await this.database.query(query, params);
  }

  /**
   * Obtém alerta específico
   * @param {number} organizationId - ID da organização
   * @param {string} alertUid - UID do alerta
   * @returns {Promise<Object>} - Alerta
   */
  async getAlert(organizationId, alertUid) {
    const alerts = await this.database.query(
      'SELECT * FROM alerts WHERE organization_id = ? AND uid = ?',
      [organizationId, alertUid]
    );
    return alerts[0] || null;
  }

  /**
   * Obtém alertas por severidade
   * @param {number} organizationId - ID da organização
   * @param {string} severity - Severidade (critical, warning, info)
   * @returns {Promise<Array>} - Alertas da severidade
   */
  async getAlertsBySeverity(organizationId, severity) {
    return await this.database.query(
      'SELECT * FROM alerts WHERE organization_id = ? AND severity = ? AND is_active = 1 ORDER BY created_at DESC',
      [organizationId, severity]
    );
  }

  /**
   * Obtém alertas não reconhecidos
   * @param {number} organizationId - ID da organização
   * @returns {Promise<Array>} - Alertas não reconhecidos
   */
  async getUnacknowledgedAlerts(organizationId) {
    return await this.database.query(
      'SELECT * FROM alerts WHERE organization_id = ? AND acknowledged = 0 AND is_active = 1 ORDER BY created_at DESC',
      [organizationId]
    );
  }

  /**
   * Obtém alertas reconhecidos
   * @param {number} organizationId - ID da organização
   * @returns {Promise<Array>} - Alertas reconhecidos
   */
  async getAcknowledgedAlerts(organizationId) {
    return await this.database.query(
      'SELECT * FROM alerts WHERE organization_id = ? AND acknowledged = 1 AND is_active = 1 ORDER BY created_at DESC',
      [organizationId]
    );
  }

  /**
   * Obtém alertas ativos
   * @param {number} organizationId - ID da organização
   * @returns {Promise<Array>} - Alertas ativos
   */
  async getActiveAlerts(organizationId) {
    return await this.database.query(
      'SELECT * FROM alerts WHERE organization_id = ? AND status = "active" AND is_active = 1 ORDER BY created_at DESC',
      [organizationId]
    );
  }

  /**
   * Obtém alertas resolvidos
   * @param {number} organizationId - ID da organização
   * @returns {Promise<Array>} - Alertas resolvidos
   */
  async getResolvedAlerts(organizationId) {
    return await this.database.query(
      'SELECT * FROM alerts WHERE organization_id = ? AND status = "resolved" AND is_active = 1 ORDER BY created_at DESC',
      [organizationId]
    );
  }

  /**
   * Obtém alertas inativos
   * @param {number} organizationId - ID da organização
   * @returns {Promise<Array>} - Alertas inativos
   */
  async getInactiveAlerts(organizationId) {
    return await this.database.query(
      'SELECT * FROM alerts WHERE organization_id = ? AND (status = "inactive" OR is_active = 0) ORDER BY created_at DESC',
      [organizationId]
    );
  }

  /**
   * Obtém histórico de um alerta
   * @param {number} organizationId - ID da organização
   * @param {string} alertUid - UID do alerta
   * @param {Object} filters - Filtros opcionais
   * @returns {Promise<Array>} - Histórico do alerta
   */
  async getAlertHistory(organizationId, alertUid, filters = {}) {
    let query = 'SELECT * FROM alert_history WHERE organization_id = ? AND alert_uid = ?';
    const params = [organizationId, alertUid];

    if (filters.action) {
      query += ' AND action = ?';
      params.push(filters.action);
    }

    query += ' ORDER BY created_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(filters.limit));
    }

    return await this.database.query(query, params);
  }

  // ========================================
  // CONSULTAS DE ESTATÍSTICAS
  // ========================================

  /**
   * Obtém estatísticas gerais de uma organização
   * @param {number} organizationId - ID da organização
   * @returns {Promise<Object>} - Estatísticas
   */
  async getGeneralStats(organizationId) {
    const stats = await this.database.query(`
      SELECT 
        (SELECT COUNT(*) FROM devices WHERE organization_id = ?) as total_devices,
        (SELECT COUNT(*) FROM devices WHERE organization_id = ? AND status = 'online' AND is_active = 1) as online_devices,
        (SELECT COUNT(*) FROM devices WHERE organization_id = ? AND status = 'offline' AND is_active = 1) as offline_devices,
        (SELECT COUNT(*) FROM devices WHERE organization_id = ? AND (status = 'inactive' OR is_active = 0)) as inactive_devices,
        (SELECT COUNT(*) FROM sites WHERE organization_id = ?) as total_sites,
        (SELECT COUNT(*) FROM sites WHERE organization_id = ? AND status = 'active' AND is_active = 1) as active_sites,
        (SELECT COUNT(*) FROM sites WHERE organization_id = ? AND (status = 'inactive' OR is_active = 0)) as inactive_sites,
        (SELECT COUNT(*) FROM alerts WHERE organization_id = ?) as total_alerts,
        (SELECT COUNT(*) FROM alerts WHERE organization_id = ? AND severity = 'critical' AND is_active = 1) as critical_alerts,
        (SELECT COUNT(*) FROM alerts WHERE organization_id = ? AND severity = 'warning' AND is_active = 1) as warning_alerts,
        (SELECT COUNT(*) FROM alerts WHERE organization_id = ? AND severity = 'info' AND is_active = 1) as info_alerts,
        (SELECT COUNT(*) FROM alerts WHERE organization_id = ? AND status = 'active' AND is_active = 1) as active_alerts,
        (SELECT COUNT(*) FROM alerts WHERE organization_id = ? AND status = 'resolved' AND is_active = 1) as resolved_alerts,
        (SELECT COUNT(*) FROM alerts WHERE organization_id = ? AND acknowledged = 0 AND is_active = 1) as unacknowledged_alerts
    `, [
      organizationId, organizationId, organizationId, organizationId,
      organizationId, organizationId, organizationId,
      organizationId, organizationId, organizationId, organizationId,
      organizationId, organizationId, organizationId
    ]);

    return stats[0];
  }

  /**
   * Obtém estatísticas por site de uma organização
   * @param {number} organizationId - ID da organização
   * @returns {Promise<Array>} - Estatísticas por site
   */
  async getStatsBySite(organizationId) {
    return await this.database.query(`
      SELECT 
        s.uid,
        s.name,
        s.status as site_status,
        s.device_count,
        s.online_devices,
        s.offline_devices,
        COUNT(d.uid) as actual_devices,
        COUNT(CASE WHEN d.status = 'online' THEN 1 END) as actual_online,
        COUNT(CASE WHEN d.status = 'offline' THEN 1 END) as actual_offline,
        COUNT(a.uid) as total_alerts,
        COUNT(CASE WHEN a.severity = 'critical' THEN 1 END) as critical_alerts,
        COUNT(CASE WHEN a.severity = 'warning' THEN 1 END) as warning_alerts,
        COUNT(CASE WHEN a.severity = 'info' THEN 1 END) as info_alerts
      FROM sites s
      LEFT JOIN devices d ON s.organization_id = d.organization_id AND s.uid = d.site_uid
      LEFT JOIN alerts a ON s.organization_id = a.organization_id AND s.uid = a.site_uid
      WHERE s.organization_id = ?
      GROUP BY s.uid, s.name, s.status, s.device_count, s.online_devices, s.offline_devices
      ORDER BY s.name ASC
    `, [organizationId]);
  }

  /**
   * Obtém estatísticas de sincronização de uma organização
   * @param {number} organizationId - ID da organização
   * @returns {Promise<Array>} - Estatísticas de sincronização
   */
  async getSyncStats(organizationId) {
    return await this.database.query(`
      SELECT 
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
      WHERE organization_id = ?
      GROUP BY sync_type, status
      ORDER BY sync_type, last_sync DESC
    `, [organizationId]);
  }

  // ========================================
  // CONSULTAS DE RELACIONAMENTOS
  // ========================================

  /**
   * Obtém dispositivo com alertas
   * @param {number} organizationId - ID da organização
   * @param {string} deviceUid - UID do dispositivo
   * @returns {Promise<Object>} - Dispositivo com alertas
   */
  async getDeviceWithAlerts(organizationId, deviceUid) {
    const device = await this.getDevice(organizationId, deviceUid);
    if (!device) return null;

    const alerts = await this.database.query(
      'SELECT * FROM alerts WHERE organization_id = ? AND device_uid = ? ORDER BY created_at DESC',
      [organizationId, deviceUid]
    );

    return {
      ...device,
      alerts: alerts
    };
  }

  /**
   * Obtém site com dispositivos e alertas
   * @param {number} organizationId - ID da organização
   * @param {string} siteUid - UID do site
   * @returns {Promise<Object>} - Site com dispositivos e alertas
   */
  async getSiteWithDetails(organizationId, siteUid) {
    const site = await this.getSite(organizationId, siteUid);
    if (!site) return null;

    const devices = await this.getDevicesBySite(organizationId, siteUid);
    const alerts = await this.database.query(
      'SELECT * FROM alerts WHERE organization_id = ? AND site_uid = ? ORDER BY created_at DESC',
      [organizationId, siteUid]
    );

    return {
      ...site,
      devices: devices,
      alerts: alerts
    };
  }

  // ========================================
  // CONSULTAS DE PESQUISA
  // ========================================

  /**
   * Pesquisa global em dispositivos, sites e alertas de uma organização
   * @param {number} organizationId - ID da organização
   * @param {string} searchTerm - Termo de busca
   * @returns {Promise<Object>} - Resultados da pesquisa
   */
  async globalSearch(organizationId, searchTerm) {
    const term = `%${searchTerm}%`;

    const devices = await this.database.query(
      'SELECT uid, name, type, status, site_name FROM devices WHERE organization_id = ? AND (name LIKE ? OR hostname LIKE ? OR ip_address LIKE ?)',
      [organizationId, term, term, term]
    );

    const sites = await this.database.query(
      'SELECT uid, name, description, status FROM sites WHERE organization_id = ? AND (name LIKE ? OR description LIKE ?)',
      [organizationId, term, term]
    );

    const alerts = await this.database.query(
      'SELECT uid, title, message, severity, status, device_name, site_name FROM alerts WHERE organization_id = ? AND (title LIKE ? OR message LIKE ?)',
      [organizationId, term, term]
    );

    return {
      devices: devices,
      sites: sites,
      alerts: alerts,
      total: devices.length + sites.length + alerts.length
    };
  }

  // ========================================
  // CONSULTAS GLOBAIS (ADMIN)
  // ========================================

  /**
   * Obtém estatísticas globais de todas as organizações
   * @returns {Promise<Object>} - Estatísticas globais
   */
  async getGlobalStats() {
    const stats = await this.database.query(`
      SELECT 
        COUNT(DISTINCT o.id) as total_organizations,
        SUM(CASE WHEN o.is_active = 1 THEN 1 ELSE 0 END) as active_organizations,
        SUM(CASE WHEN o.sync_enabled = 1 THEN 1 ELSE 0 END) as sync_enabled_organizations,
        SUM(CASE WHEN o.status = 'active' THEN 1 ELSE 0 END) as active_status_organizations,
        (SELECT COUNT(*) FROM devices) as total_devices,
        (SELECT COUNT(*) FROM sites) as total_sites,
        (SELECT COUNT(*) FROM alerts) as total_alerts,
        (SELECT COUNT(*) FROM users) as total_users
      FROM organizations o
    `);

    return stats[0];
  }

  /**
   * Obtém estatísticas por organização
   * @returns {Promise<Array>} - Estatísticas por organização
   */
  async getStatsByOrganization() {
    return await this.database.query(`
      SELECT 
        o.id,
        o.name,
        o.status,
        o.is_active,
        o.sync_enabled,
        o.last_sync,
        COUNT(d.uid) as total_devices,
        COUNT(CASE WHEN d.is_active = 1 THEN 1 END) as active_devices,
        COUNT(CASE WHEN d.status = 'online' THEN 1 END) as online_devices,
        COUNT(CASE WHEN d.status = 'offline' THEN 1 END) as offline_devices,
        COUNT(s.uid) as total_sites,
        COUNT(CASE WHEN s.is_active = 1 THEN 1 END) as active_sites,
        COUNT(a.uid) as total_alerts,
        COUNT(CASE WHEN a.is_active = 1 THEN 1 END) as active_alerts,
        COUNT(CASE WHEN a.severity = 'critical' THEN 1 END) as critical_alerts,
        COUNT(CASE WHEN a.severity = 'warning' THEN 1 END) as warning_alerts,
        COUNT(CASE WHEN a.severity = 'info' THEN 1 END) as info_alerts,
        COUNT(u.uid) as total_users,
        COUNT(CASE WHEN u.is_active = 1 THEN 1 END) as active_users
      FROM organizations o
      LEFT JOIN devices d ON o.id = d.organization_id
      LEFT JOIN sites s ON o.id = s.organization_id
      LEFT JOIN alerts a ON o.id = a.organization_id
      LEFT JOIN users u ON o.id = u.organization_id
      GROUP BY o.id, o.name, o.status, o.is_active, o.sync_enabled, o.last_sync
      ORDER BY o.name ASC
    `);
  }
}

module.exports = DatabaseService;