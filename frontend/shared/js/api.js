// Helper para chamadas à API

const API_BASE = 'http://localhost:3000/api';

// Função genérica para fazer requisições
async function fetchAPI(endpoint, options = {}) {
  const usuario = obterUsuarioLogado();
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'x-usuario-id': usuario ? usuario.id : ''
  };
  
  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };
  
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro na requisição');
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Erro na API:', error);
    return { success: false, error: error.message };
  }
}

// Métodos específicos
const API = {
  // Disciplinas do usuário
  async minhasDisciplinas() {
    const usuario = obterUsuarioLogado();
    
    if (usuario.tipo === 'Aluno') {
      return fetchAPI(`/matriculas/aluno/${usuario.id}`);
    } else if (usuario.tipo === 'Monitor') {
      return fetchAPI(`/monitorias/monitor/${usuario.id}`);
    } else if (usuario.tipo === 'Professor') {
      return fetchAPI(`/disciplinas/professor/${usuario.id}`);
    } else {
      return fetchAPI('/disciplinas');
    }
  },
  
  // Tópicos de uma disciplina
  async topicosDisciplina(disciplinaId) {
    return fetchAPI(`/topicos/disciplina/${disciplinaId}`);
  },
  
  // Criar tópico
  async criarTopico(dados) {
    return fetchAPI('/topicos', {
      method: 'POST',
      body: JSON.stringify(dados)
    });
  },
  
  // Respostas de um tópico
  async respostasTopico(topicoId) {
    return fetchAPI(`/respostas/topico/${topicoId}`);
  },
  
  // Criar resposta
  async criarResposta(dados) {
    return fetchAPI('/respostas', {
      method: 'POST',
      body: JSON.stringify(dados)
    });
  },
  
  // Recados
  async recados() {
    return fetchAPI('/recados');
  },
  
  // Criar recado
  async criarRecado(dados) {
    return fetchAPI('/recados', {
      method: 'POST',
      body: JSON.stringify(dados)
    });
  },
  
  // Upload de arquivo
  async uploadArquivo(formData) {
    const usuario = obterUsuarioLogado();
    
    const response = await fetch(`${API_BASE}/arquivos`, {
      method: 'POST',
      headers: {
        'x-usuario-id': usuario ? usuario.id : ''
      },
      body: formData
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro no upload');
    }
    
    return { success: true, data };
  }
};
