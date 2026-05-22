import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import api from "../services/api";
import MainLayout from "../layouts/MainLayout";

export default function Correction() {
  const [question, setQuestion] = useState("");
  const [studentAnswer, setStudentAnswer] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  async function correctAnswer() {
    if (!question || !studentAnswer) {
      toast.error("Preencha a pergunta e a resposta do aluno");
      return;
    }
    setLoading(true);
    setResponse("");
    try {
      const prompt = `Você é um professor.\n\nCorrija a resposta abaixo.\n\nPergunta:\n${question}\n\nResposta do aluno:\n${studentAnswer}\n\nRetorne:\n- avaliação\n- pontos fortes\n- erros\n- sugestão de melhoria\n- nota de 0 a 10`;
      const res = await api.post("/generate", {
        email: localStorage.getItem("email"),
        prompt
      });
      setResponse(res.data.response);
      toast.success("Correção realizada!");
    } catch (error) {
      const msg = error.response?.data?.detail || "Erro ao corrigir atividade";
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
          <h1 className="text-3xl font-extrabold gradient-text">Correção IA</h1>
          <p className="text-slate-400 text-sm mt-1">Corrija atividades automaticamente</p>
        </div>

        <div className="glass rounded-2xl p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Pergunta</label>
            <textarea
              placeholder="Digite a pergunta da atividade..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="input-modern w-full h-24 bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 text-white placeholder-slate-500 resize-none outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Resposta do Aluno</label>
            <textarea
              placeholder="Cole a resposta do aluno..."
              value={studentAnswer}
              onChange={(e) => setStudentAnswer(e.target.value)}
              className="input-modern w-full h-32 bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 text-white placeholder-slate-500 resize-none outline-none"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={correctAnswer}
            disabled={loading || !question || !studentAnswer}
            className="btn-gradient w-full p-4 rounded-xl font-medium disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Corrigindo...
              </span>
            ) : "📚 Corrigir Resposta"}
          </motion.button>
        </div>

        {response && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 glass rounded-2xl p-6"
          >
            <h2 className="text-sm font-semibold text-emerald-400 mb-3 uppercase tracking-wider">Correção</h2>
            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{response}</p>
          </motion.div>
        )}
      </motion.div>
    </MainLayout>
  );
}
