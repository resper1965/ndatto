const DattoRMMClient = require('../client');

class SiteService {
  constructor() {
    this.client = new DattoRMMClient();
  }

  /**
   * Lista todos os sites
   * @param {Object} filters - Filtros opcionais
   * @returns {Promise<Array>} - Lista de sites
   */
  async listSites(filters = {}) {
    try {
      const params = {
        ...filters,
        limit: filters.limit || 100,
        offset: filters.offset || 0
      };
      
      return await this.client.get('/site', params);
    } catch (error) {
      console.error('Erro ao listar sites:', error.message);
      throw error;
    }
  }

  /**
   * Obtém detalhes de um site específico
   * @param {string} siteUid - UID do site
   * @returns {Promise<Object>} - Detalhes do site
   */
  async getSite(siteUid) {
    try {
      return await this.client.get(`/site/${siteUid}`);
    } catch (error) {
      console.error(`Erro ao obter site ${siteUid}:`, error.message);
      throw error;
    }
  }

  /**
   * Obtém dispositivos de um site
   * @param {string} siteUid - UID do site
   * @returns {Promise<Array>} - Lista de dispositivos do site
   */
  async getSiteDevices(siteUid) {
    try {
      return await this.client.get(`/site/${siteUid}/device`);
    } catch (error) {
      console.error(`Erro ao obter dispositivos do site ${siteUid}:`, error.message);
      throw error;
    }
  }

  /**
   * Obtém estatísticas de um site
   * @param {string} siteUid - UID do site
   * @returns {Promise<Object>} - Estatísticas do site
   */
  async getSiteStats(siteUid) {
    try {
      return await this.client.get(`/site/${siteUid}/stats`);
    } catch (error) {
      console.error(`Erro ao obter estatísticas do site ${siteUid}:`, error.message);
      throw error;
    }
  }

  /**
   * Busca sites por nome ou descrição
   * @param {string} searchTerm - Termo de busca
   * @returns {Promise<Array>} - Lista de sites encontrados
   */
  async searchSites(searchTerm) {
    try {
      return await this.client.get('/site', { search: searchTerm });
    } catch (error) {
      console.error(`Erro ao buscar sites com termo "${searchTerm}":`, error.message);
      throw error;
    }
  }

  /**
   * Obtém sites ativos
   * @returns {Promise<Array>} - Lista de sites ativos
   */
  async getActiveSites() {
    try {
      return await this.client.get('/site', { status: 'active' });
    } catch (error) {
      console.error('Erro ao listar sites ativos:', error.message);
      throw error;
    }
  }

  /**
   * Obtém sites inativos
   * @returns {Promise<Array>} - Lista de sites inativos
   */
  async getInactiveSites() {
    try {
      return await this.client.get('/site', { status: 'inactive' });
    } catch (error) {
      console.error('Erro ao listar sites inativos:', error.message);
      throw error;
    }
  }
}

module.exports = SiteService;