import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "../styles/PatientRegister.css";

export default function PatientRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.removeItem("patient_token");
    localStorage.removeItem("patient_code");
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.phone.trim()) {
      setError("Le numéro de téléphone est requis.");
      return;
    }

    if (form.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (!consent) {
      setError("Vous devez accepter la politique de confidentialité.");
      return;
    }

    const payload = {
      nom_complet: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
      email: form.email.trim(),
      telephone: form.phone.trim(),
      password: form.password,
    };

    setLoading(true);

    try {
      const res = await fetch("http://localhost:4000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de l'inscription.");
        return;
      }

      localStorage.setItem("pending_user_id", data.userId);
      localStorage.setItem("pending_phone", payload.telephone);
      localStorage.setItem("pending_email", payload.email);
      navigate("/patient/verify-code");
    } catch (err) {
      setError("Impossible de joindre le serveur.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="patient-register-page">
      <Link className="patient-register-back" to="/">
        <ArrowLeft size={18} />
        Retour à l’accueil
      </Link>

      <section className="patient-register-shell">
        <section className="patient-register-card">
          <div className="patient-register-card-heading">
            <span>Inscription</span>
            <h2>Créer un compte</h2>
            <p>
              Un code de vérification par email vous sera envoyé pour confirmer
              votre inscription.
            </p>
          </div>

          {error && <div className="patient-register-error">{error}</div>}

          <form className="patient-register-form" onSubmit={handleSubmit}>
            <div className="patient-register-row">
              <div className="patient-register-field">
                <label>Prénom</label>
                <input
                  type="text"
                  name="firstName"
                  placeholder="Ex : Sarah"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="patient-register-field">
                <label>Nom</label>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Ex : Martin"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="patient-register-field">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="exemple@mail.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="patient-register-field">
              <label>Numéro de téléphone</label>
              <input
                type="tel"
                name="phone"
                placeholder="Ex : 06 12 34 56 78"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="patient-register-row">
              <div className="patient-register-field">
                <label>Mot de passe</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Minimum 8 caractères"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="patient-register-field">
                <label>Confirmer le mot de passe</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Répétez le mot de passe"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <label className="patient-register-consent">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                required
              />
              <span>
                J’accepte la{" "}
                <Link to="/politique-confidentialite" target="_blank">
                  politique de confidentialité
                </Link>{" "}
                et le traitement de mes données personnelles.
              </span>
            </label>

            <button
              type="submit"
              className="patient-register-submit"
              disabled={loading || !consent}
            >
              {loading ? "Création en cours..." : "Créer mon compte"}
            </button>
          </form>

          <p className="patient-register-switch">
            Vous avez déjà un compte ?{" "}
            <Link to="/patient/login">Se connecter</Link>
          </p>
        </section>
      </section>
    </main>
  );
}
