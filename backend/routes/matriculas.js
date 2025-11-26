const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verificarAutenticacao } = require('../middleware/auth');

// --------------------------------------------------
// GET - Todas as matrículas
// --------------------------------------------------
router.get('/', verificarAutenticacao, (req, res) => {
  const sql = `
    SELECT m.*,
           u.nome_completo AS aluno_nome,
           d.nome AS disciplina_nome,
           d.codigo
    FROM matriculas m
    JOIN usuarios u ON m.aluno_id = u.id
    JOIN disciplinas d ON m.disciplina_id = d.id
    ORDER BY m.data_matricula DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao carregar matrículas.' });
    }
    res.json(results);
  });
});

// --------------------------------------------------
// GET - Matrículas do aluno
// --------------------------------------------------
router.get('/aluno/:alunoId', verificarAutenticacao, (req, res) => {
  const sql = `
    SELECT m.*, d.nome AS disciplina_nome, d.codigo,
           u.nome_completo AS professor_nome
    FROM matriculas m
    JOIN disciplinas d ON m.disciplina_id = d.id
    LEFT JOIN usuarios u ON d.professor_id = u.id
    WHERE m.aluno_id = ?
  `;

  db.query(sql, [req.params.alunoId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao buscar matrículas do aluno.' });
    }
    res.json(results);
  });
});

// --------------------------------------------------
// GET - Matrícula por ID
// --------------------------------------------------
router.get('/:id', verificarAutenticacao, (req, res) => {
  const sql = `
    SELECT m.*,
           u.nome_completo AS aluno_nome,
           d.nome AS disciplina_nome, d.codigo
    FROM matriculas m
    JOIN usuarios u ON m.aluno_id = u.id
    JOIN disciplinas d ON m.disciplina_id = d.id
    WHERE m.id = ?
  `;

  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar matrícula.' });
    if (!result || result.length === 0)
      return res.status(404).json({ error: 'Matrícula não encontrada.' });

    res.json(result[0]);
  });
});

// --------------------------------------------------
// POST - Criar matrícula
// --------------------------------------------------
router.post('/', verificarAutenticacao, (req, res) => {
  const { aluno_id, disciplina_id, semestre } = req.body;

  if (!aluno_id || !disciplina_id || !semestre)
    return res.status(400).json({ error: 'Dados obrigatórios não informados.' });

  // Verifica duplicidade manualmente antes de inserir
  const verificaSql = `
    SELECT id FROM matriculas
    WHERE aluno_id = ? AND disciplina_id = ?
  `;

  db.query(verificaSql, [aluno_id, disciplina_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erro ao validar matrícula.' });

    if (result.length > 0)
      return res.status(400).json({ error: 'O aluno já está matriculado nesta disciplina.' });

    const sql = `
      INSERT INTO matriculas (aluno_id, disciplina_id, semestre, status)
      VALUES (?, ?, ?, 'Ativa')
    `;

    db.query(sql, [aluno_id, disciplina_id, semestre], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro ao salvar matrícula.' });
      }

      res.status(201).json({ id: result.insertId, message: 'Matrícula criada com sucesso!' });
    });
  });
});

// --------------------------------------------------
// PUT - Atualizar matrícula ✅
// --------------------------------------------------
router.put('/:id', verificarAutenticacao, (req, res) => {
  const { status, semestre } = req.body;

  if (!status && !semestre)
    return res.status(400).json({ error: 'Nenhum dado para atualização foi enviado.' });

  db.query('SELECT * FROM matriculas WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erro ao localizar matrícula.' });
    if (!result || result.length === 0)
      return res.status(404).json({ error: 'Matrícula não encontrada.' });

    const atual = result[0];
    const novoStatus = status ?? atual.status;
    const novoSemestre = semestre ?? atual.semestre;

    const sql = `
      UPDATE matriculas
      SET status = ?, semestre = ?
      WHERE id = ?
    `;

    db.query(sql, [novoStatus, novoSemestre, req.params.id], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro ao atualizar matrícula.' });
      }

      res.json({ message: 'Matrícula atualizada com sucesso!' });
    });
  });
});

// --------------------------------------------------
// DELETE - Remover matrícula
// --------------------------------------------------
router.delete('/:id', verificarAutenticacao, (req, res) => {
  const sql = 'DELETE FROM matriculas WHERE id = ?';

  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erro ao excluir matrícula.' });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Matrícula não encontrada.' });

    res.json({ message: 'Matrícula removida com sucesso!' });
  });
});

module.exports = router;
