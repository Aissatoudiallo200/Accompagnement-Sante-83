import React from 'react';
import { Link } from 'react-router-dom';
import "../styles/MainFooter.css";

export default function MainFooter() {
  return (
    <footer className="main-footer">
      <div className="footer-container">

        {/* LOGO + DESC */}
        <div className="footer-col brand">
          <div className="footer-logo">
            <span className="logo-icon">❤</span>
            <span className="logo-text">Accompagnement santé 83</span>
          </div>
          <p>
            Plateforme d’entraide et de partage d’expérience entre patients
            dans l’environnement hospitalier.
          </p>
        </div>

        {/* NAVIGATION */}
        <div className="footer-col">
          <h4>Navigation</h4>
          <ul>
            <li><Link to="/">Accueil</Link></li>
            <li><Link to="/a-propos">À propos</Link></li> {/* Câblé ici */}
          </ul>
        </div>

        {/* ESPACES */}
        <div className="footer-col">
          <h4>Espaces</h4>
          <ul>
            <li><Link to="/patient/login">Espace Patient</Link></li>
            <li><Link to="/expert/login">Espace Patient Partenaire</Link></li>
            <li><Link to="/admin/login">Espace Administrateur</Link></li>
          </ul>
        </div>

        {/* INFOS */}
        <div className="footer-col">
          <h4>Informations</h4>
          <ul>
            <li><Link to="/mentions-legales">Mentions légales</Link></li>
            <li><Link to="/rgpd">RGPD</Link></li>
            <li><Link to="/contact">Contact</Link></li> {/* Câblé ici */}
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 Accompagnement Santé 83 — Tous droits réservés</span>
        <span className="rgpd">Plateforme sécurisée et conforme RGPD</span>
      </div>
    </footer>
  );
}
