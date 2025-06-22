import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

export default function Sidebar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const chatId = searchParams.get('id');

  const [chats, setChats] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.get('/user')
      .then(res => setUser(res.data))
      .catch(() => navigate('/login'));

    loadChats();
  }, []);

  const loadChats = () => {
    api.get('/chats').then(res => setChats(res.data));
  };

  const newChat = () => {
    api.post('/new-chat').then(res => {
      navigate(`/chat?id=${res.data.chatId}`);
      loadChats();
    });
  };

  const deleteChat = (id) => {
    api.delete(`/chats/${id}`).then(loadChats);
    if (id === chatId) navigate('/chat');
  };

  const handleFooterClick = () => {
    if (user?.role === 'admin') {
      navigate('/admin');
    }
  };

  return (
    <div className="w-72 bg-neutral-900 shadow-xl flex flex-col">
      {/* TOPO */}
      <div className="flex flex-col items-center gap-2 p-5">
        <img
          src="/gnomo.png"
          alt="Logo"
          className="w-16 h-16 rounded-full shadow-md"
        />
        <div className="text-2xl font-extrabold text-white tracking-wide">
          GNØMØ
        </div>
      </div>

      {/* CHATS */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <button
          className="w-full mb-5 px-4 py-2 bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-800 hover:to-blue-600 rounded-xl text-sm text-white font-semibold shadow-md transition"
          onClick={newChat}
        >
          + Novo Chat
        </button>

        <div className="space-y-2">
          {chats.map(c => (
            <div
              key={c.id}
              className={`p-3 rounded-xl cursor-pointer transition ${
                c.id === chatId
                  ? 'bg-neutral-800 shadow-md'
                  : 'hover:bg-neutral-800/70'
              }`}
              onClick={() => navigate(`/chat?id=${c.id}`)}
            >
              <div className="truncate text-sm text-neutral-200">
                {c.title}
              </div>
              <button
                className="text-xs text-red-500 hover:underline mt-1"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteChat(c.id);
                }}
              >
                Excluir
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* RODAPÉ */}
      <div
        onClick={handleFooterClick}
        className={`p-4 flex flex-col items-center gap-2 ${
          user?.role === 'admin' ? 'cursor-pointer hover:bg-neutral-800/50' : ''
        } transition`}
      >
        <div className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center text-sm font-semibold text-white shadow">
          {user?.username?.slice(0, 2).toUpperCase()}
        </div>
        <div className="text-sm text-neutral-300 font-medium truncate">
          {user?.username}
        </div>
        {user?.role === 'admin' && (
          <div className="text-xs text-blue-400 opacity-70">
            Acessar Admin
          </div>
        )}
      </div>
    </div>
  );
}