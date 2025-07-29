/**
 * Esquema de Banco de Dados para Persistência de Dados da API Datto RMM
 * 
 * Estrutura multitenancy com separação por organizações
 * sem perder dados existentes quando não estiverem mais disponíveis na API
 */

const databaseSchema = {
  // ========================================
  // TABELA: organizations (Organizações/Tenants)
  // ========================================
  organizations: {
    // Identificadores
    id: 'INT AUTO_INCREMENT PRIMARY KEY',
    uid: 'VARCHAR(50) UNIQUE NOT NULL',           // UID único da organização
    name: 'VARCHAR(255) NOT NULL',                // Nome da organização
    slug: 'VARCHAR(100) UNIQUE NOT NULL',         // Slug para URLs
    description: 'TEXT',                          // Descrição da organização
    
    // Configurações da API Datto
    datto_api_url: 'VARCHAR(255)',                // URL da API do Datto
    datto_api_key: 'VARCHAR(255)',                // API Key do Datto
    datto_api_secret: 'VARCHAR(255)',             // API Secret do Datto
    datto_platform: 'VARCHAR(50)',                // Plataforma (vidal, merlot, etc)
    
    // Status e Controle
    status: 'ENUM("active", "inactive", "suspended") DEFAULT "active"',
    is_active: 'BOOLEAN DEFAULT true',            // Se a organização está ativa
    sync_enabled: 'BOOLEAN DEFAULT true',         // Se a sincronização está habilitada
    last_sync: 'TIMESTAMP NULL',                  // Última sincronização
    
    // Configurações de Sincronização
    sync_interval_minutes: 'INT DEFAULT 60',      // Intervalo de sincronização
    sync_devices: 'BOOLEAN DEFAULT true',         // Sincronizar dispositivos
    sync_sites: 'BOOLEAN DEFAULT true',           // Sincronizar sites
    sync_alerts: 'BOOLEAN DEFAULT true',          // Sincronizar alertas
    
    // Limites e Controles
    max_devices: 'INT DEFAULT 1000',              // Limite de dispositivos
    max_sites: 'INT DEFAULT 100',                 // Limite de sites
    max_alerts_history: 'INT DEFAULT 10000',      // Limite de histórico de alertas
    
    // Dados de Contato
    contact_name: 'VARCHAR(255)',                 // Nome do contato
    contact_email: 'VARCHAR(255)',                // Email do contato
    contact_phone: 'VARCHAR(50)',                 // Telefone do contato
    
    // Dados Adicionais
    metadata: 'JSON',                             // Dados extras
    custom_fields: 'JSON',                        // Campos customizados
    
    // Timestamps
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    
    // Índices
    indexes: [
      'INDEX idx_uid (uid)',
      'INDEX idx_slug (slug)',
      'INDEX idx_status (status)',
      'INDEX idx_is_active (is_active)',
      'INDEX idx_last_sync (last_sync)'
    ]
  },

  // ========================================
  // TABELA: users (Usuários)
  // ========================================
  users: {
    // Identificadores
    id: 'INT AUTO_INCREMENT PRIMARY KEY',
    uid: 'VARCHAR(50) UNIQUE NOT NULL',           // UID único do usuário
    organization_id: 'INT NOT NULL',               // Organização do usuário
    email: 'VARCHAR(255) NOT NULL',               // Email do usuário
    username: 'VARCHAR(100) UNIQUE',              // Nome de usuário
    
    // Informações Pessoais
    first_name: 'VARCHAR(100)',                   // Nome
    last_name: 'VARCHAR(100)',                    // Sobrenome
    display_name: 'VARCHAR(255)',                 // Nome de exibição
    
    // Status e Controle
    status: 'ENUM("active", "inactive", "suspended") DEFAULT "active"',
    is_active: 'BOOLEAN DEFAULT true',            // Se o usuário está ativo
    email_verified: 'BOOLEAN DEFAULT false',      // Email verificado
    last_login: 'TIMESTAMP NULL',                 // Último login
    
    // Autenticação
    password_hash: 'VARCHAR(255)',                // Hash da senha
    password_reset_token: 'VARCHAR(255)',         // Token para reset de senha
    password_reset_expires: 'TIMESTAMP NULL',     // Expiração do token
    
    // Permissões
    role: 'ENUM("admin", "manager", "viewer") DEFAULT "viewer"',
    permissions: 'JSON',                          // Permissões específicas
    
    // Dados Adicionais
    metadata: 'JSON',                             // Dados extras
    custom_fields: 'JSON',                        // Campos customizados
    
    // Timestamps
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    
    // Foreign Keys
    foreign_keys: [
      'FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE'
    ],
    
    // Índices
    indexes: [
      'INDEX idx_uid (uid)',
      'INDEX idx_organization_id (organization_id)',
      'INDEX idx_email (email)',
      'INDEX idx_username (username)',
      'INDEX idx_status (status)',
      'INDEX idx_role (role)',
      'INDEX idx_last_login (last_login)'
    ]
  },

  // ========================================
  // TABELA: devices (Dispositivos)
  // ========================================
  devices: {
    // Identificadores
    id: 'INT AUTO_INCREMENT PRIMARY KEY',
    uid: 'VARCHAR(50) NOT NULL',                  // UID único do Datto
    organization_id: 'INT NOT NULL',               // Organização do dispositivo
    datto_id: 'VARCHAR(50)',                      // ID original do Datto
    name: 'VARCHAR(255) NOT NULL',                // Nome do dispositivo
    type: 'VARCHAR(50)',                          // Tipo (server, workstation, etc)
    
    // Status e Controle
    status: 'ENUM("online", "offline", "inactive") DEFAULT "inactive"',
    is_active: 'BOOLEAN DEFAULT true',            // Se ainda existe na API
    last_seen_api: 'TIMESTAMP NULL',              // Última vez visto na API
    last_sync: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    
    // Informações Técnicas
    os: 'VARCHAR(100)',                           // Sistema operacional
    os_version: 'VARCHAR(50)',                    // Versão do OS
    ip_address: 'VARCHAR(45)',                    // Endereço IP
    mac_address: 'VARCHAR(17)',                   // Endereço MAC
    hostname: 'VARCHAR(255)',                     // Hostname
    
    // Relacionamentos
    site_uid: 'VARCHAR(50)',                      // Site ao qual pertence
    site_name: 'VARCHAR(255)',                    // Nome do site (cache)
    
    // Dados Adicionais (JSON)
    metadata: 'JSON',                             // Dados extras da API
    custom_fields: 'JSON',                        // Campos customizados
    
    // Timestamps
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    
    // Foreign Keys
    foreign_keys: [
      'FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE'
    ],
    
    // Índices
    indexes: [
      'INDEX idx_uid (uid)',
      'INDEX idx_organization_id (organization_id)',
      'INDEX idx_status (status)',
      'INDEX idx_type (type)',
      'INDEX idx_site_uid (site_uid)',
      'INDEX idx_last_sync (last_sync)',
      'INDEX idx_is_active (is_active)',
      'UNIQUE KEY uk_org_device (organization_id, uid)'
    ]
  },

  // ========================================
  // TABELA: sites (Sites/Locações)
  // ========================================
  sites: {
    // Identificadores
    id: 'INT AUTO_INCREMENT PRIMARY KEY',
    uid: 'VARCHAR(50) NOT NULL',                  // UID único do Datto
    organization_id: 'INT NOT NULL',               // Organização do site
    datto_id: 'VARCHAR(50)',                      // ID original do Datto
    name: 'VARCHAR(255) NOT NULL',                // Nome do site
    description: 'TEXT',                          // Descrição
    
    // Status e Controle
    status: 'ENUM("active", "inactive") DEFAULT "inactive"',
    is_active: 'BOOLEAN DEFAULT true',            // Se ainda existe na API
    last_sync: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    
    // Informações de Contato
    address: 'TEXT',                              // Endereço físico
    contact_name: 'VARCHAR(255)',                 // Nome do contato
    contact_email: 'VARCHAR(255)',                // Email do contato
    contact_phone: 'VARCHAR(50)',                 // Telefone do contato
    
    // Estatísticas
    device_count: 'INT DEFAULT 0',                // Número de dispositivos
    online_devices: 'INT DEFAULT 0',              // Dispositivos online
    offline_devices: 'INT DEFAULT 0',             // Dispositivos offline
    
    // Dados Adicionais
    metadata: 'JSON',                             // Dados extras da API
    custom_fields: 'JSON',                        // Campos customizados
    
    // Timestamps
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    
    // Foreign Keys
    foreign_keys: [
      'FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE'
    ],
    
    // Índices
    indexes: [
      'INDEX idx_uid (uid)',
      'INDEX idx_organization_id (organization_id)',
      'INDEX idx_status (status)',
      'INDEX idx_is_active (is_active)',
      'INDEX idx_last_sync (last_sync)',
      'UNIQUE KEY uk_org_site (organization_id, uid)'
    ]
  },

  // ========================================
  // TABELA: alerts (Alertas)
  // ========================================
  alerts: {
    // Identificadores
    id: 'INT AUTO_INCREMENT PRIMARY KEY',
    uid: 'VARCHAR(50) NOT NULL',                  // UID único do Datto
    organization_id: 'INT NOT NULL',               // Organização do alerta
    datto_id: 'VARCHAR(50)',                      // ID original do Datto
    title: 'VARCHAR(255) NOT NULL',               // Título do alerta
    message: 'TEXT',                              // Mensagem do alerta
    
    // Classificação
    severity: 'ENUM("critical", "warning", "info") NOT NULL',
    category: 'VARCHAR(100)',                     // Categoria do alerta
    source: 'VARCHAR(100)',                       // Fonte do alerta
    
    // Status e Controle
    status: 'ENUM("active", "resolved", "acknowledged", "inactive") DEFAULT "inactive"',
    is_active: 'BOOLEAN DEFAULT true',            // Se ainda existe na API
    acknowledged: 'BOOLEAN DEFAULT false',         // Se foi reconhecido
    resolved: 'BOOLEAN DEFAULT false',            // Se foi resolvido
    
    // Relacionamentos
    device_uid: 'VARCHAR(50)',                    // Dispositivo relacionado
    device_name: 'VARCHAR(255)',                  // Nome do dispositivo (cache)
    site_uid: 'VARCHAR(50)',                      // Site relacionado
    site_name: 'VARCHAR(255)',                    // Nome do site (cache)
    
    // Timestamps
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    acknowledged_at: 'TIMESTAMP NULL',             // Quando foi reconhecido
    resolved_at: 'TIMESTAMP NULL',                // Quando foi resolvido
    last_sync: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    
    // Dados Adicionais
    metadata: 'JSON',                             // Dados extras da API
    custom_fields: 'JSON',                        // Campos customizados
    
    // Foreign Keys
    foreign_keys: [
      'FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE'
    ],
    
    // Índices
    indexes: [
      'INDEX idx_uid (uid)',
      'INDEX idx_organization_id (organization_id)',
      'INDEX idx_severity (severity)',
      'INDEX idx_status (status)',
      'INDEX idx_device_uid (device_uid)',
      'INDEX idx_site_uid (site_uid)',
      'INDEX idx_created_at (created_at)',
      'INDEX idx_is_active (is_active)',
      'INDEX idx_acknowledged (acknowledged)',
      'INDEX idx_resolved (resolved)',
      'UNIQUE KEY uk_org_alert (organization_id, uid)'
    ]
  },

  // ========================================
  // TABELA: sync_log (Log de Sincronização)
  // ========================================
  sync_log: {
    id: 'INT AUTO_INCREMENT PRIMARY KEY',
    organization_id: 'INT NOT NULL',               // Organização
    sync_type: 'ENUM("devices", "sites", "alerts", "full") NOT NULL',
    status: 'ENUM("success", "error", "partial") NOT NULL',
    items_processed: 'INT DEFAULT 0',             // Itens processados
    items_updated: 'INT DEFAULT 0',               // Itens atualizados
    items_created: 'INT DEFAULT 0',               // Itens criados
    items_deactivated: 'INT DEFAULT 0',           // Itens desativados
    error_message: 'TEXT',                        // Mensagem de erro
    started_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    completed_at: 'TIMESTAMP NULL',               // Quando terminou
    duration_seconds: 'INT',                      // Duração em segundos
    
    // Foreign Keys
    foreign_keys: [
      'FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE'
    ],
    
    // Índices
    indexes: [
      'INDEX idx_organization_id (organization_id)',
      'INDEX idx_sync_type (sync_type)',
      'INDEX idx_status (status)',
      'INDEX idx_started_at (started_at)'
    ]
  },

  // ========================================
  // TABELA: device_history (Histórico de Dispositivos)
  // ========================================
  device_history: {
    id: 'INT AUTO_INCREMENT PRIMARY KEY',
    organization_id: 'INT NOT NULL',               // Organização
    device_uid: 'VARCHAR(50) NOT NULL',           // UID do dispositivo
    action: 'ENUM("created", "updated", "status_changed", "deactivated") NOT NULL',
    old_status: 'VARCHAR(50)',                    // Status anterior
    new_status: 'VARCHAR(50)',                    // Novo status
    old_data: 'JSON',                             // Dados anteriores
    new_data: 'JSON',                             // Novos dados
    changed_fields: 'JSON',                        // Campos que mudaram
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    
    // Foreign Keys
    foreign_keys: [
      'FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE'
    ],
    
    // Índices
    indexes: [
      'INDEX idx_organization_id (organization_id)',
      'INDEX idx_device_uid (device_uid)',
      'INDEX idx_action (action)',
      'INDEX idx_created_at (created_at)'
    ]
  },

  // ========================================
  // TABELA: alert_history (Histórico de Alertas)
  // ========================================
  alert_history: {
    id: 'INT AUTO_INCREMENT PRIMARY KEY',
    organization_id: 'INT NOT NULL',               // Organização
    alert_uid: 'VARCHAR(50) NOT NULL',            // UID do alerta
    action: 'ENUM("created", "updated", "acknowledged", "resolved", "deactivated") NOT NULL',
    old_status: 'VARCHAR(50)',                    // Status anterior
    new_status: 'VARCHAR(50)',                    // Novo status
    old_data: 'JSON',                             // Dados anteriores
    new_data: 'JSON',                             // Novos dados
    changed_fields: 'JSON',                        // Campos que mudaram
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    
    // Foreign Keys
    foreign_keys: [
      'FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE'
    ],
    
    // Índices
    indexes: [
      'INDEX idx_organization_id (organization_id)',
      'INDEX idx_alert_uid (alert_uid)',
      'INDEX idx_action (action)',
      'INDEX idx_created_at (created_at)'
    ]
  },

  // ========================================
  // TABELA: api_cache (Cache da API)
  // ========================================
  api_cache: {
    id: 'INT AUTO_INCREMENT PRIMARY KEY',
    organization_id: 'INT NOT NULL',               // Organização
    endpoint: 'VARCHAR(255) NOT NULL',            // Endpoint da API
    params_hash: 'VARCHAR(64)',                   // Hash dos parâmetros
    response_data: 'JSON',                        // Dados da resposta
    response_status: 'INT',                       // Status HTTP
    cached_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    expires_at: 'TIMESTAMP',                      // Quando expira
    last_used: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    
    // Foreign Keys
    foreign_keys: [
      'FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE'
    ],
    
    // Índices
    indexes: [
      'INDEX idx_organization_id (organization_id)',
      'INDEX idx_endpoint (endpoint)',
      'INDEX idx_expires_at (expires_at)',
      'INDEX idx_last_used (last_used)'
    ]
  },

  // ========================================
  // TABELA: user_sessions (Sessões de Usuário)
  // ========================================
  user_sessions: {
    id: 'INT AUTO_INCREMENT PRIMARY KEY',
    organization_id: 'INT NOT NULL',               // Organização
    user_id: 'INT NOT NULL',                      // Usuário
    session_token: 'VARCHAR(255) UNIQUE NOT NULL', // Token da sessão
    ip_address: 'VARCHAR(45)',                    // IP do usuário
    user_agent: 'TEXT',                           // User agent
    expires_at: 'TIMESTAMP NOT NULL',             // Quando expira
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    
    // Foreign Keys
    foreign_keys: [
      'FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE',
      'FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE'
    ],
    
    // Índices
    indexes: [
      'INDEX idx_organization_id (organization_id)',
      'INDEX idx_user_id (user_id)',
      'INDEX idx_session_token (session_token)',
      'INDEX idx_expires_at (expires_at)'
    ]
  }
};

module.exports = databaseSchema;