const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verificarPalavrasOdio } = require('../utils/validacoes');
const { registrarLog } = require('../utils/auditoria');
const { verificarAutenticacao, verificarProfessorMonitorOuAdmin } = require('../middleware/auth');

// GET - Listar todos os recados (RFS06)
router.get('/', (req, res) => {
  const sql = `
    SELECT r.*, u.nome_completo as autor_nome
    FROM mural_recados r
    LEFT JOIN usuarios u ON r.usuario_id = u.id
    ORDER BY r.criado_em DESC
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Erro ao buscar recados:', err);
      return res.status(500).json({ error: 'Erro ao buscar recados' });
    }
    res.json(results);
  });
});

// GET - Buscar recado por ID
router.get('/:id', (req, res) => {
  const recadoId = req.params.id;
  
  const sql = `
    SELECT r.*, u.nome_completo as autor_nome
    FROM mural_recados r
    LEFT JOIN usuarios u ON r.usuario_id = u.id
    WHERE r.id = ?
  `;
  
  db.query(sql, [recadoId], (err, results) => {
    if (err) {
      console.error('Erro ao buscar recado:', err);
      return res.status(500).json({ error: 'Erro ao buscar recado' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Recado não encontrado' });
    }
    
    res.json(results[0]);
  });
});

// POST - Criar novo recado (RFS05)
router.post('/', verificarAutenticacao, verificarProfessorMonitorOuAdmin, (req, res) => {
  const { titulo, conteudo, tipo_aviso } = req.body;
  const usuario_id = req.usuario.id;
  
  if (!titulo || !conteudo || !tipo_aviso) {
    return res.status(400).json({ error: 'Título, conteúdo e tipo de aviso são obrigatórios' });
  }
  
  // Verificar palavras de ódio no título e conteúdo
  const textoCompleto = `${titulo} ${conteudo}`;
  
  verificarPalavrasOdio(textoCompleto, (err, resultado) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao validar conteúdo' });
    }
    
    if (resultado.encontrada) {
      return res.status(400).json({ error: resultado.erro });
    }
    
    const sql = `
      INSERT INTO mural_recados (titulo, conteudo, tipo_aviso, usuario_id)
      VALUES (?, ?, ?, ?)
    `;
    
    db.query(sql, [titulo, conteudo, tipo_aviso, usuario_id], (err, result) => {
      if (err) {
        console.error('Erro ao criar recado:', err);
        return res.status(500).json({ error: 'Erro ao criar recado' });
      }
      
      // RN18: Registrar log
      const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      registrarLog(usuario_id, 'CRIAR_RECADO', 'mural_recados', result.insertId, null, { titulo, tipo_aviso }, ipAddress);
      
      res.status(201).json({ 
        id: result.insertId, 
        message: 'Recado publicado com sucesso' 
      });
    });
  });
});

// PUT - Editar recado (RFS07)
router.put('/:id', verificarAutenticacao, (req, res) => {
  const recadoId = req.params.id;
  const { titulo, conteudo, tipo_aviso } = req.body;
  
  // Buscar recado atual
  db.query('SELECT * FROM mural_recados WHERE id = ?', [recadoId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ error: 'Recado não encontrado' });
    }
    
    const recado = results[0];
    
    // RN22: Apenas autor ou admin pode editar
    if (recado.usuario_id !== req.usuario.id && req.usuario.tipo_usuario !== 'Administrador') {
      return res.status(403).json({ error: 'Você não tem permissão para editar este recado' });
    }
    
    // Verificar palavras de ódio
    const textoCompleto = `${titulo || recado.titulo} ${conteudo || recado.conteudo}`;
    verificarPalavrasOdio(textoCompleto, (err, resultado) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao validar conteúdo' });
      }
      
      if (resultado.encontrada) {
        return res.status(400).json({ error: resultado.erro });
      }
      
      const sql = `
        UPDATE mural_recados 
        SET titulo = ?, conteudo = ?, tipo_aviso = ?, atualizado_em = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      db.query(sql, [
        titulo || recado.titulo,
        conteudo || recado.conteudo,
        tipo_aviso || recado.tipo_aviso,
        recadoId
      ], (err) => {
        if (err) {
          console.error('Erro ao editar recado:', err);
          return res.status(500).json({ error: 'Erro ao editar recado' });
        }
        
        // RN24: Log de alteração
        const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        registrarLog(req.usuario.id, 'EDITAR_RECADO', 'mural_recados', recadoId, recado, { titulo, conteudo }, ipAddress);
        
        res.json({ message: 'Recado atualizado com sucesso' });
      });
    });
  });
});

// DELETE - Excluir recado (RFS08)
router.delete('/:id', verificarAutenticacao, (req, res) => {
  const recadoId = req.params.id;
  const { motivo } = req.body;
  
  // Verificar se o usuário é o autor ou admin
  db.query('SELECT usuario_id FROM mural_recados WHERE id = ?', [recadoId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao verificar recado' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Recado não encontrado' });
    }
    
    const recado = results[0];
    
    // RN22: Apenas autor ou admin pode excluir
    if (recado.usuario_id !== req.usuario.id && req.usuario.tipo_usuario !== 'Administrador') {
      return res.status(403).json({ error: 'Você não tem permissão para excluir este recado' });
    }
    
    // RN26: Registrar motivo
    if (!motivo) {
      return res.status(400).json({ error: 'Motivo da exclusão é obrigatório' });
    }
    
    db.query('DELETE FROM mural_recados WHERE id = ?', [recadoId], (err) => {
      if (err) {
        console.error('Erro ao excluir recado:', err);
        return res.status(500).json({ error: 'Erro ao excluir recado' });
      }
      
      const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      registrarLog(req.usuario.id, 'EXCLUIR_RECADO', 'mural_recados', recadoId, { motivo }, null, ipAddress);
      
      res.json({ message: 'Recado excluído com sucesso' });
    });
  });
});

module.exports = router;
