// Validar força da senha (RN03)
const validarSenha = (senha) => {
  if (senha.length < 8) {
    return { valida: false, erro: 'A senha deve ter no mínimo 8 caracteres' };
  }
  
  const temMaiuscula = /[A-Z]/.test(senha);
  const temMinuscula = /[a-z]/.test(senha);
  const temNumero = /[0-9]/.test(senha);
  const temEspecial = /[!@#$%^&*(),.?":{}|<>]/.test(senha);
  
  if (!temMaiuscula) {
    return { valida: false, erro: 'A senha deve conter pelo menos uma letra maiúscula' };
  }
  
  if (!temMinuscula) {
    return { valida: false, erro: 'A senha deve conter pelo menos uma letra minúscula' };
  }
  
  if (!temNumero) {
    return { valida: false, erro: 'A senha deve conter pelo menos um número' };
  }
  
  if (!temEspecial) {
    return { valida: false, erro: 'A senha deve conter pelo menos um caractere especial (!@#$%^&*...)' };
  }
  
  return { valida: true };
};

// Validar formato de e-mail institucional (RN02)
const validarEmailInstitucional = (email) => {
  const regex = /^[a-zA-Z0-9._-]+@unifei\.edu\.br$/;
  
  if (!regex.test(email)) {
    return { valido: false, erro: 'E-mail deve seguir o formato: [usuario]@unifei.edu.br' };
  }
  
  return { valido: true };
};

// Verificar palavras de ódio (RN04, RN29, RN38, RN51)
const verificarPalavrasOdio = (texto, callback) => {
  const db = require('../config/database');
  
  const sql = 'SELECT palavra FROM palavras_bloqueadas WHERE ativo = TRUE';
  
  db.query(sql, (err, results) => {
    if (err) {
      return callback(err, null);
    }
    
    const textoLower = texto.toLowerCase();
    
    for (let row of results) {
      const palavra = row.palavra.toLowerCase();
      if (textoLower.includes(palavra)) {
        return callback(null, {
          encontrada: true,
          palavra: row.palavra,
          erro: 'O texto contém conteúdo inadequado. Por favor, revise.'
        });
      }
    }
    
    callback(null, { encontrada: false });
  });
};

module.exports = {
  validarSenha,
  validarEmailInstitucional,
  verificarPalavrasOdio
};
