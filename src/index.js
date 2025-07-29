const DeviceService = require('./services/devices');
const SiteService = require('./services/sites');
const AlertService = require('./services/alerts');
const DattoRMMClient = require('./client');

/**
 * Cliente principal da API do Datto RMM
 * Fornece acesso aos serviços de dispositivos, sites e alertas
 */
class DattoRMMAPI {
  constructor() {
    this.devices = new DeviceService();
    this.sites = new SiteService();
    this.alerts = new AlertService();
    this.client = new DattoRMMClient();
  }

  /**
   * Testa a conexão com a API
   * @returns {Promise<Object>} - Status da conexão
   */
  async testConnection() {
    try {
      console.log('📡 Testando conexão com a API...');
      const accountInfo = await this.client.get('/account');
      
      return {
        success: true,
        message: 'Conexão com a API estabelecida com sucesso',
        data: accountInfo
      };
    } catch (error) {
      return {
        success: false,
        message: 'Falha na conexão com a API',
        error: error.message
      };
    }
  }

  /**
   * Obtém informações da conta
   * @returns {Promise<Object>} - Informações da conta
   */
  async getAccountInfo() {
    try {
      return await this.client.get('/account');
    } catch (error) {
      console.error('Erro ao obter informações da conta:', error.message);
      throw error;
    }
  }

  /**
   * Obtém sites da conta
   * @returns {Promise<Array>} - Lista de sites da conta
   */
  async getAccountSites() {
    try {
      return await this.client.get('/account/sites');
    } catch (error) {
      console.error('Erro ao obter sites da conta:', error.message);
      throw error;
    }
  }

  /**
   * Obtém jobs da conta
   * @returns {Promise<Array>} - Lista de jobs da conta
   */
  async getAccountJobs() {
    try {
      return await this.client.get('/account/jobs');
    } catch (error) {
      console.error('Erro ao obter jobs da conta:', error.message);
      throw error;
    }
  }

  /**
   * Obtém detalhes de um job específico
   * @param {string} jobUid - UID do job
   * @returns {Promise<Object>} - Detalhes do job
   */
  async getJob(jobUid) {
    try {
      return await this.client.get(`/job/${jobUid}`);
    } catch (error) {
      console.error(`Erro ao obter job ${jobUid}:`, error.message);
      throw error;
    }
  }

  /**
   * Obtém estatísticas gerais
   * @returns {Promise<Object>} - Estatísticas da conta
   */
  async getStats() {
    try {
      return await this.client.get('/stats');
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error.message);
      throw error;
    }
  }
}

module.exports = {
  DattoRMMAPI,
  DeviceService,
  SiteService,
  AlertService
};