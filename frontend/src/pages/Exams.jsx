import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import api from "../services/api";
import MainLayout from "../layouts/MainLayout";

export default function Exams() {
  const [theme, setTheme] = useState("");
  const [questions, setQuestions] = useState(5);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  async function generateExam() {
    if (!theme) {
      toast.error("Digite um tema para a prova");
      return;
    }
    setLoading(true);
    setResponse("");
    try {
      const prompt = `Crie uma prova escolar com ${questions} questões sobre:\n\n${theme}\n\nA prova deve conter:\n- perguntas claras\n- alternativas\n- gabarito no final`;
      const res = await api.post("/generate", {
        email: localStorage.getItem("email"),
        prompt
      });
      setResponse(res.data.response);
      toast.success("Prova gerada com sucesso!");
    } catch (error) {
      const msg = error.response?.data?.detail || "Erro ao gerar prova";
      setResponse(msg);
      toast.error(msg);
    }
    setLoading(false);
  }

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold gradient-text">Gerador de Provas</h1>
          <p className="text-slate-400 text-sm mt-1">Crie provas personalizadas com IA</p>
        </div>

        <div className="glass rounded-2xl p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Tema da Prova</label>
            <input
              type="text"
              placeholder="Ex: Revolução Industrial"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="input-modern w-full bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 text-white placeholder-slate-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Quantidade de Questões</label>
            <select
              value={questions}
              onChange={(e) => setQuestions(Number(e.target.value))}
              className="input-modern w-full bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 text-white outline-none"
            >
              <option value={5}>5 questões</option>
              <option value={10}>10 questões</option>
              <option value={15}>15 questões</option>
              <option value={20}>20 questões</option>
            </select>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={generateExam}
            disabled={loading || !theme}
            className="btn-gradient w-full p-4 rounded-xl font-medium disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Gerando...
              </span>
            ) : "📝 Gerar Prova"}
          </motion.button>
        </div>

        {response && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 glass rounded-2xl p-6"
          >
            <h2 className="text-sm font-semibold text-indigo-400 mb-3 uppercase tracking-wider">Prova Gerada</h2>
            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{response}</p>
          </motion.div>
        )}
      </motion.div>
    </MainLayout>
  );
}
