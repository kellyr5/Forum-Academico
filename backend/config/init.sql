-- Script de criação do banco de dados do Fórum Acadêmico

DROP DATABASE IF EXISTS forum_academico;
CREATE DATABASE forum_academico CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE forum_academico;

-- Tabela de Universidades
CREATE TABLE universidades (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(200) NOT NULL UNIQUE,
    sigla VARCHAR(20),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Cursos
CREATE TABLE cursos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(200) NOT NULL,
    universidade_id INT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (universidade_id) REFERENCES universidades(id) ON DELETE CASCADE,
    UNIQUE KEY (nome, universidade_id)
);

-- Tabela de Usuários
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome_completo VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    universidade_id INT NOT NULL,
    curso_id INT NOT NULL,
    periodo INT NOT NULL,
    tipo_usuario ENUM('Aluno', 'Professor', 'Monitor') NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    excluido BOOLEAN DEFAULT FALSE,
    data_exclusao TIMESTAMP NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (universidade_id) REFERENCES universidades(id),
    FOREIGN KEY (curso_id) REFERENCES cursos(id),
    INDEX idx_email (email),
    INDEX idx_tipo (tipo_usuario)
);

-- Tabela de Disciplinas
CREATE TABLE disciplinas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    codigo VARCHAR(15) NOT NULL,
    universidade_id INT NOT NULL,
    curso_id INT NOT NULL,
    professor_id INT NOT NULL,
    periodo_letivo VARCHAR(10) NOT NULL,
    descricao TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (universidade_id) REFERENCES universidades(id),
    FOREIGN KEY (curso_id) REFERENCES cursos(id),
    FOREIGN KEY (professor_id) REFERENCES usuarios(id),
    UNIQUE KEY (codigo, universidade_id),
    INDEX idx_periodo (periodo_letivo)
);

-- Tabela de Tópicos
CREATE TABLE topicos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(150) NOT NULL,
    conteudo TEXT NOT NULL,
    disciplina_id INT NOT NULL,
    usuario_id INT NOT NULL,
    categoria ENUM('Dúvida', 'Discussão', 'Anúncio') NOT NULL,
    tags VARCHAR(255),
    fixo BOOLEAN DEFAULT FALSE,
    status ENUM('Aberto', 'Resolvido', 'Fechado') DEFAULT 'Aberto',
    visualizacoes INT DEFAULT 0,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (disciplina_id) REFERENCES disciplinas(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    INDEX idx_disciplina (disciplina_id),
    INDEX idx_categoria (categoria),
    INDEX idx_status (status),
    FULLTEXT idx_busca (titulo, conteudo)
);

-- Tabela de Respostas
CREATE TABLE respostas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    conteudo TEXT NOT NULL,
    topico_id INT NOT NULL,
    usuario_id INT NOT NULL,
    resposta_pai_id INT NULL,
    melhor_resposta BOOLEAN DEFAULT FALSE,
    votos INT DEFAULT 0,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (topico_id) REFERENCES topicos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (resposta_pai_id) REFERENCES respostas(id) ON DELETE CASCADE,
    INDEX idx_topico (topico_id),
    INDEX idx_usuario (usuario_id)
);

-- Tabela de Votos
CREATE TABLE votos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    resposta_id INT NOT NULL,
    usuario_id INT NOT NULL,
    tipo_voto ENUM('Positivo') DEFAULT 'Positivo',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resposta_id) REFERENCES respostas(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY (resposta_id, usuario_id)
);

-- Tabela de Arquivos Anexados
CREATE TABLE arquivos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome_original VARCHAR(255) NOT NULL,
    nome_arquivo VARCHAR(255) NOT NULL,
    tamanho INT NOT NULL,
    tipo_mime VARCHAR(100) NOT NULL,
    hash_arquivo VARCHAR(64) NOT NULL,
    topico_id INT NULL,
    resposta_id INT NULL,
    usuario_id INT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (topico_id) REFERENCES topicos(id) ON DELETE CASCADE,
    FOREIGN KEY (resposta_id) REFERENCES respostas(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    INDEX idx_hash (hash_arquivo)
);

-- Tabela de Log de Auditoria
CREATE TABLE logs_auditoria (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT,
    acao VARCHAR(100) NOT NULL,
    tabela VARCHAR(50) NOT NULL,
    registro_id INT,
    dados_anteriores JSON,
    dados_novos JSON,
    ip_address VARCHAR(45),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_usuario (usuario_id),
    INDEX idx_acao (acao),
    INDEX idx_data (criado_em)
);

-- Tabela de Palavras Bloqueadas
CREATE TABLE palavras_bloqueadas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    palavra VARCHAR(100) NOT NULL UNIQUE,
    severidade ENUM('Baixa', 'Média', 'Alta') DEFAULT 'Média',
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir dados iniciais
INSERT INTO universidades (nome, sigla) VALUES 
('Universidade Federal de Itajubá', 'UNIFEI'),
('Universidade de São Paulo', 'USP'),
('Universidade Federal de Minas Gerais', 'UFMG');

INSERT INTO cursos (nome, universidade_id) VALUES 
('Engenharia de Computação', 1),
('Ciência da Computação', 1),
('Sistemas de Informação', 1),
('Engenharia Elétrica', 1);

-- Inserir palavras bloqueadas (exemplo)
INSERT INTO palavras_bloqueadas (palavra, severidade) VALUES 
('idiota', 'Média'),
('burro', 'Média'),
('estúpido', 'Alta');
