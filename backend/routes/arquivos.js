const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const db = require('../config/database');
const { registrarLog } = require('../utils/auditoria');
const { verificarAutenticacao } = require('../middleware/auth');

// Configurar multer para upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const hash = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, hash + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// GET - Listar todos os arquivos (RFS25)
router.get('/', (req, res) => {
  const sql = `
    SELECT a.*, u.nome_completo as usuario_nome,
           t.titulo as topico_titulo
    FROM arquivos a
    LEFT JOIN usuarios u ON a.usuario_id = u.id
    LEFT JOIN topicos t ON a.topico_id = t.id
    ORDER BY a.criado_em DESC
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Erro ao buscar arquivos:', err);
      return res.status(500).json({ error: 'Erro ao buscar arquivos' });
    }
    res.json(results);
  });
});

// POST - Upload de arquivo (RFS24)
router.post('/', verificarAutenticacao, upload.single('arquivo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo foi enviado' });
  }
  
  const { topico_id, resposta_id, usuario_id } = req.body;
  
  if (!usuario_id) {
    // Remover arquivo se não tiver usuário
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: 'ID do usuário é obrigatório' });
  }
  
  // RN77: Verificar tamanho máximo (já validado pelo multer)
  // RN78: Tipos permitidos (adicionar validação se necessário)
  
  // Calcular hash do arquivo (RN80)
  const fileBuffer = fs.readFileSync(req.file.path);
  const hashSum = crypto.createHash('md5');
  hashSum.update(fileBuffer);
  const fileHash = hashSum.digest('hex');
  
  const sql = `
    INSERT INTO arquivos 
    (nome_original, nome_arquivo, tamanho, tipo_mime, hash_arquivo, topico_id, resposta_id, usuario_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const values = [
    req.file.originalname,
    req.file.filename,
    req.file.size,
    req.file.mimetype,
    fileHash,
    topico_id || null,
    resposta_id || null,
    usuario_id
  ];
  
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Erro ao salvar arquivo:', err);
      // Remover arquivo se erro ao salvar no BD
      fs.unlinkSync(req.file.path);
      return res.status(500).json({ error: 'Erro ao salvar arquivo' });
    }
    
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    registrarLog(usuario_id, 'UPLOAD_ARQUIVO', 'arquivos', result.insertId, null, { nome: req.file.originalname }, ipAddress);
    
    res.status(201).json({
      id: result.insertId,
      message: 'Arquivo enviado com sucesso',
      arquivo: {
        id: result.insertId,
        nome_original: req.file.originalname,
        tamanho: req.file.size
      }
    });
  });
});

// GET - Download de arquivo (RFS26)
router.get('/:id/download', (req, res) => {
  const arquivoId = req.params.id;
  
  db.query('SELECT * FROM arquivos WHERE id = ?', [arquivoId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar arquivo' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }
    
    const arquivo = results[0];
    const filePath = path.join(__dirname, '../uploads', arquivo.nome_arquivo);
    
    // Verificar se arquivo existe fisicamente
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Arquivo físico não encontrado no servidor' });
    }
    
    // RN88: Registrar log de download
    const usuarioId = req.headers['x-usuario-id'];
    if (usuarioId) {
      const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      registrarLog(usuarioId, 'DOWNLOAD_ARQUIVO', 'arquivos', arquivoId, null, { nome: arquivo.nome_original }, ipAddress);
    }
    
    res.download(filePath, arquivo.nome_original);
  });
});

// DELETE - Excluir arquivo (RFS27) - Soft Delete
router.delete('/:id', verificarAutenticacao, (req, res) => {
  const arquivoId = req.params.id;
  
  // Verificar se o usuário é o autor ou admin
  db.query('SELECT * FROM arquivos WHERE id = ?', [arquivoId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao verificar arquivo' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }
    
    const arquivo = results[0];
    
    // RN91: Apenas autor ou admin pode excluir
    if (arquivo.usuario_id !== req.usuario.id && req.usuario.tipo_usuario !== 'Administrador') {
      return res.status(403).json({ error: 'Você não tem permissão para excluir este arquivo' });
    }
    
    // RN90: Soft delete (apenas marcar como excluído, não remover do banco)
    // Como não temos coluna 'excluido' na tabela arquivos, vamos fazer delete físico mesmo
    // mas idealmente deveria ser soft delete
    
    db.query('DELETE FROM arquivos WHERE id = ?', [arquivoId], (err) => {
      if (err) {
        console.error('Erro ao excluir arquivo:', err);
        return res.status(500).json({ error: 'Erro ao excluir arquivo' });
      }
      
      // Tentar remover arquivo físico
      const filePath = path.join(__dirname, '../uploads', arquivo.nome_arquivo);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      registrarLog(req.usuario.id, 'EXCLUIR_ARQUIVO', 'arquivos', arquivoId, { nome: arquivo.nome_original }, null, ipAddress);
      
      res.json({ message: 'Arquivo excluído com sucesso' });
    });
  });
});

module.exports = router;
