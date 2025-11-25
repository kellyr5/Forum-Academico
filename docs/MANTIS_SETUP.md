# Configuracao Mantis Bug Tracker

## Instalacao do Mantis

### Requisitos
- PHP 7.4 ou superior
- MySQL 5.7 ou superior
- Apache ou Nginx
- Extensoes PHP: mysqli, mbstring, gd

### Passo 1: Download
```bash
cd /var/www/html
wget https://sourceforge.net/projects/mantisbt/files/mantis-stable/2.25.7/mantisbt-2.25.7.tar.gz
tar -xzf mantisbt-2.25.7.tar.gz
mv mantisbt-2.25.7 mantis
```

### Passo 2: Configurar Banco de Dados
```sql
CREATE DATABASE mantisbt CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'mantis'@'localhost' IDENTIFIED BY 'senha_segura';
GRANT ALL PRIVILEGES ON mantisbt.* TO 'mantis'@'localhost';
FLUSH PRIVILEGES;
```

### Passo 3: Configuracao Web

Acesse: http://localhost/mantis/admin/install.php

Preencha:
- Database Type: MySQL
- Hostname: localhost
- Username: mantis
- Password: senha_segura
- Database Name: mantisbt

### Passo 4: Configuracao do Projeto

1. Login: administrator / root
2. Manage > Manage Projects
3. Create New Project:
   - Nome: Forum Academico UNIFEI
   - Status: development
   - Visibilidade: public

### Passo 5: Categorias

Criar categorias:
- Backend - Database
- Backend - Upload
- Backend - API
- Frontend - UI
- Frontend - Upload
- Testes
- Documentacao

### Passo 6: Severidades

Configurar niveis:
- feature (nova funcionalidade)
- trivial (muito baixo impacto)
- text (documentacao)
- tweak (ajuste pequeno)
- minor (impacto baixo)
- major (impacto medio)
- crash (travamento)
- block (bloqueador)
- critical (critico)

### Passo 7: Importar Bugs

1. Manage > Manage Configuration
2. Import/Export
3. Upload mantis_bugs_export.csv

## Configuracao de Email

Editar config/config_inc.php:
```php
$g_hostname = 'localhost';
$g_db_type = 'mysqli';
$g_database_name = 'mantisbt';
$g_db_username = 'mantis';
$g_db_password = 'senha_segura';

$g_phpMailer_method = PHPMAILER_METHOD_SMTP;
$g_smtp_host = 'smtp.unifei.edu.br';
$g_smtp_username = 'noreply@unifei.edu.br';
$g_smtp_password = 'senha_email';
$g_administrator_email = 'admin@unifei.edu.br';
```

## Usuarios Sugeridos

- administrator (admin geral)
- qa.team (equipe de qualidade)
- dev.backend (desenvolvedor backend)
- dev.frontend (desenvolvedor frontend)
- reporter (usuarios finais)

## Workflow de Bug

1. NEW - Bug reportado
2. FEEDBACK - Aguardando informacoes
3. ACKNOWLEDGED - Confirmado
4. ASSIGNED - Atribuido a desenvolvedor
5. RESOLVED - Corrigido
6. CLOSED - Verificado e fechado

## Integracao com Git

Configurar mensagens de commit:
```
fix: corrige validacao de email duplicado (refs #0001)
```

No config_inc.php:
```php
$g_source_control_notes_view_status = VIEWER;
$g_source_control_regexp = '/\b(?:bug|issue|mantis)\s*[#]{0,1}(\d+)\b/i';
```

## Backup
```bash
# Backup do banco
mysqldump -u mantis -p mantisbt > mantis_backup.sql

# Backup dos arquivos
tar -czf mantis_files.tar.gz /var/www/html/mantis/
```

## Acesso Web

URL: http://localhost/mantis
Login padrao: administrator / root

IMPORTANTE: Altere a senha padrao imediatamente!

---

Para mais informacoes: https://www.mantisbt.org/docs/
