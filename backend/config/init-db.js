const db = require('./database');
const bcrypt = require('bcryptjs');

async function inicializarBancoDados() {
  console.log('Verificando estrutura do banco de dados...');
  
  const checkTables = `
    SELECT COUNT(*) as total 
    FROM information_schema.tables 
    WHERE table_schema = 'forum_academico' 
    AND table_name = 'usuarios'
  `;
  
  db.query(checkTables, async (err, results) => {
    if (err) {
      console.error('Erro ao verificar tabelas:', err);
      return;
    }
    
    if (results[0].total === 0) {
      console.error('ERRO: Banco de dados nao inicializado!');
      console.error('Execute: mysql -u root -p < backend/config/schema-completo.sql');
      return;
    }
    
    console.log('Banco de dados OK');
    
    db.query('SELECT COUNT(*) as total FROM usuarios', async (err, results) => {
      if (err) {
        console.error('Erro ao verificar usuarios:', err);
        return;
      }
      
      if (results[0].total > 0) {
        console.log(`Banco ja possui ${results[0].total} usuario(s)`);
        return;
      }
      
      console.log('Criando usuarios de teste...');
      
      try {
        const senhaAdmin = await bcrypt.hash('Admin@123', 10);
        const senhaProfessor = await bcrypt.hash('Prof@123', 10);
        const senhaAluno = await bcrypt.hash('Aluno@123', 10);
        const senhaMonitor = await bcrypt.hash('Monitor@123', 10);
        
        const usuarios = [
          ['Administrador do Sistema', 'admin@unifei.edu.br', senhaAdmin, 1, 1, 1, 'Administrador', true, false],
          ['Prof. Carlos Silva', 'carlos.silva@unifei.edu.br', senhaProfessor, 1, 1, 1, 'Professor', true, false],
          ['Maria Santos', 'maria.santos@unifei.edu.br', senhaAluno, 1, 1, 5, 'Aluno', true, false],
          ['Joao Oliveira', 'joao.oliveira@unifei.edu.br', senhaMonitor, 1, 2, 6, 'Monitor', true, false],
          ['Ana Paula', 'ana.paula@unifei.edu.br', senhaAluno, 1, 1, 3, 'Aluno', true, false]
        ];
        
        const sqlUsuarios = `
          INSERT INTO usuarios 
          (nome_completo, email, senha_hash, universidade_id, curso_id, periodo, tipo_usuario, ativo, excluido)
          VALUES ?
        `;
        
        db.query(sqlUsuarios, [usuarios], (err, result) => {
          if (err) {
            console.error('Erro ao inserir usuarios:', err);
            return;
          }
          
          console.log('Usuarios de teste criados com sucesso!');
          console.log('');
          console.log('CREDENCIAIS DE ACESSO:');
          console.log('------------------------------------');
          console.log('ADMINISTRADOR:');
          console.log('  Email: admin@unifei.edu.br');
          console.log('  Senha: Admin@123');
          console.log('');
          console.log('PROFESSOR:');
          console.log('  Email: carlos.silva@unifei.edu.br');
          console.log('  Senha: Prof@123');
          console.log('');
          console.log('ALUNO:');
          console.log('  Email: maria.santos@unifei.edu.br');
          console.log('  Senha: Aluno@123');
          console.log('');
          console.log('MONITOR:');
          console.log('  Email: joao.oliveira@unifei.edu.br');
          console.log('  Senha: Monitor@123');
          console.log('------------------------------------');
          
          criarDisciplinasExemplo();
        });
      } catch (error) {
        console.error('Erro ao criar usuarios:', error);
      }
    });
  });
}

function criarDisciplinasExemplo() {
  const disciplinas = [
    ['Calculo I', 'MAT001', 1, 1, 2, '2025.1', 'Introducao ao Calculo Diferencial e Integral'],
    ['Programacao I', 'COM001', 1, 1, 2, '2025.1', 'Fundamentos de Programacao'],
    ['Estrutura de Dados', 'COM002', 1, 1, 2, '2025.1', 'Estruturas de Dados e Algoritmos'],
    ['Banco de Dados', 'COM003', 1, 2, 2, '2025.1', 'Sistemas de Gerenciamento de Banco de Dados']
  ];
  
  const sql = `
    INSERT INTO disciplinas 
    (nome, codigo, universidade_id, curso_id, professor_id, periodo_letivo, descricao)
    VALUES ?
  `;
  
  db.query(sql, [disciplinas], (err) => {
    if (err) {
      console.error('Erro ao criar disciplinas:', err);
    } else {
      console.log('Disciplinas de exemplo criadas');
    }
  });
}

module.exports = { inicializarBancoDados };