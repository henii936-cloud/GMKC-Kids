import React from "react";
import { Loader2 } from "lucide-react";

// ─── Card ─────────────────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}
export const Card = ({ children, style }: CardProps) => (
  <div
    style={{
      backgroundColor: "#fff",
      borderRadius: "16px",
      padding: "16px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      ...style,
    }}
  >
    {children}
  </div>
);

// ─── Button ───────────────────────────────────────────────────────────────────
interface ButtonProps {
  onPress?: () => void;
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  style?: React.CSSProperties;
  textStyle?: React.CSSProperties;
}
export const Button = ({
  onPress,
  children,
  loading,
  disabled,
  variant = "primary",
  style,
  textStyle,
}: ButtonProps) => {
  const bgColor =
    variant === "primary"
      ? "#002c53"
      : variant === "secondary"
      ? "#f3f4f6"
      : variant === "danger"
      ? "#ef4444"
      : "transparent";

  const txtColor =
    variant === "primary"
      ? "#fff"
      : variant === "secondary"
      ? "#002c53"
      : variant === "danger"
      ? "#fff"
      : "#002c53";

  return (
    <button
      onClick={onPress}
      disabled={disabled || loading}
      style={{
        width: "100%",
        borderRadius: "12px",
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        border: "none",
        backgroundColor: bgColor,
        color: txtColor,
        fontSize: "15px",
        fontWeight: "700",
        letterSpacing: "0.3px",
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled || loading ? 0.6 : 1,
        transition: "opacity 0.2s ease",
        outline: "none",
        ...style,
      }}
    >
      {loading ? (
        <Loader2 className="animate-spin" size={18} color={txtColor} />
      ) : typeof children === "string" ? (
        <span style={{ color: txtColor, ...textStyle }}>{children}</span>
      ) : (
        children
      )}
    </button>
  );
};

// ─── Input ────────────────────────────────────────────────────────────────────
interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "phone-pad";
  multiline?: boolean;
  numberOfLines?: number;
  style?: React.CSSProperties;
  required?: boolean;
  editable?: boolean;
}
export const Input = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType = "default",
  multiline,
  numberOfLines,
  style,
  required,
  editable = true,
}: InputProps) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%", ...style }}>
    {label && (
      <label
        style={{
          fontSize: "11px",
          fontWeight: "700",
          textTransform: "uppercase",
          letterSpacing: "1px",
          color: "#6b7280",
        }}
      >
        {label}
        {required && <span style={{ color: "#ef4444" }}> *</span>}
      </label>
    )}
    {multiline ? (
      <textarea
        style={{
          backgroundColor: "#f3f4f6",
          borderRadius: "12px",
          padding: "12px 16px",
          fontSize: "15px",
          color: "#191c1d",
          border: "2px solid transparent",
          outline: "none",
          width: "100%",
          boxSizing: "border-box",
          fontFamily: "inherit",
          resize: "vertical",
          minHeight: numberOfLines ? `${numberOfLines * 24}px` : "80px",
        }}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChangeText(e.target.value)}
        disabled={!editable}
      />
    ) : (
      <input
        type={secureTextEntry ? "password" : keyboardType === "email-address" ? "email" : keyboardType === "phone-pad" ? "tel" : "text"}
        style={{
          backgroundColor: "#f3f4f6",
          borderRadius: "12px",
          padding: "12px 16px",
          fontSize: "15px",
          color: "#191c1d",
          border: "2px solid transparent",
          outline: "none",
          width: "100%",
          boxSizing: "border-box",
        }}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChangeText(e.target.value)}
        disabled={!editable}
      />
    )}
  </div>
);

// ─── Badge ────────────────────────────────────────────────────────────────────
interface BadgeProps {
  label: string;
  color?: "green" | "red" | "amber" | "blue" | "gray";
}
export const Badge = ({ label, color = "gray" }: BadgeProps) => {
  const colors: Record<string, { bg: string; text: string }> = {
    green: { bg: "#d1fae5", text: "#059669" },
    red: { bg: "#fee2e2", text: "#dc2626" },
    amber: { bg: "#fef3c7", text: "#d97706" },
    blue: { bg: "#dbeafe", text: "#2563eb" },
    gray: { bg: "#f3f4f6", text: "#6b7280" },
  };
  const c = colors[color] || colors.gray;
  return (
    <div
      style={{
        padding: "3px 8px",
        borderRadius: "20px",
        display: "inline-block",
        backgroundColor: c.bg,
      }}
    >
      <span
        style={{
          fontSize: "10px",
          fontWeight: "700",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          color: c.text,
        }}
      >
        {label}
      </span>
    </div>
  );
};

// ─── LoadingScreen ────────────────────────────────────────────────────────────
export const LoadingScreen = ({ message = "Loading..." }: { message?: string }) => (
  <div
    style={{
      flex: 1,
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f8f9fa",
      gap: "12px",
    }}
  >
    <Loader2 className="animate-spin" size={32} color="#002c53" />
    <span
      style={{
        fontSize: "13px",
        color: "#6b7280",
        fontWeight: "600",
        letterSpacing: "1px",
        textTransform: "uppercase",
      }}
    >
      {message}
    </span>
  </div>
);

// ─── EmptyState ───────────────────────────────────────────────────────────────
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
}
export const EmptyState = ({ icon, title, subtitle }: EmptyStateProps) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "48px 16px",
      gap: "8px",
    }}
  >
    {icon}
    <span style={{ fontSize: "16px", fontWeight: "700", color: "#6b7280" }}>{title}</span>
    {subtitle && (
      <span style={{ fontSize: "13px", color: "#9ca3af", textAlign: "center" }}>{subtitle}</span>
    )}
  </div>
);

// ─── Toast ────────────────────────────────────────────────────────────────────
interface ToastProps {
  message: string;
  type?: "success" | "error";
}
export const Toast = ({ message, type = "success" }: ToastProps) => (
  <div
    style={{
      position: "fixed",
      top: "60px",
      left: "20px",
      right: "20px",
      maxWidth: "480px",
      margin: "0 auto",
      borderRadius: "12px",
      padding: "14px",
      zIndex: 9999,
      boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
      backgroundColor: type === "success" ? "#059669" : "#dc2626",
      color: "#fff",
      fontWeight: "700",
      fontSize: "14px",
      textAlign: "center",
    }}
  >
    {message}
  </div>
);
