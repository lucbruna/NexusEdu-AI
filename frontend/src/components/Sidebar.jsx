import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";

const menuItems = [
  { path: "/dashboard", label: "Dashboard", icon: "📊" },
  { path: "/chat", label: "Chat IA", icon: "🤖" },
  { path: "/exams", label: "Gerar Provas", icon: "📝" },
  { path: "/correction", label: "Correção IA", icon: "📚" },
  { path: "/upload", label: "Upload IA", icon: "📄" },
  { path: "/ocr", label: "OCR IA", icon: "🧠" },
  { path: "/history", label: "Histórico", icon: "📜" },
  { path: "/admin", label: "Painel Admin", icon: "👑" },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);

  async function loadProfile() {
    try {
      const email = localStorage.getItem("email");
      const res = await api.get(`/profile/${email}`);
      setProfile(res.data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    navigate("/");
  }

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: mobileOpen ? 0 : -300 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed top-0 left-0 h-screen w-72 glass border-r border-indigo-500/10 p-6 flex flex-col z-50 lg:translate-x-0"
      >
      <div className="flex items-center justify-between mb-6 lg:hidden">
        <h2 className="text-lg font-bold gradient-text">Menu</h2>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-slate-400">✕</button>
      </div>
      <div className="flex flex-col flex-1">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-10"
        >
          <h1
            className="text-3xl font-extrabold gradient-text cursor-pointer"
            onClick={() => navigate("/dashboard")}
          >
            NexusEdu AI
          </h1>
          <p className="text-xs text-slate-500 mt-1">Plataforma Educacional Inteligente</p>
        </motion.div>

        <AnimatePresence>
          {profile && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-light rounded-2xl p-4 mb-8 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    {profile.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {profile.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400">Plano</span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    profile.plan === "pro"
                      ? "bg-gradient-to-r from-amber-500 to-rose-500 text-white"
                      : "bg-slate-700 text-slate-300"
                  }`}>
                    {profile.plan.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Créditos</span>
                  <span className="text-sm font-bold text-emerald-400">
                    {profile.credits}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <nav className="flex flex-col gap-2 flex-1">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <motion.button
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                onClick={() => navigate(item.path)}
                className={`relative flex items-center gap-3 p-3.5 rounded-xl text-left transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white border border-indigo-500/20"
                    : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-gradient-to-b from-indigo-500 to-purple-500"
                  />
                )}
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </motion.button>
            );
          })}
        </nav>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          onClick={() => navigate("/upgrade")}
          className="relative overflow-hidden group mb-3 bg-gradient-to-r from-amber-500/10 to-rose-500/10 border border-amber-500/20 rounded-xl p-3.5 text-left"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10 flex items-center gap-3">
            <span className="text-lg">💎</span>
            <div>
              <p className="text-sm font-semibold text-amber-400">Upgrade PRO</p>
              <p className="text-xs text-slate-500">Recursos ilimitados</p>
            </div>
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          onClick={logout}
          className="flex items-center gap-3 p-3.5 rounded-xl text-left text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 border border-transparent hover:border-red-500/20"
        >
          <span className="text-lg">🚪</span>
          <span className="text-sm font-medium">Sair</span>
        </motion.button>
      </div>
    </motion.aside>
    </>
  );
}
