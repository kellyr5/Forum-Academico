USE forum_academico;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE votos;
TRUNCATE TABLE respostas;
TRUNCATE TABLE topicos;
TRUNCATE TABLE disciplinas;
TRUNCATE TABLE usuarios;
TRUNCATE TABLE mural_recados;
SET FOREIGN_KEY_CHECKS = 1;

-- USUÁRIOS
INSERT INTO usuarios (id, nome_completo, email, senha_hash, universidade_id, curso_id, periodo, tipo_usuario) VALUES
(2023000490, 'Kelly Reis', 'kelly.reis@unifei.edu.br', '$2a$10$rZ8qNW0KvE5YhX7LJ4xLOeJ9vK2pQ1sR3tT4uU5vV6wW7xX8yY9zZ0', 1, 1, 5, 'Aluno');

INSERT INTO usuarios (nome_completo, email, senha_hash, universidade_id, curso_id, periodo, tipo_usuario) VALUES
('Prof. Carlos Silva', 'carlos.silva@unifei.edu.br', '$2a$10$rZ8qNW0KvE5YhX7LJ4xLOeJ9vK2pQ1sR3tT4uU5vV6wW7xX8yY9zZ0', 1, 1, 10, 'Professor'),
('Profa. Ana Paula', 'ana.paula@unifei.edu.br', '$2a$10$rZ8qNW0KvE5YhX7LJ4xLOeJ9vK2pQ1sR3tT4uU5vV6wW7xX8yY9zZ0', 1, 1, 10, 'Professor'),
('Prof. Roberto Lima', 'roberto.lima@unifei.edu.br', '$2a$10$rZ8qNW0KvE5YhX7LJ4xLOeJ9vK2pQ1sR3tT4uU5vV6wW7xX8yY9zZ0', 1, 2, 10, 'Professor'),
('Profa. Mariana Costa', 'mariana.costa@unifei.edu.br', '$2a$10$rZ8qNW0KvE5YhX7LJ4xLOeJ9vK2pQ1sR3tT4uU5vV6wW7xX8yY9zZ0', 1, 3, 10, 'Professor'),
('João Pedro Santos', 'joao.santos@unifei.edu.br', '$2a$10$rZ8qNW0KvE5YhX7LJ4xLOeJ9vK2pQ1sR3tT4uU5vV6wW7xX8yY9zZ0', 1, 1, 6, 'Aluno'),
('Maria Eduarda Oliveira', 'maria.oliveira@unifei.edu.br', '$2a$10$rZ8qNW0KvE5YhX7LJ4xLOeJ9vK2pQ1sR3tT4uU5vV6wW7xX8yY9zZ0', 1, 1, 4, 'Aluno'),
('Lucas Ferreira', 'lucas.ferreira@unifei.edu.br', '$2a$10$rZ8qNW0KvE5YhX7LJ4xLOeJ9vK2pQ1sR3tT4uU5vV6wW7xX8yY9zZ0', 1, 2, 3, 'Aluno'),
('Beatriz Almeida', 'beatriz.almeida@unifei.edu.br', '$2a$10$rZ8qNW0KvE5YhX7LJ4xLOeJ9vK2pQ1sR3tT4uU5vV6wW7xX8yY9zZ0', 1, 3, 7, 'Aluno'),
('Gabriel Rodrigues', 'gabriel.rodrigues@unifei.edu.br', '$2a$10$rZ8qNW0KvE5YhX7LJ4xLOeJ9vK2pQ1sR3tT4uU5vV6wW7xX8yY9zZ0', 1, 1, 5, 'Aluno'),
('Pedro Henrique', 'pedro.henrique@unifei.edu.br', '$2a$10$rZ8qNW0KvE5YhX7LJ4xLOeJ9vK2pQ1sR3tT4uU5vV6wW7xX8yY9zZ0', 1, 1, 8, 'Monitor'),
('Isabela Mendes', 'isabela.mendes@unifei.edu.br', '$2a$10$rZ8qNW0KvE5YhX7LJ4xLOeJ9vK2pQ1sR3tT4uU5vV6wW7xX8yY9zZ0', 1, 2, 7, 'Monitor');

-- DISCIPLINAS
INSERT INTO disciplinas (nome, codigo, universidade_id, curso_id, professor_id, periodo_letivo, descricao) VALUES
('Algoritmos e Estruturas de Dados', 'COM101', 1, 1, 1, '2025.1', 'Estudo de algoritmos fundamentais'),
('Programação Orientada a Objetos', 'COM201', 1, 1, 1, '2025.1', 'Paradigma OO'),
('Banco de Dados', 'COM301', 1, 1, 2, '2025.1', 'Modelagem de BD'),
('Engenharia de Software', 'COM401', 1, 1, 2, '2025.1', 'Processos de desenvolvimento'),
('Sistemas Operacionais', 'COM501', 1, 1, 1, '2025.1', 'Fundamentos de SO'),
('Redes de Computadores', 'COM601', 1, 1, 2, '2025.1', 'Protocolos de rede'),
('Inteligência Artificial', 'COM701', 1, 1, 2, '2025.1', 'Técnicas de IA'),
('Compiladores', 'COM801', 1, 1, 1, '2025.1', 'Teoria de compiladores'),
('Mecânica dos Sólidos', 'MEC101', 1, 2, 3, '2025.1', 'Análise de estruturas'),
('Termodinâmica', 'MEC201', 1, 2, 3, '2025.1', 'Transferência de calor'),
('Circuitos Elétricos', 'ELE101', 1, 3, 4, '2025.1', 'Análise de circuitos'),
('Eletrônica Analógica', 'ELE201', 1, 3, 4, '2025.1', 'Dispositivos eletrônicos');

-- MURAL
INSERT INTO mural_recados (titulo, conteudo, autor, categoria, cor, fixado) VALUES
('Bem-vindo ao Fórum Acadêmico UNIFEI', 'Este é o espaço oficial para discussões acadêmicas!', 'Administração', 'Aviso', '#003366', TRUE),
('Palestra sobre IA - 15/01/2025', 'Não percam! 19h no Auditório Principal', 'Coordenação', 'Evento', '#1e88e5', TRUE),
('Monitoria de Banco de Dados', 'Terças e quintas, 16h-18h, Sala 203', 'Monitoria', 'Aviso', '#43a047', FALSE),
('Processo Seletivo Empresa Júnior', 'Inscrições até 20/01/2025', 'EJ', 'Oportunidade', '#fb8c00', FALSE),
('Manutenção Sistema - 10/01', 'Sistema offline das 2h às 6h', 'TI', 'Aviso', '#e53935', FALSE);

-- TÓPICOS
INSERT INTO topicos (titulo, conteudo, disciplina_id, usuario_id, categoria, tags, status) VALUES
('Dúvida sobre QuickSort', 'Por que a complexidade no pior caso é O(n²)?', 1, 2023000490, 'Dúvida', 'algoritmos,quicksort', 'Aberto'),
('Diferença entre Composição e Agregação', 'Quando usar cada uma em POO?', 2, 5, 'Discussão', 'poo,design', 'Aberto'),
('Normalização até 3FN', 'Sempre devemos normalizar até 3FN?', 3, 6, 'Discussão', 'banco-de-dados,normalizacao', 'Aberto'),
('Testes Automatizados - Jest vs Mocha', 'Qual framework recomendam?', 4, 2023000490, 'Dúvida', 'testes,jest,mocha', 'Aberto'),
('Escalonamento Round Robin vs Prioridade', 'Exemplos práticos?', 5, 7, 'Dúvida', 'so,escalonamento', 'Aberto'),
('Implementar Servidor HTTP', 'Dicas para o projeto final?', 6, 8, 'Discussão', 'redes,http,projeto', 'Aberto'),
('Redes Neurais - Número de Camadas', 'Como escolher quantas camadas usar?', 7, 9, 'Dúvida', 'ia,deep-learning', 'Aberto'),
('Momento Fletor em Vigas', 'Como calcular em viga bi-apoiada?', 9, 7, 'Dúvida', 'mecanica,viga', 'Aberto');

-- RESPOSTAS (SEM resposta_pai_id para evitar erro)
INSERT INTO respostas (conteudo, topico_id, usuario_id, votos, melhor_resposta) VALUES
('O pior caso é O(n²) quando o pivô escolhido é sempre o menor ou maior elemento, resultando em partições desbalanceadas.', 1, 10, 3, TRUE),
('Para evitar o pior caso, use pivô aleatório ou mediana de três. Na prática o QuickSort é O(n log n).', 1, 1, 2, FALSE),
('Composição: objeto contido não existe sem o container. Agregação: objetos independentes.', 2, 2, 2, TRUE),
('Exemplo: Carro-Motor é composição. Professor-Departamento é agregação.', 2, 10, 1, FALSE),
('3FN é suficiente para maioria dos projetos. Ir além pode prejudicar performance.', 3, 11, 2, TRUE),
('No meu estágio mantivemos 3FN e criamos views desnormalizadas para relatórios.', 3, 2023000490, 1, FALSE),
('Recomendo Jest! Vem com tudo integrado e é mais fácil começar.', 4, 1, 2, TRUE),
('Uso Mocha + Chai no trabalho. Mais modular mas Jest é melhor para iniciantes.', 4, 6, 1, FALSE),
('Round Robin: todos processos iguais. Prioridade: quando alguns são mais importantes.', 5, 1, 2, TRUE),
('Já fiz! Comece simples com GET de arquivos estáticos. Use sockets e implemente parsing de headers.', 6, 11, 2, TRUE),
('Não existe regra fixa. Comece com 1 camada e vá adicionando se necessário.', 7, 4, 3, TRUE),
('Para viga bi-apoiada com carga distribuída: M_max = (w × L²) / 8', 8, 3, 2, TRUE);

SELECT 'Dados inseridos com sucesso!' as status;
