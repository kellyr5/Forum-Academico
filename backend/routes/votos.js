const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verificarAutenticacao } = require('../middleware/auth');

// POST - Votar em resposta (RFS22)
router.post('/', verificarAutenticacao, (req, res) => {
  const { resposta_id, usuario_id } = req.body;
  
  if (!resposta_id || !usuario_id) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }
  
  // RN71: Não pode votar na própria resposta
  db.query('SELECT usuario_id FROM respostas WHERE id = ?', [resposta_id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ error: 'Resposta não encontrada' });
    }
    
    if (results[0].usuario_id === usuario_id) {
      return res.status(403).json({ error: 'Você não pode votar na sua própria resposta' });
    }
    
    // RN69: Verificar se já votou
    db.query('SELECT id FROM votos WHERE resposta_id = ? AND usuario_id = ?', 
      [resposta_id, usuario_id], 
      (err, votos) => {
        if (err) {
          return res.status(500).json({ error: 'Erro ao verificar voto' });
        }
        
        if (votos.length > 0) {
          // RN70: Já votou, então remove o voto (toggle)
          db.query('DELETE FROM votos WHERE resposta_id = ? AND usuario_id = ?', 
            [resposta_id, usuario_id], 
            (err) => {
              if (err) {
                return res.status(500).json({ error: 'Erro ao remover voto' });
              }
              
              // RN72: Atualizar contador
              db.query('UPDATE respostas SET votos = votos - 1 WHERE id = ?', [resposta_id], (err) => {
                if (err) {
                  return res.status(500).json({ error: 'Erro ao atualizar contador' });
                }
                
                // Buscar novo total
                db.query('SELECT votos FROM respostas WHERE id = ?', [resposta_id], (err, results) => {
                  res.json({ 
                    message: 'Voto removido',
                    votou: false,
                    total_votos: results[0].votos
                  });
                });
              });
            }
          );
        } else {
          // Adicionar voto
          db.query('INSERT INTO votos (resposta_id, usuario_id, tipo_voto) VALUES (?, ?, ?)', 
            [resposta_id, usuario_id, 'Positivo'], 
            (err) => {
              if (err) {
                console.error('Erro ao adicionar voto:', err);
                return res.status(500).json({ error: 'Erro ao adicionar voto' });
              }
              
              // RN72: Atualizar contador
              db.query('UPDATE respostas SET votos = votos + 1 WHERE id = ?', [resposta_id], (err) => {
                if (err) {
                  return res.status(500).json({ error: 'Erro ao atualizar contador' });
                }
                
                // Buscar novo total
                db.query('SELECT votos FROM respostas WHERE id = ?', [resposta_id], (err, results) => {
                  res.json({ 
                    message: 'Voto adicionado',
                    votou: true,
                    total_votos: results[0].votos
                  });
                });
              });
            }
          );
        }
      }
    );
  });
});

// GET - Verificar se usuário votou em uma resposta
router.get('/verificar/:respostaId/:usuarioId', verificarAutenticacao, (req, res) => {
  const { respostaId, usuarioId } = req.params;
  
  db.query('SELECT id FROM votos WHERE resposta_id = ? AND usuario_id = ?', 
    [respostaId, usuarioId], 
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao verificar voto' });
      }
      
      res.json({ votou: results.length > 0 });
    }
  );
});

// GET - Obter votos de múltiplas respostas para um usuário
router.post('/verificar-multiplos', verificarAutenticacao, (req, res) => {
  const { respostas_ids, usuario_id } = req.body;
  
  if (!respostas_ids || !Array.isArray(respostas_ids) || respostas_ids.length === 0) {
    return res.json({ votos: {} });
  }
  
  const placeholders = respostas_ids.map(() => '?').join(',');
  const sql = `SELECT resposta_id FROM votos WHERE resposta_id IN (${placeholders}) AND usuario_id = ?`;
  
  db.query(sql, [...respostas_ids, usuario_id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao verificar votos' });
    }
    
    const votos = {};
    results.forEach(row => {
      votos[row.resposta_id] = true;
    });
    
    res.json({ votos });
  });
});

module.exports = router;
