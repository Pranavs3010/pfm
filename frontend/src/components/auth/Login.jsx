import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Eye, EyeOff, LogIn } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login({ email, password });

    if (result.success) {
      navigate("/dashboard");
    }

    setIsLoading(false);
  };

  // Inline styles as fallback
  const styles = {
    container: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem 1rem",
      backgroundColor: "#f9fafb",
    },
    card: {
      maxWidth: "28rem",
      width: "100%",
      padding: "2rem",
      backgroundColor: "white",
      borderRadius: "0.5rem",
      boxShadow:
        "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    },
    logo: {
      margin: "0 auto",
      height: "3rem",
      width: "3rem",
      backgroundColor: "#2563eb",
      borderRadius: "0.5rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
    },
    title: {
      marginTop: "1.5rem",
      textAlign: "center",
      fontSize: "1.875rem",
      fontWeight: "800",
      color: "#1f2937",
    },
    subtitle: {
      marginTop: "0.5rem",
      textAlign: "center",
      fontSize: "0.875rem",
      color: "#6b7280",
    },
    link: {
      color: "#2563eb",
      fontWeight: "500",
    },
    error: {
      backgroundColor: "#fef2f2",
      padding: "1rem",
      borderRadius: "0.375rem",
      color: "#dc2626",
      fontSize: "0.875rem",
    },
    label: {
      display: "block",
      fontSize: "0.875rem",
      fontWeight: "500",
      color: "#374151",
      marginBottom: "0.5rem",
    },
    input: {
      width: "100%",
      padding: "0.5rem 0.75rem",
      border: "1px solid #d1d5db",
      borderRadius: "0.5rem",
      boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      outline: "none",
    },
    inputFocus: {
      borderColor: "#3b82f6",
      ring: "2px solid #3b82f6",
    },
    button: {
      width: "100%",
      display: "flex",
      justifyContent: "center",
      padding: "0.75rem 1rem",
      border: "1px solid transparent",
      borderRadius: "0.5rem",
      fontSize: "0.875rem",
      fontWeight: "500",
      backgroundColor: "#2563eb",
      color: "white",
      cursor: "pointer",
    },
    buttonHover: {
      backgroundColor: "#1d4ed8",
    },
    buttonDisabled: {
      opacity: "0.5",
      cursor: "not-allowed",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div>
          <div style={styles.logo}>
            <LogIn style={{ height: "1.5rem", width: "1.5rem" }} />
          </div>
          <h2 style={styles.title}>Sign in to your account</h2>
          <p style={styles.subtitle}>
            Or{" "}
            <Link to="/register" style={styles.link}>
              create a new account
            </Link>
          </p>
        </div>

        <form style={{ marginTop: "2rem" }} onSubmit={handleSubmit}>
          {error && <div style={styles.error}>{error}</div>}

          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="email" style={styles.label}>
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="Enter your email"
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label htmlFor="password" style={styles.label}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ ...styles.input, paddingRight: "2.5rem" }}
                placeholder="Enter your password"
              />
              <button
                type="button"
                style={{
                  position: "absolute",
                  right: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff
                    style={{
                      height: "1.25rem",
                      width: "1.25rem",
                      color: "#9ca3af",
                    }}
                  />
                ) : (
                  <Eye
                    style={{
                      height: "1.25rem",
                      width: "1.25rem",
                      color: "#9ca3af",
                    }}
                  />
                )}
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                ...styles.button,
                ...(isLoading ? styles.buttonDisabled : {}),
              }}
              onMouseOver={(e) =>
                !isLoading &&
                (e.target.style.backgroundColor =
                  styles.buttonHover.backgroundColor)
              }
              onMouseOut={(e) =>
                !isLoading &&
                (e.target.style.backgroundColor = styles.button.backgroundColor)
              }
            >
              {isLoading ? (
                <div
                  style={{
                    animation: "spin 1s linear infinite",
                    borderRadius: "50%",
                    height: "1.5rem",
                    width: "1.5rem",
                    border: "2px solid transparent",
                    borderTopColor: "white",
                  }}
                ></div>
              ) : (
                "Sign in"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
/*
  This commit is done from Akmain branch
*/