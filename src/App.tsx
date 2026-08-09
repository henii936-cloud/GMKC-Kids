import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import KidsLayout from "./components/KidsLayout";
import Login from "./pages/Login";
import KidsAttendance from "./pages/KidsAttendance";
import { Loader2 } from "lucide-react";

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8f9fa",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <Loader2 className="animate-spin" size={32} color="#059669" />
        <span style={{ fontSize: "13px", color: "#6b7280", fontWeight: "600", letterSpacing: "1.5px" }}>
          LOADING KIDS PORTAL...
        </span>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<KidsLayout />}>
        <Route path="/" element={<KidsAttendance />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
