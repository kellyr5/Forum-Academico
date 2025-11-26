# Forum Academico UNIFEI

Sistema web de forum academico para a Universidade Federal de Itajuba (UNIFEI).

**Versao:** 2.0.0  
**Status:** Producao  
**Data:** 20/11/2025

---

## VISAO GERAL

O Forum Academico UNIFEI e uma plataforma web completa para gerenciamento de discussoes academicas, compartilhamento de materiais e comunicacao entre alunos, professores e administradores.

### Funcionalidades Principais

- 6 modulos CRUD completos
- Sistema de autenticacao com 4 perfis de usuario
- Relatorio gerencial com metricas
- Upload e download de arquivos
- Sistema de votacao em respostas
- Mural de avisos e recados

---

## MODULOS IMPLEMENTADOS

### 1. Usuarios
Gerenciamento completo de usuarios com tipos: Administrador, Professor, Aluno e Monitor.

### 2. Disciplinas
Cadastro de disciplinas vinculadas a cursos e professores responsaveis.

### 3. Topicos
Sistema de discussao com categorias e status (Aberto, Fechado, Resolvido).

### 4. Respostas
Respostas aos topicos com sistema de votacao (upvote/downvote).

### 5. Mural
Publicacao de recados com 4 tipos: Importante, Evento, Geral, Aviso Faculdade.

### 6. Arquivos
Upload e compartilhamento de arquivos (limite 10MB) vinculados a topicos.

---

## REQUISITOS

### Software Necessario
- Node.js 18.0+
- MySQL 8.0+
- Python 3.8+ (para testes)
- Firefox (para testes Selenium)

### Dependencias Node.js
```json
{
  "express": "^4.18.0",
  "mysql2": "^3.0.0",
  "multer": "^1.4.0",
  "cors": "^2.8.5"
}
```

---

## INSTALACAO

### 1. Clonar Repositorio
```bash
git clone https://github.com/kellyr5/Forum-Academico.git
cd Forum-Academico
```

### 2. Configurar Banco de Dados
```bash
mysql -u root -p < backend/config/schema.sql
mysql -u root -p forum_academico < popular-dados.sql
```

### 3. Instalar Dependencias
```bash
cd backend
npm install
```

### 4. Configurar Variaveis
Editar `backend/config/database.js`:
```javascript
host: 'localhost',
user: 'root',
password: 'sua_senha',
database: 'forum_academico'
```

### 5. Iniciar Aplicacao

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
python3 -m http.server 8000
```

### 6. Acessar Sistema
- URL: http://localhost:8000
- Login: admin@unifei.edu.br / admin123

---

## TESTES

### Executar Suite Selenium
```bash
python3 test_selenium_final.py
```

### Usuarios de Teste
- **Admin:** admin@unifei.edu.br / admin123
- **Professor:** professor@unifei.edu.br / prof123
- **Aluno:** aluno@unifei.edu.br / aluno123
- **Monitor:** monitor@unifei.edu.br / monitor123

---

## ESTRUTURA DO PROJETO
```
forum-academico/
├── backend/
│   ├── config/
│   │   ├── database.js
│   │   └── schema.sql
│   ├── routes/
│   │   ├── usuarios.js
│   │   ├── disciplinas.js
│   │   ├── topicos.js
│   │   ├── respostas.js
│   │   ├── recados.js
│   │   ├── arquivos.js
│   │   ├── relatorios.js
│   │   └── auth.js
│   ├── uploads/
│   └── server.js
├── frontend/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── auth.js
│   ├── index.html
│   ├── login.html
│   └── relatorio.html
├── docs/
├── BUGS.md
├── STATUS_REPORT.md
├── CHECKLIST_RELEASE_03.md
├── README.md
└── test_selenium_final.py
```

---

## API ENDPOINTS

### Autenticacao
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Usuarios
- `GET /api/usuarios` - Listar
- `POST /api/usuarios` - Criar
- `PUT /api/usuarios/:id` - Atualizar
- `DELETE /api/usuarios/:id` - Deletar

### Disciplinas
- `GET /api/disciplinas` - Listar
- `POST /api/disciplinas` - Criar
- `PUT /api/disciplinas/:id` - Atualizar
- `DELETE /api/disciplinas/:id` - Deletar

### Topicos
- `GET /api/topicos` - Listar
- `POST /api/topicos` - Criar
- `PUT /api/topicos/:id` - Atualizar
- `DELETE /api/topicos/:id` - Deletar

### Respostas
- `GET /api/respostas` - Listar
- `POST /api/respostas` - Criar
- `PUT /api/respostas/:id` - Atualizar
- `DELETE /api/respostas/:id` - Deletar
- `POST /api/respostas/:id/votar` - Votar

### Recados
- `GET /api/recados` - Listar
- `POST /api/recados` - Criar
- `PUT /api/recados/:id` - Atualizar
- `DELETE /api/recados/:id` - Deletar

### Arquivos
- `GET /api/arquivos` - Listar
- `POST /api/arquivos` - Upload
- `GET /api/arquivos/:id/download` - Download
- `DELETE /api/arquivos/:id` - Deletar

### Relatorios
- `GET /api/relatorios/atividades` - Relatorio Geral

---

## SISTEMA DE PERMISSOES

| Acao | Admin | Professor | Aluno | Monitor |
|------|-------|-----------|-------|---------|
| Gerenciar Usuarios | ✓ | ✗ | ✗ | ✗ |
| Gerenciar Disciplinas | ✓ | ✗ | ✗ | ✗ |
| Criar Recado | ✓ | ✓ | ✗ | ✓ |
| Criar Topico | ✓ | ✓ | ✓ | ✓ |
| Responder Topico | ✓ | ✓ | ✓ | ✓ |
| Upload Arquivo | ✓ | ✓ | ✓ | ✓ |
| Deletar Itens | ✓ | ✗ | ✗ | ✗ |

---

## BUGS CONHECIDOS

Todos os 5 bugs identificados foram corrigidos. Ver `BUGS.md` para detalhes.

---

## LICENCA

Projeto academico - UNIFEI © 2025
