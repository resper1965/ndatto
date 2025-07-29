/**
 * Serviço de Gerenciamento de Organizações
 * 
 * Gerencia organizações (tenants) no sistema multitenancy
 * com configurações específicas para cada organização
 */
class OrganizationService {
  constructor(database) {
    this.database = database;
  }

  // ========================================
  // CRUD DE ORGANIZAÇÕES
  // ========================================

  /**
   * Cria uma nova organização
   * @param {Object} organizationData - Dados da organização
   * @returns {Promise<Object>} - Organização criada
   */
  async createOrganization(organizationData) {
    const organization = {
      uid: organizationData.uid || this.generateUid(),
      name: organizationData.name,
      slug: organizationData.slug || this.generateSlug(organizationData.name),
      description: organizationData.description,
      datto_api_url: organizationData.datto_api_url,
      datto_api_key: organizationData.datto_api_key,
      datto_api_secret: organizationData.datto_api_secret,
      datto_platform: organizationData.datto_platform,
      status: organizationData.status || 'active',
      is_active: organizationData.is_active !== false,
      sync_enabled: organizationData.sync_enabled !== false,
      sync_interval_minutes: organizationData.sync_interval_minutes || 60,
      sync_devices: organizationData.sync_devices !== false,
      sync_sites: organizationData.sync_sites !== false,
      sync_alerts: organizationData.sync_alerts !== false,
      max_devices: organizationData.max_devices || 1000,
      max_sites: organizationData.max_sites || 100,
      max_alerts_history: organizationData.max_alerts_history || 10000,
      contact_name: organizationData.contact_name,
      contact_email: organizationData.contact_email,
      contact_phone: organizationData.contact_phone,
      metadata: JSON.stringify(organizationData.metadata || {}),
      custom_fields: JSON.stringify(organizationData.custom_fields || {})
    };

    const result = await this.database.query(
      'INSERT INTO organizations SET ?',
      [organization]
    );

    return { ...organization, id: result.insertId };
  }

  /**
   * Obtém uma organização por ID
   * @param {number} organizationId - ID da organização
   * @returns {Promise<Object>} - Organização
   */
  async getOrganization(organizationId) {
    const organizations = await this.database.query(
      'SELECT * FROM organizations WHERE id = ?',
      [organizationId]
    );
    return organizations[0] || null;
  }

  /**
   * Obtém uma organização por UID
   * @param {string} organizationUid - UID da organização
   * @returns {Promise<Object>} - Organização
   */
  async getOrganizationByUid(organizationUid) {
    const organizations = await this.database.query(
      'SELECT * FROM organizations WHERE uid = ?',
      [organizationUid]
    );
    return organizations[0] || null;
  }

  /**
   * Obtém uma organização por slug
   * @param {string} slug - Slug da organização
   * @returns {Promise<Object>} - Organização
   */
  async getOrganizationBySlug(slug) {
    const organizations = await this.database.query(
      'SELECT * FROM organizations WHERE slug = ?',
      [slug]
    );
    return organizations[0] || null;
  }

  /**
   * Lista organizações com filtros
   * @param {Object} filters - Filtros de consulta
   * @returns {Promise<Array>} - Lista de organizações
   */
  async getOrganizations(filters = {}) {
    let query = 'SELECT * FROM organizations WHERE 1=1';
    const params = [];

    // Filtros
    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.is_active !== undefined) {
      query += ' AND is_active = ?';
      params.push(filters.is_active);
    }

    if (filters.sync_enabled !== undefined) {
      query += ' AND sync_enabled = ?';
      params.push(filters.sync_enabled);
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
   * Atualiza uma organização
   * @param {number} organizationId - ID da organização
   * @param {Object} updateData - Dados para atualizar
   * @returns {Promise<Object>} - Organização atualizada
   */
  async updateOrganization(organizationId, updateData) {
    const allowedFields = [
      'name', 'description', 'datto_api_url', 'datto_api_key', 'datto_api_secret',
      'datto_platform', 'status', 'is_active', 'sync_enabled', 'sync_interval_minutes',
      'sync_devices', 'sync_sites', 'sync_alerts', 'max_devices', 'max_sites',
      'max_alerts_history', 'contact_name', 'contact_email', 'contact_phone',
      'metadata', 'custom_fields'
    ];

    const updateFields = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        if (field === 'metadata' || field === 'custom_fields') {
          updateFields[field] = JSON.stringify(updateData[field]);
        } else {
          updateFields[field] = updateData[field];
        }
      }
    }

    if (Object.keys(updateFields).length === 0) {
      return await this.getOrganization(organizationId);
    }

    await this.database.query(
      'UPDATE organizations SET ? WHERE id = ?',
      [updateFields, organizationId]
    );

    return await this.getOrganization(organizationId);
  }

  /**
   * Desativa uma organização
   * @param {number} organizationId - ID da organização
   * @returns {Promise<Object>} - Organização desativada
   */
  async deactivateOrganization(organizationId) {
    await this.database.query(
      'UPDATE organizations SET is_active = false, status = "inactive" WHERE id = ?',
      [organizationId]
    );

    return await this.getOrganization(organizationId);
  }

  /**
   * Remove uma organização e todos os seus dados
   * @param {number} organizationId - ID da organização
   * @returns {Promise<boolean>} - Sucesso da operação
   */
  async deleteOrganization(organizationId) {
    // Remove todos os dados da organização (CASCADE)
    await this.database.query(
      'DELETE FROM organizations WHERE id = ?',
      [organizationId]
    );

    return true;
  }

  // ========================================
  // CONFIGURAÇÕES DE SINCRONIZAÇÃO
  // ========================================

  /**
   * Obtém configurações de sincronização de uma organização
   * @param {number} organizationId - ID da organização
   * @returns {Promise<Object>} - Configurações de sincronização
   */
  async getSyncConfig(organizationId) {
    const organization = await this.getOrganization(organizationId);
    if (!organization) return null;

    return {
      sync_enabled: organization.sync_enabled,
      sync_interval_minutes: organization.sync_interval_minutes,
      sync_devices: organization.sync_devices,
      sync_sites: organization.sync_sites,
      sync_alerts: organization.sync_alerts,
      datto_api_url: organization.datto_api_url,
      datto_api_key: organization.datto_api_key,
      datto_api_secret: organization.datto_api_secret,
      datto_platform: organization.datto_platform,
      last_sync: organization.last_sync
    };
  }

  /**
   * Atualiza configurações de sincronização
   * @param {number} organizationId - ID da organização
   * @param {Object} syncConfig - Configurações de sincronização
   * @returns {Promise<Object>} - Configurações atualizadas
   */
  async updateSyncConfig(organizationId, syncConfig) {
    const updateData = {
      sync_enabled: syncConfig.sync_enabled,
      sync_interval_minutes: syncConfig.sync_interval_minutes,
      sync_devices: syncConfig.sync_devices,
      sync_sites: syncConfig.sync_sites,
      sync_alerts: syncConfig.sync_alerts,
      datto_api_url: syncConfig.datto_api_url,
      datto_api_key: syncConfig.datto_api_key,
      datto_api_secret: syncConfig.datto_api_secret,
      datto_platform: syncConfig.datto_platform
    };

    await this.updateOrganization(organizationId, updateData);
    return await this.getSyncConfig(organizationId);
  }

  /**
   * Atualiza a última sincronização de uma organização
   * @param {number} organizationId - ID da organização
   * @returns {Promise<void>}
   */
  async updateLastSync(organizationId) {
    await this.database.query(
      'UPDATE organizations SET last_sync = NOW() WHERE id = ?',
      [organizationId]
    );
  }

  // ========================================
  // ESTATÍSTICAS E LIMITES
  // ========================================

  /**
   * Obtém estatísticas de uma organização
   * @param {number} organizationId - ID da organização
   * @returns {Promise<Object>} - Estatísticas
   */
  async getOrganizationStats(organizationId) {
    const stats = await this.database.query(`
      SELECT 
        o.id,
        o.name,
        o.status,
        o.is_active,
        o.sync_enabled,
        o.last_sync,
        o.max_devices,
        o.max_sites,
        o.max_alerts_history,
        (SELECT COUNT(*) FROM devices d WHERE d.organization_id = o.id) as total_devices,
        (SELECT COUNT(*) FROM devices d WHERE d.organization_id = o.id AND d.is_active = 1) as active_devices,
        (SELECT COUNT(*) FROM devices d WHERE d.organization_id = o.id AND d.status = 'online') as online_devices,
        (SELECT COUNT(*) FROM devices d WHERE d.organization_id = o.id AND d.status = 'offline') as offline_devices,
        (SELECT COUNT(*) FROM sites s WHERE s.organization_id = o.id) as total_sites,
        (SELECT COUNT(*) FROM sites s WHERE s.organization_id = o.id AND s.is_active = 1) as active_sites,
        (SELECT COUNT(*) FROM alerts a WHERE a.organization_id = o.id) as total_alerts,
        (SELECT COUNT(*) FROM alerts a WHERE a.organization_id = o.id AND a.is_active = 1) as active_alerts,
        (SELECT COUNT(*) FROM alerts a WHERE a.organization_id = o.id AND a.severity = 'critical') as critical_alerts,
        (SELECT COUNT(*) FROM alerts a WHERE a.organization_id = o.id AND a.severity = 'warning') as warning_alerts,
        (SELECT COUNT(*) FROM alerts a WHERE a.organization_id = o.id AND a.severity = 'info') as info_alerts,
        (SELECT COUNT(*) FROM users u WHERE u.organization_id = o.id) as total_users,
        (SELECT COUNT(*) FROM users u WHERE u.organization_id = o.id AND u.is_active = 1) as active_users
      FROM organizations o
      WHERE o.id = ?
    `, [organizationId]);

    return stats[0] || null;
  }

  /**
   * Verifica se uma organização atingiu seus limites
   * @param {number} organizationId - ID da organização
   * @returns {Promise<Object>} - Status dos limites
   */
  async checkLimits(organizationId) {
    const organization = await this.getOrganization(organizationId);
    if (!organization) return null;

    const stats = await this.getOrganizationStats(organizationId);
    
    return {
      devices: {
        current: stats.total_devices,
        limit: organization.max_devices,
        percentage: Math.round((stats.total_devices / organization.max_devices) * 100),
        exceeded: stats.total_devices >= organization.max_devices
      },
      sites: {
        current: stats.total_sites,
        limit: organization.max_sites,
        percentage: Math.round((stats.total_sites / organization.max_sites) * 100),
        exceeded: stats.total_sites >= organization.max_sites
      },
      alerts_history: {
        current: stats.total_alerts,
        limit: organization.max_alerts_history,
        percentage: Math.round((stats.total_alerts / organization.max_alerts_history) * 100),
        exceeded: stats.total_alerts >= organization.max_alerts_history
      }
    };
  }

  // ========================================
  // UTILITÁRIOS
  // ========================================

  /**
   * Gera um UID único para organização
   * @returns {string} - UID único
   */
  generateUid() {
    return 'org_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Gera um slug a partir do nome
   * @param {string} name - Nome da organização
   * @returns {string} - Slug
   */
  generateSlug(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }

  /**
   * Verifica se um slug está disponível
   * @param {string} slug - Slug para verificar
   * @param {number} excludeId - ID da organização a excluir da verificação
   * @returns {Promise<boolean>} - Se o slug está disponível
   */
  async isSlugAvailable(slug, excludeId = null) {
    let query = 'SELECT COUNT(*) as count FROM organizations WHERE slug = ?';
    const params = [slug];

    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }

    const result = await this.database.query(query, params);
    return result[0].count === 0;
  }

  /**
   * Obtém organizações que precisam de sincronização
   * @returns {Promise<Array>} - Organizações para sincronizar
   */
  async getOrganizationsForSync() {
    return await this.database.query(`
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
  }

  /**
   * Obtém organizações ativas
   * @returns {Promise<Array>} - Organizações ativas
   */
  async getActiveOrganizations() {
    return await this.database.query(`
      SELECT * FROM organizations 
      WHERE is_active = 1 AND status = 'active'
      ORDER BY name ASC
    `);
  }

  /**
   * Obtém estatísticas gerais de todas as organizações
   * @returns {Promise<Object>} - Estatísticas gerais
   */
  async getGlobalStats() {
    const stats = await this.database.query(`
      SELECT 
        COUNT(*) as total_organizations,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_organizations,
        SUM(CASE WHEN sync_enabled = 1 THEN 1 ELSE 0 END) as sync_enabled_organizations,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_status_organizations,
        (SELECT COUNT(*) FROM devices) as total_devices,
        (SELECT COUNT(*) FROM sites) as total_sites,
        (SELECT COUNT(*) FROM alerts) as total_alerts,
        (SELECT COUNT(*) FROM users) as total_users
      FROM organizations
    `);

    return stats[0];
  }
}

module.exports = OrganizationService;