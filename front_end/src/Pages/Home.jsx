import React from 'react';
import { Link } from "react-router-dom";
import "../styles/Home.css";

// Icônes modernes 
import { 
  Heart, 
  Shield, 
  Users, 
  Award, 
  MessageCircle, 
  FileCheck, 
  Activity,
  CheckCircle,
  Handshake,
  Sparkles
} from 'lucide-react';

import heroImg from "../assets/Patient-hero.jpg";
import aboutImg from "../assets/about.jpg";

export default function Home() {
  return (
    <div className="home">
      {/* NAVBAR  */}
      <header className="home-nav">
        <div className="home-brand">
          <div className="home-logo">
            <Heart size={24} strokeWidth={2} color="#2F8F6B" fill="#2F8F6B" />
          </div>
          <div>
            <div className="home-brand-name">Accompagnement Santé 83</div>
            <div className="home-brand-sub">Entraide santé</div>
          </div>
        </div>

        <nav className="home-links">
          <a href="#accueil">Accueil</a>
          <a href="#espaces">Espaces</a>
          <a href="#fonctionnalites">Fonctionnalités</a>
          <a href="#apropos">À propos</a>
        </nav>

        <Link className="home-cta" to="/patient/login">
          Se connecter
        </Link>
      </header>

      {/*  HERO  */}
      <main className="home-main" id="accueil">
        <section className="hero">
          <div className="hero-left">
            <span className="hero-pill">
              <Heart size={16} strokeWidth={2} style={{ display: 'inline', marginRight: '6px' }} />
              Plateforme d'entraide santé
            </span>

            <h1 className="hero-title">
              Soyons Partenaire dans la <span>maladie</span>
            </h1>

            <p className="hero-text">
              Accompagnement Santé 83 mets en relation les patients et patients partenaire pour partager expériences,
              conseils et soutien dans un environnement hospitalier sécurisé.
            </p>
          </div>
          
          <div className="hero-right">
            <div className="hero-image-wrap">
              <img
                className="hero-image"
                src={heroImg}
                alt="Entraide et accompagnement"
              />

              <div className="hero-badge">
                <div className="hero-badge-icon">
                  <Shield size={22} strokeWidth={2} color="#2F8F6B" />
                </div>
                <div>
                  <div className="hero-badge-title">Accès sécurisé</div>
                  <div className="hero-badge-sub">Données protégées</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* POINTS FORTS */}
        <section className="stats">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">Patient</div>
              <div className="stat-label">Rendez-vous, ressources et notifications au même endroit</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-number">Expert</div>
              <div className="stat-label">Demandes, propositions et suivi des accompagnements</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-number">RDV</div>
              <div className="stat-label">Demande, confirmation, annulation et historique</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-number">Ressources</div>
              <div className="stat-label">Fiches utiles disponibles selon les besoins du patient</div>
            </div>
          </div>
        </section>

        {/*  CHOISISSEZ VOTRE ESPACE */}
        <section className="choose" id="espaces">
          <span className="section-pill">Espaces</span>
          <h2>Choisissez votre espace</h2>
          <p>
            Que vous soyez patient cherchant du soutien ou patient partenaires souhaitant
            partager votre expérience, Accompagnement Santé 83 vous accompagne.
          </p>

          <div className="choose-grid">
            {/* CARD PATIENT */}
            <article className="choose-card">
              <div className="choose-icon blue">
                <Users size={48} strokeWidth={1.5} />
              </div>
              <h3>Espace Patient</h3>
              <p>
                Trouvez du soutien auprès de patients partenaires, consultez des fiches mémo
                validées et rejoignez une communauté bienveillante.
              </p>

              <ul>
                <li>Recherche de patients partenaires par pathologie</li>
                <li>Accès aux fiches mémo validées</li>
                <li>Échanges sécurisés et confidentiels</li>
              </ul>

              <div className="choose-actions">
                <Link className="choose-btn blue" to="/patient/login">
                  Accéder à mon espace
                </Link>
              </div>
            </article>

            {/* CARD EXPERT */}
            <article className="choose-card">
              <div className="choose-icon green">
                <Award size={48} strokeWidth={1.5} />
              </div>
              <h3>Espace Patient Partenaire</h3>
              <p>
                Partagez votre expérience, créez des fiches mémo et aidez d'autres patients
                dans leur parcours de soin.
              </p>

              <ul>
                <li>Création de fiches mémo pour votre pathologie</li>
                <li>Gestion de votre profil de patient partenaire</li>
                <li>Accompagnement personnalisé des patients</li>
              </ul>

              <div className="choose-actions">
                <Link className="choose-btn green" to="/expert/login">
                  Accéder à mon espace 
                </Link>
              </div>
            </article>
          </div>
        </section>

        {/*  FONCTIONNALITÉS */}
        <section className="features" id="fonctionnalites">
          <span className="section-pill">Fonctionnalités</span>
          <h2>Une plateforme complète</h2>
          <p>
            Accompagnement Santé 83 offre tous les outils nécessaires pour faciliter l'entraide et le
            partage d'expérience entre patients.
          </p>

          <div className="features-grid">
            <article className="feature">
              <div className="feature-ico purple">
                <MessageCircle size={32} strokeWidth={1.5} />
              </div>
              <h3>Échanges sécurisés</h3>
              <p>Communiquez en toute confiance dans un environnement protégé.</p>
            </article>

            <article className="feature">
              <div className="feature-ico orange">
                <FileCheck size={32} strokeWidth={1.5} />
              </div>
              <h3>Fiches mémo validées</h3>
              <p>Des contenus fiables validés par des médecins.</p>
            </article>

            <article className="feature">
              <div className="feature-ico pink">
                <Activity size={32} strokeWidth={1.5} />
              </div>
              <h3>Suivi personnalisé</h3>
              <p>Un accompagnement adapté à votre pathologie.</p>
            </article>
          </div>
        </section>

        {/* CERTIFICATIONS */}
        <section className="trust">
          <div className="trust-content">
            <h3>Certifié et validé par</h3>
            <div className="trust-logos">
              <div className="trust-badge">
                <CheckCircle size={24} strokeWidth={2} color="#2F8F6B" />
                <span>RGPD Conforme</span>
              </div>
            </div>
          </div>
        </section>

        {/* A PROPOS  */}
        <section className="about" id="apropos">
          <div className="about-grid">
            <div className="about-image">
              <img src={aboutImg} alt="Consultation médicale" />
            </div>

            <div className="about-content">
              <span className="section-pill green">À propos</span>
              <h2>Qu'est-ce que Accompagnement Santé 83 ?</h2>

              <p>
                Accompagnement Santé 83 est une plateforme d'entraide qui met en relation des patients avec
                des patients partenaires ayant vécu des expériences similaires.
              </p>

              <p>
                Notre mission : créer un espace bienveillant avec des informations validées
                et des échanges sécurisés.
              </p>

              <div className="about-points">
                <div className="about-point">
                  <div className="about-ico blue">
                    <CheckCircle size={28} strokeWidth={2} />
                  </div>
                  <div>
                    <h4>Validation médicale</h4>
                    <p>Les fiches sont validées par les médécins.</p>
                  </div>
                </div>

                <div className="about-point">
                  <div className="about-ico green">
                    <Handshake size={28} strokeWidth={2} />
                  </div>
                  <div>
                    <h4>Communauté bienveillante</h4>
                    <p>Un environnement d'écoute et de partage.</p>
                  </div>
                </div>

                <div className="about-point">
                  <div className="about-ico purple">
                    <Sparkles size={28} strokeWidth={2} />
                  </div>
                  <div>
                    <h4>Accompagnement personnalisé</h4>
                    <p>Un soutien adapté et pertinent selon votre situation.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
