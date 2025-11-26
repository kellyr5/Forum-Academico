const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'forum2025',
  database: 'forum_academico',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

db.on('error', (err) => {
  console.error('Erro na conexao:', err);
});

console.log('Pool de conexoes criado com sucesso');

module.exports = db;
