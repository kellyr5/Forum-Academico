const API_URL = 'http://localhost:3000/api';

function obterUsuarioLogado() {
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
  return usuario;
}

function obterHeaders() {
  const usuario = obterUsuarioLogado();
  return {
    'Content-Type': 'application/json',
    'x-usuario-id': usuario ? usuario.id : ''
  };
}

// Carregar cursos nos selects
function carregarCursosSelect() {
  fetch(API_URL + '/cursos')
    .then(r => r.json())
    .then(cursos => {
      const selectUsuario = document.getElementById('usuario-curso');
      const selectDisciplina = document.getElementById('disciplina-curso');
      
      if (selectUsuario) {
        selectUsuario.innerHTML = '<option value="">Selecione o curso</option>';
        cursos.forEach(curso => {
          selectUsuario.innerHTML += `<option value="${curso.id}">${curso.nome}</option>`;
        });
      }
      
      if (selectDisciplina) {
        selectDisciplina.innerHTML = '<option value="">Selecione o curso</option>';
        cursos.forEach(curso => {
          selectDisciplina.innerHTML += `<option value="${curso.id}">${curso.nome}</option>`;
        });
      }
    })
    .catch(err => console.error('Erro ao carregar cursos:', err));
}

// Carregar professores no select
function carregarProfessoresSelect() {
  fetch(API_URL + '/usuarios?tipo=Professor', {
    headers: obterHeaders()
  })
    .then(r => r.json())
    .then(professores => {
      const select = document.getElementById('disciplina-professor');
      if (select) {
        select.innerHTML = '<option value="">Selecione o professor</option>';
        professores.forEach(prof => {
          select.innerHTML += `<option value="${prof.id}">${prof.nome_completo}</option>`;
        });
      }
    })
    .catch(err => console.error('Erro ao carregar professores:', err));
}

// Carregar disciplinas no select
function carregarDisciplinasSelect() {
  fetch(API_URL + '/disciplinas')
    .then(r => r.json())
    .then(disciplinas => {
      const selectTopico = document.getElementById('topico-disciplina');
      const selectArquivo = document.getElementById('arquivo-topico');
      
      if (selectTopico) {
        selectTopico.innerHTML = '<option value="">Selecione a disciplina</option>';
        disciplinas.forEach(disc => {
          selectTopico.innerHTML += `<option value="${disc.id}">${disc.nome}</option>`;
        });
      }
      
      if (selectArquivo) {
        selectArquivo.innerHTML = '<option value="">Nenhum</option>';
      }
    })
    .catch(err => console.error('Erro ao carregar disciplinas:', err));
}

// Carregar categorias no select
function carregarCategoriasSelect() {
  fetch(API_URL + '/categorias')
    .then(r => r.json())
    .then(categorias => {
      const select = document.getElementById('topico-categoria');
      if (select) {
        select.innerHTML = '<option value="">Selecione a categoria</option>';
        categorias.forEach(cat => {
          select.innerHTML += `<option value="${cat.id}">${cat.nome}</option>`;
        });
      }
    })
    .catch(err => console.error('Erro ao carregar categorias:', err));
}

// Carregar tópicos no select
function carregarTopicosSelect() {
  fetch(API_URL + '/topicos')
    .then(r => r.json())
    .then(topicos => {
      const selectResposta = document.getElementById('resposta-topico');
      const selectArquivo = document.getElementById('arquivo-topico');
      
      if (selectResposta) {
        selectResposta.innerHTML = '<option value="">Selecione o tópico</option>';
        topicos.forEach(top => {
          selectResposta.innerHTML += `<option value="${top.id}">${top.titulo}</option>`;
        });
      }
      
      if (selectArquivo) {
        topicos.forEach(top => {
          selectArquivo.innerHTML += `<option value="${top.id}">${top.titulo}</option>`;
        });
      }
    })
    .catch(err => console.error('Erro ao carregar tópicos:', err));
}

// Inicializar todos os selects
function inicializarSelects() {
  carregarCursosSelect();
  carregarProfessoresSelect();
  carregarDisciplinasSelect();
  carregarCategoriasSelect();
  carregarTopicosSelect();
}

// Executar ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
  inicializarSelects();
});
