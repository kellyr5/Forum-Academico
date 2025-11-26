const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Relatorio de Atividades do Forum (COMPLETO)
router.get('/atividades', (req, res) => {
  const queries = {
    usuarios: 'SELECT COUNT(*) as total FROM usuarios WHERE excluido = FALSE',
    topicos: 'SELECT COUNT(*) as total FROM topicos',
    respostas: 'SELECT COUNT(*) as total FROM respostas',
    arquivos: 'SELECT COUNT(*) as total FROM arquivos',
    recados: 'SELECT COUNT(*) as total FROM mural_recados',
    matriculas: 'SELECT COUNT(*) as total FROM matriculas',
    monitorias: 'SELECT COUNT(*) as total FROM monitorias',
    disciplinas: 'SELECT COUNT(*) as total FROM disciplinas',
    topicos_por_disciplina: `
      SELECT d.nome as disciplina, d.codigo, COUNT(t.id) as total_topicos
      FROM disciplinas d
      LEFT JOIN topicos t ON d.id = t.disciplina_id
      GROUP BY d.id, d.nome, d.codigo
      ORDER BY total_topicos DESC
    `,
    usuarios_mais_ativos: `
      SELECT u.nome_completo, u.tipo_usuario,
             COUNT(DISTINCT t.id) as topicos_criados,
             COUNT(DISTINCT r.id) as respostas_dadas
      FROM usuarios u
      LEFT JOIN topicos t ON u.id = t.usuario_id
      LEFT JOIN respostas r ON u.id = r.usuario_id
      WHERE u.excluido = FALSE
      GROUP BY u.id, u.nome_completo, u.tipo_usuario
      HAVING (topicos_criados > 0 OR respostas_dadas > 0)
      ORDER BY (topicos_criados + respostas_dadas) DESC
      LIMIT 10
    `,
    recados_por_tipo: `
      SELECT tipo_aviso, COUNT(*) as total
      FROM mural_recados
      GROUP BY tipo_aviso
      ORDER BY total DESC
    `,
    matriculas_por_status: `
      SELECT status, COUNT(*) as total
      FROM matriculas
      GROUP BY status
    `,
    topicos_por_status: `
      SELECT status, COUNT(*) as total
      FROM topicos
      GROUP BY status
    `,
    arquivos_por_tipo: `
      SELECT tipo_mime, COUNT(*) as total, SUM(tamanho) as tamanho_total
      FROM arquivos
      GROUP BY tipo_mime
      ORDER BY total DESC
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
          gerado_em: new Date().toISOString(),
          resumo: {
            total_usuarios: resultados.usuarios[0]?.total || 0,
            total_disciplinas: resultados.disciplinas[0]?.total || 0,
            total_topicos: resultados.topicos[0]?.total || 0,
            total_respostas: resultados.respostas[0]?.total || 0,
            total_arquivos: resultados.arquivos[0]?.total || 0,
            total_recados: resultados.recados[0]?.total || 0,
            total_matriculas: resultados.matriculas[0]?.total || 0,
            total_monitorias: resultados.monitorias[0]?.total || 0
          },
          detalhes: {
            topicos_por_disciplina: resultados.topicos_por_disciplina || [],
            usuarios_mais_ativos: resultados.usuarios_mais_ativos || [],
            recados_por_tipo: resultados.recados_por_tipo || [],
            matriculas_por_status: resultados.matriculas_por_status || [],
            topicos_por_status: resultados.topicos_por_status || [],
            arquivos_por_tipo: resultados.arquivos_por_tipo || []
          }
        });
      }
    });
  });
});

// Relatorio de Arquivos por Usuario
router.get('/arquivos-usuario', (req, res) => {
  const sql = `
    SELECT u.nome_completo, u.tipo_usuario,
           COUNT(a.id) as total_arquivos,
           COALESCE(SUM(a.tamanho), 0) as total_bytes,
           ROUND(COALESCE(SUM(a.tamanho), 0) / 1024 / 1024, 2) as total_mb
    FROM usuarios u
    LEFT JOIN arquivos a ON u.id = a.usuario_id
    WHERE u.excluido = FALSE
    GROUP BY u.id, u.nome_completo, u.tipo_usuario
    HAVING total_arquivos > 0
    ORDER BY total_arquivos DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Relatorio de Topicos Populares
router.get('/topicos-populares', (req, res) => {
  const sql = `
    SELECT t.id, t.titulo, t.status, d.nome as disciplina, u.nome_completo as autor,
           COUNT(r.id) as total_respostas, t.visualizacoes, t.criado_em
    FROM topicos t
    LEFT JOIN respostas r ON t.id = r.topico_id
    LEFT JOIN disciplinas d ON t.disciplina_id = d.id
    LEFT JOIN usuarios u ON t.usuario_id = u.id
    GROUP BY t.id
    ORDER BY total_respostas DESC, t.visualizacoes DESC
    LIMIT 20
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Relatorio Geral (endpoint adicional)
router.get('/geral', (req, res) => {
  const sql = `
    SELECT 
      (SELECT COUNT(*) FROM usuarios WHERE excluido = FALSE) as usuarios,
      (SELECT COUNT(*) FROM disciplinas) as disciplinas,
      (SELECT COUNT(*) FROM topicos) as topicos,
      (SELECT COUNT(*) FROM respostas) as respostas,
      (SELECT COUNT(*) FROM arquivos) as arquivos,
      (SELECT COUNT(*) FROM mural_recados) as recados,
      (SELECT COUNT(*) FROM matriculas) as matriculas,
      (SELECT COUNT(*) FROM monitorias) as monitorias
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
});

module.exports = router;
