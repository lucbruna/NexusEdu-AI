import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import MainLayout from "../layouts/MainLayout";

export default function History() {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  async function loadHistory() {
    setLoading(true);
    try {
      const res = await api.get(`/history?page=${page}&page_size=20`);
      setHistory(res.data.items || []);
      setTotalPages(res.data.total_pages || 1);
    } catch {
      setHistory([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadHistory();
  }, [page]);

  const filteredHistory = history.filter((item) =>
    item.prompt?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-extrabold gradient-text">Histórico</h1>
            <p className="text-slate-400 text-sm mt-1">Todas as aulas geradas pela IA</p>
          </div>
          <span className="text-xs text-slate-500 bg-white/5 px-3 py-1.5 rounded-full">
            {history.length} registro(s)
          </span>
        </div>

        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
          <input
            type="text"
            placeholder="Buscar aulas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-modern w-full glass rounded-xl p-4 pl-12 text-white placeholder-slate-500 outline-none"
          />
        </div>

        <div className="flex flex-col gap-4">
          <AnimatePresence>
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin h-8 w-8 border-2 border-indigo-400 border-t-transparent rounded-full mx-auto" />
              </div>
            ) : filteredHistory.length > 0 ? (
              filteredHistory.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass rounded-2xl p-6 card-hover group"
                >
                  <div className="flex items-start gap-2 mb-4">
                    <span className="text-lg">💬</span>
                    <div className="flex-1">
                      <h2 className="text-xs font-semibold text-indigo-400 mb-1 uppercase tracking-wider">Prompt</h2>
                      <p className="text-slate-300 whitespace-pre-wrap text-sm">{item.prompt}</p>
                    </div>
                  </div>
                  <div className="w-full h-px bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-transparent mb-4" />
                  <div className="flex items-start gap-2">
                    <span className="text-lg">🤖</span>
                    <div className="flex-1">
                      <h2 className="text-xs font-semibold text-emerald-400 mb-1 uppercase tracking-wider">Resposta</h2>
                      <p className="text-slate-300 whitespace-pre-wrap text-sm leading-relaxed">
                        {item.response}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <p className="text-4xl mb-4">📭</p>
                <p className="text-slate-500">Nenhum registro encontrado</p>
              </motion.div>
            )}
          </AnimatePresence>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 disabled:opacity-30 hover:bg-slate-700"
              >
                ← Anterior
              </button>
              <span className="px-4 py-2 text-slate-400">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 disabled:opacity-30 hover:bg-slate-700"
              >
                Próximo →
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </MainLayout>
  );
}
