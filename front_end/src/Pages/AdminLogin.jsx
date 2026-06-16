import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, ShieldCheck } from "lucide-react";
import API_URL from "../config/api";
import "../styles/AdminLogin.css";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur de connexion admin");
        return;
      }

      localStorage.setItem("admin_token", data.token);
      navigate("/admin/dashboard", { replace: true });
    } catch {
      setError("Impossible de joindre le serveur.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-login-page">
      <Link className="admin-login-back" to="/">
        <ArrowLeft size={18} />
        Retour à l’accueil
      </Link>

      <section className="admin-login-shell">
        <section className="admin-login-card">
          <div className="admin-login-logo">
            <Heart size={24} fill="currentColor" />
          </div>

          <div className="admin-login-heading">
            <span>Administration</span>
            <h1>Connexion admin</h1>
            <p>Accédez à l’espace de validation des patients partenaires.</p>
          </div>

          {error && <div className="admin-login-error">{error}</div>}

          <form className="admin-login-form" onSubmit={handleSubmit}>
            <div className="admin-login-field">
              <label>Email</label>
              <input type="email" placeholder="admin@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="admin-login-field">
              <label>Mot de passe</label>
              <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            <button className="admin-login-submit" disabled={loading}>
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <div className="admin-login-note">
            <ShieldCheck size={18} />
            <span>Accès réservé aux administrateurs globaux.</span>
          </div>
        </section>
      </section>
    </main>
  );
}
