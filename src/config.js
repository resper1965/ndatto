require('dotenv').config();

const config = {
  apiUrl: process.env.DATTO_API_URL || 'https://vidal-api.centrastage.net',
  apiKey: process.env.DATTO_API_KEY,
  apiSecret: process.env.DATTO_API_SECRET,
  logLevel: process.env.LOG_LEVEL || 'info'
};

// Validação das configurações obrigatórias
if (!config.apiKey || !config.apiSecret) {
  throw new Error('DATTO_API_KEY e DATTO_API_SECRET são obrigatórios no arquivo .env');
}

module.exports = config;