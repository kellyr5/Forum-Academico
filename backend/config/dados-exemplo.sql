USE forum_academico;

-- Inserir recados de exemplo
INSERT INTO mural_recados (titulo, conteudo, tipo_aviso, usuario_id) VALUES
('Bem-vindos ao Fórum Acadêmico', 'Este é o espaço oficial para discussões acadêmicas da UNIFEI. Sejam respeitosos e colaborativos!', 'importante', 1),
('Semana de Provas - 2025.1', 'A semana de provas será de 15 a 19 de dezembro. Organizem seus estudos com antecedência.', 'aviso_faculdade', 2),
('Palestra sobre Inteligência Artificial', 'No dia 30/11 às 14h teremos uma palestra sobre IA aplicada. Sala 301. Todos convidados!', 'evento', 2),
('Manutenção no Sistema', 'O sistema ficará fora do ar no domingo das 2h às 6h para manutenção programada.', 'geral', 1),
('Prazo de Matrícula', 'O prazo para matrícula no próximo semestre termina em 10/12. Não percam!', 'importante', 1);

-- Inserir tópicos de exemplo
INSERT INTO topicos (titulo, conteudo, disciplina_id, usuario_id, categoria_id, status) VALUES
('Dúvida sobre derivadas', 'Estou com dificuldade em entender a regra da cadeia. Alguém pode explicar com um exemplo prático?', 1, 3, 1, 'Aberto'),
('Projeto Final - Ideias', 'Estou pensando em fazer um sistema de gerenciamento para bibliotecas. O que vocês acham? Sugestões?', 2, 3, 2, 'Aberto'),
('Melhor IDE para programar em Python', 'Qual IDE vocês recomendam para iniciantes em Python? Estou entre VS Code e PyCharm.', 2, 5, 2, 'Aberto'),
('Dúvida sobre ponteiros em C', 'Não estou conseguindo entender como funciona a alocação dinâmica de memória. Alguém pode ajudar?', 3, 3, 1, 'Aberto'),
('Normalização de Banco de Dados', 'Alguém pode explicar a diferença entre 2FN e 3FN com exemplos? Estou confuso.', 4, 5, 1, 'Aberto'),
('Aula Extra de Cálculo', 'Haverá aula extra de cálculo na sexta-feira às 16h. Sala 205. Será revisão para a prova.', 1, 2, 3, 'Aberto');

-- Inserir respostas de exemplo
INSERT INTO respostas (conteudo, topico_id, usuario_id, votos) VALUES
('A regra da cadeia é usada quando você tem uma função composta. Por exemplo: se f(x) = (3x+2)^5, você deriva o "de fora" e multiplica pela derivada do "de dentro". Neste caso: 5(3x+2)^4 * 3 = 15(3x+2)^4', 1, 2, 5),
('Complementando: pense na regra da cadeia como derivar camada por camada. Se tem uma função dentro de outra, você deriva de fora para dentro.', 1, 4, 3),
('Ótima ideia! Sistema de biblioteca é um projeto completo. Você pode adicionar: cadastro de livros, controle de empréstimos, multas por atraso, relatórios... Tem muito conteúdo pra trabalhar.', 2, 4, 4),
('Recomendo começar com VS Code. É mais leve, tem excelentes extensões para Python e é gratuito. PyCharm é ótimo mas pode ser pesado para máquinas mais fracas.', 3, 2, 6),
('Uso VS Code também! Instala as extensões Python, Pylance e Code Runner que fica perfeito.', 3, 4, 2),
('Ponteiros podem ser complicados no início. O básico: um ponteiro guarda o ENDEREÇO de uma variável, não o valor. Use malloc() para alocar memória e free() para liberar. Quer um exemplo de código?', 4, 2, 4),
('2FN: todos os atributos não-chave devem depender da chave primária COMPLETA. 3FN: não pode haver dependência transitiva (um atributo não-chave não pode depender de outro atributo não-chave). Exemplo: se você tem Aluno(id, nome, cidade, estado) e estado depende de cidade, está violando a 3FN.', 5, 2, 7),
('Estarei presente na aula extra! Preciso tirar dúvidas sobre limites.', 6, 3, 1),
('Professor, poderia revisar também integrais definidas?', 6, 5, 2);

-- Atualizar contadores de votos nas respostas (já inseridos acima)

-- Inserir alguns arquivos de exemplo (simulados - arquivos físicos não existem)
INSERT INTO arquivos (nome_original, nome_arquivo, tamanho, tipo_mime, hash_arquivo, topico_id, usuario_id) VALUES
('apostila-calculo.pdf', 'abc123def456.pdf', 2048576, 'application/pdf', 'hash123abc456def', 1, 2),
('exemplo-ponteiros.c', 'def789ghi012.c', 5120, 'text/plain', 'hash789def012ghi', 4, 2),
('diagrama-normalizacao.png', 'ghi345jkl678.png', 153600, 'image/png', 'hash345ghi678jkl', 5, 2),
('projeto-biblioteca.zip', 'jkl901mno234.zip', 10240000, 'application/zip', 'hash901jkl234mno', 2, 3);

-- Atualizar algumas estatísticas
UPDATE topicos SET visualizacoes = 15 WHERE id = 1;
UPDATE topicos SET visualizacoes = 8 WHERE id = 2;
UPDATE topicos SET visualizacoes = 12 WHERE id = 3;
UPDATE topicos SET visualizacoes = 6 WHERE id = 4;
UPDATE topicos SET visualizacoes = 10 WHERE id = 5;
UPDATE topicos SET visualizacoes = 20 WHERE id = 6;

-- Marcar alguns tópicos como resolvidos
UPDATE topicos SET status = 'Resolvido' WHERE id IN (1, 5);
