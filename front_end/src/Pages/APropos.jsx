import React, { useEffect } from 'react';
import '../styles/APropos.css';

const APropos = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="about-container">
      <div className="about-card">
        <h1 className="about-title">À Propos de Nous</h1>
        <p className="about-subtitle">
          Découvrez l'origine et les ambitions de la plateforme Accompagnement Santé 83.
        </p>

        <hr className="about-divider" />

        <section className="about-section">
          <h2>Notre Projet de Master</h2>
          <p>
            Ce site internet constitue notre <strong>Master Project de 4ème année d'études d'ingénieur</strong> au sein de l'école <strong>ISEN Méditerranée Toulon</strong>. Conçu par une équipe d'étudiants spécialisés dans l'option Numérique et Santé (E-santé), ce projet valide notre capacité à concevoir des solutions technologiques innovantes au service de l'humain et de la médecine de demain.
          </p>
        </section>

        <section className="about-section">
          <h2>Le Sujet : Rompre l'isolement hospitalier</h2>
          <p>
            <strong>Accompagnement Santé 83</strong> est une plateforme d'entraide et de partage d'expériences conçue spécifiquement pour l'environnement hospitalier. 
          </p>
          <p>
            Notre objectif principal est de mettre en relation des patients traversant une épreuve de santé avec des <strong>patients-experts (ou partenaires)</strong> ayant déjà vécu un parcours de soin similaire. Grâce à des outils d'échange sécurisés, nous permettons le partage de conseils pratiques, de soutien moral et de vécu, offrant ainsi un accompagnement complémentaire aux parcours de soins médicaux classiques.
          </p>
        </section>
      </div>
    </div>
  );
};

export default APropos;