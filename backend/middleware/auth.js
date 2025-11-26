const db = require('../config/database');

// Middleware para verificar autenticação
const verificarAutenticacao = (req, res, next) => {
  const usuarioId = req.headers['x-usuario-id'];
  
  if (!usuarioId) {
    return res.status(401).json({ error: 'Não autenticado. Faça login.' });
  }
  
  const sql = 'SELECT id, nome_completo, email, tipo_usuario FROM usuarios WHERE id = ? AND ativo = TRUE AND excluido = FALSE';
  
  db.query(sql, [usuarioId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao verificar autenticação' });
    }
    
    if (results.length === 0) {
      return res.status(401).json({ error: 'Usuário não encontrado ou inativo' });
    }
    
    req.usuario = results[0];
    next();
  });
};

// Middleware para verificar se é Professor ou Administrador
const verificarProfessorOuAdmin = (req, res, next) => {
  if (!req.usuario) {
    return res.status(401).json({ error: 'Não autenticado' });
  }
  
  if (req.usuario.tipo_usuario !== 'Professor' && req.usuario.tipo_usuario !== 'Administrador') {
    return res.status(403).json({ error: 'Acesso negado. Apenas professores e administradores.' });
  }
  
  next();
};

// Middleware para verificar se é Administrador
const verificarAdmin = (req, res, next) => {
  if (!req.usuario) {
    return res.status(401).json({ error: 'Não autenticado' });
  }
  
  if (req.usuario.tipo_usuario !== 'Administrador') {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
  }
  
  next();
};

// Middleware para verificar se é Professor, Monitor ou Administrador
const verificarProfessorMonitorOuAdmin = (req, res, next) => {
  if (!req.usuario) {
    return res.status(401).json({ error: 'Não autenticado' });
  }
  
  const tiposPermitidos = ['Professor', 'Monitor', 'Administrador'];
  if (!tiposPermitidos.includes(req.usuario.tipo_usuario)) {
    return res.status(403).json({ error: 'Acesso negado.' });
  }
  
  next();
};

module.exports = {
  verificarAutenticacao,
  verificarProfessorOuAdmin,
  verificarAdmin,
  verificarProfessorMonitorOuAdmin
};
