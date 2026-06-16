import React, { useEffect } from 'react';
import '../styles/Contact.css';

const Contact = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="contact-container">
      <div className="contact-card">
        <h1 className="contact-title">Contactez l'Équipe</h1>
        <p className="contact-subtitle">
          Une question sur la plateforme ? Une suggestion ? N'hésitez pas à joindre l'équipe d'ingénieurs en charge du projet.
        </p>

        <hr className="contact-divider" />

        {/* CHEF DE PROJET */}
        <section className="contact-section project-leader">
          <h2>Chef de projet</h2>
          <div className="member-info">
            <h3>Aissatou DIALLO</h3>
            <p className="member-title">Émulation & Management de projet — Élève-Ingénieure en 4ème année</p>
            <p className="member-specialty">Option Numérique et Santé (E-santé) — ISEN Méditerranée Toulon</p>
            <a href="mailto:aissatou.diallo@isen.yncrea.fr" className="contact-email">
              aissatou.diallo@isen.yncrea.fr
            </a>
          </div>
        </section>

        {/* CO-FONDATEURS / COLLABORATEURS */}
        <section className="contact-section">
          <h2>Ingénieurs Collaborateurs</h2>
          <div className="members-grid">
            
            <div className="member-card">
              <h3>Camille MARTINI</h3>
              <p className="member-title">Élève-Ingénieure en 4ème année</p>
              <p className="member-specialty">Option Numérique et Santé — ISEN Méditerranée</p>
              <a href="mailto:camille.martini@isen.yncrea.fr" className="contact-email">
                camille.martini@isen.yncrea.fr
              </a>
            </div>

            <div className="member-card">
              <h3>Lucas MURATET</h3>
              <p className="member-title">Élève-Ingénieur en 4ème année</p>
              <p className="member-specialty">Option Numérique et Santé — ISEN Méditerranée</p>
              <a href="mailto:lucas.muratet@isen.yncrea.fr" className="contact-email">
                lucas.muratet@isen.yncrea.fr
              </a>
            </div>

          </div>
        </section>
      </div>
    </div>
  );
};

export default Contact;