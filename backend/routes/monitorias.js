const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verificarAutenticacao, verificarProfessorOuAdmin } = require('../middleware/auth');

// GET - Listar todas as monitorias
router.get('/', verificarAutenticacao, (req, res) => {
  const sql = `
    SELECT m.*, u.nome_completo as monitor_nome, d.nome as disciplina_nome, d.codigo
    FROM monitorias m
    JOIN usuarios u ON m.monitor_id = u.id
    JOIN disciplinas d ON m.disciplina_id = d.id
    ORDER BY m.criado_em DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar monitorias' });
    res.json(results);
  });
});

// GET - Monitorias de um monitor
router.get('/monitor/:monitorId', verificarAutenticacao, (req, res) => {
  const sql = `
    SELECT m.*, d.nome as disciplina_nome, d.codigo, d.periodo_letivo,
           u.nome_completo as professor_nome
    FROM monitorias m
    JOIN disciplinas d ON m.disciplina_id = d.id
    LEFT JOIN usuarios u ON d.professor_id = u.id
    WHERE m.monitor_id = ? AND m.ativa = TRUE
    ORDER BY d.nome
  `;
  db.query(sql, [req.params.monitorId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar monitorias' });
    res.json(results);
  });
});

// GET - Obter monitoria por id
router.get('/:id', verificarAutenticacao, (req, res) => {
  const sql = `
    SELECT m.*, u.nome_completo as monitor_nome, d.nome as disciplina_nome, d.codigo
    FROM monitorias m
    JOIN usuarios u ON m.monitor_id = u.id
    JOIN disciplinas d ON m.disciplina_id = d.id
    WHERE m.id = ?
  `;
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar monitoria' });
    if (!results || results.length === 0) return res.status(404).json({ error: 'Monitoria nao encontrada' });
    res.json(results[0]);
  });
});

// POST - Criar monitoria
router.post('/', verificarAutenticacao, (req, res) => {
  const { monitor_id, disciplina_id, semestre } = req.body;
  if (!monitor_id || !disciplina_id || !semestre) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }
  const sql = 'INSERT INTO monitorias (monitor_id, disciplina_id, semestre, ativa) VALUES (?, ?, ?, TRUE)';
  db.query(sql, [monitor_id, disciplina_id, semestre], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Monitor ja vinculado a esta disciplina' });
      return res.status(500).json({ error: 'Erro ao adicionar monitoria' });
    }
    res.status(201).json({ id: result.insertId, message: 'Monitoria criada com sucesso' });
  });
});

// PUT - Atualizar monitoria
router.put('/:id', verificarAutenticacao, (req, res) => {
  const { ativa, semestre, monitor_id, disciplina_id } = req.body;
  db.query('SELECT * FROM monitorias WHERE id = ?', [req.params.id], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ error: 'Monitoria nao encontrada' });
    const m = results[0];
    const sql = 'UPDATE monitorias SET monitor_id = ?, disciplina_id = ?, ativa = ?, semestre = ? WHERE id = ?';
    const newMonitor = monitor_id !== undefined ? monitor_id : m.monitor_id;
    const newDisciplina = disciplina_id !== undefined ? disciplina_id : m.disciplina_id;
    const newAtiva = ativa !== undefined ? ativa : m.ativa;
    const newSemestre = semestre || m.semestre;
    db.query(sql, [newMonitor, newDisciplina, newAtiva, newSemestre, req.params.id], (err) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Monitor ja vinculado a esta disciplina' });
        return res.status(500).json({ error: 'Erro ao atualizar monitoria' });
      }
      res.json({ message: 'Monitoria atualizada com sucesso' });
    });
  });
});

// DELETE - Remover monitoria
router.delete('/:id', verificarAutenticacao, (req, res) => {
  db.query('DELETE FROM monitorias WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erro ao remover monitoria' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Monitoria nao encontrada' });
    res.json({ message: 'Monitoria removida com sucesso' });
  });
});

module.exports = router;
