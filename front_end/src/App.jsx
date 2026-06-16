import React from 'react';
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Home from "./Pages/Home.jsx";
import PatientLogin from "./Pages/PatientLogin.jsx";
import PatientRegister from "./Pages/PatientRegister.jsx";
import VerifyCode from "./Pages/verifyCode.jsx";

import ExpertLogin from "./Pages/ExpertLogin.jsx";
import ExpertRegister from "./Pages/ExpertRegister.jsx";
import AdminLogin from "./Pages/AdminLogin.jsx";
import AdminDashboard from "./Pages/AdminDashboard.jsx";

import PatientDashboard from "./Pages/PatientDashboard.jsx";
import ExpertDashboard from "./Pages/ExpertDashboard.jsx";
import Appointments from "./Pages/Appointments";
import MainFooter from "./Pages/MainFooter";
import Rgpd from "./Pages/Rgpd.jsx";
import MentionsLegales from "./Pages/MentionsLegales.jsx";
import Contact from "./Pages/Contact.jsx";   // Import Contact
import APropos from "./Pages/APropos.jsx";   // Import À Propos

/* PROTECTED ROUTE */
function ProtectedRoute({ children, role }) {
  const token =
    role === "patient"
      ? localStorage.getItem("patient_token")
      : role === "admin"
        ? localStorage.getItem("admin_token")
        : localStorage.getItem("partner_token");

  if (!token) {
    return <Navigate to={`/${role}/login`} replace />;
  }

  return children;
}

/* LAYOUT AVEC FOOTER */
function AppLayout({ children }) {
  const location = useLocation();

  // Ajout des nouvelles pages pour afficher le footer
  const showFooter = [
    "/",
    "/rgpd",
    "/mentions-legales",
    "/contact",
    "/a-propos",
    "/patient/dashboard",
    "/expert/dashboard",
  ].includes(location.pathname);

  return (
    <>
      {children}
      {showFooter && <MainFooter />}
    </>
  );
}

/* APP */
export default function App() {
  return (
    <AppLayout>
      <Routes>
        {/* Accueil public */}
        <Route path="/" element={<Home />} />

        {/* Routes publiques d'informations */}
        <Route path="/rgpd" element={<Rgpd />} />
        <Route path="/mentions-legales" element={<MentionsLegales />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/a-propos" element={<APropos />} />

        <Route
          path="/patient/appointment/:partenaireId"
          element={<Appointments />}
        />

        {/* Auth patient */}
        <Route path="/patient/login" element={<PatientLogin />} />
        <Route path="/patient/register" element={<PatientRegister />} />
        <Route path="/patient/verify-code" element={<VerifyCode />} />

        {/* Auth expert */}
        <Route path="/expert/login" element={<ExpertLogin />} />
        <Route path="/expert/register" element={<ExpertRegister />} />

        {/* Auth admin */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Dashboards protégés */}
        <Route
          path="/patient/dashboard"
          element={
            <ProtectedRoute role="patient">
              <PatientDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/expert/dashboard"
          element={
            <ProtectedRoute role="expert">
              <ExpertDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/patient/rdv/:partenaireId"
          element={
            <ProtectedRoute role="patient">
              <Appointments />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}
