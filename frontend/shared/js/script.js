const API = 'http://localhost:3000/api';

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

// SISTEMA DE NAVEGAÇÃO ENTRE ABAS
function ativarAba(abaId) {
  console.log('Ativando aba:', abaId);
  
  // Remover classe active de todas as seções e links
  document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.tab-link').forEach(l => l.classList.remove('active'));
  
  // Adicionar classe active na seção e link corretos
  const secao = document.getElementById(abaId);
  const link = document.querySelector(`[data-tab="${abaId}"]`);
  
  if (secao) {
    secao.classList.add('active');
    console.log('Seção ativada:', abaId);
  } else {
    console.error('Seção não encontrada:', abaId);
  }
  
  if (link) {
    link.classList.add('active');
  }
  
  // Carregar dados específicos de cada aba
  switch(abaId) {
    case 'mural':
      carregarRecados();
      break;
    case 'usuarios':
      carregarUsuarios();
      break;
    case 'disciplinas':
      carregarDisciplinas();
      break;
    case 'topicos':
      carregarTopicos();
      break;
    case 'respostas':
      carregarRespostas();
      break;
    case 'arquivos':
      carregarArquivos();
      break;
  }
}

// Adicionar event listeners aos links das abas
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM carregado, inicializando abas...');
  
  document.querySelectorAll('.tab-link').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const tab = this.getAttribute('data-tab');
      console.log('Click na aba:', tab);
      ativarAba(tab);
    });
  });
  
  // Carregar dados iniciais da aba mural
  carregarRecados();
});

// ==================== RECADOS ====================
document.getElementById('form-recado').addEventListener('submit', function(e) {
  e.preventDefault();
  const usuario = obterUsuarioLogado();
  
  const dados = {
    titulo: document.getElementById('recado-titulo').value,
    conteudo: document.getElementById('recado-conteudo').value,
    usuario_id: usuario.id,
    tipo_aviso: document.getElementById('recado-tipo').value
  };
  
  fetch(API + '/recados', {
    method: 'POST',
    headers: obterHeaders(),
    body: JSON.stringify(dados)
  })
  .then(r => r.json())
  .then(data => {
    if (data.error) {
      alert('Erro: ' + data.error);
    } else {
      alert('Recado publicado com sucesso!');
      document.getElementById('form-recado').reset();
      carregarRecados();
    }
  })
  .catch(e => {
    console.error('Erro:', e);
    alert('Erro ao publicar recado: ' + e.message);
  });
});

function carregarRecados() {
  console.log('Carregando recados...');
  
  fetch(API + '/recados')
    .then(r => r.json())
    .then(recados => {
      console.log('Recados carregados:', recados);
      const lista = document.getElementById('recados-lista');
      
      if (!lista) {
        console.error('Elemento recados-lista não encontrado');
        return;
      }
      
      if (!recados || recados.length === 0) {
        lista.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">Nenhum recado encontrado.</p>';
        return;
      }
      
      lista.innerHTML = recados.map(r => `
        <div class="item-card" style="background: white; padding: 20px; margin-bottom: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="display: flex; justify-content: space-between; align-items: start;">
            <div style="flex: 1;">
              <span style="display: inline-block; padding: 4px 12px; background: #1e3c72; color: white; border-radius: 4px; font-size: 11px; text-transform: uppercase; margin-bottom: 10px;">${r.tipo_aviso}</span>
              <h4 style="margin: 10px 0; color: #333; font-size: 18px;">${r.titulo}</h4>
              <p style="color: #666; margin: 10px 0; line-height: 1.6;">${r.conteudo}</p>
              <small style="color: #999;">
                Por: <strong>${r.autor_nome || 'Desconhecido'}</strong> | 
                ${new Date(r.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </small>
            </div>
          </div>
        </div>
      `).join('');
    })
    .catch(err => {
      console.error('Erro ao carregar recados:', err);
      const lista = document.getElementById('recados-lista');
      if (lista) {
        lista.innerHTML = '<p style="color: red; text-align: center;">Erro ao carregar recados. Verifique se o servidor está rodando.</p>';
      }
    });
}

// ==================== USUÁRIOS ====================
document.getElementById('form-usuario').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const senha = document.getElementById('usuario-senha').value;
  
  const dados = {
    nome_completo: document.getElementById('usuario-nome').value,
    email: document.getElementById('usuario-email').value,
    senha: senha,
    confirmar_senha: senha,
    curso_id: parseInt(document.getElementById('usuario-curso').value),
    periodo: parseInt(document.getElementById('usuario-periodo').value),
    tipo_usuario: document.getElementById('usuario-tipo').value
  };
  
  fetch(API + '/usuarios', {
    method: 'POST',
    headers: obterHeaders(),
    body: JSON.stringify(dados)
  })
  .then(r => r.json())
  .then(data => {
    if (data.error) {
      alert('Erro: ' + data.error);
    } else {
      alert('Usuário cadastrado com sucesso!');
      document.getElementById('form-usuario').reset();
      carregarUsuarios();
    }
  })
  .catch(e => alert('Erro: ' + e.message));
});

function carregarUsuarios() {
  console.log('Carregando usuários...');
  
  fetch(API + '/usuarios', {
    headers: obterHeaders()
  })
    .then(r => r.json())
    .then(usuarios => {
      console.log('Usuários carregados:', usuarios);
      const lista = document.getElementById('usuarios-lista');
      
      if (!usuarios || usuarios.length === 0) {
        lista.innerHTML = '<p style="text-align: center; color: #999;">Nenhum usuário encontrado.</p>';
        return;
      }
      
      lista.innerHTML = usuarios.map(u => `
        <div class="item-card" style="background: white; padding: 20px; margin-bottom: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h4 style="margin: 0 0 10px 0; color: #333;">${u.nome_completo}</h4>
          <p style="margin: 5px 0; color: #666;"><strong>Email:</strong> ${u.email}</p>
          <p style="margin: 5px 0; color: #666;"><strong>Tipo:</strong> ${u.tipo_usuario} | <strong>Período:</strong> ${u.periodo}º</p>
          <p style="margin: 5px 0; color: #666;"><strong>Curso:</strong> ${u.curso_nome || 'Não informado'}</p>
        </div>
      `).join('');
    })
    .catch(err => {
      console.error('Erro ao carregar usuários:', err);
    });
}

// ==================== DISCIPLINAS ====================
document.getElementById('form-disciplina').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const dados = {
    nome: document.getElementById('disciplina-nome').value,
    codigo: document.getElementById('disciplina-codigo').value,
    curso_id: parseInt(document.getElementById('disciplina-curso').value),
    professor_id: parseInt(document.getElementById('disciplina-professor').value),
    periodo_letivo: '2025.1'
  };
  
  fetch(API + '/disciplinas', {
    method: 'POST',
    headers: obterHeaders(),
    body: JSON.stringify(dados)
  })
  .then(r => r.json())
  .then(data => {
    if (data.error) {
      alert('Erro: ' + data.error);
    } else {
      alert('Disciplina cadastrada com sucesso!');
      document.getElementById('form-disciplina').reset();
      carregarDisciplinas();
    }
  })
  .catch(e => alert('Erro: ' + e.message));
});

function carregarDisciplinas() {
  console.log('Carregando disciplinas...');
  
  fetch(API + '/disciplinas')
    .then(r => r.json())
    .then(disciplinas => {
      console.log('Disciplinas carregadas:', disciplinas);
      const lista = document.getElementById('disciplinas-lista');
      
      if (!disciplinas || disciplinas.length === 0) {
        lista.innerHTML = '<p style="text-align: center; color: #999;">Nenhuma disciplina encontrada.</p>';
        return;
      }
      
      lista.innerHTML = disciplinas.map(d => `
        <div class="item-card" style="background: white; padding: 20px; margin-bottom: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h4 style="margin: 0 0 10px 0; color: #333;">${d.nome}</h4>
          <p style="margin: 5px 0; color: #666;"><strong>Código:</strong> ${d.codigo}</p>
          <p style="margin: 5px 0; color: #666;"><strong>Período:</strong> ${d.periodo_letivo}</p>
          ${d.descricao ? `<p style="margin: 10px 0 0 0; color: #666;">${d.descricao}</p>` : ''}
        </div>
      `).join('');
    })
    .catch(err => {
      console.error('Erro ao carregar disciplinas:', err);
    });
}

// ==================== TÓPICOS ====================
document.getElementById('form-topico').addEventListener('submit', function(e) {
  e.preventDefault();
  const usuario = obterUsuarioLogado();
  
  const dados = {
    titulo: document.getElementById('topico-titulo').value,
    conteudo: document.getElementById('topico-conteudo').value,
    disciplina_id: parseInt(document.getElementById('topico-disciplina').value),
    usuario_id: usuario.id,
    categoria_id: parseInt(document.getElementById('topico-categoria').value)
  };
  
  fetch(API + '/topicos', {
    method: 'POST',
    headers: obterHeaders(),
    body: JSON.stringify(dados)
  })
  .then(r => r.json())
  .then(data => {
    if (data.error) {
      alert('Erro: ' + data.error);
    } else {
      alert('Tópico criado com sucesso!');
      document.getElementById('form-topico').reset();
      carregarTopicos();
    }
  })
  .catch(e => alert('Erro: ' + e.message));
});

function carregarTopicos() {
  console.log('Carregando tópicos...');
  
  fetch(API + '/topicos')
    .then(r => r.json())
    .then(topicos => {
      console.log('Tópicos carregados:', topicos);
      const lista = document.getElementById('topicos-lista');
      
      if (!topicos || topicos.length === 0) {
        lista.innerHTML = '<p style="text-align: center; color: #999;">Nenhum tópico encontrado.</p>';
        return;
      }
      
      lista.innerHTML = topicos.map(t => `
        <div class="item-card" style="background: white; padding: 20px; margin-bottom: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h4 style="margin: 0 0 10px 0; color: #333;">${t.titulo}</h4>
          <p style="margin: 10px 0; color: #666;">${t.conteudo.substring(0, 150)}${t.conteudo.length > 150 ? '...' : ''}</p>
          <small style="color: #999;">
            <strong>Status:</strong> ${t.status} | 
            ${new Date(t.criado_em).toLocaleDateString('pt-BR')}
          </small>
        </div>
      `).join('');
    })
    .catch(err => {
      console.error('Erro ao carregar tópicos:', err);
    });
}

// ==================== RESPOSTAS ====================
document.getElementById('form-resposta').addEventListener('submit', function(e) {
  e.preventDefault();
  const usuario = obterUsuarioLogado();
  
  const dados = {
    conteudo: document.getElementById('resposta-conteudo').value,
    topico_id: parseInt(document.getElementById('resposta-topico').value),
    usuario_id: usuario.id
  };
  
  fetch(API + '/respostas', {
    method: 'POST',
    headers: obterHeaders(),
    body: JSON.stringify(dados)
  })
  .then(r => r.json())
  .then(data => {
    if (data.error) {
      alert('Erro: ' + data.error);
    } else {
      alert('Resposta registrada com sucesso!');
      document.getElementById('form-resposta').reset();
      carregarRespostas();
    }
  })
  .catch(e => alert('Erro: ' + e.message));
});

function carregarRespostas() {
  console.log('Carregando respostas...');
  
  fetch(API + '/respostas')
    .then(r => r.json())
    .then(respostas => {
      console.log('Respostas carregadas:', respostas);
      const lista = document.getElementById('respostas-lista');
      
      if (!respostas || respostas.length === 0) {
        lista.innerHTML = '<p style="text-align: center; color: #999;">Nenhuma resposta encontrada.</p>';
        return;
      }
      
      lista.innerHTML = respostas.map(r => `
        <div class="item-card" style="background: white; padding: 20px; margin-bottom: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <p style="margin: 0 0 10px 0; color: #666;">${r.conteudo}</p>
          <small style="color: #999;">
            <strong>Votos:</strong> ${r.votos || 0} | 
            ${new Date(r.criado_em).toLocaleDateString('pt-BR')}
          </small>
        </div>
      `).join('');
    })
    .catch(err => {
      console.error('Erro ao carregar respostas:', err);
    });
}

// ==================== ARQUIVOS ====================
document.getElementById('form-arquivo').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const fileInput = document.getElementById('arquivo-file');
  const usuario = obterUsuarioLogado();
  const topicoId = document.getElementById('arquivo-topico').value;
  const respostaId = document.getElementById('arquivo-resposta').value;
  
  if (!fileInput.files[0]) {
    alert('Selecione um arquivo');
    return;
  }
  
  const formData = new FormData();
  formData.append('arquivo', fileInput.files[0]);
  formData.append('usuario_id', usuario.id);
  if (topicoId) formData.append('topico_id', topicoId);
  if (respostaId) formData.append('resposta_id', respostaId);
  
  const progressBar = document.getElementById('progress-bar');
  const uploadProgress = document.getElementById('upload-progress');
  uploadProgress.style.display = 'block';
  progressBar.style.width = '50%';
  progressBar.textContent = '50%';
  
  fetch(API + '/arquivos', {
    method: 'POST',
    body: formData
  })
  .then(r => r.json())
  .then(data => {
    progressBar.style.width = '100%';
    progressBar.textContent = '100%';
    
    setTimeout(() => {
      uploadProgress.style.display = 'none';
      progressBar.style.width = '0%';
      
      if (data.error) {
        alert('Erro: ' + data.error);
      } else {
        alert('Arquivo enviado com sucesso!');
        document.getElementById('form-arquivo').reset();
        carregarArquivos();
      }
    }, 1000);
  })
  .catch(e => {
    uploadProgress.style.display = 'none';
    alert('Erro: ' + e.message);
  });
});

function carregarArquivos() {
  console.log('Carregando arquivos...');
  
  fetch(API + '/arquivos')
    .then(r => r.json())
    .then(arquivos => {
      console.log('Arquivos carregados:', arquivos);
      const lista = document.getElementById('arquivos-lista');
      
      if (!arquivos || arquivos.length === 0) {
        lista.innerHTML = '<p style="text-align: center; color: #999;">Nenhum arquivo encontrado.</p>';
        return;
      }
      
      lista.innerHTML = arquivos.map(a => `
        <div class="item-card" style="background: white; padding: 20px; margin-bottom: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h4 style="margin: 0 0 10px 0; color: #333;">${a.nome_original}</h4>
          <p style="margin: 5px 0; color: #666;"><strong>Tamanho:</strong> ${(a.tamanho / 1024).toFixed(2)} KB</p>
          <small style="color: #999; display: block; margin: 10px 0;">
            Enviado em: ${new Date(a.criado_em).toLocaleDateString('pt-BR')}
          </small>
          <a href="${API}/arquivos/${a.id}/download" target="_blank" class="btn btn-primary" style="display: inline-block; padding: 8px 16px; background: #1e3c72; color: white; text-decoration: none; border-radius: 4px;">Baixar</a>
        </div>
      `).join('');
    })
    .catch(err => {
      console.error('Erro ao carregar arquivos:', err);
    });
}

// Atualizar função de carregar arquivos
function carregarArquivos() {
  console.log('Carregando arquivos...');
  
  fetch(API + '/arquivos')
    .then(r => r.json())
    .then(arquivos => {
      console.log('Arquivos carregados:', arquivos);
      const lista = document.getElementById('arquivos-lista');
      
      if (!arquivos || arquivos.length === 0) {
        lista.innerHTML = '<p style="text-align: center; color: #999;">Nenhum arquivo encontrado. Faça o upload do primeiro arquivo!</p>';
        return;
      }
      
      lista.innerHTML = arquivos.map(a => `
        <div class="item-card" style="background: white; padding: 20px; margin-bottom: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h4 style="margin: 0 0 10px 0; color: #333;">${a.nome_original}</h4>
          <p style="margin: 5px 0; color: #666;">
            <strong>Tamanho:</strong> ${(a.tamanho / 1024).toFixed(2)} KB
          </p>
          <p style="margin: 5px 0; color: #666;">
            <strong>Enviado por:</strong> ${a.usuario_nome || 'Desconhecido'}
          </p>
          ${a.topico_titulo ? `<p style="margin: 5px 0; color: #666;"><strong>Tópico:</strong> ${a.topico_titulo}</p>` : ''}
          <small style="color: #999; display: block; margin: 10px 0;">
            ${new Date(a.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </small>
          <a href="${API}/arquivos/${a.id}/download" target="_blank" class="btn btn-primary" style="display: inline-block; padding: 8px 16px; background: #1e3c72; color: white; text-decoration: none; border-radius: 4px;">Tentar Baixar</a>
          <small style="display: block; margin-top: 5px; color: #999; font-style: italic;">
            * Arquivos de exemplo podem não estar disponíveis para download
          </small>
        </div>
      `).join('');
    })
    .catch(err => {
      console.error('Erro ao carregar arquivos:', err);
      const lista = document.getElementById('arquivos-lista');
      if (lista) {
        lista.innerHTML = '<p style="color: red; text-align: center;">Erro ao carregar arquivos.</p>';
      }
    });
}
