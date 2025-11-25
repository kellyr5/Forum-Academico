const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/database');
const { validarSenha, validarEmailInstitucional, verificarPalavrasOdio } = require('../utils/validacoes');
const { registrarLog } = require('../utils/auditoria');
const { verificarAutenticacao, verificarAdmin } = require('../middleware/auth');

// GET - Listar todos os usuários (RFS02)
router.get('/', verificarAutenticacao, (req, res) => {
  const { nome, curso, tipo } = req.query;
  
  let sql = `
    SELECT u.id, u.nome_completo, u.email, u.tipo_usuario, u.periodo, u.criado_em,
           c.nome as curso_nome, uni.nome as universidade_nome
    FROM usuarios u
    LEFT JOIN cursos c ON u.curso_id = c.id
    LEFT JOIN universidades uni ON u.universidade_id = uni.id
    WHERE u.excluido = FALSE
  `;
  
  const params = [];
  
  // RN07: Apenas usuários da mesma universidade podem visualizar perfis completos
  if (req.usuario.tipo_usuario !== 'Administrador') {
    sql += ' AND u.universidade_id = ?';
    params.push(req.usuario.universidade_id);
  }
  
  if (nome) {
    sql += ' AND u.nome_completo LIKE ?';
    params.push(`%${nome}%`);
  }
  
  if (curso) {
    sql += ' AND u.curso_id = ?';
    params.push(curso);
  }
  
  if (tipo) {
    sql += ' AND u.tipo_usuario = ?';
    params.push(tipo);
  }
  
  sql += ' ORDER BY u.nome_completo ASC';
  
  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Erro ao buscar usuários:', err);
      return res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
    
    // RN06: Não expor dados sensíveis (remover hash de senha se vier)
    const usuariosSeguros = results.map(u => {
      const { senha_hash, ...dadosSeguros } = u;
      return dadosSeguros;
    });
    
    res.json(usuariosSeguros);
  });
});

// POST - Criar novo usuário (RFS01)
router.post('/', (req, res) => {
  const { nome_completo, email, senha, confirmar_senha, universidade_id, curso_id, periodo, tipo_usuario } = req.body;
  
  // Validações básicas
  if (!nome_completo || !email || !senha || !confirmar_senha || !curso_id || !periodo || !tipo_usuario) {
    return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos' });
  }
  
  // Validar confirmação de senha
  if (senha !== confirmar_senha) {
    return res.status(400).json({ error: 'As senhas não coincidem' });
  }
  
  // RN02: Validar formato de e-mail institucional
  const validacaoEmail = validarEmailInstitucional(email);
  if (!validacaoEmail.valido) {
    return res.status(400).json({ error: validacaoEmail.erro });
  }
  
  // RN03: Validar força da senha
  const validacaoSenha = validarSenha(senha);
  if (!validacaoSenha.valida) {
    return res.status(400).json({ error: validacaoSenha.erro });
  }
  
  // RN04: Verificar palavras de ódio no nome
  verificarPalavrasOdio(nome_completo, (err, resultado) => {
    if (err) {
      console.error('Erro ao verificar palavras de ódio:', err);
      return res.status(500).json({ error: 'Erro ao validar dados' });
    }
    
    if (resultado.encontrada) {
      return res.status(400).json({ error: resultado.erro });
    }
    
    // RN01: E-mail deve ser único
    const checkEmailSql = 'SELECT id FROM usuarios WHERE email = ?';
    db.query(checkEmailSql, [email], (err, results) => {
      if (err) {
        console.error('Erro ao verificar e-mail:', err);
        return res.status(500).json({ error: 'Erro ao validar e-mail' });
      }
      
      if (results.length > 0) {
        return res.status(400).json({ error: 'Este e-mail já está cadastrado' });
      }
      
      // RN05: Criptografar senha
      bcrypt.hash(senha, 10, (err, senhaHash) => {
        if (err) {
          console.error('Erro ao criptografar senha:', err);
          return res.status(500).json({ error: 'Erro ao processar senha' });
        }
        
        // Se universidade_id não for fornecido, buscar UNIFEI por padrão
        const getUniversidadeId = (callback) => {
          if (universidade_id) {
            callback(universidade_id);
          } else {
            db.query('SELECT id FROM universidades WHERE sigla = "UNIFEI" LIMIT 1', (err, results) => {
              if (err || results.length === 0) {
                callback(1); // ID padrão
              } else {
                callback(results[0].id);
              }
            });
          }
        };
        
        getUniversidadeId((uniId) => {
          const sql = `
            INSERT INTO usuarios 
            (nome_completo, email, senha_hash, universidade_id, curso_id, periodo, tipo_usuario, ativo, excluido)
            VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, FALSE)
          `;
          
          db.query(sql, [nome_completo, email, senhaHash, uniId, curso_id, periodo, tipo_usuario], (err, result) => {
            if (err) {
              console.error('Erro ao criar usuário:', err);
              return res.status(500).json({ error: 'Erro ao criar usuário' });
            }
            
            const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            registrarLog(result.insertId, 'CRIAR_USUARIO', 'usuarios', result.insertId, null, { nome_completo, email, tipo_usuario }, ipAddress);
            
            res.status(201).json({ 
              id: result.insertId, 
              message: 'Usuário cadastrado com sucesso' 
            });
          });
        });
      });
    });
  });
});

// PUT - Atualizar usuário (RFS03)
router.put('/:id', verificarAutenticacao, (req, res) => {
  const usuarioId = req.params.id;
  const { nome_completo, senha_atual, nova_senha, confirmar_nova_senha, curso_id, periodo } = req.body;
  
  // Verificar se é o próprio usuário ou admin
  if (req.usuario.id != usuarioId && req.usuario.tipo_usuario !== 'Administrador') {
    return res.status(403).json({ error: 'Você só pode editar seu próprio perfil' });
  }
  
  // RN08: E-mail não pode ser alterado
  if (req.body.email) {
    return res.status(400).json({ error: 'O e-mail institucional não pode ser alterado' });
  }
  
  // Buscar dados atuais para log
  db.query('SELECT * FROM usuarios WHERE id = ?', [usuarioId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    const usuarioAtual = results[0];
    const dadosAnteriores = { nome_completo: usuarioAtual.nome_completo, curso_id: usuarioAtual.curso_id, periodo: usuarioAtual.periodo };
    
    // Se vai alterar nome, verificar palavras de ódio (RN10)
    if (nome_completo && nome_completo !== usuarioAtual.nome_completo) {
      verificarPalavrasOdio(nome_completo, (err, resultado) => {
        if (err) {
          return res.status(500).json({ error: 'Erro ao validar dados' });
        }
        
        if (resultado.encontrada) {
          return res.status(400).json({ error: resultado.erro });
        }
        
        prosseguirAtualizacao();
      });
    } else {
      prosseguirAtualizacao();
    }
    
    function prosseguirAtualizacao() {
      let updateFields = [];
      let updateValues = [];
      
      if (nome_completo) {
        updateFields.push('nome_completo = ?');
        updateValues.push(nome_completo);
      }
      
      if (curso_id) {
        updateFields.push('curso_id = ?');
        updateValues.push(curso_id);
      }
      
      if (periodo) {
        updateFields.push('periodo = ?');
        updateValues.push(periodo);
      }
      
      // RN09: Alteração de senha requer confirmação da senha atual
      if (nova_senha) {
        if (!senha_atual) {
          return res.status(400).json({ error: 'Senha atual é obrigatória para alterar a senha' });
        }
        
        if (nova_senha !== confirmar_nova_senha) {
          return res.status(400).json({ error: 'As senhas não coincidem' });
        }
        
        // Validar força da nova senha
        const validacaoSenha = validarSenha(nova_senha);
        if (!validacaoSenha.valida) {
          return res.status(400).json({ error: validacaoSenha.erro });
        }
        
        // Verificar senha atual
        bcrypt.compare(senha_atual, usuarioAtual.senha_hash, (err, senhaCorreta) => {
          if (err) {
            return res.status(500).json({ error: 'Erro ao verificar senha' });
          }
          
          if (!senhaCorreta) {
            return res.status(401).json({ error: 'Senha atual incorreta' });
          }
          
          // Hash da nova senha
          bcrypt.hash(nova_senha, 10, (err, novaSenhaHash) => {
            if (err) {
              return res.status(500).json({ error: 'Erro ao processar nova senha' });
            }
            
            updateFields.push('senha_hash = ?');
            updateValues.push(novaSenhaHash);
            
            executarUpdate();
          });
        });
      } else {
        executarUpdate();
      }
      
      function executarUpdate() {
        if (updateFields.length === 0) {
          return res.status(400).json({ error: 'Nenhum campo para atualizar' });
        }
        
        const sql = `UPDATE usuarios SET ${updateFields.join(', ')} WHERE id = ?`;
        updateValues.push(usuarioId);
        
        db.query(sql, updateValues, (err) => {
          if (err) {
            console.error('Erro ao atualizar usuário:', err);
            return res.status(500).json({ error: 'Erro ao atualizar usuário' });
          }
          
          // RN11: Log de auditoria
          const dadosNovos = { nome_completo, curso_id, periodo };
          if (nova_senha) dadosNovos.senha_alterada = true;
          
          const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
          registrarLog(req.usuario.id, 'EDITAR_USUARIO', 'usuarios', usuarioId, dadosAnteriores, dadosNovos, ipAddress);
          
          res.json({ message: 'Usuário atualizado com sucesso' });
        });
      }
    }
  });
});

// DELETE - Excluir usuário (RFS04) - Soft Delete
router.delete('/:id', verificarAutenticacao, (req, res) => {
  const usuarioId = req.params.id;
  
  // Verificar se é o próprio usuário ou admin
  if (req.usuario.id != usuarioId && req.usuario.tipo_usuario !== 'Administrador') {
    return res.status(403).json({ error: 'Você só pode excluir seu próprio perfil' });
  }
  
  // RN12: Verificar se é criador de tópicos ativos
  db.query('SELECT COUNT(*) as total FROM topicos WHERE usuario_id = ? AND status = "Aberto"', [usuarioId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao verificar tópicos' });
    }
    
    if (results[0].total > 0) {
      return res.status(400).json({ 
        error: `Este usuário possui ${results[0].total} tópico(s) ativo(s). Finalize-os antes de excluir a conta.` 
      });
    }
    
    // RN13: Soft delete - marcar como excluído
    const sql = 'UPDATE usuarios SET excluido = TRUE, ativo = FALSE, data_exclusao = NOW() WHERE id = ?';
    
    db.query(sql, [usuarioId], (err) => {
      if (err) {
        console.error('Erro ao excluir usuário:', err);
        return res.status(500).json({ error: 'Erro ao excluir usuário' });
      }
      
      const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      registrarLog(req.usuario.id, 'EXCLUIR_USUARIO', 'usuarios', usuarioId, null, { excluido: true }, ipAddress);
      
      res.json({ message: 'Usuário excluído com sucesso' });
    });
  });
});

module.exports = router;
