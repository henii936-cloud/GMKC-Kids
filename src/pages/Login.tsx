import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Button, Input } from "../components/UI";
import { Baby } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setErrorMsg("");

    try {
      await login(email.trim(), password);
    } catch (err: any) {
      setErrorMsg(err.message ?? "Login failed. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#059669", // Emerald Kids theme
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ width: "100%", maxWidth: "380px" }}>
        {/* Logo Section */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "24px",
              backgroundColor: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
            }}
          >
            <Baby size={40} color="#fff" />
          </div>
          <span style={{ fontSize: "28px", fontWeight: "800", color: "#fff", letterSpacing: "0.5px", display: "block" }}>
            GMCK Kids
          </span>
          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)", marginTop: "4px", fontWeight: "600", display: "block" }}>
            Sunday School & Kids Ministry Portal
          </span>
        </div>

        {/* Card */}
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "24px",
            padding: "24px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
            boxSizing: "border-box",
          }}
        >
          <span style={{ display: "block", fontSize: "22px", fontWeight: "800", color: "#065f46", marginBottom: "4px" }}>
            Sign In
          </span>
          <span style={{ display: "block", fontSize: "13px", color: "#6b7280", marginBottom: "24px" }}>
            Sign in to manage kids class attendance
          </span>

          {errorMsg && (
            <div
              style={{
                backgroundColor: "#fef2f2",
                border: "1px solid #fca5a5",
                borderRadius: "12px",
                padding: "12px",
                fontSize: "13px",
                color: "#b91c1c",
                marginBottom: "16px",
                fontWeight: "600",
              }}
            >
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Input
              label="Email"
              placeholder="kids@gmckchurch.org"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              required
            />
            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              required
            />
            <Button onPress={() => {}} loading={loading} style={{ marginTop: "8px", backgroundColor: "#059669" }}>
              {loading ? "Signing in..." : "Sign In to Kids Portal"}
            </Button>
          </form>
        </div>

        <span style={{ display: "block", textAlign: "center", color: "rgba(255,255,255,0.6)", fontSize: "12px", marginTop: "24px" }}>
          Authorized Kids Ministry Leaders only.
        </span>
      </div>
    </div>
  );
}
