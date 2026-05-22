import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import api from "../services/api";
import MainLayout from "../layouts/MainLayout";

export default function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await api.get(`/chat-history/${localStorage.getItem("email")}`);
        const history = res.data.map((m) => [
          { role: "user", content: m.message },
          { role: "assistant", content: m.response },
        ]).flat();
        setMessages(history);
      } catch {}
    }
    loadHistory();
  }, []);

  async function sendMessage() {
    if (!message) return;

    const userMessage = { role: "user", content: message };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await api.post("/chat", {
        email: localStorage.getItem("email"),
        message: message
      });

      const fullText = res.data.response;
      let currentText = "";

      const aiMessage = { role: "assistant", content: "" };
      setMessages((prev) => [...prev, aiMessage]);

      for (let i = 0; i < fullText.length; i++) {
        currentText += fullText[i];
        await new Promise((resolve) => setTimeout(resolve, 8));
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: currentText };
          return updated;
        });
      }
    } catch (error) {
      const msg = error.response?.data?.detail || "Erro ao enviar mensagem";
      toast.error(msg);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Desculpe, ocorreu um erro. Tente novamente." }
      ]);
    }

    setMessage("");
    setLoading(false);
  }

  return (
    <MainLayout>
      <div className="flex flex-col h-[85vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-extrabold gradient-text">Chat IA</h1>
          <p className="text-slate-400 text-sm mt-1">Converse com o assistente educacional</p>
        </motion.div>

        <div className="flex-1 glass rounded-2xl p-6 mb-4 overflow-y-auto">
          <div className="flex flex-col gap-4">
            <AnimatePresence>
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`p-4 rounded-2xl max-w-[80%] whitespace-pre-wrap relative group ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 self-end border border-indigo-500/10"
                      : "glass-light self-start"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-slate-500 font-medium">
                      {msg.role === "user" ? "Você" : "IA Assistente"}
                    </p>
                    {msg.role === "assistant" && msg.content && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(msg.content);
                          toast.success("Copiado!");
                        }}
                        className="text-xs text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                      >
                        📋 Copiar
                      </button>
                    )}
                  </div>
                  <p className="text-slate-200 leading-relaxed">{msg.content}</p>
                </motion.div>
              ))}
            </AnimatePresence>

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-light self-start p-4 rounded-2xl"
              >
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </motion.div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3"
        >
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Digite sua pergunta..."
            className="input-modern flex-1 glass rounded-xl p-4 text-white placeholder-slate-500 outline-none"
          />
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={sendMessage}
            disabled={loading || !message}
            className="btn-gradient px-8 rounded-xl font-medium disabled:opacity-50"
          >
            Enviar
          </motion.button>
        </motion.div>
      </div>
    </MainLayout>
  );
}
