-- Usuarios para teste de login

-- Administrador (usando 'Administrador' ao inves de 'Admin')
INSERT INTO usuarios (nome_completo, email, senha_hash, tipo_usuario, curso_id, periodo) 
VALUES ('Administrador Sistema', 'admin@unifei.edu.br', 'admin123', 'Administrador', 1, 1)
ON DUPLICATE KEY UPDATE email=email;

-- Professor
INSERT INTO usuarios (nome_completo, email, senha_hash, tipo_usuario, curso_id, periodo) 
VALUES ('Professor Carlos Silva', 'professor@unifei.edu.br', 'prof123', 'Professor', 1, 1)
ON DUPLICATE KEY UPDATE email=email;

-- Aluno
INSERT INTO usuarios (nome_completo, email, senha_hash, tipo_usuario, curso_id, periodo) 
VALUES ('Aluno Teste Silva', 'aluno@unifei.edu.br', 'aluno123', 'Aluno', 1, 5)
ON DUPLICATE KEY UPDATE email=email;
