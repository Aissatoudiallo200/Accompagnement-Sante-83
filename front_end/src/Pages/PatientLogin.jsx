import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ShieldCheck, Users, ArrowLeft } from "lucide-react";
import "../styles/PatientLogin.css";

export default function PatientLogin() {
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
      const res = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Connexion impossible");
        return;
      }

      localStorage.setItem("patient_token", data.token);
      navigate("/patient/dashboard");
    } catch (err) {
      setError("Impossible de joindre le serveur (backend éteint ?)");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="patient-login-page">
      <Link className="patient-login-back" to="/">
        <ArrowLeft size={18} />
        Retour à l’accueil
      </Link>

      <section className="patient-login-shell">
        <aside className="patient-login-intro">
          <div className="patient-login-brand">
            <span className="patient-login-logo">
              <Heart size={24} fill="currentColor" />
            </span>
            <div>
              <strong>Accompagnement Santé 83</strong>
              <span>Entraide santé</span>
            </div>
          </div>

          <div className="patient-login-copy">
            <span className="patient-login-pill">Espace patient</span>
            <h1>Retrouvez votre accompagnement en toute sérénité.</h1>
            <p>
              Connectez-vous pour accéder à vos rendez-vous, vos ressources
              et aux patients partenaires qui vous accompagnent.
            </p>
          </div>

          <div className="patient-login-benefits">
            <div>
              <ShieldCheck size={20} />
              <span>Données protégées</span>
            </div>
            <div>
              <Users size={20} />
              <span>Communauté bienveillante</span>
            </div>
          </div>
        </aside>

        <section className="patient-login-card">
          <div className="patient-login-card-heading">
            <span>Connexion</span>
            <h2>Bienvenue</h2>
            <p>Accédez à votre espace personnel patient.</p>
          </div>

          {error && <div className="patient-login-error">{error}</div>}

          <form className="patient-login-form" onSubmit={handleSubmit}>
            <div className="patient-login-field">
              <label>Email</label>
              <input
                type="email"
                placeholder="exemple@mail.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="patient-login-field">
              <label>Mot de passe</label>
              <input
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="patient-login-submit" disabled={loading}>
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <p className="patient-login-switch">
            Vous n’avez pas de compte ?{" "}
            <Link to="/patient/register">Créer un compte</Link>
          </p>
        </section>
      </section>
    </main>
  );
}
