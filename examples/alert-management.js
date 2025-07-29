const { AlertService } = require('../src/index');

async function exemploGerenciamentoAlertas() {
  console.log('🚨 Exemplo de Gerenciamento de Alertas\n');

  try {
    const alertService = new AlertService();

    // Lista todos os alertas
    console.log('📋 Listando todos os alertas...');
    const allAlerts = await alertService.listAlerts({ limit: 10 });
    console.log(`Total de alertas: ${allAlerts.length}`);
    console.log('');

    // Lista alertas por severidade
    console.log('🔴 Alertas críticos...');
    const criticalAlerts = await alertService.getAlertsBySeverity('critical');
    console.log(`Alertas críticos: ${criticalAlerts.length}`);
    console.log('');

    console.log('🟡 Alertas de aviso...');
    const warningAlerts = await alertService.getAlertsBySeverity('warning');
    console.log(`Alertas de aviso: ${warningAlerts.length}`);
    console.log('');

    console.log('🔵 Alertas informativos...');
    const infoAlerts = await alertService.getAlertsBySeverity('info');
    console.log(`Alertas informativos: ${infoAlerts.length}`);
    console.log('');

    // Lista alertas não reconhecidos
    console.log('❌ Alertas não reconhecidos...');
    const unacknowledgedAlerts = await alertService.getUnacknowledgedAlerts();
    console.log(`Alertas não reconhecidos: ${unacknowledgedAlerts.length}`);
    console.log('');

    // Se houver alertas, mostra detalhes do primeiro
    if (allAlerts.length > 0) {
      const firstAlert = allAlerts[0];
      console.log('📱 Detalhes do primeiro alerta:');
      console.log(`ID: ${firstAlert.id}`);
      console.log(`Título: ${firstAlert.title}`);
      console.log(`Severidade: ${firstAlert.severity}`);
      console.log(`Status: ${firstAlert.status}`);
      console.log(`Dispositivo: ${firstAlert.deviceName || 'N/A'}`);
      console.log(`Data: ${firstAlert.createdAt}`);
      console.log('');

      // Obtém detalhes completos do alerta
      console.log('📊 Obtendo detalhes completos...');
      const alertDetails = await alertService.getAlert(firstAlert.id);
      console.log('Detalhes completos:', JSON.stringify(alertDetails, null, 2));
      console.log('');

      // Exemplo de atualização de status (comentado para segurança)
      console.log('✏️ Exemplo de atualização de status (comentado):');
      console.log('// await alertService.updateAlertStatus(firstAlert.id, "acknowledged");');
      console.log('');
    }

    // Exemplo de reconhecimento em lote (comentado para segurança)
    console.log('📝 Exemplo de reconhecimento em lote (comentado):');
    console.log('// const alertIds = unacknowledgedAlerts.map(alert => alert.id);');
    console.log('// await alertService.acknowledgeAlerts(alertIds);');
    console.log('');

  } catch (error) {
    console.error('❌ Erro durante a execução:', error.message);
  }
}

// Executa o exemplo se o arquivo for executado diretamente
if (require.main === module) {
  exemploGerenciamentoAlertas();
}

module.exports = { exemploGerenciamentoAlertas };