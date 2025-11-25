const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verificarPalavrasOdio } = require('../utils/validacoes');
const { registrarLog } = require('../utils/auditoria');
const { verificarAutenticacao } = require('../middleware/auth');

// GET - Listar tópicos
router.get('/', (req, res) => {
  const { disciplina_id, categoria_id, status } = req.query;
  
  let sql = `
    SELECT t.*, u.nome_completo as autor_nome, d.nome as disciplina_nome, 
           c.nome as categoria_nome,
           (SELECT COUNT(*) FROM respostas WHERE topico_id = t.id) as total_respostas
    FROM topicos t
    LEFT JOIN usuarios u ON t.usuario_id = u.id
    LEFT JOIN disciplinas d ON t.disciplina_id = d.id
    LEFT JOIN categorias c ON t.categoria_id = c.id
    WHERE 1=1
  `;
  
  const params = [];
  
  if (disciplina_id) {
    sql += ' AND t.disciplina_id = ?';
    params.push(disciplina_id);
  }
  
  if (categoria_id) {
    sql += ' AND t.categoria_id = ?';
    params.push(categoria_id);
  }
  
  if (status) {
    sql += ' AND t.status = ?';
    params.push(status);
  }
  
  sql += ' ORDER BY t.fixo DESC, t.criado_em DESC';
  
  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Erro ao buscar tópicos:', err);
      return res.status(500).json({ error: 'Erro ao buscar tópicos' });
    }
    res.json(results);
  });
});

// GET - Buscar tópico por ID
router.get('/:id', (req, res) => {
  const topicoId = req.params.id;
  
  const sql = `
    SELECT t.*, u.nome_completo as autor_nome, u.tipo_usuario as autor_tipo,
           d.nome as disciplina_nome, d.professor_id,
           c.nome as categoria_nome,
           (SELECT COUNT(*) FROM respostas WHERE topico_id = t.id) as total_respostas
    FROM topicos t
    LEFT JOIN usuarios u ON t.usuario_id = u.id
    LEFT JOIN disciplinas d ON t.disciplina_id = d.id
    LEFT JOIN categorias c ON t.categoria_id = c.id
    WHERE t.id = ?
  `;
  
  db.query(sql, [topicoId], (err, results) => {
    if (err) {
      console.error('Erro ao buscar tópico:', err);
      return res.status(500).json({ error: 'Erro ao buscar tópico' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Tópico não encontrado' });
    }
    
    // Incrementar visualizações
    db.query('UPDATE topicos SET visualizacoes = visualizacoes + 1 WHERE id = ?', [topicoId]);
    
    res.json(results[0]);
  });
});

// POST - Criar tópico
router.post('/', verificarAutenticacao, (req, res) => {
  const { titulo, conteudo, disciplina_id, usuario_id, categoria_id, tags } = req.body;
  
  if (!titulo || !conteudo || !disciplina_id || !usuario_id || !categoria_id) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }
  
  // RN38: Verificar palavras de ódio
  const textoCompleto = `${titulo} ${conteudo}`;
  verificarPalavrasOdio(textoCompleto, (err, resultado) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao validar conteúdo' });
    }
    
    if (resultado.encontrada) {
      return res.status(400).json({ error: resultado.erro });
    }
    
    // RN39: Verificar limite de 5 tópicos por dia
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    db.query(
      'SELECT COUNT(*) as total FROM topicos WHERE usuario_id = ? AND criado_em >= ?',
      [usuario_id, hoje],
      (err, results) => {
        if (err) {
          return res.status(500).json({ error: 'Erro ao verificar limite' });
        }
        
        if (results[0].total >= 5) {
          return res.status(400).json({ error: 'Você atingiu o limite de 5 tópicos por dia' });
        }
        
        const sql = `
          INSERT INTO topicos 
          (titulo, conteudo, disciplina_id, usuario_id, categoria_id, tags, status)
          VALUES (?, ?, ?, ?, ?, ?, 'Aberto')
        `;
        
        db.query(sql, [titulo, conteudo, disciplina_id, usuario_id, categoria_id, tags || null], (err, result) => {
          if (err) {
            console.error('Erro ao criar tópico:', err);
            return res.status(500).json({ error: 'Erro ao criar tópico' });
          }
          
          const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
          registrarLog(usuario_id, 'CRIAR_TOPICO', 'topicos', result.insertId, null, { titulo, disciplina_id }, ipAddress);
          
          res.status(201).json({
            id: result.insertId,
            message: 'Tópico criado com sucesso'
          });
        });
      }
    );
  });
});

// PUT - Editar tópico (RFS15)
router.put('/:id', verificarAutenticacao, (req, res) => {
  const topicoId = req.params.id;
  const { titulo, conteudo, categoria_id } = req.body;
  
  // Buscar tópico atual
  db.query('SELECT t.*, d.professor_id FROM topicos t JOIN disciplinas d ON t.disciplina_id = d.id WHERE t.id = ?', 
    [topicoId], 
    (err, results) => {
      if (err || results.length === 0) {
        return res.status(404).json({ error: 'Tópico não encontrado' });
      }
      
      const topico = results[0];
      
      // RN44: Tópicos fechados não podem ser editados
      if (topico.status === 'Fechado') {
        return res.status(403).json({ error: 'Tópicos fechados não podem ser editados' });
      }
      
      // RN43: Apenas criador, professor ou monitor pode editar
      const podeEditar = 
        topico.usuario_id === req.usuario.id ||
        topico.professor_id === req.usuario.id ||
        req.usuario.tipo_usuario === 'Monitor' ||
        req.usuario.tipo_usuario === 'Administrador';
      
      if (!podeEditar) {
        return res.status(403).json({ error: 'Você não tem permissão para editar este tópico' });
      }
      
      // RN45: Categoria "Anúncio" só professor ou admin
      if (categoria_id == 3) { // ID 3 = Anúncio
        if (req.usuario.tipo_usuario !== 'Professor' && req.usuario.tipo_usuario !== 'Administrador') {
          return res.status(403).json({ error: 'Apenas professores podem usar a categoria Anúncio' });
        }
      }
      
      // Verificar palavras de ódio
      const textoCompleto = `${titulo || topico.titulo} ${conteudo || topico.conteudo}`;
      verificarPalavrasOdio(textoCompleto, (err, resultado) => {
        if (err) {
          return res.status(500).json({ error: 'Erro ao validar conteúdo' });
        }
        
        if (resultado.encontrada) {
          return res.status(400).json({ error: resultado.erro });
        }
        
        const sql = `
          UPDATE topicos 
          SET titulo = ?, conteudo = ?, categoria_id = ?, atualizado_em = CURRENT_TIMESTAMP
          WHERE id = ?
        `;
        
        db.query(sql, [
          titulo || topico.titulo,
          conteudo || topico.conteudo,
          categoria_id || topico.categoria_id,
          topicoId
        ], (err) => {
          if (err) {
            console.error('Erro ao editar tópico:', err);
            return res.status(500).json({ error: 'Erro ao editar tópico' });
          }
          
          const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
          registrarLog(req.usuario.id, 'EDITAR_TOPICO', 'topicos', topicoId, topico, { titulo, conteudo }, ipAddress);
          
          res.json({ message: 'Tópico atualizado com sucesso' });
        });
      });
    }
  );
});

// DELETE - Excluir tópico (soft delete)
router.delete('/:id', verificarAutenticacao, (req, res) => {
  const topicoId = req.params.id;
  
  // Buscar tópico
  db.query('SELECT t.*, d.professor_id FROM topicos t JOIN disciplinas d ON t.disciplina_id = d.id WHERE t.id = ?', 
    [topicoId], 
    (err, results) => {
      if (err || results.length === 0) {
        return res.status(404).json({ error: 'Tópico não encontrado' });
      }
      
      const topico = results[0];
      
      // RN48: Apenas criador, professor, monitor ou admin pode excluir
      const podeExcluir = 
        topico.usuario_id === req.usuario.id ||
        topico.professor_id === req.usuario.id ||
        req.usuario.tipo_usuario === 'Monitor' ||
        req.usuario.tipo_usuario === 'Administrador';
      
      if (!podeExcluir) {
        return res.status(403).json({ error: 'Você não tem permissão para excluir este tópico' });
      }
      
      // RN49: Tópicos fixos só professor pode excluir
      if (topico.fixo && req.usuario.tipo_usuario !== 'Professor' && req.usuario.tipo_usuario !== 'Administrador') {
        return res.status(403).json({ error: 'Apenas professores podem excluir tópicos fixos' });
      }
      
      // RN47 e RN50: Soft delete e não pode receber novas respostas
      db.query('UPDATE topicos SET status = ? WHERE id = ?', ['Fechado', topicoId], (err) => {
        if (err) {
          console.error('Erro ao excluir tópico:', err);
          return res.status(500).json({ error: 'Erro ao excluir tópico' });
        }
        
        const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        registrarLog(req.usuario.id, 'EXCLUIR_TOPICO', 'topicos', topicoId, topico, null, ipAddress);
        
        res.json({ message: 'Tópico fechado com sucesso' });
      });
    }
  );
});

// PUT - Fixar/Desfixar tópico (apenas professor e admin)
router.put('/:id/fixar', verificarAutenticacao, (req, res) => {
  const topicoId = req.params.id;
  const { fixo } = req.body;
  
  if (req.usuario.tipo_usuario !== 'Professor' && req.usuario.tipo_usuario !== 'Administrador') {
    return res.status(403).json({ error: 'Apenas professores podem fixar tópicos' });
  }
  
  db.query('UPDATE topicos SET fixo = ? WHERE id = ?', [fixo, topicoId], (err) => {
    if (err) {
      console.error('Erro ao fixar tópico:', err);
      return res.status(500).json({ error: 'Erro ao fixar tópico' });
    }
    
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    registrarLog(req.usuario.id, fixo ? 'FIXAR_TOPICO' : 'DESFIXAR_TOPICO', 'topicos', topicoId, null, { fixo }, ipAddress);
    
    res.json({ message: fixo ? 'Tópico fixado com sucesso' : 'Tópico desfixado com sucesso' });
  });
});

module.exports = router;
