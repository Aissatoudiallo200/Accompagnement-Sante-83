import React from "react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, MessageCircle, Users, Video } from "lucide-react";
import API_URL from "../config/api";
import "../styles/Appointments.css";

export default function RequestAppointment() {
  const { partenaireId } = useParams();
  const navigate = useNavigate();

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [mode, setMode] = useState("presentiel");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const token = localStorage.getItem("patient_token");
    if (!token) {
      setError("Vous devez être connecté");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        partenaireId: Number(partenaireId),
        date,
        time,
        mode,
        message,
      };

      const res = await fetch(`${API_URL}/api/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de la demande de rendez-vous");
        return;
      }

      alert("Demande de rendez-vous envoyée avec succès !");
      navigate("/patient/dashboard");
    } catch (err) {
      console.error("ERREUR RDV:", err);
      setError("Impossible de joindre le serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="rdv-page">
      <Link className="rdv-back" to="/patient/dashboard">
        <ArrowLeft size={18} />
        Retour au dashboard
      </Link>

      <section className="rdv-shell">
        <section className="rdv-card">
          <div className="rdv-heading">
            <span>Demande de rendez-vous</span>
            <h1>Proposer un créneau</h1>
            <p>
              Choisissez une date, une heure et le mode d’échange souhaité. Le
              patient partenaire pourra ensuite accepter ou refuser votre demande.
            </p>
          </div>

          {error && <div className="rdv-error">{error}</div>}

          <form className="rdv-form" onSubmit={handleSubmit}>
            <div className="rdv-row">
              <div className="rdv-field">
                <label>
                  <Calendar size={17} />
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="rdv-field">
                <label>
                  <Clock size={17} />
                  Heure
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="rdv-field">
              <label>Mode de consultation</label>
              <div className="rdv-mode-group">
                <button
                  type="button"
                  className={`rdv-mode ${mode === "presentiel" ? "active" : ""}`}
                  onClick={() => setMode("presentiel")}
                >
                  <Users size={18} />
                  Présentiel
                </button>
                <button
                  type="button"
                  className={`rdv-mode ${mode === "visio" ? "active" : ""}`}
                  onClick={() => setMode("visio")}
                >
                  <Video size={18} />
                  Visio
                </button>
              </div>
            </div>

            <div className="rdv-field">
              <label>
                <MessageCircle size={17} />
                Message facultatif
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Expliquez brièvement votre besoin ou le sujet que vous aimeriez aborder."
                rows={4}
              />
            </div>

            <button className="rdv-submit" disabled={loading}>
              {loading ? "Envoi en cours..." : "Envoyer la demande"}
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}
