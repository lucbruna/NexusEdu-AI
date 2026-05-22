import { useState } from "react";
import { motion } from "framer-motion";
import api from "../services/api";
import MainLayout from "../layouts/MainLayout";

export default function Upgrade() {
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(false);

  async function createPayment() {
    setLoading(true);
    try {
      const res = await api.post("/create-payment", {
        email: localStorage.getItem("email")
      });
      console.log("Resposta completa:", res.data);
      setPayment(res.data);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  }

  const benefits = [
    "🤖 IA ilimitada sem restrições",
    "🧠 OCR avançado com alta precisão",
    "📄 Upload de PDFs e DOCX",
    "⚡ Prioridade máxima no processamento",
    "💎 Suporte premium prioritário"
  ];

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold gradient-text">Upgrade PRO</h1>
          <p className="text-slate-400 mt-2">Desbloqueie todo o potencial do NexusEdu AI</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-3xl p-8 card-hover relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/20 to-rose-500/20 rounded-bl-full" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">💎</span>
                <div>
                  <h2 className="text-2xl font-bold text-white">Plano PRO</h2>
                  <p className="text-slate-400 text-sm">Acesso completo e ilimitado</p>
                </div>
              </div>

              <p className="text-4xl font-extrabold text-white mb-6">
                R$ 29,90
                <span className="text-lg text-slate-400 font-normal">/mês</span>
              </p>

              <ul className="space-y-4 mb-8">
                {benefits.map((benefit, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-center gap-3 text-slate-300"
                  >
                    <span className="text-lg">{benefit}</span>
                  </motion.li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={createPayment}
                disabled={loading}
                className="btn-gradient w-full p-4 rounded-xl font-semibold text-white text-lg disabled:opacity-50"
              >
                {loading ? "Gerando PIX..." : "💳 Assinar Agora"}
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-3xl p-8"
          >
            {!payment ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-6xl mb-6">🔒</p>
                <h3 className="text-xl font-semibold text-white mb-3">Pagamento Seguro</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Após clicar em "Assinar Agora", você receberá um QR Code PIX para realizar o pagamento de forma rápida e segura.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <p className="text-sm text-emerald-400 font-medium mb-4">✅ Escaneie o QR Code para pagar</p>
                <img
                  src={`data:image/png;base64,${payment.qr_code_base64}`}
                  alt="PIX QR Code"
                  className="w-64 h-64 rounded-2xl bg-white p-2"
                />
                <div className="w-full mt-4">
                  <label className="block text-xs text-slate-400 mb-2">Código PIX (copiar e colar)</label>
                  <textarea
                    value={payment.qr_code}
                    readOnly
                    className="w-full h-20 glass rounded-xl p-3 text-xs text-slate-300 resize-none outline-none"
                    onClick={(e) => {
                      e.target.select();
                      navigator.clipboard?.writeText(payment.qr_code);
                    }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </MainLayout>
  );
}
