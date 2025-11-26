# Registro de Bugs - Forum Academico UNIFEI
## Release 04 - Versao 3.0.0

---

## Resumo

| Metrica | Valor |
|---------|-------|
| Total de Bugs | 8 |
| Resolvidos | 8 |
| Abertos | 0 |
| Taxa de Resolucao | 100% |

---

## Bug 001 - Validacao de Email Duplicado

| Campo | Valor |
|-------|-------|
| ID | BUG-001 |
| Severidade | Major |
| Prioridade | Alta |
| Status | Resolvido |
| Modulo | Backend - Database |
| Data Reportado | 2025-11-05 |
| Data Resolvido | 2025-11-05 |

**Descricao:** Sistema permitia cadastro de usuarios com emails duplicados.

**Solucao:** Adicionado UNIQUE constraint na coluna email.

---

## Bug 002 - Timeout em Upload de Arquivos Grandes

| Campo | Valor |
|-------|-------|
| ID | BUG-002 |
| Severidade | Critical |
| Prioridade | Urgente |
| Status | Resolvido |
| Modulo | Backend - Upload |
| Data Reportado | 2025-11-12 |
| Data Resolvido | 2025-11-12 |

**Descricao:** Timeout em uploads acima de 10MB.

**Solucao:** Configurado limite de 10MB no Multer.

---

## Bug 003 - Campo Universidade Obrigatorio

| Campo | Valor |
|-------|-------|
| ID | BUG-003 |
| Severidade | Critical |
| Prioridade | Urgente |
| Status | Resolvido |
| Modulo | Backend - Database |
| Data Reportado | 2025-11-12 |
| Data Resolvido | 2025-11-12 |

**Descricao:** Campo universidade_id impedia cadastro.

**Solucao:** Alterado para aceitar NULL.

---

## Bug 004 - Delecao de Topico nao Remove Respostas

| Campo | Valor |
|-------|-------|
| ID | BUG-004 |
| Severidade | Major |
| Prioridade | Alta |
| Status | Resolvido |
| Modulo | Backend - Database |
| Data Reportado | 2025-11-12 |
| Data Resolvido | 2025-11-12 |

**Descricao:** Respostas ficavam orfas apos deletar topico.

**Solucao:** Adicionado ON DELETE CASCADE.

---

## Bug 005 - Preview de Imagens

| Campo | Valor |
|-------|-------|
| ID | BUG-005 |
| Severidade | Minor |
| Prioridade | Normal |
| Status | Resolvido |
| Modulo | Frontend - Upload |
| Data Reportado | 2025-11-19 |
| Data Resolvido | 2025-11-19 |

**Descricao:** Preview nao funcionava para PNG e WEBP.

**Solucao:** Expandida validacao de tipo MIME.

---

## Bug 006 - Header de Autenticacao Ausente

| Campo | Valor |
|-------|-------|
| ID | BUG-006 |
| Severidade | Major |
| Prioridade | Alta |
| Status | Resolvido |
| Modulo | Frontend - Admin |
| Data Reportado | 2025-11-25 |
| Data Resolvido | 2025-11-26 |

**Descricao:** Painel admin nao enviava header x-usuario-id.

**Solucao:** Implementada funcao fetchAuth().

---

## Bug 007 - Dashboard Admin nao Carrega

| Campo | Valor |
|-------|-------|
| ID | BUG-007 |
| Severidade | Major |
| Prioridade | Alta |
| Status | Resolvido |
| Modulo | Frontend - Admin |
| Data Reportado | 2025-11-25 |
| Data Resolvido | 2025-11-26 |

**Descricao:** Dashboard mostrava 0 em todos os cards.

**Solucao:** Corrigido para usar fetchAuth().

---

## Bug 008 - Botoes CRUD sem Resposta

| Campo | Valor |
|-------|-------|
| ID | BUG-008 |
| Severidade | Minor |
| Prioridade | Normal |
| Status | Resolvido |
| Modulo | Frontend - Admin |
| Data Reportado | 2025-11-25 |
| Data Resolvido | 2025-11-26 |

**Descricao:** Botoes de CRUD nao funcionavam.

**Solucao:** Atualizado para usar fetchAuth().

---

Ultima atualizacao: 26/11/2025
