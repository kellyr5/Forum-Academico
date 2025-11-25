const db = require('./database');

function corrigirTabelaUsuarios() {
  // Modificar coluna universidade_id para ser NULL
  const sql = `
    ALTER TABLE usuarios 
    MODIFY COLUMN universidade_id INT NULL
  `;

  db.query(sql, (err) => {
    if (err) {
      console.error('Erro ao modificar coluna universidade_id:', err.message);
    } else {
      console.log('✓ Coluna universidade_id modificada para aceitar NULL');
    }
  });
}

module.exports = { corrigirTabelaUsuarios };
