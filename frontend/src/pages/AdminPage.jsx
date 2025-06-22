import { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function AdminPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState('');
  const [newPass, setNewPass] = useState('');
  const [file, setFile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api.get('/user')
      .then(res => {
        if (res.data.role !== 'admin') navigate('/chat');
      })
      .catch(() => navigate('/login'));

    loadUsers();
    loadDocuments();
  }, []);

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

  const addUser = () => {
    if (!newUser || !newPass) return;
    api.post('/users', { username: newUser, password: newPass })
      .then(() => {
        setNewUser('');
        setNewPass('');
        loadUsers();
      });
  };

  const deleteUser = (username) => {
    api.delete(`/users/${username}`).then(loadUsers);
  };

  const deleteDocument = (filename) => {
    api.delete(`/admin/documents/${filename}`)
      .then(() => loadDocuments());
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
      })
      .finally(() => setUploading(false));
  };

  return (
    <div className="p-8 min-h-screen bg-neutral-950 text-white">
      
      {/* Botão de voltar */}
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
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-md">
          <h2 className="text-lg font-semibold mb-4">
            Gerenciamento de Usuários
          </h2>

          <div className="flex flex-wrap gap-3 items-center mb-5">
            <input
              className="p-2 rounded-lg bg-neutral-900 border border-neutral-700 w-56 text-sm text-neutral-200 focus:outline-none focus:ring-1 focus:ring-blue-600"
              placeholder="Novo usuário"
              value={newUser}
              onChange={e => setNewUser(e.target.value)}
            />
            <input
              className="p-2 rounded-lg bg-neutral-900 border border-neutral-700 w-56 text-sm text-neutral-200 focus:outline-none focus:ring-1 focus:ring-blue-600"
              type="password"
              placeholder="Senha"
              value={newPass}
              onChange={e => setNewPass(e.target.value)}
            />
            <button
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition"
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
                  className="flex justify-between items-center bg-neutral-900 border border-neutral-800 p-3 rounded-lg hover:bg-neutral-800 transition"
                >
                  <span className="text-neutral-200 text-sm">{u}</span>
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
      <section>
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-md">
          <h2 className="text-lg font-semibold mb-4">
            Upload de Documentos (.md)
          </h2>

          <div className="flex flex-wrap gap-3 items-center mb-5">
            <input
              type="file"
              className="p-2 rounded-lg bg-neutral-900 border border-neutral-700 w-64 text-sm text-neutral-300 focus:outline-none focus:ring-1 focus:ring-green-600"
              accept=".md"
              onChange={e => setFile(e.target.files[0])}
              disabled={uploading}
            />
            <button
              className={`px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition ${
                uploading && 'opacity-60 cursor-not-allowed'
              }`}
              onClick={uploadFile}
              disabled={uploading}
            >
              {uploading ? 'Enviando...' : 'Upload'}
            </button>
          </div>

          <h3 className="text-base mb-3 font-medium text-neutral-300">
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
    </div>
  );
}