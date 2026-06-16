import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, Calendar, Clock, Users, Activity, CheckCircle, XCircle,
  LogOut, Bell, User, MapPin, Phone, Mail, Briefcase, Award,
  Loader, AlertCircle, ThumbsUp, ThumbsDown, Stethoscope
} from 'lucide-react';
import '../styles/ExpertDashboard.css';
import {
  getExpertProfile, getExpertAppointments, getExpertStats, getMyPatients,
  acceptAppointment, refuseAppointment, completeAppointment, proposeAppointmentSlots,
  getExpertNotifications, markExpertNotificationsAsRead
} from '../services/ExpertService';

export default function ExpertDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('accueil');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState({ todayAppointments: 0, upcomingAppointments: 0, totalPatients: 0 });
  const [notifications, setNotifications] = useState([]);
  const [openProposalForm, setOpenProposalForm] = useState(null);
  const [proposalDrafts, setProposalDrafts] = useState({});

  useEffect(() => { loadDashboardData(); }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [profileData, appointmentsData, statsData, patientsData, notificationsData] = await Promise.all([
        getExpertProfile().catch(() => ({ nom: 'Expert', prenom: 'Dr.', service: 'Médecine' })),
        getExpertAppointments().catch(() => []),
        getExpertStats().catch(() => ({ todayAppointments: 0, upcomingAppointments: 0, totalPatients: 0 })),
        getMyPatients().catch(() => []),
        getExpertNotifications().catch(() => [])
      ]);
      setProfile(profileData);
      setAppointments(appointmentsData);
      setStats(statsData);
      setPatients(patientsData);
      setNotifications(notificationsData);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const pendingRequests = appointments.filter(apt => apt.statut === 'demande');
  const confirmedAppointments = appointments.filter(apt => apt.statut === 'confirme');
  const completedAppointments = appointments.filter(apt => apt.statut === 'termine');
  const unreadNotifications = notifications.filter((notification) => notification.lu === false).length;

  const openRequestsTab = async () => {
    setActiveTab('demandes');

    const appointmentNotifications = notifications.filter((notification) => (
      notification.lu === false && notification.type?.startsWith('appointment_')
    ));

    if (appointmentNotifications.length === 0) return;

    setNotifications((prev) => prev.map((notification) => (
      notification.type?.startsWith('appointment_') ? { ...notification, lu: true } : notification
    )));

    try {
      await markExpertNotificationsAsRead('appointment_');
      const refreshedNotifications = await getExpertNotifications().catch(() => null);
      if (refreshedNotifications) setNotifications(refreshedNotifications);
    } catch (err) {
      console.error('Erreur lecture notifications rendez-vous:', err);
      const refreshedNotifications = await getExpertNotifications().catch(() => null);
      if (refreshedNotifications) setNotifications(refreshedNotifications);
    }
  };

  const handleNotificationsClick = async () => {
    const unread = notifications.filter((notification) => notification.lu === false);

    if (unread.length === 0) return;

    setNotifications((prev) => prev.map((notification) => (
      notification.lu ? notification : { ...notification, lu: true }
    )));

    try {
      await markExpertNotificationsAsRead();
      const refreshedNotifications = await getExpertNotifications().catch(() => null);
      if (refreshedNotifications) setNotifications(refreshedNotifications);
    } catch (err) {
      console.error('Erreur lecture notifications:', err);
      const refreshedNotifications = await getExpertNotifications().catch(() => null);
      if (refreshedNotifications) setNotifications(refreshedNotifications);
    }
  };


  const getProposalDraft = (id_rdv) => (
    proposalDrafts[id_rdv] || [
      { date: '', time: '' },
      { date: '', time: '' },
      { date: '', time: '' }
    ]
  );

  const updateProposalDraft = (id_rdv, index, field, value) => {
    const nextDraft = getProposalDraft(id_rdv).map((slot, slotIndex) => (
      slotIndex === index ? { ...slot, [field]: value } : slot
    ));

    setProposalDrafts((prev) => ({ ...prev, [id_rdv]: nextDraft }));
  };

  const handleProposeSlots = async (id_rdv) => {
    const proposals = getProposalDraft(id_rdv).filter((slot) => slot.date && slot.time);

    if (proposals.length === 0) {
      alert('Ajoutez au moins un créneau');
      return;
    }

    try {
      await proposeAppointmentSlots(id_rdv, proposals);
      const updated = await getExpertAppointments();
      setAppointments(updated);
      setOpenProposalForm(null);
      setProposalDrafts((prev) => ({ ...prev, [id_rdv]: [
        { date: '', time: '' },
        { date: '', time: '' },
        { date: '', time: '' }
      ] }));
      alert('Créneaux proposés au patient');
    } catch (err) {
      alert(err.message || 'Erreur');
    }
  };

  const handleAccept = async (id_rdv) => {
    try {
      await acceptAppointment(id_rdv);
      const updated = await getExpertAppointments();
      setAppointments(updated);
      alert('Rendez-vous accepté');
    } catch (err) {
      alert('Erreur');
    }
  };

  const handleRefuse = async (id_rdv) => {
    const motif = prompt('Motif du refus (optionnel) :');
    if (motif === null) return;
    try {
      await refuseAppointment(id_rdv, motif);
      const updated = await getExpertAppointments();
      setAppointments(updated);
      alert('Rendez-vous refusé');
    } catch (err) {
      alert('Erreur');
    }
  };

  const handleComplete = async (id_rdv) => {
    if (!window.confirm('Marquer comme terminé ?')) return;
    try {
      await completeAppointment(id_rdv);
      const updated = await getExpertAppointments();
      setAppointments(updated);
      alert('Rendez-vous terminé');
    } catch (err) {
      alert('Erreur');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('partner_token');
    navigate('/expert/login');
  };

  if (loading) {
    return (
      <div className="expert-loading-screen">
        <Loader size={48} className="expert-spinner" />
        <p>Chargement de votre espace médical...</p>
      </div>
    );
  }

  return (
    <div className="expert-dashboard-medical">
      {/* SIDEBAR */}
      <aside className="expert-sidebar">
        <div className="expert-sidebar-header">
          <div className="expert-sidebar-logo">
            <Heart size={32} />
          </div>
          <div>
            <div className="expert-sidebar-brand-name">Accompagnement</div>
            <div className="expert-sidebar-brand-sub">Santé 83</div>
          </div>
        </div>

        <nav className="expert-sidebar-nav">
          <button 
            className={`expert-nav-item ${activeTab === 'accueil' ? 'active' : ''}`}
            onClick={() => setActiveTab('accueil')}
          >
            <Activity size={20} />
            Accueil
          </button>
          <button 
            className={`expert-nav-item ${activeTab === 'demandes' ? 'active' : ''}`}
            onClick={openRequestsTab}
          >
            <AlertCircle size={20} />
            Demandes
            {pendingRequests.length > 0 && <span className="expert-nav-badge">{pendingRequests.length}</span>}
          </button>
          <button 
            className={`expert-nav-item ${activeTab === 'rendez-vous' ? 'active' : ''}`}
            onClick={() => setActiveTab('rendez-vous')}
          >
            <Calendar size={20} />
            Agenda
          </button>
          <button 
            className={`expert-nav-item ${activeTab === 'patients' ? 'active' : ''}`}
            onClick={() => setActiveTab('patients')}
          >
            <Users size={20} />
            Mes patients
          </button>
          <button 
            className={`expert-nav-item ${activeTab === 'profil' ? 'active' : ''}`}
            onClick={() => setActiveTab('profil')}
          >
            <User size={20} />
            Mon profil
          </button>
        </nav>

        <button className="expert-sidebar-logout" onClick={handleLogout}>
          <LogOut size={20} />
          Déconnexion
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <div className="expert-main-shell">
        <header className="expert-top-header">
          <div className="expert-header-left">
            <div className="expert-welcome">
              <h1>Bonjour {profile?.prenom || 'Expert'}</h1>
              <p>Bienvenue sur votre espace patient partenaire</p>
            </div>
          </div>
          
          <div className="expert-header-right">
            <button
              className="expert-notif-btn"
              type="button"
              aria-label="Notifications"
              onClick={handleNotificationsClick}
            >
              <Bell size={20} />
              {unreadNotifications > 0 && <span className="expert-notif-badge">{unreadNotifications}</span>}
            </button>
            
            <div className="expert-user-info">
              <div className="expert-user-avatar">
                {profile?.prenom?.[0]}{profile?.nom?.[0]}
              </div>
              <div className="expert-user-details">
                <div className="expert-user-name">{profile?.prenom} {profile?.nom}</div>
                <div className="expert-user-role">{profile?.service || 'Patient partenaire'}</div>
              </div>
            </div>
          </div>
        </header>

        <main className="expert-main-content">
        
        {/* TAB: TABLEAU DE BORD */}
        {activeTab === 'accueil' && (
          <div className="expert-tab-content">
            <h1 className="expert-page-title">Tableau de bord</h1>
            
            {/* STATS MÉDICALES - SEULEMENT 3 CARDS */}
            <div className="expert-stats-medical">
              <div className="expert-stat-box stat-green">
                <div className="expert-stat-icon-wrap">
                  <Calendar size={24} />
                </div>
                <div className="expert-stat-data">
                  <div className="expert-stat-number">{stats.todayAppointments || 0}</div>
                  <div className="expert-stat-label">Consultations aujourd'hui</div>
                </div>
              </div>
              
              <div className="expert-stat-box stat-blue">
                <div className="expert-stat-icon-wrap">
                  <Clock size={24} />
                </div>
                <div className="expert-stat-data">
                  <div className="expert-stat-number">{confirmedAppointments.length}</div>
                  <div className="expert-stat-label">Rendez-vous confirmés</div>
                </div>
              </div>
              
              <div className="expert-stat-box stat-purple">
                <div className="expert-stat-icon-wrap">
                  <Users size={24} />
                </div>
                <div className="expert-stat-data">
                  <div className="expert-stat-number">{patients.length}</div>
                  <div className="expert-stat-label">Patients suivis</div>
                </div>
              </div>
            </div>

            {/* DEMANDES EN ATTENTE */}
            {pendingRequests.length > 0 && (
              <section className="expert-section">
                <div className="expert-section-header">
                  <h2>Demandes en attente de validation</h2>
                  <span className="expert-count-badge">{pendingRequests.length}</span>
                </div>
                
                <div className="expert-requests-table">
                  {pendingRequests.map((req) => (
                    <div key={req.id_rdv} className="expert-request-row">
                      <div className="expert-request-patient">
                        <div className="expert-patient-avatar-small">
                          {req.patient_nom?.[0]}
                        </div>
                        <div>
                          <div className="expert-patient-name-bold">{req.patient_nom}</div>
                          <div className="expert-request-meta">
                            {req.date_rdv} à {req.heure_rdv} • {req.mode}
                          </div>
                        </div>
                      </div>
                      
                      <div className="expert-request-actions-inline">
                        <button className="expert-btn-refuse" onClick={() => handleRefuse(req.id_rdv)}>
                          <XCircle size={16} />
                          Refuser
                        </button>
                        <button className="expert-btn-accept" onClick={() => handleAccept(req.id_rdv)}>
                          <CheckCircle size={16} />
                          Accepter
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* AGENDA DU JOUR */}
            <section className="expert-section">
              <div className="expert-section-header">
                <h2>Agenda des prochaines consultations</h2>
              </div>
              
              {confirmedAppointments.length === 0 ? (
                <div className="expert-empty-message">
                  Aucune consultation confirmée
                </div>
              ) : (
                <div className="expert-agenda-list">
                  {confirmedAppointments.map((apt) => (
                    <div key={apt.id_rdv} className="expert-agenda-item">
                      <div className="expert-agenda-time">
                        <Clock size={16} />
                        {apt.heure_rdv}
                      </div>
                      <div className="expert-agenda-divider"></div>
                      <div className="expert-agenda-details">
                        <div className="expert-agenda-patient">{apt.patient_nom}</div>
                        <div className="expert-agenda-meta">
                          {apt.date_rdv} • {apt.mode}
                        </div>
                      </div>
                      <div className="expert-agenda-status">
                        <span className="expert-status-confirmed">Confirmé</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* TAB: DEMANDES */}
        {activeTab === 'demandes' && (
          <div className="expert-tab-content">
            <h1 className="expert-page-title">Demandes de rendez-vous</h1>
            
            {pendingRequests.length === 0 ? (
              <div className="expert-empty-state">
                <AlertCircle size={48} />
                <p>Aucune demande en attente</p>
              </div>
            ) : (
              <div className="expert-demands-grid">
                {pendingRequests.map((req) => (
                  <div key={req.id_rdv} className="expert-demand-card">
                    <div className="expert-demand-header">
                      <div className="expert-demand-patient-info">
                        <div className="expert-demand-avatar">{req.patient_nom?.[0]}</div>
                        <div>
                          <div className="expert-demand-name">{req.patient_nom}</div>
                          <div className="expert-demand-label">Demande de consultation</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="expert-demand-details-grid">
                      <div className="expert-demand-detail">
                        <Calendar size={16} />
                        <div>
                          <div className="expert-detail-label">Date</div>
                          <div className="expert-detail-value">{req.date_rdv}</div>
                        </div>
                      </div>
                      <div className="expert-demand-detail">
                        <Clock size={16} />
                        <div>
                          <div className="expert-detail-label">Heure</div>
                          <div className="expert-detail-value">{req.heure_rdv}</div>
                        </div>
                      </div>
                      <div className="expert-demand-detail">
                        <MapPin size={16} />
                        <div>
                          <div className="expert-detail-label">Mode</div>
                          <div className="expert-detail-value">{req.mode}</div>
                        </div>
                      </div>
                    </div>
                    
                    {req.note_interne && (
                      <div className="expert-demand-message">
                        <strong>Message :</strong> {req.note_interne}
                      </div>
                    )}
                    
                    {req.propositions?.filter((proposal) => proposal.statut === 'en_attente').length > 0 && (
                      <div className="expert-existing-proposals">
                        <strong>Créneaux déjà proposés :</strong>
                        {req.propositions
                          .filter((proposal) => proposal.statut === 'en_attente')
                          .map((proposal) => (
                            <span key={proposal.id_proposition}>
                              {proposal.date_proposition} à {proposal.heure_proposition}
                            </span>
                          ))}
                      </div>
                    )}

                    {openProposalForm === req.id_rdv && (
                      <div className="expert-proposal-form">
                        <div className="expert-proposal-form-title">Proposer jusqu’à 3 créneaux</div>
                        {getProposalDraft(req.id_rdv).map((slot, index) => (
                          <div className="expert-proposal-row" key={index}>
                            <input
                              type="date"
                              value={slot.date}
                              onChange={(event) => updateProposalDraft(req.id_rdv, index, 'date', event.target.value)}
                            />
                            <input
                              type="time"
                              value={slot.time}
                              onChange={(event) => updateProposalDraft(req.id_rdv, index, 'time', event.target.value)}
                            />
                          </div>
                        ))}
                        <button className="expert-btn-propose-submit" onClick={() => handleProposeSlots(req.id_rdv)}>
                          Envoyer les propositions
                        </button>
                      </div>
                    )}

                    <div className="expert-demand-actions">
                      <button className="expert-btn-refuse-full" onClick={() => handleRefuse(req.id_rdv)}>
                        <ThumbsDown size={16} />
                        Refuser
                      </button>
                      <button className="expert-btn-propose-full" onClick={() => setOpenProposalForm(openProposalForm === req.id_rdv ? null : req.id_rdv)}>
                        <Calendar size={16} />
                        Proposer
                      </button>
                      <button className="expert-btn-accept-full" onClick={() => handleAccept(req.id_rdv)}>
                        <ThumbsUp size={16} />
                        Accepter
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: AGENDA */}
        {activeTab === 'rendez-vous' && (
          <div className="expert-tab-content">
            <h1 className="expert-page-title">Mon agenda médical</h1>
            
            {confirmedAppointments.length === 0 ? (
              <div className="expert-empty-state">
                <Calendar size={48} />
                <p>Aucune consultation confirmée</p>
              </div>
            ) : (
              <div className="expert-appointments-table">
                {confirmedAppointments.map((apt) => (
                  <div key={apt.id_rdv} className="expert-appointment-row">
                    <div className="expert-apt-patient-col">
                      <div className="expert-apt-avatar">{apt.patient_nom?.[0]}</div>
                      <div>
                        <div className="expert-apt-name">{apt.patient_nom}</div>
                        <div className="expert-apt-type">Consultation</div>
                      </div>
                    </div>
                    
                    <div className="expert-apt-info-col">
                      <div className="expert-apt-info-item">
                        <Calendar size={14} />
                        {apt.date_rdv}
                      </div>
                      <div className="expert-apt-info-item">
                        <Clock size={14} />
                        {apt.heure_rdv}
                      </div>
                      <div className="expert-apt-info-item">
                        <MapPin size={14} />
                        {apt.mode}
                      </div>
                    </div>
                    
                    <div className="expert-apt-actions-col">
                      <button className="expert-btn-complete" onClick={() => handleComplete(apt.id_rdv)}>
                        Marquer comme terminé
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: PATIENTS */}
        {activeTab === 'patients' && (
          <div className="expert-tab-content">
            <h1 className="expert-page-title">Mes patients suivis</h1>
            
            {patients.length === 0 ? (
              <div className="expert-empty-state">
                <Users size={48} />
                <p>Aucun patient suivi</p>
              </div>
            ) : (
              <div className="expert-patients-table">
                {patients.map((patient) => (
                  <div key={patient.id_patient} className="expert-patient-row">
                    <div className="expert-patient-avatar-large">
                      {patient.nom?.[0]}
                    </div>
                    <div className="expert-patient-info-col">
                      <div className="expert-patient-name-large">{patient.nom}</div>
                      <div className="expert-patient-stats-inline">
                        <span>{patient.total_rdv || 0} consultations</span>
                        <span>•</span>
                        <span>{patient.rdv_termines || 0} terminées</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: PROFIL */}
        {activeTab === 'profil' && (
          <div className="expert-tab-content">
            <h1 className="expert-page-title">Mon profil professionnel</h1>
            
            <div className="expert-profile-banner">
              <div className="expert-profile-avatar-large">
                <Stethoscope size={40} />
              </div>
              <div>
                <h2 className="expert-profile-name"> {profile?.prenom} {profile?.nom}</h2>
                <p className="expert-profile-title">Patient partenaire • {profile?.service || 'Expert médical'}</p>
                <div className="expert-profile-badges">
                  <span className="expert-badge-verified">
                    <CheckCircle size={14} />
                    Vérifié
                  </span>
                  <span className="expert-badge-active">
                    <Award size={14} />
                    Actif
                  </span>
                </div>
              </div>
            </div>

            <div className="expert-profile-sections">
              <section className="expert-profile-section">
                <h3>Informations personnelles</h3>
                <div className="expert-info-grid">
                  <div className="expert-info-item">
                    <User size={16} />
                    <div>
                      <div className="expert-info-label">Nom complet</div>
                      <div className="expert-info-value">{profile?.prenom} {profile?.nom}</div>
                    </div>
                  </div>
                  <div className="expert-info-item">
                    <Mail size={16} />
                    <div>
                      <div className="expert-info-label">Email</div>
                      <div className="expert-info-value">{profile?.email}</div>
                    </div>
                  </div>
                  <div className="expert-info-item">
                    <Phone size={16} />
                    <div>
                      <div className="expert-info-label">Téléphone</div>
                      <div className="expert-info-value">{profile?.telephone}</div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="expert-profile-section">
                <h3>Informations professionnelles</h3>
                <div className="expert-info-grid">
                  <div className="expert-info-item">
                    <Briefcase size={16} />
                    <div>
                      <div className="expert-info-label">Service médical</div>
                      <div className="expert-info-value expert-highlight">{profile?.service || 'Non renseigné'}</div>
                    </div>
                  </div>
                  <div className="expert-info-item">
                    <CheckCircle size={16} />
                    <div>
                      <div className="expert-info-label">Statut</div>
                      <div className="expert-info-value">{profile?.statut === 'actif' ? 'Actif' : 'En attente'}</div>
                    </div>
                  </div>
                  <div className="expert-info-item">
                    <Calendar size={16} />
                    <div>
                      <div className="expert-info-label">Date d'inscription</div>
                      <div className="expert-info-value">
                        {profile?.date_creation ? new Date(profile.date_creation).toLocaleDateString('fr-FR') : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="expert-profile-section">
                <h3>Statistiques d'activité</h3>
                <div className="expert-profile-stats">
                  <div className="expert-profile-stat-item">
                    <Activity size={24} />
                    <div className="expert-profile-stat-number">{completedAppointments.length}</div>
                    <div className="expert-profile-stat-label">Consultations terminées</div>
                  </div>
                  <div className="expert-profile-stat-item">
                    <Users size={24} />
                    <div className="expert-profile-stat-number">{patients.length}</div>
                    <div className="expert-profile-stat-label">Patients suivis</div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}
        
        </main>
      </div>
    </div>
  );
}
