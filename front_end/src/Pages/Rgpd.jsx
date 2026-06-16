import React, { useEffect } from 'react';
import '../styles/Rgpd.css'; // On va créer ce fichier juste après

const Rgpd = () => {
  // Remonte en haut de la page à l'ouverture
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="rgpd-container">
      <div className="rgpd-card">
        <h1 className="rgpd-title">Politique de Confidentialité & RGPD</h1>
        <p className="rgpd-subtitle">
          Chez Accompagnement Santé 83, la protection de vos données et le respect de votre vie privée sont au cœur de nos engagements.
        </p>

        <hr className="rgpd-divider" />

        <section className="rgpd-section">
          <h2>1. Collecte Minimale des Données</h2>
          <p>
            Conformément au principe de minimisation du RGPD, nous collectons uniquement le <strong>strict minimum</strong> nécessaire à la mise en relation entre patients et patients-experts. Nous ne stockons aucune donnée médicale lourde ni aucun compte rendu de santé sur nos serveurs.
          </p>
        </section>

        <section className="rgpd-section">
          <h2>2. Droit à l'Anonymat et Pseudonymat</h2>
          <p>
            Chaque utilisateur a le droit de préserver son anonymat complet sur la plateforme. Lors de la création de votre profil, vous pouvez utiliser un <strong>surnom (pseudonyme)</strong> à la place de vos nom et prénom réels pour vos échanges publics ou directs.
          </p>
        </section>

        <section className="rgpd-section">
          <h2>3. Droit à l'Image et Consentement</h2>
          <p>
            L'utilisation d'une photo de profil pour le patient ou le patient-expert est soumise à votre <strong>accord explicite</strong>. Vous pouvez modifier ou retirer votre droit à l'image à tout moment directement depuis la gestion de votre profil.
          </p>
        </section>

        <section className="rgpd-section">
          <h2>4. Sécurité des Échanges et Flux Vidéo</h2>
          <p>
            Pour garantir la confidentialité de vos discussions d'entraide, toutes les connexions et flux de données utilisent des technologies de pointe :
          </p>
          <ul>
            <li><strong>Flux vidéo cryptés</strong> de bout en bout pour les visioconférences.</li>
            <li><strong>Chiffrement AES-256</strong> pour la sécurisation des échanges et des messages.</li>
            <li>Utilisation stricte du protocole de sécurité <strong>TLS 1.2</strong> (ou supérieur) pour la navigation.</li>
          </ul>
        </section>

        <section className="rgpd-section">
          <h2>5. Vos Droits (Rétractation, Modification, Suppression)</h2>
          <p>
            Vous disposez d'un droit d'accès, de rectification, de portabilité et de suppression de vos données. Vous pouvez exercer votre <strong>droit de rétractation</strong> ou modifier vos informations à tout moment depuis votre espace personnel ou en nous contactant.
          </p>
        </section>

        <section className="rgpd-section">
          <h2>6. Analyse d'Impact (AIPD) & Violation de Données</h2>
          <p>
            Une Analyse d'Impact relative à la Protection des Données (AIPD) a été menée pour garantir la sécurité de la plateforme. En cas de faille de sécurité ou de violation de données présentant un risque, la plateforme s'engage à mener des actions immédiates et à <strong>avertir les patients concernés par e-mail sous 72 heures maximum</strong>.
          </p>
        </section>

        <section className="rgpd-section text-center">
          <p className="rgpd-notice">
            * Aucune donnée de santé à caractère médical n'est conservée de façon permanente. Vos échanges restent confidentiels et ne sont jamais transmis à des tiers.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Rgpd;