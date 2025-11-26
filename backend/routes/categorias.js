const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET - Listar todas as categorias
router.get('/', (req, res) => {
  db.query('SELECT * FROM categorias ORDER BY nome', (err, results) => {
    if (err) {
      console.error('Erro ao buscar categorias:', err);
      return res.status(500).json({ error: 'Erro ao buscar categorias' });
    }
    res.json(results);
  });
});

module.exports = router;
