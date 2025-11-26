const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const db = require('../config/database');
const { registrarLog } = require('../utils/auditoria');
const { verificarAutenticacao } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const hash = crypto.randomBytes(16).toString('hex');
    cb(null, hash + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage, limits: { fileSize: 10 * 1024 * 1024 } });

// GET - Listar arquivos
router.get('/', (req, res) => {
  const sql = `
    SELECT a.*, u.nome_completo as usuario_nome, t.titulo as topico_titulo
    FROM arquivos a
    LEFT JOIN usuarios u ON a.usuario_id = u.id
    LEFT JOIN topicos t ON a.topico_id = t.id
    ORDER BY a.criado_em DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar arquivos' });
    res.json(results);
  });
});

// POST - Upload
router.post('/', verificarAutenticacao, upload.single('arquivo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  const { topico_id, resposta_id, usuario_id } = req.body;
  if (!usuario_id) {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: 'ID do usuario obrigatorio' });
  }
  const fileBuffer = fs.readFileSync(req.file.path);
  const hashSum = crypto.createHash('md5');
  hashSum.update(fileBuffer);
  const fileHash = hashSum.digest('hex');
  const sql = 'INSERT INTO arquivos (nome_original, nome_arquivo, tamanho, tipo_mime, hash_arquivo, topico_id, resposta_id, usuario_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [req.file.originalname, req.file.filename, req.file.size, req.file.mimetype, fileHash, topico_id || null, resposta_id || null, usuario_id], (err, result) => {
    if (err) {
      fs.unlinkSync(req.file.path);
      return res.status(500).json({ error: 'Erro ao salvar arquivo' });
    }
    res.status(201).json({ id: result.insertId, message: 'Arquivo enviado com sucesso', arquivo: { id: result.insertId, nome_original: req.file.originalname, tamanho: req.file.size } });
  });
});

// GET - Download
router.get('/:id/download', (req, res) => {
  db.query('SELECT * FROM arquivos WHERE id = ?', [req.params.id], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ error: 'Arquivo nao encontrado' });
    const arquivo = results[0];
    const filePath = path.join(__dirname, '../uploads', arquivo.nome_arquivo);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Arquivo fisico nao encontrado' });
    res.download(filePath, arquivo.nome_original);
  });
});

// PUT - Atualizar arquivo
router.put('/:id', verificarAutenticacao, (req, res) => {
  const { nome_original, topico_id, resposta_id } = req.body;
  db.query('SELECT * FROM arquivos WHERE id = ?', [req.params.id], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ error: 'Arquivo nao encontrado' });
    const a = results[0];
    const sql = 'UPDATE arquivos SET nome_original = ?, topico_id = ?, resposta_id = ? WHERE id = ?';
    db.query(sql, [nome_original || a.nome_original, topico_id !== undefined ? topico_id : a.topico_id, resposta_id !== undefined ? resposta_id : a.resposta_id, req.params.id], (err) => {
      if (err) return res.status(500).json({ error: 'Erro ao atualizar arquivo' });
      res.json({ message: 'Arquivo atualizado com sucesso' });
    });
  });
});

// DELETE - Excluir arquivo
router.delete('/:id', verificarAutenticacao, (req, res) => {
  db.query('SELECT * FROM arquivos WHERE id = ?', [req.params.id], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ error: 'Arquivo nao encontrado' });
    const arquivo = results[0];
    db.query('DELETE FROM arquivos WHERE id = ?', [req.params.id], (err) => {
      if (err) return res.status(500).json({ error: 'Erro ao excluir arquivo' });
      const filePath = path.join(__dirname, '../uploads', arquivo.nome_arquivo);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      res.json({ message: 'Arquivo excluido com sucesso' });
    });
  });
});

module.exports = router;
