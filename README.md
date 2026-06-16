# Accompagnement-Sante-83
Application web e-santé permettant la mise en relation entre patients atteints de maladies chroniques et patients partenaires afin d'améliorer l'accompagnement et le parcours de soins. Développée avec React, Node.js, Express et PostgreSQL/Supabase.

L'objectif du projet est de faciliter la mise en relation entre des patients atteints de maladies chroniques et des patients partenaires (patients experts) afin d'améliorer l'accompagnement, le partage d'expérience et le parcours de soins.

---

## Fonctionnalités principales

- Authentification sécurisée des utilisateurs
- Validation des comptes par email via Brevo
- Gestion des rôles :
  - Patient
  - Patient partenaire
  - Administrateur
- Prise de rendez-vous entre patients et patients partenaires
- Gestion des propositions de créneaux
- Notifications intégrées
- Gestion des ressources documentaires
- Tableaux de bord adaptés à chaque profil utilisateur

---

## Technologies utilisées

### Front-end

- React
- Vite
- JavaScript
- CSS

### Back-end

- Node.js
- Express.js
- API REST

### Base de données

- PostgreSQL
- Supabase

### Services externes

- Brevo (validation des comptes par email)

---

## Architecture du projet

```text
Accompagnement-Sante-83/
│
├── front_end/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── back_end/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.js
│   └── package.json
│
└── README.md
```

L'application repose sur une architecture client-serveur :

- Front-end React pour l'interface utilisateur
- API REST Node.js / Express pour la logique métier
- PostgreSQL (Supabase) pour le stockage des données
- Brevo pour la validation des comptes utilisateurs

---

## Installation

### Prérequis

- Node.js
- npm

---

## Lancer le projet en développement

### Backend

Dans un premier terminal :

```bash
cd back_end
npm install
npm run dev
```

### Frontend

Dans un second terminal :

```bash
cd front_end
npm install
npm run dev
```

---

## Accès aux services

Par défaut :

- Frontend : http://localhost:5173
- Backend : http://localhost:4000
- API Health Check : http://localhost:4000/api/health

---

## Variables d'environnement

Les variables d'environnement du backend sont documentées dans :

```text
back_end/.env.example
```

---

## Principales fonctionnalités développées

✅ Authentification et gestion des comptes

✅ Validation des inscriptions par email

✅ Gestion des rôles utilisateurs

✅ Prise de rendez-vous

✅ Gestion des notifications

✅ Gestion des ressources documentaires

✅ Base de données relationnelle sécurisée



---

## Perspectives d'évolution

- Développement d'une application mobile Android / iOS
- Intégration de la visioconférence
- Déploiement Cloud
- Synchronisation avec les agendas professionnels
- Extension à d'autres services hospitaliers

---

## Contexte académique

Projet réalisé dans le cadre de la formation d'ingénieur en E-Santé à l'ISEN Méditerranée.

Ce projet a permis de mettre en œuvre des compétences en :

- Développement web full-stack
- Architecture logicielle
- Bases de données relationnelles
- API REST
- Gestion de projet
- Innovation numérique en santé

