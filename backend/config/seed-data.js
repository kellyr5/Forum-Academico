const db = require('./database');
const bcrypt = require('bcrypt');

async function popularDadosIniciais() {
  try {
    // Verificar se já existem dados
    const checkQuery = 'SELECT COUNT(*) as total FROM usuarios';
    
    db.query(checkQuery, async (err, results) => {
      if (err) {
        console.error('Erro ao verificar dados:', err);
        return;
      }
      
      if (results[0].total > 0) {
        console.log('Dados iniciais já existem');
        return;
      }
      
      console.log('Populando dados iniciais...');
      
      // Hash das senhas
      const senhaAdmin = await bcrypt.hash('Admin@123', 10);
      const senhaProfessor = await bcrypt.hash('Prof@123', 10);
      const senhaAluno = await bcrypt.hash('Aluno@123', 10);
      const senhaMonitor = await bcrypt.hash('Monitor@123', 10);
      
      // Inserir usuários de teste
      const usuarios = [
        ['Administrador do Sistema', 'admin@unifei.edu.br', senhaAdmin, 1, 1, 1, 'Administrador'],
        ['Prof. Carlos Silva', 'carlos.silva@unifei.edu.br', senhaProfessor, 1, 1, 1, 'Professor'],
        ['Maria Santos', 'maria.santos@unifei.edu.br', senhaAluno, 1, 1, 5, 'Aluno'],
        ['João Oliveira', 'joao.oliveira@unifei.edu.br', senhaMonitor, 1, 2, 6, 'Monitor']
      ];
      
      const sqlUsuarios = `
        INSERT INTO usuarios 
        (nome_completo, email, senha_hash, universidade_id, curso_id, periodo, tipo_usuario, ativo, excluido)
        VALUES ?
      `;
      
      db.query(sqlUsuarios, [usuarios], (err) => {
        if (err) {
          console.error('Erro ao inserir usuários:', err);
        } else {
          console.log('Usuários de teste criados com sucesso');
          console.log('- Admin: admin@unifei.edu.br / Admin@123');
          console.log('- Professor: carlos.silva@unifei.edu.br / Prof@123');
          console.log('- Aluno: maria.santos@unifei.edu.br / Aluno@123');
          console.log('- Monitor: joao.oliveira@unifei.edu.br / Monitor@123');
        }
      });
    });
  } catch (error) {
    console.error('Erro ao popular dados:', error);
  }
}

module.exports = { popularDadosIniciais };
