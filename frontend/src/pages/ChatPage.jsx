import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import Message from '../components/Message';

const useChatId = () => {
  const { search } = useLocation();
  return new URLSearchParams(search).get('id');
};

export default function ChatPage() {
  const navigate = useNavigate();
  const chatId = useChatId();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const controllerRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    api.get('/user')
      .then(res => setUser(res.data))
      .catch(() => navigate('/login'));
  }, []);

  useEffect(() => {
    if (chatId) {
      api.get(`/chats/${chatId}`)
        .then(res => setMessages(res.data))
        .catch(() => setMessages([]));
    } else {
      setMessages([]);
    }
  }, [chatId]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!chatId || !input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const response = await fetch(`${api.defaults.baseURL}/chats/${chatId}/message`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content }),
        signal: controller.signal,
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let botMessage = '';

      setMessages(prev => [...prev, { role: 'gnomo', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        botMessage += decoder.decode(value, { stream: true });
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1].content = botMessage;
          return updated;
        });
      }

    } catch (err) {
      if (err.name === 'AbortError') {
        setMessages(prev => [...prev, { role: 'gnomo', content: '⚠️ Resposta cancelada.' }]);
      } else {
        console.error('Erro ao enviar:', err);
        setMessages(prev => [...prev, { role: 'gnomo', content: '⚠️ Erro na resposta.' }]);
      }
    } finally {
      setLoading(false);
      controllerRef.current = null;
    }
  };

  const cancelResponse = () => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const logout = () => api.post('/logout').then(() => navigate('/login'));

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <TopBar user={user} onLogout={logout} />

        <div
  ref={chatContainerRef}
  className="flex-1 overflow-y-auto px-6 space-y-10 pb-32"
>
  <div className="max-w-5xl mx-auto flex flex-col space-y-6">
    {messages.length === 0 && !loading ? (
      <div className="flex flex-col items-center justify-center h-full text-neutral-500">
        <div className="text-2xl mb-2">Olá, {user?.username}</div>
        <div className="text-sm">Crie ou selecione um chat para começar.</div>
      </div>
    ) : (
      messages.map((m, i) => (
        <Message key={i} role={m.role} content={m.content} />
      ))
    )}
    {loading && <Message role="gnomo" content="..." />}
  </div>
</div>

        {chatId && (
          <div className="sticky bottom-0 w-full bg-neutral-950/80 backdrop-blur-md px-6 py-4">
            <div className="flex items-end gap-2 bg-neutral-900 border border-neutral-700 rounded-2xl px-4 py-3 shadow-md">
              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua mensagem..."
                className="flex-1 min-h-[48px] max-h-40 resize-none bg-transparent outline-none text-sm placeholder:text-neutral-500 text-neutral-200"
              />
              {loading ? (
                <button
                  onClick={cancelResponse}
                  className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={sendMessage}
                  className="w-10 h-10 rounded-full bg-white hover:bg-neutral-200 flex items-center justify-center transition"
                >
                  <svg className="w-5 h-5 text-neutral-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10l9 9m0 0l9-9m-9 9V3" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}