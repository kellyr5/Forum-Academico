const db = require('../config/database');

// Registrar log de auditoria (RN11, RN18, RN24, RN59, RN68)
const registrarLog = (usuarioId, acao, tabela, registroId, dadosAnteriores, dadosNovos, ipAddress) => {
  const sql = `
    INSERT INTO logs_auditoria 
    (usuario_id, acao, tabela, registro_id, dados_anteriores, dados_novos, ip_address)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  const dadosAnterioresJson = dadosAnteriores ? JSON.stringify(dadosAnteriores) : null;
  const dadosNovosJson = dadosNovos ? JSON.stringify(dadosNovos) : null;
  
  db.query(sql, [usuarioId, acao, tabela, registroId, dadosAnterioresJson, dadosNovosJson, ipAddress], (err) => {
    if (err) {
      console.error('Erro ao registrar log de auditoria:', err);
    }
  });
};

module.exports = { registrarLog };
