import { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function AdminPage() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passwords, setPasswords] = useState({});

  const [file, setFile] = useState(null);
  const [documents, setDocuments] = useState([]);

  const [prompt, setPrompt] = useState('');
  const [models, setModels] = useState([]);

  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [savingPrompt, setSavingPrompt] = useState(false);

  const [showModelModal, setShowModelModal] = useState(false);
  const [modelName, setModelName] = useState('');

  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    api.get('/user')
      .then(res => {
        if (res.data.role !== 'admin') navigate('/chat');
      })
      .catch(() => navigate('/login'));

    loadUsers();
    loadDocuments();
    loadPrompt();
    loadModels();
  }, []);

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const loadUsers = () => {
    setLoadingUsers(true);
    api.get('/users')
      .then(res => setUsers(res.data))
      .finally(() => setLoadingUsers(false));
  };

  const loadDocuments = () => {
    setLoadingDocs(true);
    api.get('/admin/documents')
      .then(res => setDocuments(res.data))
      .finally(() => setLoadingDocs(false));
  };

  const loadPrompt = () => {
    api.get('/admin/prompt')
      .then(res => setPrompt(res.data.prompt))
      .catch(() => setPrompt(''));
  };

  const loadModels = () => {
    api.get('/admin/models')
      .then(res => setModels(res.data))
      .catch(() => setModels([]));
  };

  const savePrompt = () => {
    setSavingPrompt(true);
    api.post('/admin/prompt', { newPrompt: prompt })
      .then(() => showSuccess('Prompt atualizado!'))
      .finally(() => setSavingPrompt(false));
  };

  const saveAsModel = () => {
    if (!modelName.trim()) return showSuccess('Nome inválido');
    api.post('/admin/save-model', { name: modelName, promptContent: prompt })
      .then(() => {
        showSuccess('Modelo salvo!');
        setModelName('');
        setShowModelModal(false);
        loadModels();
      });
  };

  const addUser = () => {
    if (!newUser || !newPass) return;
    api.post('/users', { username: newUser, password: newPass })
      .then(() => {
        setNewUser('');
        setNewPass('');
        loadUsers();
        showSuccess('Usuário criado!');
      });
  };

  const deleteUser = (username) => {
    api.delete(`/users/${username}`)
      .then(() => {
        loadUsers();
        showSuccess('Usuário removido!');
      });
  };

  const changePassword = (username) => {
    const newPassword = passwords[username];
    if (!newPassword) return;
    api.post(`/users/${username}/password`, { newPassword })
      .then(() => {
        setPasswords({ ...passwords, [username]: '' });
        showSuccess('Senha alterada!');
      });
  };

  const deleteDocument = (filename) => {
    api.delete(`/admin/documents/${filename}`)
      .then(() => {
        loadDocuments();
        showSuccess('Documento removido!');
      });
  };

  const uploadFile = () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    api.post('/admin/upload', formData)
      .then(() => {
        setFile(null);
        loadDocuments();
        showSuccess('Documento enviado!');
      })
      .finally(() => setUploading(false));
  };

  const deleteModel = (modelName) => {
    const safeName = modelName.replace(/[^a-zA-Z0-9-_]/g, '_');
    
    api.delete(`/admin/models/${safeName}`)
      .then(() => {
        loadModels();
        showSuccess('Modelo removido!');
      })
      .catch(() => {
        showSuccess('Erro ao remover modelo');
      });
  };
  
  
  

  return (
    <div className="p-8 min-h-screen bg-neutral-950 text-white">
      {successMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {successMessage}
        </div>
      )}

      <div className="mb-6">
        <button
          onClick={() => navigate('/chat')}
          className="text-sm px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition"
        >
          ← Voltar para o Chat
        </button>
      </div>

      <h1 className="text-2xl mb-6 font-bold tracking-tight">
        Painel de Administração
      </h1>

      {/* Usuários */}
      <section className="mb-16">
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 shadow-md">
          <h2 className="text-lg font-semibold mb-4">
            Gerenciamento de Usuários
          </h2>

          <div className="flex flex-wrap gap-3 items-center mb-5">
            <input
              className="p-2 rounded-lg bg-neutral-900 border border-neutral-700 w-56 text-sm"
              placeholder="Novo usuário"
              value={newUser}
              onChange={e => setNewUser(e.target.value)}
            />
            <input
              className="p-2 rounded-lg bg-neutral-900 border border-neutral-700 w-56 text-sm"
              type="password"
              placeholder="Senha"
              value={newPass}
              onChange={e => setNewPass(e.target.value)}
            />
            <button
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
              onClick={addUser}
            >
              Adicionar
            </button>
          </div>

          <div className="space-y-2">
            {loadingUsers ? (
              <div className="text-neutral-400 animate-pulse">
                Carregando usuários...
              </div>
            ) : users.length === 0 ? (
              <div className="text-neutral-500">Nenhum usuário cadastrado.</div>
            ) : (
              users.map((u) => (
                <div
                  key={u}
                  className="flex flex-col sm:flex-row justify-between gap-3 items-center bg-neutral-900 border border-neutral-800 p-3 rounded-lg hover:bg-neutral-800 transition"
                >
                  <div className="flex flex-col">
                    <span className="text-neutral-200 text-sm mb-1">{u}</span>
                    <div className="flex gap-2">
                      <input
                        className="p-1 rounded bg-neutral-800 border border-neutral-700 text-sm w-48"
                        type="password"
                        placeholder="Nova senha"
                        value={passwords[u] || ''}
                        onChange={e => setPasswords({ ...passwords, [u]: e.target.value })}
                      />
                      <button
                        className="text-blue-500 hover:text-red-600 text-sm"
                        onClick={() => changePassword(u)}
                      >
                        Alterar Senha
                      </button>
                    </div>
                  </div>
                  <button
                    className="text-red-500 hover:text-red-600 text-sm"
                    onClick={() => deleteUser(u)}
                  >
                    Remover
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Documentos */}
      <section className="mb-16">
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 shadow-md">
          <h2 className="text-lg font-semibold mb-4">
            Upload de Documentos (.md)
          </h2>

          <div className="flex flex-wrap gap-3 items-center mb-5">
            <input
              type="file"
              className="p-2 rounded-lg bg-neutral-900 border border-neutral-700 w-64 text-sm"
              accept=".md"
              onChange={e => setFile(e.target.files[0])}
              disabled={uploading}
            />
            <button
              className={`px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium ${
                uploading && 'opacity-60 cursor-not-allowed'
              }`}
              onClick={uploadFile}
              disabled={uploading}
            >
              {uploading ? 'Enviando...' : 'Upload'}
            </button>
          </div>

          <h3 className="text-base mb-3 font-medium">
            Documentos Enviados:
          </h3>

          <div className="space-y-2">
            {loadingDocs ? (
              <div className="text-neutral-400 animate-pulse">
                Carregando documentos...
              </div>
            ) : documents.length === 0 ? (
              <div className="text-neutral-500">Nenhum documento enviado ainda.</div>
            ) : (
              documents.map((doc, i) => (
                <div
                  key={doc.filename || i}
                  className="flex justify-between items-center bg-neutral-900 border border-neutral-800 p-3 rounded-lg hover:bg-neutral-800 transition group"
                >
                  <div className="text-neutral-200 text-sm">
                    {doc.filename || doc.name}
                  </div>
                  <button
                    onClick={() => deleteDocument(doc.filename)}
                    className="text-red-500 hover:text-red-600 text-sm opacity-0 group-hover:opacity-100 transition"
                  >
                    Remover
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Prompt */}
      <section>
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 shadow-md">
          <h2 className="text-lg font-semibold mb-4">
            Prompt do Sistema
          </h2>

          <textarea
            className="w-full h-64 p-4 rounded-lg bg-neutral-900 border border-neutral-700 text-sm"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
          />

          <div className="flex flex-wrap gap-3 mt-4">
            <button
              className={`px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-500 text-white text-sm font-medium ${
                savingPrompt && 'opacity-60 cursor-not-allowed'
              }`}
              onClick={savePrompt}
              disabled={savingPrompt}
            >
              {savingPrompt ? 'Salvando...' : 'Salvar System Prompt'}
            </button>

            <button
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
              onClick={() => setShowModelModal(true)}
            >
              Salvar como Modelo
            </button>
          </div>

          <div className="mt-6">
  <h3 className="text-sm mb-2 font-semibold text-neutral-300">
    Modelos de Prompt Salvos
  </h3>
  {models.length === 0 ? (
    <div className="text-neutral-600 text-xs">
      Nenhum modelo salvo.
    </div>
  ) : (
    <div className="space-y-2">
      {models.map((m) => (
        <div
          key={m.name}
          className="flex justify-between items-center bg-neutral-900 border border-neutral-800 p-3 rounded-lg hover:bg-neutral-800 transition group"
        >
          <div className="flex flex-col">
          <span className="text-neutral-200 text-sm font-medium">
  {m.name.replace(/_/g, ' ')}
</span>

            <span className="text-neutral-500 text-xs truncate max-w-[300px]">
              {m.prompt.slice(0, 80)}...
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPrompt(m.prompt)}
              className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs text-white"
            >
              Usar
            </button>
            <button
              onClick={() => deleteModel(m.name)}
              className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-xs text-white"
            >
              Excluir
            </button>
          </div>
        </div>
      ))}
    </div>
  )}
</div>

        </div>
      </section>

      {/* Modal Salvar Modelo */}
      {showModelModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-700 w-[400px]">
            <h3 className="text-lg mb-4 text-white font-semibold">
              Salvar como Modelo
            </h3>
            <input
              className="w-full mb-4 p-2 rounded bg-neutral-800 border border-neutral-700 text-sm"
              placeholder="Nome do modelo"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-sm"
                onClick={() => setShowModelModal(false)}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm"
                onClick={saveAsModel}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
