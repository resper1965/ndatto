# Datto RMM API Client (Somente Leitura)

Cliente Node.js para integração com a API do Datto RMM (Remote Monitoring and Management) v2 - **Apenas operações de leitura (GET)**.

## 📋 Índice

- [Instalação](#instalação)
- [Configuração](#configuração)
- [Uso Básico](#uso-básico)
- [Modo Demonstração](#modo-demonstração)
- [Serviços Disponíveis](#serviços-disponíveis)
- [Exemplos](#exemplos)
- [Documentação da API](#documentação-da-api)
- [Contribuição](#contribuição)

## 🚀 Instalação

```bash
# Clone o repositório
git clone <seu-repositorio>
cd datto-api

# Instale as dependências
npm install
```

## ⚙️ Configuração

1. **Copie o arquivo de exemplo de ambiente:**
```bash
cp env.example .env
```

2. **Configure suas credenciais no arquivo `.env`:**
```env
DATTO_API_URL=https://vidal-api.centrastage.net
DATTO_API_KEY=1V90QH7BHSALBD3UVVCDNK4P6EGC9GRH
DATTO_API_SECRET=81RR0IRHJEMSP7QELPC52USS967LBD5F
LOG_LEVEL=info
```

**Importante**: As credenciais devem ser geradas no portal do Datto RMM conforme a [documentação oficial](https://rmm.datto.com/help/en/Content/2SETUP/APIv2.htm).

## 💻 Uso Básico

```javascript
const { DattoRMMAPI } = require('./src/index');

async function exemplo() {
  const api = new DattoRMMAPI();
  
  // Testa a conexão
  const connection = await api.testConnection();
  console.log(connection);
  
  // Lista dispositivos
  const devices = await api.devices.listDevices();
  console.log(devices);
  
  // Lista alertas
  const alerts = await api.alerts.listAlerts();
  console.log(alerts);
}
```

## 🎭 Modo Demonstração

Se as credenciais da API não estiverem disponíveis ou não funcionarem, você pode usar o modo de demonstração que simula as respostas da API:

```bash
npm run demo
```

Este modo usa dados simulados para demonstrar todas as funcionalidades do cliente.

## 🔧 Serviços Disponíveis

### DeviceService
Gerencia consultas de dispositivos monitorados.

```javascript
const { DeviceService } = require('./src/index');

const deviceService = new DeviceService();

// Listar dispositivos
const devices = await deviceService.listDevices();

// Obter dispositivo específico
const device = await deviceService.getDevice('device-uid');

// Buscar dispositivos
const results = await deviceService.searchDevices('server');

// Obter status do dispositivo
const status = await deviceService.getDeviceStatus('device-uid');

// Obter dispositivos online
const onlineDevices = await deviceService.getOnlineDevices();

// Obter dispositivos offline
const offlineDevices = await deviceService.getOfflineDevices();

// Obter dispositivos por site
const siteDevices = await deviceService.getDevicesBySite('site-uid');
```

### SiteService
Gerencia consultas de sites/locações.

```javascript
const { SiteService } = require('./src/index');

const siteService = new SiteService();

// Listar sites
const sites = await siteService.listSites();

// Obter site específico
const site = await siteService.getSite('site-uid');

// Obter dispositivos de um site
const siteDevices = await siteService.getSiteDevices('site-uid');

// Obter estatísticas de um site
const siteStats = await siteService.getSiteStats('site-uid');

// Obter sites ativos
const activeSites = await siteService.getActiveSites();

// Obter sites inativos
const inactiveSites = await siteService.getInactiveSites();
```

### AlertService
Gerencia consultas de alertas e notificações.

```javascript
const { AlertService } = require('./src/index');

const alertService = new AlertService();

// Listar alertas
const alerts = await alertService.listAlerts();

// Obter alertas por severidade
const criticalAlerts = await alertService.getAlertsBySeverity('critical');

// Obter alertas não reconhecidos
const unacknowledged = await alertService.getUnacknowledgedAlerts();

// Obter alertas reconhecidos
const acknowledged = await alertService.getAcknowledgedAlerts();

// Obter alertas ativos
const activeAlerts = await alertService.getActiveAlerts();

// Obter alertas resolvidos
const resolvedAlerts = await alertService.getResolvedAlerts();

// Buscar alertas
const searchResults = await alertService.searchAlerts('disco');
```

## 📚 Exemplos

### Exemplo Básico
```bash
npm run example
```

### Modo Demonstração
```bash
npm run demo
```

### Exemplo de Gerenciamento de Dispositivos
```bash
node examples/device-management.js
```

### Exemplo de Gerenciamento de Alertas
```bash
node examples/alert-management.js
```

## 🔐 Autenticação OAuth 2.0

O cliente utiliza autenticação OAuth 2.0 conforme a [documentação oficial](https://rmm.datto.com/help/en/Content/2SETUP/APIv2.htm):

- **API Key**: Identifica sua conta
- **API Secret**: Usado para obter tokens de acesso
- **Access Token**: Token Bearer válido por 100 horas
- **Rate Limiting**: 600 requisições por 60 segundos

### Headers de Autenticação

```
Authorization: Bearer <access-token>
Content-Type: application/json
```

## 📊 Endpoints Disponíveis (Somente GET)

### Dispositivos
- `GET /api/v2/device` - Lista dispositivos
- `GET /api/v2/device/{deviceUid}` - Obtém dispositivo específico
- `GET /api/v2/device/{deviceUid}/status` - Status do dispositivo

### Sites
- `GET /api/v2/site` - Lista sites
- `GET /api/v2/site/{siteUid}` - Obtém site específico
- `GET /api/v2/site/{siteUid}/device` - Dispositivos do site
- `GET /api/v2/site/{siteUid}/stats` - Estatísticas do site

### Alertas
- `GET /api/v2/alert` - Lista alertas
- `GET /api/v2/alert/{alertUid}` - Obtém alerta específico

### Conta
- `GET /api/v2/account` - Informações da conta
- `GET /api/v2/account/sites` - Sites da conta
- `GET /api/v2/account/jobs` - Jobs da conta

### Jobs
- `GET /api/v2/job/{jobUid}` - Detalhes do job

## 🛠️ Scripts Disponíveis

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Executar exemplo básico
npm run example

# Executar modo demonstração
npm run demo

# Executar testes
npm test

# Verificar código
npm run lint
```

## 📝 Logs

O cliente inclui logging automático de requisições e respostas:

```
[REQUEST] GET /api/v2/device
[RESPONSE] 200 /api/v2/device
```

## 🔍 Tratamento de Erros

```javascript
try {
  const devices = await api.devices.listDevices();
} catch (error) {
  console.error('Erro:', error.message);
  
  if (error.message.includes('API Error 401')) {
    console.error('Erro de autenticação - verifique suas credenciais');
  } else if (error.message.includes('API Error 429')) {
    console.error('Rate limit excedido - aguarde 60 segundos');
  } else if (error.message.includes('API Error 404')) {
    console.error('Recurso não encontrado');
  }
}
```

## ⚠️ Status Atual

**Nota**: As credenciais fornecidas podem não estar ativas ou corretas. O sistema está configurado e pronto para uso, mas requer credenciais válidas da API do Datto RMM para funcionar com dados reais.

Para testar o sistema sem credenciais válidas, use o modo de demonstração:
```bash
npm run demo
```

## 📖 Documentação Oficial

Este cliente é baseado na [documentação oficial da API do Datto RMM v2](https://rmm.datto.com/help/en/Content/2SETUP/APIv2.htm).

### Plataformas Disponíveis

| Plataforma | URL da API |
|------------|------------|
| Vidal | https://vidal-api.centrastage.net |
| Merlot | https://merlot-api.centrastage.net |
| Pinotage | https://pinotage-api.centrastage.net |
| Concord | https://concord-api.centrastage.net |
| Zinfandel | https://zinfandel-api.centrastage.net |
| Syrah | https://syrah-api.centrastage.net |

### Swagger UI

Para explorar a API interativamente, acesse:
- **Vidal**: https://vidal-api.centrastage.net/api/swagger-ui/index.html

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

Para suporte técnico ou dúvidas sobre a API do Datto RMM:

- [Documentação Oficial](https://rmm.datto.com/help/en/Content/2SETUP/APIv2.htm)
- [Portal de Desenvolvedores](https://developer.centrastage.net/)

## 🔄 Changelog

### v2.0.0
- Implementação da API v2 do Datto RMM
- Autenticação OAuth 2.0
- **Somente operações de leitura (GET)**
- Endpoints atualizados conforme documentação oficial
- Suporte a dispositivos, sites e alertas
- Rate limiting automático
- Logging automático
- Exemplos de uso
- Modo de demonstração com dados simulados