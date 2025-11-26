# Forum Academico UNIFEI

Sistema web de forum academico para a Universidade Federal de Itajuba (UNIFEI).

**Versao:** 3.0.0  
**Release:** 04  
**Status:** Producao  
**Data:** 26/11/2025

---

## VISAO GERAL

O Forum Academico UNIFEI e uma plataforma web completa para gerenciamento de discussoes academicas, compartilhamento de materiais, controle de matriculas/monitorias e comunicacao entre alunos, professores e administradores.

### Funcionalidades Principais

- 8 modulos CRUD completos
- Sistema de autenticacao com 4 perfis de usuario
- Relatorio gerencial com metricas
- Upload e download de arquivos
- Sistema de votacao em respostas
- Mural de avisos e recados
- Gestao de matriculas
- Gestao de monitorias
- Painel administrativo completo

---

## 8 CRUDs IMPLEMENTADOS

| # | Modulo | Create | Read | Update | Delete | Status |
|---|--------|--------|------|--------|--------|--------|
| 1 | Usuarios | OK | OK | OK | OK | COMPLETO |
| 2 | Disciplinas | OK | OK | OK | OK | COMPLETO |
| 3 | Topicos | OK | OK | OK | OK | COMPLETO |
| 4 | Respostas | OK | OK | OK | OK | COMPLETO |
| 5 | Recados/Mural | OK | OK | OK | OK | COMPLETO |
| 6 | Arquivos | OK | OK | OK | OK | COMPLETO |
| 7 | Matriculas | OK | OK | OK | OK | COMPLETO |
| 8 | Monitorias | OK | OK | OK | OK | COMPLETO |

---

## RELATORIO IMPLEMENTADO

### Relatorio de Atividades do Forum

**Endpoints disponiveis:**
- GET /api/relatorios/atividades - Relatorio geral
- GET /api/relatorios/geral - Estatisticas consolidadas

---

## INSTALACAO

### 1. Configurar Banco de Dados
```bash
mysql -u root -p < backend/config/init.sql
```

### 2. Instalar Dependencias
```bash
cd backend
npm install
```

### 3. Iniciar Aplicacao
```bash
cd backend
node server.js
```

### 4. Acessar Sistema
- URL: http://localhost:5500/frontend/login.html
- Admin: admin@unifei.edu.br / Teste@123

---

## USUARIOS DE TESTE

| Tipo | Email | Senha |
|------|-------|-------|
| Administrador | admin@unifei.edu.br | Teste@123 |
| Professor | carlos.silva@unifei.edu.br | Prof@123 |
| Aluno | maria.santos@unifei.edu.br | Aluno@123 |
| Monitor | joao.oliveira@unifei.edu.br | Monitor@123 |

---

## CONTROLE DE VERSAO

- Repositorio Git inicializado
- Tag v3.0.0 criada
- Baseline salva

---

## BUGS

Total: 8 bugs identificados e resolvidos.
Taxa de resolucao: 100%

---

## EQUIPE

- Desenvolvimento: Equipe 10
- Disciplina: Engenharia de Software
- Instituicao: UNIFEI