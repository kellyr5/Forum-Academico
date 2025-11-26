const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Relatorio de Atividades do Forum
router.get('/atividades', (req, res) => {
  const { data_inicio, data_fim } = req.query;
  
  const queries = {
    usuarios: 'SELECT COUNT(*) as total FROM usuarios',
    topicos: 'SELECT COUNT(*) as total FROM topicos',
    respostas: 'SELECT COUNT(*) as total FROM respostas',
    arquivos: 'SELECT COUNT(*) as total FROM arquivos',
    recados: 'SELECT COUNT(*) as total FROM mural_recados',
    topicos_por_disciplina: `
      SELECT d.nome as disciplina, COUNT(t.id) as total_topicos
      FROM disciplinas d
      LEFT JOIN topicos t ON d.id = t.disciplina_id
      GROUP BY d.id, d.nome
      ORDER BY total_topicos DESC
    `,
    usuarios_mais_ativos: `
      SELECT u.nome_completo, 
             COUNT(DISTINCT t.id) as topicos_criados,
             COUNT(DISTINCT r.id) as respostas_dadas
      FROM usuarios u
      LEFT JOIN topicos t ON u.id = t.usuario_id
      LEFT JOIN respostas r ON u.id = r.usuario_id
      GROUP BY u.id, u.nome_completo
      HAVING (topicos_criados > 0 OR respostas_dadas > 0)
      ORDER BY (topicos_criados + respostas_dadas) DESC
      LIMIT 10
    `,
    recados_por_tipo: `
      SELECT tipo_aviso, COUNT(*) as total
      FROM mural_recados
      GROUP BY tipo_aviso
    `
  };

  const resultados = {};
  let completados = 0;
  const total = Object.keys(queries).length;

  Object.keys(queries).forEach(key => {
    db.query(queries[key], (err, resultado) => {
      if (err) {
        console.error(`Erro em ${key}:`, err);
        resultados[key] = [];
      } else {
        resultados[key] = resultado;
      }
      
      completados++;
      if (completados === total) {
        res.json({
          periodo: {
            inicio: data_inicio || 'Inicio',
            fim: data_fim || 'Hoje'
          },
          resumo: {
            total_usuarios: resultados.usuarios[0]?.total || 0,
            total_topicos: resultados.topicos[0]?.total || 0,
            total_respostas: resultados.respostas[0]?.total || 0,
            total_arquivos: resultados.arquivos[0]?.total || 0,
            total_recados: resultados.recados[0]?.total || 0
          },
          topicos_por_disciplina: resultados.topicos_por_disciplina || [],
          usuarios_mais_ativos: resultados.usuarios_mais_ativos || [],
          recados_por_tipo: resultados.recados_por_tipo || []
        });
      }
    });
  });
});

// Relatorio de Arquivos por Usuario
router.get('/arquivos-usuario', (req, res) => {
  const sql = `
    SELECT 
      u.nome_completo,
      COUNT(a.id) as total_arquivos,
      SUM(a.tamanho) as total_bytes,
      ROUND(SUM(a.tamanho) / 1024 / 1024, 2) as total_mb
    FROM usuarios u
    LEFT JOIN arquivos a ON u.id = a.usuario_id
    GROUP BY u.id, u.nome_completo
    HAVING total_arquivos > 0
    ORDER BY total_arquivos DESC
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Relatorio de Topicos Mais Discutidos
router.get('/topicos-populares', (req, res) => {
  const sql = `
    SELECT 
      t.titulo,
      d.nome as disciplina,
      u.nome_completo as autor,
      COUNT(r.id) as total_respostas,
      t.visualizacoes,
      t.criado_em
    FROM topicos t
    LEFT JOIN respostas r ON t.id = r.topico_id
    LEFT JOIN disciplinas d ON t.disciplina_id = d.id
    LEFT JOIN usuarios u ON t.usuario_id = u.id
    GROUP BY t.id
    ORDER BY total_respostas DESC, t.visualizacoes DESC
    LIMIT 20
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

module.exports = router;
