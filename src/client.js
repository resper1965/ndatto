const axios = require('axios');
const config = require('./config');
const OAuth2Client = require('./utils/auth');

class DattoRMMClient {
  constructor() {
    this.baseURL = config.apiUrl;
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
    
    // Cliente OAuth 2.0
    this.oauthClient = new OAuth2Client(this.baseURL, this.apiKey, this.apiSecret);
    
    // Configuração do axios
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000, // 30 segundos
      headers: {
        'User-Agent': 'DattoRMM-API-Client/1.0.0'
      }
    });

    // Interceptor para logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`[REQUEST] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[REQUEST ERROR]', error);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        console.log(`[RESPONSE] ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('[RESPONSE ERROR]', {
          status: error.response?.status,
          url: error.config?.url,
          message: error.message
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Faz uma requisição GET autenticada para a API
   * @param {string} path - Caminho da requisição (com /api/v2/)
   * @param {Object} params - Parâmetros de query (opcional)
   * @returns {Promise<Object>} - Resposta da API
   */
  async get(path, params = null) {
    try {
      // Adiciona o prefixo /api/v2/ se não estiver presente
      const fullPath = path.startsWith('/api/v2/') ? path : `/api/v2${path}`;
      
      return await this.oauthClient.request('GET', fullPath, null, params);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = DattoRMMClient;