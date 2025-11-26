# Fórum Acadêmico UNIFEI

Sistema web acadêmico para a Universidade Federal de Itajubá (UNIFEI), desenvolvido para gerenciamento de fóruns, comunicação interna e apoio às atividades acadêmicas.

**Versão:** 2.2.0  
**Status:** Produção  
**Data:** 20/11/2025  

---

## 📘 Visão Geral

O **Fórum Acadêmico UNIFEI** é uma plataforma web completa voltada à comunicação acadêmica, oferecendo ferramentas para discussão, colaboração e gestão de conteúdos educacionais para alunos, professores, monitores e administradores.

---

## 🚀 Principais Funcionalidades

- ✅ **8 módulos CRUD completos**
- ✅ Sistema de autenticação com perfis de acesso
- ✅ Controle de permissões por tipo de usuário
- ✅ Upload e download de arquivos
- ✅ Sistema de votação em respostas
- ✅ Mural de avisos
- ✅ Relatórios gerenciais
- ✅ Testes automatizados com Selenium

---

## 🧩 Módulos Implementados (CRUDs)

### 1. Usuários
Gerenciamento de usuários com perfis:
- Administrador
- Professor
- Aluno
- Monitor

---

### 2. Disciplinas
Gerenciamento de disciplinas vinculadas a cursos e professores responsáveis.

---

### 3. Tópicos
Sistema de debates acadêmicos com:
- Categorias
- Status (Aberto, Fechado, Resolvido)

---

### 4. Respostas
Respostas em tópicos com:
- Sistema de votação (Upvote / Downvote)

---

### 5. Mural (Recados)
Publicação de comunicados organizados por tipo:
- Importante
- Evento
- Aviso Geral
- Aviso da Faculdade

---

### 6. Arquivos
Sistema de gerenciamento de arquivos:
- Upload (máx. 10MB)
- Download
- Vinculação aos tópicos

---

### 7. Matrículas
Controle acadêmico de alunos:
- Vinculação aluno ↔ disciplina
- Edição de status da matrícula
- Filtro por semestre

---

### 8. Monitorias
Gerenciamento das monitorias:
- Cadastro de monitores por disciplina
- Controle de semestre
- Ativação e desativação da monitoria

---

## ⚙️ Requisitos do Sistema

### Software Necessário

- Node.js 18+
- MySQL 8+
- Python 3.8+
- Google Chrome (para Selenium)

---

### Dependências Node.js

```json
{
  "express": "^4.18.0",
  "mysql2": "^3.0.0",
  "multer": "^1.4.0",
  "cors": "^2.8.5"
}
