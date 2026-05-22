import Sidebar from "../components/Sidebar";
import { motion } from "framer-motion";

export default function MainLayout({ children }) {
  return (
    <div className="flex min-h-screen gradient-bg text-white">
      <Sidebar />
      <motion.main
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="flex-1 p-8 overflow-auto ml-72"
      >
        {children}
      </motion.main>
    </div>
  );
}
