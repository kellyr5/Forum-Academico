// Sistema de Autenticação Unificado

const AUTH_CONFIG = {
  API_URL: 'http://localhost:3000/api',
  PAGINAS_PUBLICAS: ['login.html', 'cadastro.html'],
  ROTAS_POR_PERFIL: {
    'Aluno': '/aluno/index.html',
    'Professor': '/professor/index.html',
    'Monitor': '/monitor/index.html',
    'Administrador': '/admin/index.html'
  }
};

// Obter usuário logado
function obterUsuarioLogado() {
  const usuario = localStorage.getItem('usuario');
  return usuario ? JSON.parse(usuario) : null;
}

// Salvar usuário
function salvarUsuario(usuario) {
  localStorage.setItem('usuario', JSON.stringify(usuario));
}

// Remover usuário
function removerUsuario() {
  localStorage.removeItem('usuario');
}

// Verificar autenticação
function verificarAutenticacao() {
  const caminhoAtual = window.location.pathname;
  const arquivoAtual = caminhoAtual.split('/').pop();
  
  // Se está em página pública, não precisa verificar
  if (AUTH_CONFIG.PAGINAS_PUBLICAS.includes(arquivoAtual)) {
    return;
  }
  
  const usuario = obterUsuarioLogado();
  
  // Se não está logado, redirecionar para login
  if (!usuario || !usuario.id) {
    window.location.href = '/login.html';
    return;
  }
  
  // Verificar se está na rota correta para seu perfil
  const rotaCorreta = AUTH_CONFIG.ROTAS_POR_PERFIL[usuario.tipo];
  
  if (rotaCorreta && !caminhoAtual.includes(rotaCorreta.split('/')[1])) {
    // Se não está na pasta correta do seu perfil e não está no login
    if (!AUTH_CONFIG.PAGINAS_PUBLICAS.includes(arquivoAtual)) {
      window.location.href = rotaCorreta;
      return;
    }
  }
  
  // Atualizar informações do usuário no header
  atualizarHeaderUsuario(usuario);
}

// Atualizar informações do usuário no header
function atualizarHeaderUsuario(usuario) {
  const userNameElement = document.getElementById('user-name');
  const userRoleElement = document.getElementById('user-role');
  
  if (userNameElement) {
    userNameElement.textContent = usuario.nome;
  }
  
  if (userRoleElement) {
    userRoleElement.textContent = usuario.tipo;
  }
}

// Fazer login
async function fazerLogin(email, senha) {
  try {
    const response = await fetch(`${AUTH_CONFIG.API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });
    
    const data = await response.json();
    
    if (data.success && data.usuario) {
      salvarUsuario(data.usuario);
      
      // Redirecionar para dashboard do perfil
      const rota = AUTH_CONFIG.ROTAS_POR_PERFIL[data.usuario.tipo];
      window.location.href = rota || '/aluno/index.html';
      
      return { success: true };
    } else {
      return { success: false, error: data.error || 'Erro ao fazer login' };
    }
  } catch (error) {
    console.error('Erro no login:', error);
    return { success: false, error: 'Erro ao conectar com o servidor' };
  }
}

// Fazer logout
async function fazerLogout() {
  const usuario = obterUsuarioLogado();
  
  if (usuario && usuario.id) {
    try {
      await fetch(`${AUTH_CONFIG.API_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: usuario.id })
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }
  
  removerUsuario();
  window.location.href = '/login.html';
}

// Obter headers para requisições autenticadas
function obterHeaders() {
  const usuario = obterUsuarioLogado();
  return {
    'Content-Type': 'application/json',
    'x-usuario-id': usuario ? usuario.id : ''
  };
}

// Verificar permissão
function temPermissao(tiposPermitidos) {
  const usuario = obterUsuarioLogado();
  if (!usuario) return false;
  return tiposPermitidos.includes(usuario.tipo);
}

// Executar ao carregar página
document.addEventListener('DOMContentLoaded', function() {
  verificarAutenticacao();
  
  // Adicionar evento de logout ao botão se existir
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', fazerLogout);
  }
});
