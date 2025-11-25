const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verificarAutenticacao, verificarProfessorOuAdmin } = require('../middleware/auth');

// GET - Disciplinas que um monitor monitora
router.get('/monitor/:monitorId', verificarAutenticacao, (req, res) => {
  const monitorId = req.params.monitorId;
  
  // Verificar se é o próprio monitor ou admin
  if (req.usuario.id != monitorId && req.usuario.tipo_usuario !== 'Administrador') {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  
  const sql = `
    SELECT m.*, d.nome as disciplina_nome, d.codigo, d.periodo_letivo,
           u.nome_completo as professor_nome
    FROM monitorias m
    JOIN disciplinas d ON m.disciplina_id = d.id
    LEFT JOIN usuarios u ON d.professor_id = u.id
    WHERE m.monitor_id = ? AND m.ativa = TRUE
    ORDER BY d.nome
  `;
  
  db.query(sql, [monitorId], (err, results) => {
    if (err) {
      console.error('Erro ao buscar monitorias:', err);
      return res.status(500).json({ error: 'Erro ao buscar disciplinas' });
    }
    res.json(results);
  });
});

// POST - Adicionar monitor (professor ou admin)
router.post('/', verificarAutenticacao, verificarProfessorOuAdmin, (req, res) => {
  const { monitor_id, disciplina_id, semestre } = req.body;
  
  if (!monitor_id || !disciplina_id || !semestre) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }
  
  const sql = `
    INSERT INTO monitorias (monitor_id, disciplina_id, semestre, ativa)
    VALUES (?, ?, ?, TRUE)
  `;
  
  db.query(sql, [monitor_id, disciplina_id, semestre], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Monitor já vinculado a esta disciplina' });
      }
      console.error('Erro ao adicionar monitor:', err);
      return res.status(500).json({ error: 'Erro ao adicionar monitor' });
    }
    
    res.status(201).json({
      id: result.insertId,
      message: 'Monitor adicionado com sucesso'
    });
  });
});

// DELETE - Remover monitor (professor ou admin)
router.delete('/:id', verificarAutenticacao, verificarProfessorOuAdmin, (req, res) => {
  const monitoriaId = req.params.id;
  
  db.query('DELETE FROM monitorias WHERE id = ?', [monitoriaId], (err) => {
    if (err) {
      console.error('Erro ao remover monitoria:', err);
      return res.status(500).json({ error: 'Erro ao remover monitoria' });
    }
    res.json({ message: 'Monitor removido com sucesso' });
  });
});

module.exports = router;
