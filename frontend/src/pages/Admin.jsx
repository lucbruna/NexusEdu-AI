import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import api from "../services/api";
import MainLayout from "../layouts/MainLayout";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch (error) {
      const msg = error.response?.data?.detail || "Erro ao carregar usuários";
      toast.error(msg);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const planColors = {
    free: "bg-slate-700 text-slate-300",
    pro: "bg-gradient-to-r from-amber-500 to-rose-500 text-white",
  };

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold gradient-text">Painel Admin</h1>
            <p className="text-slate-400 text-sm mt-1">Gerencie os usuários da plataforma</p>
          </div>
          <span className="text-xs text-slate-500 bg-white/5 px-3 py-1.5 rounded-full">
            {users.length} usuário(s)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass rounded-2xl p-5 card-hover"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user.email}
                  </p>
                  <p className="text-xs text-slate-500">ID: #{user.id}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${planColors[user.plan] || planColors.free}`}>
                  {user.plan?.toUpperCase() || "FREE"}
                </span>
                <span className="text-xs text-slate-400">
                  {user.credits} créditos
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin h-8 w-8 border-2 border-indigo-400 border-t-transparent rounded-full mx-auto" />
          </div>
        ) : users.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-4xl mb-4">👑</p>
            <p className="text-slate-500">Nenhum usuário cadastrado</p>
          </motion.div>
        )}
      </motion.div>
    </MainLayout>
  );
}
