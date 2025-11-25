USE forum_academico;

-- Tabela de Matrículas (alunos matriculados em disciplinas)
CREATE TABLE IF NOT EXISTS matriculas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    aluno_id INT NOT NULL,
    disciplina_id INT NOT NULL,
    semestre VARCHAR(10) NOT NULL,
    status ENUM('Ativa', 'Trancada', 'Concluida') DEFAULT 'Ativa',
    data_matricula TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (aluno_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (disciplina_id) REFERENCES disciplinas(id) ON DELETE CASCADE,
    UNIQUE KEY (aluno_id, disciplina_id, semestre),
    INDEX idx_aluno (aluno_id),
    INDEX idx_disciplina (disciplina_id)
);

-- Tabela de Monitoria (monitores vinculados a disciplinas)
CREATE TABLE IF NOT EXISTS monitorias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    monitor_id INT NOT NULL,
    disciplina_id INT NOT NULL,
    semestre VARCHAR(10) NOT NULL,
    ativa BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (monitor_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (disciplina_id) REFERENCES disciplinas(id) ON DELETE CASCADE,
    UNIQUE KEY (monitor_id, disciplina_id, semestre),
    INDEX idx_monitor (monitor_id),
    INDEX idx_disciplina (disciplina_id)
);

-- Inserir matrículas de exemplo
-- Maria Santos (Aluno, id=3) matriculada em Cálculo I e Programação I
INSERT INTO matriculas (aluno_id, disciplina_id, semestre, status) VALUES
(3, 1, '2025.1', 'Ativa'),  -- Cálculo I
(3, 2, '2025.1', 'Ativa'),  -- Programação I
(3, 3, '2025.1', 'Ativa');  -- Estrutura de Dados

-- Ana Paula (Aluno, id=5) matriculada em Banco de Dados e Programação I
INSERT INTO matriculas (aluno_id, disciplina_id, semestre, status) VALUES
(5, 2, '2025.1', 'Ativa'),  -- Programação I
(5, 4, '2025.1', 'Ativa');  -- Banco de Dados

-- João Oliveira (Monitor, id=4) monitora Estrutura de Dados
INSERT INTO monitorias (monitor_id, disciplina_id, semestre, ativa) VALUES
(4, 3, '2025.1', TRUE);  -- Estrutura de Dados
