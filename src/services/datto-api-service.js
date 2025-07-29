/**
 * Serviço de Integração com a API Datto RMM
 * 
 * Conecta com a API real da Datto RMM usando as credenciais configuradas
 * Fornece métodos para buscar dados reais de organizações, dispositivos e alertas
 */
const DattoClient = require('../client');
const config = require('../config');

class DattoApiService {
  constructor() {
    this.client = new DattoClient(config.apiUrl, config.apiKey, config.apiSecret);
  }

  /**
   * Testa a conexão com a API da Datto
   * @returns {Promise<boolean>} - True se conectou com sucesso
   */
  async testConnection() {
    try {
      const response = await this.client.get('/api/v2/account');
      return response && response.data;
    } catch (error) {
      console.error('Erro ao testar conexão com Datto API:', error.message);
      return false;
    }
  }

  /**
   * Obtém informações da conta
   * @returns {Promise<Object>} - Dados da conta
   */
  async getAccountInfo() {
    try {
      const response = await this.client.get('/api/v2/account');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter informações da conta:', error.message);
      throw error;
    }
  }

  /**
   * Lista todas as organizações
   * @returns {Promise<Array>} - Lista de organizações
   */
  async getOrganizations() {
    try {
      const response = await this.client.get('/api/v2/organization');
      return response.data.organizations || [];
    } catch (error) {
      console.error('Erro ao obter organizações:', error.message);
      throw error;
    }
  }

  /**
   * Obtém uma organização específica
   * @param {string} organizationUid - UID da organização
   * @returns {Promise<Object>} - Dados da organização
   */
  async getOrganization(organizationUid) {
    try {
      const response = await this.client.get(`/api/v2/organization/${organizationUid}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter organização:', error.message);
      throw error;
    }
  }

  /**
   * Lista dispositivos de uma organização
   * @param {string} organizationUid - UID da organização
   * @returns {Promise<Array>} - Lista de dispositivos
   */
  async getDevices(organizationUid) {
    try {
      const response = await this.client.get(`/api/v2/organization/${organizationUid}/device`);
      return response.data.devices || [];
    } catch (error) {
      console.error('Erro ao obter dispositivos:', error.message);
      throw error;
    }
  }

  /**
   * Lista sites de uma organização
   * @param {string} organizationUid - UID da organização
   * @returns {Promise<Array>} - Lista de sites
   */
  async getSites(organizationUid) {
    try {
      const response = await this.client.get(`/api/v2/organization/${organizationUid}/site`);
      return response.data.sites || [];
    } catch (error) {
      console.error('Erro ao obter sites:', error.message);
      throw error;
    }
  }

  /**
   * Lista alertas de uma organização
   * @param {string} organizationUid - UID da organização
   * @returns {Promise<Array>} - Lista de alertas
   */
  async getAlerts(organizationUid) {
    try {
      const response = await this.client.get(`/api/v2/organization/${organizationUid}/alert`);
      return response.data.alerts || [];
    } catch (error) {
      console.error('Erro ao obter alertas:', error.message);
      throw error;
    }
  }

  /**
   * Obtém estatísticas de uma organização
   * @param {string} organizationUid - UID da organização
   * @returns {Promise<Object>} - Estatísticas da organização
   */
  async getOrganizationStats(organizationUid) {
    try {
      const [devices, alerts, sites] = await Promise.all([
        this.getDevices(organizationUid),
        this.getAlerts(organizationUid),
        this.getSites(organizationUid)
      ]);

      const onlineDevices = devices.filter(d => d.status === 'online').length;
      const criticalAlerts = alerts.filter(a => a.severity === 'critical' && a.status === 'active').length;

      return {
        total_devices: devices.length,
        online_devices: onlineDevices,
        offline_devices: devices.length - onlineDevices,
        total_alerts: alerts.length,
        critical_alerts: criticalAlerts,
        total_sites: sites.length,
        active_sites: sites.filter(s => s.status === 'active').length
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas da organização:', error.message);
      throw error;
    }
  }

  /**
   * Obtém estatísticas globais de todas as organizações
   * @returns {Promise<Object>} - Estatísticas globais
   */
  async getGlobalStats() {
    try {
      const organizations = await this.getOrganizations();
      let totalDevices = 0;
      let totalAlerts = 0;
      let totalSites = 0;

      for (const org of organizations) {
        const stats = await this.getOrganizationStats(org.uid);
        totalDevices += stats.total_devices;
        totalAlerts += stats.total_alerts;
        totalSites += stats.total_sites;
      }

      return {
        total_organizations: organizations.length,
        total_devices: totalDevices,
        total_alerts: totalAlerts,
        total_sites: totalSites,
        total_users: organizations.length * 10 // Estimativa
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas globais:', error.message);
      throw error;
    }
  }

  /**
   * Sincroniza dados de uma organização
   * @param {string} organizationUid - UID da organização
   * @returns {Promise<Object>} - Resultado da sincronização
   */
  async syncOrganization(organizationUid) {
    try {
      const [devices, alerts, sites] = await Promise.all([
        this.getDevices(organizationUid),
        this.getAlerts(organizationUid),
        this.getSites(organizationUid)
      ]);

      return {
        success: true,
        organization_uid: organizationUid,
        devices_synced: devices.length,
        alerts_synced: alerts.length,
        sites_synced: sites.length,
        synced_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erro ao sincronizar organização:', error.message);
      throw error;
    }
  }
}

module.exports = DattoApiService;