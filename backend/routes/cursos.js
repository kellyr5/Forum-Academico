const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET - Listar todos os cursos
router.get('/', (req, res) => {
  const sql = `
    SELECT c.id, c.nome, u.nome as universidade_nome, u.sigla as universidade_sigla
    FROM cursos c
    LEFT JOIN universidades u ON c.universidade_id = u.id
    ORDER BY c.nome ASC
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Erro ao buscar cursos:', err);
      return res.status(500).json({ error: 'Erro ao buscar cursos' });
    }
    res.json(results);
  });
});

module.exports = router;
