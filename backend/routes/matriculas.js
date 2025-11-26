const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verificarAutenticacao, verificarAdmin } = require('../middleware/auth');

// GET - Listar todas as matriculas
router.get('/', verificarAutenticacao, (req, res) => {
  const sql = `
    SELECT m.*, u.nome_completo as aluno_nome, d.nome as disciplina_nome, d.codigo
    FROM matriculas m
    JOIN usuarios u ON m.aluno_id = u.id
    JOIN disciplinas d ON m.disciplina_id = d.id
    ORDER BY m.data_matricula DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar matriculas' });
    res.json(results);
  });
});

// GET - Matriculas de um aluno
router.get('/aluno/:alunoId', verificarAutenticacao, (req, res) => {
  const sql = `
    SELECT m.*, d.nome as disciplina_nome, d.codigo, d.periodo_letivo,
           u.nome_completo as professor_nome
    FROM matriculas m
    JOIN disciplinas d ON m.disciplina_id = d.id
    LEFT JOIN usuarios u ON d.professor_id = u.id
    WHERE m.aluno_id = ?
    ORDER BY d.nome
  `;
  db.query(sql, [req.params.alunoId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar matriculas' });
    res.json(results);
  });
});

// POST - Criar matricula
router.post('/', verificarAutenticacao, (req, res) => {
  const { aluno_id, disciplina_id, semestre } = req.body;
  if (!aluno_id || !disciplina_id || !semestre) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }
  const sql = 'INSERT INTO matriculas (aluno_id, disciplina_id, semestre, status) VALUES (?, ?, ?, "Ativa")';
  db.query(sql, [aluno_id, disciplina_id, semestre], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Aluno ja matriculado nesta disciplina' });
      return res.status(500).json({ error: 'Erro ao matricular' });
    }
    res.status(201).json({ id: result.insertId, message: 'Matricula realizada com sucesso' });
  });
});

// PUT - Atualizar matricula
router.put('/:id', verificarAutenticacao, (req, res) => {
  const { status, semestre } = req.body;
  db.query('SELECT * FROM matriculas WHERE id = ?', [req.params.id], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ error: 'Matricula nao encontrada' });
    const m = results[0];
    const sql = 'UPDATE matriculas SET status = ?, semestre = ? WHERE id = ?';
    db.query(sql, [status || m.status, semestre || m.semestre, req.params.id], (err) => {
      if (err) return res.status(500).json({ error: 'Erro ao atualizar matricula' });
      res.json({ message: 'Matricula atualizada com sucesso' });
    });
  });
});

// DELETE - Remover matricula
router.delete('/:id', verificarAutenticacao, (req, res) => {
  db.query('DELETE FROM matriculas WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erro ao remover matricula' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Matricula nao encontrada' });
    res.json({ message: 'Matricula removida com sucesso' });
  });
});

module.exports = router;
