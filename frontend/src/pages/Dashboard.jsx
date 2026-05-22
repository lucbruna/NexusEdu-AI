import { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import api from "../services/api";
import MainLayout from "../layouts/MainLayout";

const quickActions = [
  { label: "Gerar Prova", icon: "📝", path: "/exams", color: "from-blue-500 to-cyan-500" },
  { label: "Chat IA", icon: "🤖", path: "/chat", color: "from-purple-500 to-pink-500" },
  { label: "Upload Arquivo", icon: "📄", path: "/upload", color: "from-emerald-500 to-teal-500" },
  { label: "OCR Imagem", icon: "🧠", path: "/ocr", color: "from-orange-500 to-rose-500" },
];

export default function Dashboard() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  async function loadProfile() {
    setProfileLoading(true);
    try {
      const email = localStorage.getItem("email");
      if (!email) return;
      const res = await api.get(`/profile/${email}`);
      setProfile(res.data);
    } catch {
      toast.error("Erro ao carregar perfil");
    }
    setProfileLoading(false);
  }

  useEffect(() => {
    loadProfile();
  }, []);

  async function generateLesson() {
    if (!prompt) {
      toast.error("Digite um tema para a aula");
      return;
    }
    setLoading(true);
    setResponse("");
    try {
      const res = await api.post("/generate", {
        email: localStorage.getItem("email"),
        prompt,
      });
      setResponse(res.data.response);
      if (res.data.credits !== undefined) {
        setProfile((prev) => prev ? { ...prev, credits: res.data.credits } : prev);
      }
      toast.success("Aula gerada com sucesso!");
    } catch (error) {
      const msg = error.response?.data?.detail || "Erro ao conectar com IA";
      setResponse(msg);
      toast.error(msg);
    }
    setLoading(false);
  }

  function exportPDF() {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("NexusEdu AI - Plano de Aula", 10, 20);
    doc.setFontSize(12);
    const lines = doc.splitTextToSize(response, 180);
    doc.text(lines, 10, 40);
    doc.save("plano_de_aula.pdf");
    toast.success("PDF exportado!");
  }

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-extrabold gradient-text">
              Dashboard
            </h1>
            <p className="text-slate-400 mt-1">Bem-vindo ao NexusEdu AI</p>
          </div>
          {profileLoading ? (
            <div className="glass-light rounded-2xl px-5 py-3">
              <div className="animate-pulse flex gap-4">
                <div className="h-8 w-16 bg-slate-700 rounded" />
                <div className="h-8 w-16 bg-slate-700 rounded" />
              </div>
            </div>
          ) : profile && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="glass-light rounded-2xl px-5 py-3 flex items-center gap-4"
            >
              <div className="text-right">
                <p className="text-xs text-slate-400">Créditos</p>
                <p className="text-lg font-bold text-emerald-400">{profile.credits}</p>
              </div>
              <div className="w-px h-8 bg-slate-700" />
              <div className="text-right">
                <p className="text-xs text-slate-400">Plano</p>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  profile.plan === "pro"
                    ? "bg-gradient-to-r from-amber-500 to-rose-500 text-white"
                    : "bg-slate-700 text-slate-300"
                }`}>
                  {profile.plan.toUpperCase()}
                </span>
              </div>
            </motion.div>
          )}
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          {quickActions.map((action, index) => (
            <motion.a
              key={action.label}
              href={action.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.4 }}
              className="card-hover glass-light rounded-2xl p-5 cursor-pointer group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-2xl mb-3`}>
                {action.icon}
              </div>
              <p className="text-sm font-medium text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-purple-400 transition-all">
                {action.label}
              </p>
            </motion.a>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-2xl p-6 mb-6"
        >
          <label className="block text-sm font-medium text-slate-300 mb-3">
            Digite o tema da aula
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: Uma aula sobre fotossíntese para o 5º ano..."
            className="input-modern w-full h-36 bg-slate-900/50 border border-slate-700/50 rounded-xl p-5 text-white placeholder-slate-500 resize-none focus:outline-none"
          />
          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-slate-500">{prompt.length} caracteres</p>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={exportPDF}
                disabled={!response}
                className="px-6 py-3 rounded-xl font-medium text-sm border border-slate-700 text-slate-300 hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                📥 Exportar PDF
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={generateLesson}
                disabled={loading || !prompt}
                className="btn-gradient px-6 py-3 rounded-xl font-medium text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Gerando...
                  </span>
                ) : "🎯 Gerar Aula"}
              </motion.button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: response ? 1 : 0, y: response ? 0 : 20 }}
          transition={{ duration: 0.5 }}
          className="glass rounded-2xl p-6 min-h-[200px]"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Resposta da IA</h2>
            {response && (
              <span className="text-xs text-emerald-400">✓ Gerado com sucesso</span>
            )}
          </div>
          <div className="prose prose-invert max-w-none">
            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
              {response || (
                <span className="text-slate-500 italic">
                  A resposta da IA aparecerá aqui após gerar uma aula.
                </span>
              )}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </MainLayout>
  );
}
