const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verificarPalavrasOdio } = require('../utils/validacoes');
const { registrarLog } = require('../utils/auditoria');
const { verificarAutenticacao, verificarProfessorOuAdmin } = require('../middleware/auth');

// GET - Listar todas as disciplinas
router.get('/', (req, res) => {
  const sql = `
    SELECT d.*, c.nome as curso_nome, u.nome_completo as professor_nome,
           uni.nome as universidade_nome
    FROM disciplinas d
    LEFT JOIN cursos c ON d.curso_id = c.id
    LEFT JOIN usuarios u ON d.professor_id = u.id
    LEFT JOIN universidades uni ON d.universidade_id = uni.id
    ORDER BY d.nome
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Erro ao buscar disciplinas:', err);
      return res.status(500).json({ error: 'Erro ao buscar disciplinas' });
    }
    res.json(results);
  });
});

// GET - Disciplinas de um professor específico
router.get('/professor/:professorId', verificarAutenticacao, (req, res) => {
  const professorId = req.params.professorId;
  
  // Verificar se é o próprio professor ou admin
  if (req.usuario.id != professorId && req.usuario.tipo_usuario !== 'Administrador') {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  
  const sql = `
    SELECT d.*, c.nome as curso_nome, uni.nome as universidade_nome
    FROM disciplinas d
    LEFT JOIN cursos c ON d.curso_id = c.id
    LEFT JOIN universidades uni ON d.universidade_id = uni.id
    WHERE d.professor_id = ?
    ORDER BY d.nome
  `;
  
  db.query(sql, [professorId], (err, results) => {
    if (err) {
      console.error('Erro ao buscar disciplinas do professor:', err);
      return res.status(500).json({ error: 'Erro ao buscar disciplinas' });
    }
    res.json(results);
  });
});

// GET - Buscar disciplina por ID
router.get('/:id', (req, res) => {
  const disciplinaId = req.params.id;
  
  const sql = `
    SELECT d.*, c.nome as curso_nome, u.nome_completo as professor_nome,
           uni.nome as universidade_nome
    FROM disciplinas d
    LEFT JOIN cursos c ON d.curso_id = c.id
    LEFT JOIN usuarios u ON d.professor_id = u.id
    LEFT JOIN universidades uni ON d.universidade_id = uni.id
    WHERE d.id = ?
  `;
  
  db.query(sql, [disciplinaId], (err, results) => {
    if (err) {
      console.error('Erro ao buscar disciplina:', err);
      return res.status(500).json({ error: 'Erro ao buscar disciplina' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Disciplina não encontrada' });
    }
    
    res.json(results[0]);
  });
});

// POST - Cadastrar disciplina
router.post('/', verificarAutenticacao, verificarProfessorOuAdmin, (req, res) => {
  const { nome, codigo, curso_id, professor_id, periodo_letivo, descricao } = req.body;
  
  if (!nome || !codigo || !curso_id || !professor_id || !periodo_letivo) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }
  
  // RN27: Código único
  db.query('SELECT id FROM disciplinas WHERE codigo = ?', [codigo], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao verificar código' });
    }
    
    if (results.length > 0) {
      return res.status(400).json({ error: 'Código de disciplina já existe' });
    }
    
    // RN29: Verificar palavras de ódio
    const textoCompleto = `${nome} ${descricao || ''}`;
    verificarPalavrasOdio(textoCompleto, (err, resultado) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao validar conteúdo' });
      }
      
      if (resultado.encontrada) {
        return res.status(400).json({ error: resultado.erro });
      }
      
      const sql = `
        INSERT INTO disciplinas 
        (nome, codigo, universidade_id, curso_id, professor_id, periodo_letivo, descricao)
        VALUES (?, ?, 1, ?, ?, ?, ?)
      `;
      
      db.query(sql, [nome, codigo, curso_id, professor_id, periodo_letivo, descricao], (err, result) => {
        if (err) {
          console.error('Erro ao criar disciplina:', err);
          return res.status(500).json({ error: 'Erro ao criar disciplina' });
        }
        
        const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        registrarLog(professor_id, 'CRIAR_DISCIPLINA', 'disciplinas', result.insertId, null, { nome, codigo }, ipAddress);
        
        res.status(201).json({
          id: result.insertId,
          message: 'Disciplina criada com sucesso'
        });
      });
    });
  });
});

// PUT - Editar disciplina
router.put('/:id', verificarAutenticacao, (req, res) => {
  const disciplinaId = req.params.id;
  const { nome, descricao, periodo_letivo } = req.body;
  
  // Buscar dados anteriores
  db.query('SELECT * FROM disciplinas WHERE id = ?', [disciplinaId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ error: 'Disciplina não encontrada' });
    }
    
    const disciplinaAnterior = results[0];
    
    // RN33: Apenas professor responsável ou admin
    if (disciplinaAnterior.professor_id !== req.usuario.id && req.usuario.tipo_usuario !== 'Administrador') {
      return res.status(403).json({ error: 'Apenas o professor responsável ou administrador pode editar' });
    }
    
    const sql = `
      UPDATE disciplinas 
      SET nome = ?, descricao = ?, periodo_letivo = ?
      WHERE id = ?
    `;
    
    db.query(sql, [nome || disciplinaAnterior.nome, descricao, periodo_letivo || disciplinaAnterior.periodo_letivo, disciplinaId], (err) => {
      if (err) {
        console.error('Erro ao editar disciplina:', err);
        return res.status(500).json({ error: 'Erro ao editar disciplina' });
      }
      
      const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      registrarLog(req.usuario.id, 'EDITAR_DISCIPLINA', 'disciplinas', disciplinaId, disciplinaAnterior, { nome, descricao }, ipAddress);
      
      res.json({ message: 'Disciplina atualizada com sucesso' });
    });
  });
});

// DELETE - Excluir disciplina (apenas admin)
router.delete('/:id', verificarAutenticacao, (req, res) => {
  const disciplinaId = req.params.id;
  
  if (req.usuario.tipo_usuario !== 'Administrador') {
    return res.status(403).json({ error: 'Apenas administradores podem excluir disciplinas' });
  }
  
  db.query('DELETE FROM disciplinas WHERE id = ?', [disciplinaId], (err) => {
    if (err) {
      console.error('Erro ao excluir disciplina:', err);
      return res.status(500).json({ error: 'Erro ao excluir disciplina' });
    }
    
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    registrarLog(req.usuario.id, 'EXCLUIR_DISCIPLINA', 'disciplinas', disciplinaId, null, null, ipAddress);
    
    res.json({ message: 'Disciplina excluída com sucesso' });
  });
});

module.exports = router;
