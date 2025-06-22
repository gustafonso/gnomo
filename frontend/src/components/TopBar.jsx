import { useEffect, useState } from "react";
import api from "../services/api";
import DropdownSelect from "../components/ui/DropdownSelect";

export default function TopBar({ user, onLogout }) {
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(user?.selectedModel || "");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchModels() {
      try {
        const res = await api.get("/models");
        const opts = res.data.models.map((m) => ({ label: m, value: m }));
        setModels(opts);
        setSelectedModel(user?.selectedModel || res.data.defaultModel);
      } catch (err) {
        setModels([]);
      } finally {
        setLoading(false);
      }
    }
    fetchModels();
    // eslint-disable-next-line
  }, []);

  const handleModelChange = async (model) => {
    setSelectedModel(model);
    try {
      await api.post("/user/model", { model });
    } catch {
      alert("Erro ao alterar modelo!");
    }
  };

  return (
    <div className="h-14 flex items-center justify-between px-6
      backdrop-blur-lg bg-neutral-950/60 shadow-xl relative z-40">

      <div className="flex items-center gap-4 text-sm text-neutral-300">
        <div className="px-3 py-1 rounded-md bg-neutral-800/40 hover:bg-neutral-800/60 
        transition text-neutral-400 hover:text-white">
          Logado como: <span className="font-semibold text-white">{user?.username}</span>
        </div>

        {loading ? (
          <div className="text-neutral-500">Carregando modelos...</div>
        ) : (
          <DropdownSelect
            value={selectedModel}
            onChange={handleModelChange}
            options={models}
            placeholder="Selecionar modelo"
          />
        )}
      </div>

      <button
        onClick={onLogout}
        className="text-sm text-neutral-400 hover:text-white transition px-3 py-1 
        rounded-md hover:bg-neutral-800/50"
      >
        Logout
      </button>
    </div>
  );
}