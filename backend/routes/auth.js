const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/database');
const { registrarLog } = require('../utils/auditoria');

// LOGIN
router.post('/login', (req, res) => {
  const { email, senha } = req.body;
  
  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }
  
  const sql = `
    SELECT u.id, u.nome_completo, u.email, u.tipo_usuario, u.curso_id, u.periodo, u.senha_hash,
           c.nome as curso_nome
    FROM usuarios u
    LEFT JOIN cursos c ON u.curso_id = c.id
    WHERE u.email = ? AND u.ativo = TRUE AND u.excluido = FALSE
  `;
  
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error('Erro no login:', err);
      return res.status(500).json({ error: 'Erro ao realizar login' });
    }
    
    if (results.length === 0) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }
    
    const usuario = results[0];
    
    // Comparar senha com hash
    bcrypt.compare(senha, usuario.senha_hash, (err, senhaCorreta) => {
      if (err) {
        console.error('Erro ao verificar senha:', err);
        return res.status(500).json({ error: 'Erro ao verificar senha' });
      }
      
      if (!senhaCorreta) {
        return res.status(401).json({ error: 'Email ou senha incorretos' });
      }
      
      // Registrar log de login
      const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      registrarLog(usuario.id, 'LOGIN', 'usuarios', usuario.id, null, null, ipAddress);
      
      // Retornar dados do usuário (sem a senha)
      res.json({
        success: true,
        usuario: {
          id: usuario.id,
          nome: usuario.nome_completo,
          email: usuario.email,
          tipo: usuario.tipo_usuario,
          curso: usuario.curso_nome,
          periodo: usuario.periodo
        }
      });
    });
  });
});

// VERIFICAR SESSÃO
router.post('/verificar', (req, res) => {
  const { usuario_id } = req.body;
  
  if (!usuario_id) {
    return res.status(401).json({ error: 'Não autenticado' });
  }
  
  const sql = `
    SELECT id, nome_completo, email, tipo_usuario 
    FROM usuarios 
    WHERE id = ? AND ativo = TRUE AND excluido = FALSE
  `;
  
  db.query(sql, [usuario_id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(401).json({ error: 'Sessão inválida' });
    }
    
    res.json({ success: true, usuario: results[0] });
  });
});

// LOGOUT
router.post('/logout', (req, res) => {
  const { usuario_id } = req.body;
  
  if (usuario_id) {
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    registrarLog(usuario_id, 'LOGOUT', 'usuarios', usuario_id, null, null, ipAddress);
  }
  
  res.json({ success: true, message: 'Logout realizado com sucesso' });
});

module.exports = router;
