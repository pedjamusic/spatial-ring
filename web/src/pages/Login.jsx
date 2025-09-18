import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { setToken } from "../lib/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/admin";

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Login failed");
      }
      const data = await res.json();
      setToken(data.token);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div
      style={{
        maxWidth: 360,
        margin: "10vh auto",
        padding: 24,
        border: "1px solid #eee",
        borderRadius: 8,
      }}
    >
      <h1 style={{ marginTop: 0, fontSize: 20 }}>Admin Login</h1>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label>
          <div>Email</div>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            style={{ width: "100%" }}
          />
        </label>
        <label>
          <div>Password</div>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            style={{ width: "100%" }}
          />
        </label>
        {error && <div style={{ color: "crimson" }}>{error}</div>}
        <button type="submit">Sign in</button>
      </form>
    </div>
  );
}
