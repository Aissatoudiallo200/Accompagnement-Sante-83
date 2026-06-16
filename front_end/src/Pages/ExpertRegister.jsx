import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, ChevronDown } from "lucide-react";
import "../styles/ExpertRegister.css";

export default function ExpertRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    service: "",
    password: "",
    confirmPassword: "",
    consent: false,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.removeItem("partner_token");
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.phone.trim()) {
      setError("Le numéro de téléphone est requis.");
      return;
    }

    if (!form.service) {
      setError("Veuillez sélectionner un service médical.");
      return;
    }

    if (!form.consent) {
      setError("Vous devez accepter la politique de confidentialité.");
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

    const payload = {
      nom_complet: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
      email: form.email.trim(),
      telephone: form.phone.trim(),
      service_medical: form.service,
      password: form.password,
    };

    setLoading(true);

    try {
      const res = await fetch("http://localhost:4000/api/auth/expert/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de l'inscription.");
        return;
      }

      navigate("/expert/login", {
        state: {
          success:
            "Votre demande a bien été envoyée. Un administrateur doit valider votre compte.",
        },
      });
    } catch (err) {
      setError("Impossible de joindre le serveur.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="expert-register-page">
      <Link className="expert-register-back" to="/">
        <ArrowLeft size={18} />
        Retour à l’accueil
      </Link>

      <section className="expert-register-shell">
        <section className="expert-register-card">
          <div className="expert-register-card-heading">
            <span>Patient partenaire</span>
            <h2>Créer un compte</h2>
            <p>
              Votre demande sera examinée par un administrateur avant activation
              de votre espace patient partenaire.
            </p>
          </div>

          {error && <div className="expert-register-error">{error}</div>}

          <form className="expert-register-form" onSubmit={handleSubmit}>
            <div className="expert-register-row">
              <div className="expert-register-field">
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

              <div className="expert-register-field">
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

            <div className="expert-register-field">
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

            <div className="expert-register-row">
              <div className="expert-register-field">
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

              <div className="expert-register-field">
                <label>Service médical</label>
                <div className="expert-register-select-wrap">
                  <select
                    name="service"
                    value={form.service}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Sélectionnez un service</option>
                    <option value="Cardiologie">Cardiologie</option>
                    <option value="Néphrologie">Néphrologie</option>
                    <option value="Oncologie">Oncologie</option>
                  </select>
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>

            <div className="expert-register-row">
              <div className="expert-register-field">
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

              <div className="expert-register-field">
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

            <label className="expert-register-consent">
              <input
                type="checkbox"
                name="consent"
                checked={form.consent}
                onChange={handleChange}
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
              className="expert-register-submit"
              disabled={loading || !form.consent}
            >
              {loading ? "Envoi en cours..." : "Envoyer ma demande"}
            </button>
          </form>

          <p className="expert-register-switch">
            Vous avez déjà un compte ?{" "}
            <Link to="/expert/login">Se connecter</Link>
          </p>
        </section>
      </section>
    </main>
  );
}
