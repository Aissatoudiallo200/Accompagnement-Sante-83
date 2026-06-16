import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Handshake, ShieldCheck } from "lucide-react";
import "../styles/ExpertLogin.css";

export default function ExpertLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:4000/api/auth/expert/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur de connexion");
        return;
      }

      localStorage.setItem("partner_token", data.token);
      navigate("/expert/dashboard", { replace: true });
    } catch (err) {
      setError("Impossible de joindre le serveur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="expert-login-page">
      <Link className="expert-login-back" to="/">
        <ArrowLeft size={18} />
        Retour à l’accueil
      </Link>

      <section className="expert-login-shell">
        <aside className="expert-login-intro">
          <div className="expert-login-brand">
            <span className="expert-login-logo">
              <Heart size={24} fill="currentColor" />
            </span>
            <div>
              <strong>Accompagnement Santé 83</strong>
              <span>Entraide santé</span>
            </div>
          </div>

          <div className="expert-login-copy">
            <span className="expert-login-pill">Patient partenaire</span>
            <h1>Accompagnez d’autres patients avec confiance.</h1>
            <p>
              Connectez-vous pour consulter vos demandes, suivre vos rendez-vous
              et partager votre expérience au sein de la communauté.
            </p>
          </div>

          <div className="expert-login-benefits">
            <div>
              <Handshake size={20} />
              <span>Accompagnement humain</span>
            </div>
            <div>
              <ShieldCheck size={20} />
              <span>Espace sécurisé</span>
            </div>
          </div>
        </aside>

        <section className="expert-login-card">
          <div className="expert-login-card-heading">
            <span>Connexion</span>
            <h2>Bienvenue</h2>
            <p>Accédez à votre espace patient partenaire.</p>
          </div>

          {location.state?.success && (
            <div className="expert-login-success">{location.state.success}</div>
          )}

          {error && <div className="expert-login-error">{error}</div>}

          <form className="expert-login-form" onSubmit={handleSubmit}>
            <div className="expert-login-field">
              <label>Email</label>
              <input
                type="email"
                placeholder="exemple@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="expert-login-field">
              <label>Mot de passe</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button className="expert-login-submit" disabled={loading}>
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <p className="expert-login-switch">
            Pas encore patient partenaire ?{" "}
            <Link to="/expert/register">Créer un compte</Link>
          </p>
        </section>
      </section>
    </main>
  );
}
