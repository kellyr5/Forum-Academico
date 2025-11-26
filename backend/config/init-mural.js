const db = require('./database');

function criarTabelaMural() {
  const sql = `
    CREATE TABLE IF NOT EXISTS mural_recados (
      id INT PRIMARY KEY AUTO_INCREMENT,
      titulo VARCHAR(200) NOT NULL,
      conteudo TEXT NOT NULL,
      usuario_id INT NOT NULL,
      tipo_aviso ENUM('importante', 'evento', 'geral', 'aviso_faculdade') DEFAULT 'geral',
      fixado BOOLEAN DEFAULT FALSE,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_usuario (usuario_id),
      INDEX idx_fixado (fixado),
      INDEX idx_tipo (tipo_aviso)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `;

  db.query(sql, (err) => {
    if (err) {
      console.error('Erro ao criar tabela mural_recados:', err.message);
    } else {
      console.log('✓ Tabela mural_recados verificada/criada com sucesso');
      
      // Verificar se coluna tipo_aviso existe
      db.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'forum_academico' 
        AND TABLE_NAME = 'mural_recados' 
        AND COLUMN_NAME = 'tipo_aviso'
      `, (err, results) => {
        if (err) {
          console.error('Erro ao verificar coluna tipo_aviso:', err.message);
          return;
        }
        
        // Se a coluna não existe, adicionar
        if (results.length === 0) {
          db.query(`
            ALTER TABLE mural_recados 
            ADD COLUMN tipo_aviso ENUM('importante', 'evento', 'geral', 'aviso_faculdade') DEFAULT 'geral' 
            AFTER usuario_id
          `, (err) => {
            if (err) {
              console.error('Erro ao adicionar coluna tipo_aviso:', err.message);
            } else {
              console.log('✓ Coluna tipo_aviso adicionada com sucesso');
            }
          });
        }
      });
    }
  });
}

module.exports = { criarTabelaMural };
