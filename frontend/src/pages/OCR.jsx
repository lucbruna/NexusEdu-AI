import { useState, useRef } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import api from "../services/api";
import MainLayout from "../layouts/MainLayout";

export default function OCR() {
  const [file, setFile] = useState(null);
  const [response, setResponse] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  async function sendImage() {
    if (!file) return;
    setLoading(true);
    setResponse("");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await api.post("/ocr", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setResponse(res.data.analysis);
      toast.success("Imagem processada com sucesso!");
    } catch (error) {
      const msg = error.response?.data?.detail || "Erro ao processar imagem";
      setResponse(msg);
      toast.error(msg);
    }
    setLoading(false);
  }

  function handleFile(e) {
    const f = e.target.files[0];
    setFile(f);
    if (f) {
      setImagePreview(URL.createObjectURL(f));
    }
  }

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold gradient-text">OCR IA</h1>
          <p className="text-slate-400 text-sm mt-1">Extraia texto de imagens automaticamente</p>
        </div>

        <div className="glass rounded-2xl p-8">
          <div
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-slate-700/50 rounded-2xl p-12 text-center cursor-pointer hover:border-purple-500/30 transition-all group"
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="hidden"
            />
            <p className="text-5xl mb-4 group-hover:scale-110 transition-transform inline-block">🖼️</p>
            <p className="text-slate-300 font-medium">
              {file ? file.name : "Clique para selecionar uma imagem"}
            </p>
            <p className="text-slate-500 text-sm mt-1">PNG, JPG, JPEG</p>
          </div>

          {imagePreview && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <img
                src={imagePreview}
                alt="Preview"
                className="max-h-64 rounded-xl mx-auto mb-4"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📎</span>
                  <div>
                    <p className="text-sm font-medium text-white">{file?.name}</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={sendImage}
                  disabled={loading}
                  className="btn-gradient px-6 py-3 rounded-xl text-sm font-medium disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Analisando...
                    </span>
                  ) : "🧠 Ler Imagem"}
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>

        {response && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 glass rounded-2xl p-6"
          >
            <h2 className="text-sm font-semibold text-purple-400 mb-3 uppercase tracking-wider">Análise da IA</h2>
            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{response}</p>
          </motion.div>
        )}
      </motion.div>
    </MainLayout>
  );
}
