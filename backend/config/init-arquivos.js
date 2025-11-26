const db = require('./database');

function criarTabelaArquivos() {
  const sql = `
    CREATE TABLE IF NOT EXISTS arquivos (
      id INT PRIMARY KEY AUTO_INCREMENT,
      nome_original VARCHAR(255) NOT NULL,
      nome_arquivo VARCHAR(255) NOT NULL,
      tamanho INT NOT NULL,
      tipo_mime VARCHAR(100) NOT NULL,
      hash_arquivo VARCHAR(64) NOT NULL,
      topico_id INT NULL,
      resposta_id INT NULL,
      usuario_id INT NOT NULL,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_hash (hash_arquivo),
      INDEX idx_topico (topico_id),
      INDEX idx_resposta (resposta_id),
      INDEX idx_usuario (usuario_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `;

  db.query(sql, (err) => {
    if (err) {
      console.error('Erro ao criar tabela arquivos:', err.message);
    } else {
      console.log('✓ Tabela arquivos verificada/criada com sucesso');
    }
  });
}

module.exports = { criarTabelaArquivos };
