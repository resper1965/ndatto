const DattoRMMClient = require('../client');

class AlertService {
  constructor() {
    this.client = new DattoRMMClient();
  }

  /**
   * Lista todos os alertas
   * @param {Object} filters - Filtros opcionais
   * @returns {Promise<Array>} - Lista de alertas
   */
  async listAlerts(filters = {}) {
    try {
      const params = {
        ...filters,
        limit: filters.limit || 100,
        offset: filters.offset || 0
      };
      
      return await this.client.get('/alert', params);
    } catch (error) {
      console.error('Erro ao listar alertas:', error.message);
      throw error;
    }
  }

  /**
   * Obtém detalhes de um alerta específico
   * @param {string} alertUid - UID do alerta
   * @returns {Promise<Object>} - Detalhes do alerta
   */
  async getAlert(alertUid) {
    try {
      return await this.client.get(`/alert/${alertUid}`);
    } catch (error) {
      console.error(`Erro ao obter alerta ${alertUid}:`, error.message);
      throw error;
    }
  }

  /**
   * Lista alertas por severidade
   * @param {string} severity - Severidade (critical, warning, info)
   * @returns {Promise<Array>} - Lista de alertas da severidade especificada
   */
  async getAlertsBySeverity(severity) {
    try {
      return await this.client.get('/alert', { severity });
    } catch (error) {
      console.error(`Erro ao listar alertas de severidade ${severity}:`, error.message);
      throw error;
    }
  }

  /**
   * Lista alertas por dispositivo
   * @param {string} deviceUid - UID do dispositivo
   * @returns {Promise<Array>} - Lista de alertas do dispositivo
   */
  async getAlertsByDevice(deviceUid) {
    try {
      return await this.client.get('/alert', { deviceUid });
    } catch (error) {
      console.error(`Erro ao listar alertas do dispositivo ${deviceUid}:`, error.message);
      throw error;
    }
  }

  /**
   * Lista alertas por site
   * @param {string} siteUid - UID do site
   * @returns {Promise<Array>} - Lista de alertas do site
   */
  async getAlertsBySite(siteUid) {
    try {
      return await this.client.get('/alert', { siteUid });
    } catch (error) {
      console.error(`Erro ao listar alertas do site ${siteUid}:`, error.message);
      throw error;
    }
  }

  /**
   * Lista alertas não reconhecidos
   * @returns {Promise<Array>} - Lista de alertas não reconhecidos
   */
  async getUnacknowledgedAlerts() {
    try {
      return await this.client.get('/alert', { acknowledged: false });
    } catch (error) {
      console.error('Erro ao listar alertas não reconhecidos:', error.message);
      throw error;
    }
  }

  /**
   * Lista alertas reconhecidos
   * @returns {Promise<Array>} - Lista de alertas reconhecidos
   */
  async getAcknowledgedAlerts() {
    try {
      return await this.client.get('/alert', { acknowledged: true });
    } catch (error) {
      console.error('Erro ao listar alertas reconhecidos:', error.message);
      throw error;
    }
  }

  /**
   * Lista alertas ativos
   * @returns {Promise<Array>} - Lista de alertas ativos
   */
  async getActiveAlerts() {
    try {
      return await this.client.get('/alert', { status: 'active' });
    } catch (error) {
      console.error('Erro ao listar alertas ativos:', error.message);
      throw error;
    }
  }

  /**
   * Lista alertas resolvidos
   * @returns {Promise<Array>} - Lista de alertas resolvidos
   */
  async getResolvedAlerts() {
    try {
      return await this.client.get('/alert', { status: 'resolved' });
    } catch (error) {
      console.error('Erro ao listar alertas resolvidos:', error.message);
      throw error;
    }
  }

  /**
   * Busca alertas por termo
   * @param {string} searchTerm - Termo de busca
   * @returns {Promise<Array>} - Lista de alertas encontrados
   */
  async searchAlerts(searchTerm) {
    try {
      return await this.client.get('/alert', { search: searchTerm });
    } catch (error) {
      console.error(`Erro ao buscar alertas com termo "${searchTerm}":`, error.message);
      throw error;
    }
  }
}

module.exports = AlertService;