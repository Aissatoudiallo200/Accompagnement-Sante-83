import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, MailCheck } from "lucide-react";
import "../styles/verifyCode.css";

export default function VerifyCode() {
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState(
    "Un code de vérification a été envoyé par email."
  );
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const canResend = useMemo(() => secondsLeft <= 0, [secondsLeft]);

  function handleChange(e) {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(digits);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (code.length !== 6) {
      setError("Veuillez saisir les 6 chiffres du code.");
      return;
    }

    const email = localStorage.getItem("pending_email");
    if (!email) {
      setError("Session expirée. Veuillez recommencer l’inscription.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:4000/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Code incorrect ou expiré.");
        setLoading(false);
        return;
      }

      localStorage.setItem("patient_token", data.token);
      localStorage.removeItem("pending_email");

      setLoading(false);
      navigate("/patient/dashboard");
    } catch (err) {
      setLoading(false);
      setError("Impossible de joindre le serveur.");
    }
  }

  async function handleResend() {
    if (!canResend) return;

    const email = localStorage.getItem("pending_email");
    if (!email) return;

    setError("");
    setInfo("Un nouveau code a été envoyé par email.");
    setSecondsLeft(60);

    await fetch("http://localhost:4000/api/auth/resend-email-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
  }

  return (
    <main className="verify-code-page">
      <Link className="verify-code-back" to="/patient/register">
        <ArrowLeft size={18} />
        Retour à l’inscription
      </Link>

      <section className="verify-code-shell">
        <section className="verify-code-card">
          <div className="verify-code-icon">
            <MailCheck size={28} />
          </div>

          <div className="verify-code-heading">
            <span>Vérification email</span>
            <h1>Entrez votre code</h1>
            <p>{info}</p>
          </div>

          {error && <div className="verify-code-error">{error}</div>}

          <form className="verify-code-form" onSubmit={handleSubmit}>
            <div className="verify-code-field">
              <label>Code de validation</label>
              <input
                className="verify-code-input"
                inputMode="numeric"
                autoComplete="one-time-code"
                type="text"
                placeholder="123456"
                value={code}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="verify-code-submit"
              disabled={code.length !== 6 || loading}
            >
              {loading ? "Vérification..." : "Valider le code"}
            </button>

            <button
              type="button"
              className="verify-code-secondary"
              onClick={handleResend}
              disabled={!canResend}
            >
              {canResend ? "Renvoyer le code" : `Renvoyer dans ${secondsLeft}s`}
            </button>
          </form>

          <p className="verify-code-switch">
            Adresse incorrecte ?{" "}
            <Link to="/patient/register">Revenir à l’inscription</Link>
          </p>
        </section>
      </section>
    </main>
  );
}
