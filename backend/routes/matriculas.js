const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verificarAutenticacao, verificarAdmin } = require('../middleware/auth');

// GET - Disciplinas de um aluno
router.get('/aluno/:alunoId', verificarAutenticacao, (req, res) => {
  const alunoId = req.params.alunoId;
  
  // Verificar se é o próprio aluno ou admin
  if (req.usuario.id != alunoId && req.usuario.tipo_usuario !== 'Administrador') {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  
  const sql = `
    SELECT m.*, d.nome as disciplina_nome, d.codigo, d.periodo_letivo,
           u.nome_completo as professor_nome
    FROM matriculas m
    JOIN disciplinas d ON m.disciplina_id = d.id
    LEFT JOIN usuarios u ON d.professor_id = u.id
    WHERE m.aluno_id = ? AND m.status = 'Ativa'
    ORDER BY d.nome
  `;
  
  db.query(sql, [alunoId], (err, results) => {
    if (err) {
      console.error('Erro ao buscar matrículas:', err);
      return res.status(500).json({ error: 'Erro ao buscar disciplinas' });
    }
    res.json(results);
  });
});

// POST - Matricular aluno (apenas admin)
router.post('/', verificarAutenticacao, verificarAdmin, (req, res) => {
  const { aluno_id, disciplina_id, semestre } = req.body;
  
  if (!aluno_id || !disciplina_id || !semestre) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }
  
  const sql = `
    INSERT INTO matriculas (aluno_id, disciplina_id, semestre, status)
    VALUES (?, ?, ?, 'Ativa')
  `;
  
  db.query(sql, [aluno_id, disciplina_id, semestre], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Aluno já matriculado nesta disciplina' });
      }
      console.error('Erro ao matricular:', err);
      return res.status(500).json({ error: 'Erro ao matricular aluno' });
    }
    
    res.status(201).json({
      id: result.insertId,
      message: 'Aluno matriculado com sucesso'
    });
  });
});

// DELETE - Remover matrícula (apenas admin)
router.delete('/:id', verificarAutenticacao, verificarAdmin, (req, res) => {
  const matriculaId = req.params.id;
  
  db.query('DELETE FROM matriculas WHERE id = ?', [matriculaId], (err) => {
    if (err) {
      console.error('Erro ao remover matrícula:', err);
      return res.status(500).json({ error: 'Erro ao remover matrícula' });
    }
    res.json({ message: 'Matrícula removida com sucesso' });
  });
});

module.exports = router;
