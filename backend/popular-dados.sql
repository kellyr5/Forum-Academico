-- Limpar dados antigos (opcional)
-- DELETE FROM mural_recados;
-- DELETE FROM respostas;
-- DELETE FROM topicos;
-- DELETE FROM disciplinas;
-- DELETE FROM usuarios WHERE id > 0;

-- Inserir usuários (se não existirem)
INSERT IGNORE INTO usuarios (id, nome_completo, email, senha_hash, curso_id, periodo, tipo_usuario) VALUES
(1, 'Admin Sistema', 'admin@unifei.edu.br', 'admin123', 1, 1, 'Professor'),
(2, 'Professor João Silva', 'joao.silva@unifei.edu.br', 'prof123', 1, 1, 'Professor'),
(3, 'Aluna Maria Santos', 'maria.santos@unifei.edu.br', 'aluno123', 1, 3, 'Aluno');

-- Inserir disciplinas
INSERT IGNORE INTO disciplinas (id, nome, codigo, curso_id, professor_id) VALUES
(1, 'Engenharia de Software', 'ES001', 1, 1),
(2, 'Banco de Dados', 'BD001', 1, 2),
(3, 'Algoritmos e Estruturas de Dados', 'AED001', 1, 2);

-- Inserir categorias (se não existirem)
INSERT IGNORE INTO categorias (id, nome, descricao) VALUES
(1, 'Dúvida', 'Perguntas e dúvidas sobre a disciplina'),
(2, 'Discussão', 'Discussões sobre tópicos relacionados'),
(3, 'Anúncio', 'Anúncios e avisos importantes');

-- Inserir tópicos de exemplo
INSERT IGNORE INTO topicos (id, titulo, conteudo, disciplina_id, usuario_id, categoria_id, status) VALUES
(1, 'Dúvida sobre MVC', 'Como implementar o padrão MVC corretamente?', 1, 3, 1, 'Aberto'),
(2, 'Normalização de Banco de Dados', 'Alguém pode explicar a diferença entre 2NF e 3NF?', 2, 3, 1, 'Aberto');

-- Resetar AUTO_INCREMENT (se necessário)
ALTER TABLE usuarios AUTO_INCREMENT = 4;
ALTER TABLE disciplinas AUTO_INCREMENT = 4;
ALTER TABLE categorias AUTO_INCREMENT = 4;
ALTER TABLE topicos AUTO_INCREMENT = 3;
