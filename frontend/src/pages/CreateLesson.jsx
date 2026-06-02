import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import api from "../services/api";
import MainLayout from "../layouts/MainLayout";

const grades = [
  { value: "1º Ano", label: "1º Ano (EF)" },
  { value: "2º Ano", label: "2º Ano (EF)" },
  { value: "3º Ano", label: "3º Ano (EF)" },
  { value: "4º Ano", label: "4º Ano (EF)" },
  { value: "5º Ano", label: "5º Ano (EF)" },
  { value: "6º Ano", label: "6º Ano (EF)" },
  { value: "7º Ano", label: "7º Ano (EF)" },
  { value: "8º Ano", label: "8º Ano (EF)" },
  { value: "9º Ano", label: "9º Ano (EF)" },
  { value: "1ª Série", label: "1ª Série (EM)" },
  { value: "2ª Série", label: "2ª Série (EM)" },
  { value: "3ª Série", label: "3ª Série (EM)" },
];

const subjects = [
  "Matemática",
  "Português",
  "História",
  "Geografia",
  "Biologia",
  "Física",
  "Química",
  "Inglês",
  "Filosofia",
  "Sociologia",
  "Artes",
  "Educação Física",
];

const bimesterOptions = ["1º Bimestre", "2º Bimestre", "3º Bimestre", "4º Bimestre"];
const hourOptions = [1, 2, 3, 4];

export default function CreateLesson() {
  const [grade, setGrade] = useState(grades[0].value);
  const [subject, setSubject] = useState(subjects[0]);
  const [bimester, setBimester] = useState(bimesterOptions[0]);
  const [topic, setTopic] = useState("");
  const [hours, setHours] = useState(1);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    if (!topic.trim()) {
      toast.error("Digite o assunto da matéria");
      return;
    }
    setLoading(true);
    setResponse("");
    try {
      const res = await api.post("/generate-lesson", {
        email: localStorage.getItem("email"),
        grade,
        subject,
        bimester,
        topic,
        hours,
      });
      setResponse(res.data.content);
      toast.success("Matéria criada com sucesso!");
    } catch (error) {
      const msg = error.response?.data?.detail || "Erro ao conectar com IA";
      setResponse(msg);
      toast.error(msg);
    }
    setLoading(false);
  }

  function selectStyle() {
    return "input-modern w-full bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 text-white outline-none cursor-pointer appearance-none";
  }

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold gradient-text">Criar Matéria</h1>
          <p className="text-slate-400 text-sm mt-1">
            Gere planos de aula completos com IA
          </p>
        </div>

        <div className="glass rounded-2xl p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Série</label>
              <select value={grade} onChange={(e) => setGrade(e.target.value)} className={selectStyle()}>
                {grades.map((g) => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Matéria</label>
              <select value={subject} onChange={(e) => setSubject(e.target.value)} className={selectStyle()}>
                {subjects.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Bimestre</label>
              <select value={bimester} onChange={(e) => setBimester(e.target.value)} className={selectStyle()}>
                {bimesterOptions.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Carga Horária</label>
              <select value={hours} onChange={(e) => setHours(Number(e.target.value))} className={selectStyle()}>
                {hourOptions.map((h) => (
                  <option key={h} value={h}>{h} hora{h > 1 ? "s" : ""}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Assunto</label>
            <input
              type="text"
              placeholder="Ex: Frações, Equações do 2º Grau, Revolução Francesa..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="input-modern w-full bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 text-white placeholder-slate-500 outline-none"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
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
            ) : "✨ Criar Matéria"}
          </motion.button>
        </div>

        {response && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 glass rounded-2xl p-6"
          >
            <h2 className="text-sm font-semibold text-indigo-400 mb-3 uppercase tracking-wider">
              Matéria Gerada
            </h2>
            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{response}</p>
          </motion.div>
        )}
      </motion.div>
    </MainLayout>
  );
}
