import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function LoginPage() {
  const navigate  = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/login', { username, password });
      navigate('/');
    } catch {
      setError(' Usuário ou senha incorretos.');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-neutral-950">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-10 shadow-2xl w-full max-w-md">
        {/* logo */}
        <div className="flex justify-center mb-6">
  <img 
    src={`${import.meta.env.BASE_URL}gnomo.png`} 
    alt="GNOMO" 
    className="w-24 h-24 rounded-full border border-neutral-700 shadow-lg" 
  />
</div>

        <h1 className="text-3xl font-bold text-center mb-8 text-white">
          Bem-vindo ao <span className="text-white">GNøM0</span>
        </h1>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block mb-1 text-sm text-neutral-400">Usuário</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Digite seu usuário"
              className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm text-neutral-400">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          {/* botão branco + texto escuro para contraste */}
          <button
            type="submit"
            className="w-full bg-white hover:bg-neutral-200 transition-colors text-neutral-900 font-semibold py-3 rounded-xl"
          >
            Entrar
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-neutral-500">
          GNOMO — IA para Pentest <br /> &copy; {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}