const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./config/database');
const { inicializarBancoDados } = require('./config/init-db');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Inicializar banco de dados
setTimeout(() => {
  inicializarBancoDados();
}, 1000);

// Rotas
const usuariosRoutes = require('./routes/usuarios');
const disciplinasRoutes = require('./routes/disciplinas');
const topicosRoutes = require('./routes/topicos');
const respostasRoutes = require('./routes/respostas');
const recadosRoutes = require('./routes/recados');
const categoriasRoutes = require('./routes/categorias');
const votosRoutes = require('./routes/votos');
const arquivosRoutes = require('./routes/arquivos');
const authRoutes = require('./routes/auth');
const relatoriosRoutes = require('./routes/relatorios');
const cursosRoutes = require('./routes/cursos');
const matriculasRoutes = require('./routes/matriculas');
const monitoriasRoutes = require('./routes/monitorias');

app.use('/api/usuarios', usuariosRoutes);
app.use('/api/disciplinas', disciplinasRoutes);
app.use('/api/topicos', topicosRoutes);
app.use('/api/respostas', respostasRoutes);
app.use('/api/recados', recadosRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/votos', votosRoutes);
app.use('/api/arquivos', arquivosRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/relatorios', relatoriosRoutes);
app.use('/api/cursos', cursosRoutes);
app.use('/api/matriculas', matriculasRoutes);
app.use('/api/monitorias', monitoriasRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  SERVIDOR RODANDO EM http://localhost:${PORT}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});
