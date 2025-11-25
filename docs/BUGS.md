# Registro de Bugs - Forum Academico UNIFEI

## Bug 001 - Validacao de Email Duplicado
**Severidade:** Media
**Status:** Resolvido
**Data:** 2025-01-15
**Descricao:** Sistema permitia cadastro de usuarios com emails duplicados
**Solucao:** Adicionado UNIQUE constraint na coluna email da tabela usuarios
**Impacto:** Prevencao de duplicatas no banco

## Bug 002 - Upload de Arquivos Grandes
**Severidade:** Alta
**Status:** Resolvido
**Data:** 2025-01-16
**Descricao:** Timeout em uploads acima de 10MB
**Solucao:** Configurado limite em 10MB e validacao no frontend
**Impacto:** Melhor UX e prevencao de sobrecarga do servidor

## Bug 003 - Campo Universidade Obrigatorio
**Severidade:** Alta
**Status:** Resolvido
**Data:** 2025-01-17
**Descricao:** Campo universidade_id impedia cadastro de usuarios
**Solucao:** Alterado campo para aceitar NULL
**Impacto:** Permitir cadastro sem vinculo de universidade

## Bug 004 - Foreign Key em Cascata
**Severidade:** Media
**Status:** Resolvido
**Data:** 2025-01-17
**Descricao:** Delecao de topico nao deletava respostas
**Solucao:** Adicionado ON DELETE CASCADE nas foreign keys
**Impacto:** Integridade referencial garantida

## Bug 005 - Preview de Imagens
**Severidade:** Baixa
**Status:** Resolvido
**Data:** 2025-01-18
**Descricao:** Preview nao exibia para alguns formatos de imagem
**Solucao:** Validacao de tipo MIME mais abrangente
**Impacto:** Melhor visualizacao de arquivos

## Template para Novos Bugs

### Bug XXX - Titulo do Bug
**Severidade:** Baixa/Media/Alta/Critica
**Status:** Aberto/Em Analise/Resolvido/Fechado
**Data:** AAAA-MM-DD
**Reportado por:** Nome
**Atribuido a:** Nome
**Descricao:** Descricao detalhada do problema
**Passos para Reproduzir:**
1. Passo 1
2. Passo 2
3. Passo 3

**Comportamento Esperado:** O que deveria acontecer
**Comportamento Atual:** O que esta acontecendo
**Screenshots:** (se aplicavel)
**Solucao:** Descricao da solucao implementada
**Impacto:** Impacto da correcao no sistema
