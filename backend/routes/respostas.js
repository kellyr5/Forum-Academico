const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verificarPalavrasOdio } = require('../utils/validacoes');
const { registrarLog } = require('../utils/auditoria');
const { verificarAutenticacao } = require('../middleware/auth');

// GET - Listar respostas
router.get('/', (req, res) => {
  const { topico_id } = req.query;
  
  let sql = `
    SELECT r.*, u.nome_completo as autor_nome, u.tipo_usuario as autor_tipo
    FROM respostas r
    LEFT JOIN usuarios u ON r.usuario_id = u.id
    WHERE 1=1
  `;
  
  const params = [];
  
  if (topico_id) {
    sql += ' AND r.topico_id = ?';
    params.push(topico_id);
  }
  
  sql += ' ORDER BY r.melhor_resposta DESC, r.votos DESC, r.criado_em ASC';
  
  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Erro ao buscar respostas:', err);
      return res.status(500).json({ error: 'Erro ao buscar respostas' });
    }
    res.json(results);
  });
});

// POST - Criar resposta
router.post('/', verificarAutenticacao, (req, res) => {
  const { conteudo, topico_id, usuario_id, resposta_pai_id } = req.body;
  
  if (!conteudo || !topico_id || !usuario_id) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }
  
  // RN53: Verificar se tópico está fechado
  db.query('SELECT status FROM topicos WHERE id = ?', [topico_id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ error: 'Tópico não encontrado' });
    }
    
    if (results[0].status === 'Fechado') {
      return res.status(403).json({ error: 'Este tópico está fechado e não aceita mais respostas' });
    }
    
    // RN51: Verificar palavras de ódio
    verificarPalavrasOdio(conteudo, (err, resultado) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao validar conteúdo' });
      }
      
      if (resultado.encontrada) {
        return res.status(400).json({ error: resultado.erro });
      }
      
      // RN54: Verificar limite de 20 respostas por dia
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      db.query(
        'SELECT COUNT(*) as total FROM respostas WHERE usuario_id = ? AND criado_em >= ?',
        [usuario_id, hoje],
        (err, results) => {
          if (err) {
            return res.status(500).json({ error: 'Erro ao verificar limite' });
          }
          
          if (results[0].total >= 20) {
            return res.status(400).json({ error: 'Você atingiu o limite de 20 respostas por dia' });
          }
          
          const sql = `
            INSERT INTO respostas 
            (conteudo, topico_id, usuario_id, resposta_pai_id)
            VALUES (?, ?, ?, ?)
          `;
          
          db.query(sql, [conteudo, topico_id, usuario_id, resposta_pai_id || null], (err, result) => {
            if (err) {
              console.error('Erro ao criar resposta:', err);
              return res.status(500).json({ error: 'Erro ao criar resposta' });
            }
            
            const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            registrarLog(usuario_id, 'CRIAR_RESPOSTA', 'respostas', result.insertId, null, { topico_id }, ipAddress);
            
            res.status(201).json({
              id: result.insertId,
              message: 'Resposta criada com sucesso'
            });
          });
        }
      );
    });
  });
});

// PUT - Editar resposta (RFS19)
router.put('/:id', verificarAutenticacao, (req, res) => {
  const respostaId = req.params.id;
  const { conteudo } = req.body;
  
  if (!conteudo) {
    return res.status(400).json({ error: 'Conteúdo é obrigatório' });
  }
  
  // Buscar resposta e tópico
  db.query(`
    SELECT r.*, t.status as topico_status, t.usuario_id as topico_autor, d.professor_id
    FROM respostas r
    JOIN topicos t ON r.topico_id = t.id
    JOIN disciplinas d ON t.disciplina_id = d.id
    WHERE r.id = ?
  `, [respostaId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ error: 'Resposta não encontrada' });
    }
    
    const resposta = results[0];
    
    // RN57: Apenas autor, monitor ou professor pode editar
    const podeEditar = 
      resposta.usuario_id === req.usuario.id ||
      req.usuario.tipo_usuario === 'Monitor' ||
      resposta.professor_id === req.usuario.id ||
      req.usuario.tipo_usuario === 'Administrador';
    
    if (!podeEditar) {
      return res.status(403).json({ error: 'Você não tem permissão para editar esta resposta' });
    }
    
    // RN58: Tópicos fechados só professor pode editar
    if (resposta.topico_status === 'Fechado') {
      if (req.usuario.tipo_usuario !== 'Professor' && req.usuario.tipo_usuario !== 'Administrador') {
        return res.status(403).json({ error: 'Apenas professores podem editar respostas em tópicos fechados' });
      }
    }
    
    // Verificar palavras de ódio
    verificarPalavrasOdio(conteudo, (err, resultado) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao validar conteúdo' });
      }
      
      if (resultado.encontrada) {
        return res.status(400).json({ error: resultado.erro });
      }
      
      // RN60 e RN61: Manter melhor_resposta e hierarquia (não alterar)
      db.query('UPDATE respostas SET conteudo = ?, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?', 
        [conteudo, respostaId], 
        (err) => {
          if (err) {
            console.error('Erro ao editar resposta:', err);
            return res.status(500).json({ error: 'Erro ao editar resposta' });
          }
          
          // RN59: Log de auditoria
          const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
          registrarLog(req.usuario.id, 'EDITAR_RESPOSTA', 'respostas', respostaId, resposta, { conteudo }, ipAddress);
          
          res.json({ message: 'Resposta atualizada com sucesso' });
        }
      );
    });
  });
});

// DELETE - Excluir resposta (RFS20) - Soft Delete
router.delete('/:id', verificarAutenticacao, (req, res) => {
  const respostaId = req.params.id;
  
  // Buscar resposta
  db.query(`
    SELECT r.*, t.status as topico_status, d.professor_id
    FROM respostas r
    JOIN topicos t ON r.topico_id = t.id
    JOIN disciplinas d ON t.disciplina_id = d.id
    WHERE r.id = ?
  `, [respostaId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ error: 'Resposta não encontrada' });
    }
    
    const resposta = results[0];
    
    // RN63: Apenas autor, monitor ou professor pode excluir
    const podeExcluir = 
      resposta.usuario_id === req.usuario.id ||
      req.usuario.tipo_usuario === 'Monitor' ||
      resposta.professor_id === req.usuario.id ||
      req.usuario.tipo_usuario === 'Administrador';
    
    if (!podeExcluir) {
      return res.status(403).json({ error: 'Você não tem permissão para excluir esta resposta' });
    }
    
    // RN62 e RN64: Substituir conteúdo por "Resposta removida" e preservar aninhadas
    // RN65: Não pode receber edições ou votos depois
    // RN66: Remover status melhor_resposta se tiver
    db.query(`
      UPDATE respostas 
      SET conteudo = '[Conteúdo removido pelo autor]',
          melhor_resposta = FALSE
      WHERE id = ?
    `, [respostaId], (err) => {
      if (err) {
        console.error('Erro ao excluir resposta:', err);
        return res.status(500).json({ error: 'Erro ao excluir resposta' });
      }
      
      const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      registrarLog(req.usuario.id, 'EXCLUIR_RESPOSTA', 'respostas', respostaId, resposta, null, ipAddress);
      
      res.json({ message: 'Resposta removida com sucesso' });
    });
  });
});

// PUT - Marcar como melhor resposta (RFS23)
router.put('/:id/melhor-resposta', verificarAutenticacao, (req, res) => {
  const respostaId = req.params.id;
  
  // Buscar resposta e tópico
  db.query(`
    SELECT r.topico_id, t.usuario_id as topico_autor, d.professor_id
    FROM respostas r
    JOIN topicos t ON r.topico_id = t.id
    JOIN disciplinas d ON t.disciplina_id = d.id
    WHERE r.id = ?
  `, [respostaId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ error: 'Resposta não encontrada' });
    }
    
    const info = results[0];
    
    // RN74 e RN75: Professor, monitor ou criador do tópico pode marcar
    const podeMarcar = 
      info.topico_autor === req.usuario.id ||
      info.professor_id === req.usuario.id ||
      req.usuario.tipo_usuario === 'Monitor' ||
      req.usuario.tipo_usuario === 'Administrador';
    
    if (!podeMarcar) {
      return res.status(403).json({ error: 'Você não tem permissão para marcar melhor resposta' });
    }
    
    // RN73: Remover melhor_resposta de outras respostas do mesmo tópico
    db.query('UPDATE respostas SET melhor_resposta = FALSE WHERE topico_id = ?', [info.topico_id], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao atualizar respostas' });
      }
      
      // Marcar esta como melhor
      db.query('UPDATE respostas SET melhor_resposta = TRUE WHERE id = ?', [respostaId], (err) => {
        if (err) {
          console.error('Erro ao marcar melhor resposta:', err);
          return res.status(500).json({ error: 'Erro ao marcar melhor resposta' });
        }
        
        // Marcar tópico como resolvido
        db.query('UPDATE topicos SET status = ? WHERE id = ?', ['Resolvido', info.topico_id]);
        
        const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        registrarLog(req.usuario.id, 'MARCAR_MELHOR_RESPOSTA', 'respostas', respostaId, null, { topico_id: info.topico_id }, ipAddress);
        
        res.json({ message: 'Melhor resposta marcada com sucesso' });
      });
    });
  });
});

// DELETE - Desmarcar melhor resposta
router.delete('/:id/melhor-resposta', verificarAutenticacao, (req, res) => {
  const respostaId = req.params.id;
  
  db.query(`
    SELECT r.topico_id, t.usuario_id as topico_autor, d.professor_id
    FROM respostas r
    JOIN topicos t ON r.topico_id = t.id
    JOIN disciplinas d ON t.disciplina_id = d.id
    WHERE r.id = ?
  `, [respostaId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ error: 'Resposta não encontrada' });
    }
    
    const info = results[0];
    
    const podeDesmarcar = 
      info.topico_autor === req.usuario.id ||
      info.professor_id === req.usuario.id ||
      req.usuario.tipo_usuario === 'Monitor' ||
      req.usuario.tipo_usuario === 'Administrador';
    
    if (!podeDesmarcar) {
      return res.status(403).json({ error: 'Você não tem permissão para desmarcar melhor resposta' });
    }
    
    db.query('UPDATE respostas SET melhor_resposta = FALSE WHERE id = ?', [respostaId], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao desmarcar melhor resposta' });
      }
      
      // Voltar tópico para Aberto
      db.query('UPDATE topicos SET status = ? WHERE id = ?', ['Aberto', info.topico_id]);
      
      res.json({ message: 'Melhor resposta desmarcada com sucesso' });
    });
  });
});

module.exports = router;
