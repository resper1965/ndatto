const DattoRMMClient = require('../client');

class DeviceService {
  constructor() {
    this.client = new DattoRMMClient();
  }

  /**
   * Lista todos os dispositivos
   * @param {Object} filters - Filtros opcionais
   * @returns {Promise<Array>} - Lista de dispositivos
   */
  async listDevices(filters = {}) {
    try {
      const params = {
        ...filters,
        limit: filters.limit || 100,
        offset: filters.offset || 0
      };
      
      return await this.client.get('/device', params);
    } catch (error) {
      console.error('Erro ao listar dispositivos:', error.message);
      throw error;
    }
  }

  /**
   * Obtém detalhes de um dispositivo específico
   * @param {string} deviceUid - UID do dispositivo
   * @returns {Promise<Object>} - Detalhes do dispositivo
   */
  async getDevice(deviceUid) {
    try {
      return await this.client.get(`/device/${deviceUid}`);
    } catch (error) {
      console.error(`Erro ao obter dispositivo ${deviceUid}:`, error.message);
      throw error;
    }
  }

  /**
   * Obtém status de um dispositivo
   * @param {string} deviceUid - UID do dispositivo
   * @returns {Promise<Object>} - Status do dispositivo
   */
  async getDeviceStatus(deviceUid) {
    try {
      return await this.client.get(`/device/${deviceUid}/status`);
    } catch (error) {
      console.error(`Erro ao obter status do dispositivo ${deviceUid}:`, error.message);
      throw error;
    }
  }

  /**
   * Lista dispositivos por tipo
   * @param {string} deviceType - Tipo do dispositivo
   * @returns {Promise<Array>} - Lista de dispositivos do tipo especificado
   */
  async getDevicesByType(deviceType) {
    try {
      return await this.client.get('/device', { type: deviceType });
    } catch (error) {
      console.error(`Erro ao listar dispositivos do tipo ${deviceType}:`, error.message);
      throw error;
    }
  }

  /**
   * Busca dispositivos por nome ou descrição
   * @param {string} searchTerm - Termo de busca
   * @returns {Promise<Array>} - Lista de dispositivos encontrados
   */
  async searchDevices(searchTerm) {
    try {
      return await this.client.get('/device', { search: searchTerm });
    } catch (error) {
      console.error(`Erro ao buscar dispositivos com termo "${searchTerm}":`, error.message);
      throw error;
    }
  }

  /**
   * Obtém dispositivos online
   * @returns {Promise<Array>} - Lista de dispositivos online
   */
  async getOnlineDevices() {
    try {
      return await this.client.get('/device', { status: 'online' });
    } catch (error) {
      console.error('Erro ao listar dispositivos online:', error.message);
      throw error;
    }
  }

  /**
   * Obtém dispositivos offline
   * @returns {Promise<Array>} - Lista de dispositivos offline
   */
  async getOfflineDevices() {
    try {
      return await this.client.get('/device', { status: 'offline' });
    } catch (error) {
      console.error('Erro ao listar dispositivos offline:', error.message);
      throw error;
    }
  }

  /**
   * Obtém dispositivos por site
   * @param {string} siteUid - UID do site
   * @returns {Promise<Array>} - Lista de dispositivos do site
   */
  async getDevicesBySite(siteUid) {
    try {
      return await this.client.get(`/site/${siteUid}/device`);
    } catch (error) {
      console.error(`Erro ao listar dispositivos do site ${siteUid}:`, error.message);
      throw error;
    }
  }
}

module.exports = DeviceService;