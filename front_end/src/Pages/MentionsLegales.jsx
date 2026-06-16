import React, { useEffect } from 'react';
import '../styles/MentionsLegales.css';

const MentionsLegales = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="legal-container">
      <div className="legal-card">
        <h1 className="legal-title">Mentions Légales</h1>
        <p className="legal-subtitle">
          Conformément aux dispositions de l'article 6 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique (LCEN).
        </p>

        <hr className="legal-divider" />

        <section className="legal-section">
          <h2>1. Édition du site</h2>
          <p>
            Le site internet <strong>Accompagnement Santé 83</strong> est une plateforme d'entraide éditée dans le cadre d'un projet de mise en relation hospitalière sécurisée pour le département du Var (83).
          </p>
          <p>
            <strong>Responsable de la publication :</strong> Équipe Accompagnement Santé 83.<br />
            <strong>Contact :</strong> contact@accompagnementsante83.fr
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Hébergement</h2>
          <p>
            Le site est hébergé localement et sur des infrastructures sécurisées respectant la confidentialité des données des utilisateurs. 
          </p>
          <p>
            <em>Note réglementaire :</em> Bien que la plateforme n'enregistre aucun compte rendu médical lourd, les serveurs d'hébergement appliquent des mesures de sécurité strictes équivalentes aux exigences de protection des données de santé.
          </p>
        </section>

        <section className="legal-section">
          <h2>3. Propriété intellectuelle</h2>
          <p>
            Tous les éléments constituant la charte graphique, les textes, les logos (notamment le logo "❤ Accompagnement santé 83") et les icônes de la plateforme sont la propriété exclusive de l'éditeur ou de ses partenaires. Toute reproduction, représentation ou diffusion, en tout ou partie, du contenu de ce site sur quelque support que ce soit est interdite sans autorisation préalable.
          </p>
        </section>

        <section className="legal-section">
          <h2>4. Limitation de responsabilité</h2>
          <p>
            <strong>Accompagnement Santé 83</strong> met en relation des patients et des patients-experts afin de partager des retours d'expériences et des conseils d'entraide. Les informations partagées sur cette plateforme <strong>ne remplacent en aucun cas un avis médical professionnel</strong>, un diagnostic ou un traitement prescrit par un médecin ou un professionnel de santé qualifié.
          </p>
        </section>

        <section className="legal-section text-center">
          <p className="legal-notice">
            Pour toute question relative aux mentions légales ou pour exercer vos droits, vous pouvez consulter notre page RGPD ou nous contacter directement.
          </p>
        </section>
      </div>
    </div>
  );
};

export default MentionsLegales;