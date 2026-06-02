import { Toaster } from "react-hot-toast";
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Admin from "./pages/Admin";
import OCR from "./pages/OCR";
import Exams from "./pages/Exams";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import ProtectedRoute from "./components/ProtectedRoute";
import Correction from "./pages/Correction";
import Upload from "./pages/Upload";
import Chat from "./pages/Chat";
import Upgrade from "./pages/Upgrade";
import CreateLesson from "./pages/CreateLesson";

function App() {

  return (

    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "rgba(15, 23, 42, 0.95)",
            color: "#fff",
            border: "1px solid rgba(99, 102, 241, 0.2)",
            backdropFilter: "blur(12px)",
          },
          success: { iconTheme: { primary: "#34d399", secondary: "#fff" } },
          error: { iconTheme: { primary: "#f87171", secondary: "#fff" } },
        }}
      />
      <Routes>

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />
        <Route
          path="/exams"
          element={
            <ProtectedRoute>
              <Exams />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <Upload />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ocr"
          element={
            <ProtectedRoute>
              <OCR />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upgrade"
          element={
            <ProtectedRoute>
              <Upgrade />
            </ProtectedRoute>
          }
        />
        <Route
          path="/correction"
          element={
            <ProtectedRoute>
              <Correction />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-lesson"
          element={
            <ProtectedRoute>
              <CreateLesson />
            </ProtectedRoute>
          }
        />
      </Routes>

    </BrowserRouter>
  );
}

export default App;