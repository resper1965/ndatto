const axios = require('axios');

/**
 * Cliente OAuth 2.0 para autenticação da API do Datto RMM
 * Baseado na documentação oficial: https://rmm.datto.com/help/en/Content/2SETUP/APIv2.htm
 */
class OAuth2Client {
  constructor(apiUrl, apiKey, apiSecret) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Obtém um token de acesso usando OAuth 2.0
   * @returns {Promise<string>} - Token de acesso
   */
  async getAccessToken() {
    // Se já temos um token válido, retorna ele
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      console.log('🔐 Obtendo token de acesso OAuth 2.0...');
      
      const response = await axios.post(`${this.apiUrl}/auth/oauth/token`, {
        grant_type: 'client_credentials',
        client_id: this.apiKey,
        client_secret: this.apiSecret
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      this.accessToken = response.data.access_token;
      // Tokens expiram em 100 horas (360000000 ms)
      this.tokenExpiry = Date.now() + (100 * 60 * 60 * 1000);
      
      console.log('✅ Token de acesso obtido com sucesso');
      return this.accessToken;
    } catch (error) {
      console.error('❌ Erro ao obter token de acesso:', error.response?.data || error.message);
      throw new Error(`Falha na autenticação OAuth 2.0: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Prepara headers de autenticação para a API
   * @returns {Promise<Object>} - Headers de autenticação
   */
  async getAuthHeaders() {
    const token = await this.getAccessToken();
    
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Faz uma requisição GET autenticada para a API
   * @param {string} method - Método HTTP (sempre GET)
   * @param {string} path - Caminho da requisição
   * @param {Object} data - Sempre null para GET
   * @param {Object} params - Parâmetros de query (opcional)
   * @returns {Promise<Object>} - Resposta da API
   */
  async request(method, path, data = null, params = null) {
    try {
      const headers = await this.getAuthHeaders();
      
      const config = {
        method: 'GET', // Sempre GET
        url: `${this.apiUrl}${path}`,
        headers,
        ...(params && { params })
      };

      const response = await axios(config);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        // Token pode ter expirado, tenta renovar
        this.accessToken = null;
        this.tokenExpiry = null;
        throw new Error('Token de acesso expirado. Tente novamente.');
      }
      
      if (error.response) {
        throw new Error(`API Error ${error.response.status}: ${error.response.data?.message || error.message}`);
      }
      throw new Error(`Network Error: ${error.message}`);
    }
  }
}

module.exports = OAuth2Client;