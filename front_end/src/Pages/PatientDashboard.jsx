import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Search, 
  Calendar, 
  BookOpen, 
  User, 
  Bell,
  LogOut,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  Phone,
  Mail,
  FileText,
  MessageCircle,
  TrendingUp,
  Loader,
  Stethoscope,
  ArrowLeft
} from 'lucide-react';
import '../styles/PatientDashboard.css';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

// Import des services API
import {
  getPatientProfile,
  getPatientAppointments,
  getAllExperts,
  getResources,
  getPatientStats,
  cancelAppointment,
  searchExperts,
  downloadResource,
  getPatientNotifications,
  markPatientNotificationsAsRead,
  acceptAppointmentProposal
} from '../services/PatientService';

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('accueil');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExpertCategory, setSelectedExpertCategory] = useState(null);
  const [selectedResourceCategory, setSelectedResourceCategory] = useState(null);
  const [resourceSearchQuery, setResourceSearchQuery] = useState('');
  const [appointmentView, setAppointmentView] = useState('upcoming');
  const [notifications, setNotifications] = useState([]);

  // États pour les données
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [experts, setExperts] = useState([]);
  const [resources, setResources] = useState([]);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
    messages: 0
  });

  // Charger les données au montage
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [profileData, appointmentsData, expertsData, resourcesData, statsData, notificationsData] = await Promise.all([
        getPatientProfile(),
        getPatientAppointments(),
        getAllExperts(),
        getResources(),
        getPatientStats(),
        getPatientNotifications().catch(() => [])
      ]);

      setProfile(profileData);
      setAppointments(appointmentsData);
      setExperts(expertsData);
      setResources(resourcesData);
      setStats(statsData);
      setNotifications(notificationsData);
    } catch (err) {
      console.error('Erreur chargement données:', err);
    } finally {
      setLoading(false);
    }
  };

  const expertCategories = Object.values(
    experts.reduce((categories, expert) => {
      const service = expert.service || 'Autres spécialités';

      if (!categories[service]) {
        categories[service] = { name: service, count: 0 };
      }

      categories[service].count += 1;
      return categories;
    }, {})
  )
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 4);

  // Filtrer les experts selon la catégorie puis la recherche
  const filteredExperts = experts.filter(expert => {
    const query = searchQuery.toLowerCase();
    const service = expert.service || 'Autres spécialités';
    const matchesCategory = !selectedExpertCategory || service === selectedExpertCategory;
    const matchesSearch =
      expert.prenom?.toLowerCase().includes(query) ||
      expert.nom?.toLowerCase().includes(query) ||
      service.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  // Prochains rendez-vous visibles sur l'accueil
  const upcomingAppointments = appointments
    .filter(apt => ['demande', 'confirme'].includes(apt.statut));

  const appointmentGroups = {
    upcoming: appointments.filter(apt => apt.statut === 'confirme'),
    pending: appointments.filter(apt => apt.statut === 'demande'),
    history: appointments.filter(apt => ['termine', 'annule', 'refuse'].includes(apt.statut))
  };

  const appointmentTabs = [
    { key: 'upcoming', label: 'À venir', count: appointmentGroups.upcoming.length },
    { key: 'pending', label: 'En attente', count: appointmentGroups.pending.length },
    { key: 'history', label: 'Historique', count: appointmentGroups.history.length }
  ];

  const visibleAppointments = appointmentGroups[appointmentView] || [];

  const resourceCategories = Object.values(
    resources.reduce((categories, resource) => {
      const category = resource.service || 'Autres ressources';

      if (!categories[category]) {
        categories[category] = { name: category, count: 0 };
      }

      categories[category].count += 1;
      return categories;
    }, {})
  ).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  const searchedResources = resources.filter(resource => {
    const query = resourceSearchQuery.toLowerCase().trim();
    if (!query) return true;

    return (
      resource.titre?.toLowerCase().includes(query) ||
      resource.description?.toLowerCase().includes(query)
    );
  });

  const filteredResources = resources.filter(resource => {
    const category = resource.service || 'Autres ressources';
    return !selectedResourceCategory || category === selectedResourceCategory;
  });

  const unreadNotifications = notifications.filter((notification) => notification.lu === false).length;
  const unreadAppointmentNotifications = notifications.filter((notification) => (
    notification.lu === false && notification.type?.startsWith('appointment_')
  )).length;

  const openAppointmentsTab = async () => {
    setActiveTab('rendez-vous');

    const appointmentNotifications = notifications.filter((notification) => (
      notification.lu === false && notification.type?.startsWith('appointment_')
    ));

    if (appointmentNotifications.length === 0) return;

    setNotifications((prev) => prev.map((notification) => (
      notification.type?.startsWith('appointment_') ? { ...notification, lu: true } : notification
    )));

    try {
      await markPatientNotificationsAsRead('appointment_');
      const refreshedNotifications = await getPatientNotifications().catch(() => null);
      if (refreshedNotifications) setNotifications(refreshedNotifications);
    } catch (err) {
      console.error('Erreur lecture notifications rendez-vous:', err);
      const refreshedNotifications = await getPatientNotifications().catch(() => null);
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
      await markPatientNotificationsAsRead();
      const refreshedNotifications = await getPatientNotifications().catch(() => null);
      if (refreshedNotifications) setNotifications(refreshedNotifications);
    } catch (err) {
      console.error('Erreur lecture notifications:', err);
      const refreshedNotifications = await getPatientNotifications().catch(() => null);
      if (refreshedNotifications) setNotifications(refreshedNotifications);
    }
  };


  // Déconnexion
  const handleLogout = () => {
    localStorage.removeItem('patient_token');
    navigate('/patient/login');
  };



  const handleAcceptProposal = async (proposal) => {
    await Swal.fire({
      title: 'Confirmer ce créneau ?',
      html: `
        <div style="text-align:center;line-height:1.6">
          <strong>${proposal.date_proposition} à ${proposal.heure_proposition}</strong><br />
          Ce rendez-vous sera confirmé avec ce nouvel horaire.
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Valider le créneau',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#2f8f6b',
      cancelButtonColor: '#587269',
      background: '#ffffff',
      color: '#17332a',
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading(),
      customClass: {
        popup: 'paxcare-swal-popup',
        confirmButton: 'paxcare-swal-confirm',
        cancelButton: 'paxcare-swal-cancel'
      },
      preConfirm: async () => {
        try {
          await acceptAppointmentProposal(proposal.id_proposition);
          const updatedAppointments = await getPatientAppointments();
          setAppointments(updatedAppointments);

          Swal.hideLoading();
          Swal.update({
            title: 'Rendez-vous confirmé',
            html: 'Le créneau a bien été validé.',
            icon: 'success',
            showCancelButton: false,
            showConfirmButton: true,
            confirmButtonText: 'Fermer',
            confirmButtonColor: '#2f8f6b',
            color: '#17332a',
            preConfirm: undefined,
            allowOutsideClick: true
          });

          return false;
        } catch (err) {
          Swal.showValidationMessage(err.message || 'Erreur lors de l’acceptation du créneau');
          return false;
        }
      }
    });
  };


  const handleDownloadResource = async (resource) => {
    try {
      const blob = await downloadResource(resource.id_ressource);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = resource.fichier_nom || `${resource.titre}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message || 'Erreur lors du téléchargement');
    }
  };

  // Annuler un RDV
  const handleCancelAppointment = async (id_rdv) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
      return;
    }

    try {
      await cancelAppointment(id_rdv);
      // Recharger les RDV
      const updatedAppointments = await getPatientAppointments();
      setAppointments(updatedAppointments);
      alert('Rendez-vous annulé avec succès');
    } catch (err) {
      console.error('Erreur annulation:', err);
      alert('Erreur lors de l\'annulation');
    }
  };

  // Loading screen
  if (loading) {
    return (
      <div className="loading-screen">
        <Loader size={48} className="spinner" />
        <p>Chargement de votre espace...</p>
      </div>
    );
  }

  return (
    <div className="patient-dashboard">
      {/* ========== SIDEBAR ========== */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Heart size={32} />
          </div>
          <div>
            <div className="sidebar-brand-name">Accompagnement</div>
            <div className="sidebar-brand-sub">Santé 83</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'accueil' ? 'active' : ''}`}
            onClick={() => setActiveTab('accueil')}
          >
            <TrendingUp size={20} />
            Accueil
          </button>

          <button
            className={`nav-item ${activeTab === 'trouver' ? 'active' : ''}`}
            onClick={() => setActiveTab('trouver')}
          >
            <Search size={20} />
            Trouver un expert
          </button>

          <button
            className={`nav-item ${activeTab === 'rendez-vous' ? 'active' : ''}`}
            onClick={openAppointmentsTab}
          >
            <Calendar size={20} />
            <span className="nav-label">Mes rendez-vous</span>
            {unreadAppointmentNotifications > 0 && (
              <span className="nav-notification-badge">{unreadAppointmentNotifications}</span>
            )}
          </button>

          <button
            className={`nav-item ${activeTab === 'ressources' ? 'active' : ''}`}
            onClick={() => setActiveTab('ressources')}
          >
            <BookOpen size={20} />
            Ressources
          </button>

          <button
            className={`nav-item ${activeTab === 'profil' ? 'active' : ''}`}
            onClick={() => setActiveTab('profil')}
          >
            <User size={20} />
            Mon profil
          </button>
        </nav>

        <button className="sidebar-logout" onClick={handleLogout}>
          <LogOut size={20} />
          Déconnexion
        </button>
      </div>

      {/* ========== MAIN CONTENT ========== */}
      <div className="dashboard-main">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-welcome">
            <h1>Bonjour {profile?.prenom || 'Patient'} </h1>
            <p>Bienvenue sur votre espace personnel</p>
          </div>

          <div className="header-actions">
            <button
              className="header-btn"
              type="button"
              aria-label="Notifications"
              onClick={handleNotificationsClick}
            >
              <Bell size={20} />
              {unreadNotifications > 0 && (
                <span className="notification-badge">{unreadNotifications}</span>
              )}
            </button>

            <div className="header-profile">
              <div className="profile-avatar">
                {profile?.prenom?.[0]}{profile?.nom?.[0]}
              </div>
              <div>
                <div className="profile-name">{profile?.prenom} {profile?.nom}</div>
                <div className="profile-role">Patient</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="dashboard-content">
          {/* ========== TAB : ACCUEIL ========== */}
          {activeTab === 'accueil' && (
            <div className="tab-content">
              <section className="dashboard-hero">
                <div>
                  <span className="dashboard-kicker">Espace patient</span>
                  <h2>Votre accompagnement, en un coup d’œil.</h2>
                  <p>
                    Retrouvez vos rendez-vous, vos ressources et les actions utiles
                    pour avancer sereinement dans votre parcours.
                  </p>
                </div>
              </section>

              {/* Stats */}
              <div className="stats-grid">
                <div className="stat-card blue">
                  <div className="stat-icon">
                    <Calendar size={28} />
                  </div>
                  <div>
                    <div className="stat-value">{stats.upcomingAppointments}</div>
                    <div className="stat-label">RDV à venir</div>
                  </div>
                </div>

                <div className="stat-card green">
                  <div className="stat-icon">
                    <CheckCircle size={28} />
                  </div>
                  <div>
                    <div className="stat-value">{stats.completedAppointments}</div>
                    <div className="stat-label">RDV terminés</div>
                  </div>
                </div>

                <div className="stat-card purple">
                  <div className="stat-icon">
                    <MessageCircle size={28} />
                  </div>
                  <div>
                    <div className="stat-value">{stats.messages}</div>
                    <div className="stat-label">Messages</div>
                  </div>
                </div>

                <div className="stat-card orange">
                  <div className="stat-icon">
                    <FileText size={28} />
                  </div>
                  <div>
                    <div className="stat-value">{resources.length}</div>
                    <div className="stat-label">Ressources</div>
                  </div>
                </div>
              </div>

              {/* Actions rapides */}
              <div className="section">
                <h2>Actions rapides</h2>
                <div className="quick-actions">
                  <div className="action-card" onClick={() => setActiveTab('trouver')}>
                    <Search size={40} />
                    <h3>Trouver un expert</h3>
                    <p>Recherchez un patient partenaire</p>
                  </div>

                  <div className="action-card" onClick={() => setActiveTab('rendez-vous')}>
                    <Calendar size={40} />
                    <h3>Prendre RDV</h3>
                    <p>Planifiez un rendez-vous</p>
                  </div>

                  <div className="action-card" onClick={() => setActiveTab('ressources')}>
                    <BookOpen size={40} />
                    <h3>Voir ressources</h3>
                    <p>Fiches mémo validées</p>
                  </div>
                </div>
              </div>

              {/* Prochains RDV */}
              <div className="section">
                <h2>Prochains rendez-vous</h2>
                {upcomingAppointments.length === 0 ? (
                  <div className="empty-state">Aucun rendez-vous à venir</div>
                ) : (
                  <div className="appointments-preview">
                    {upcomingAppointments.map((apt) => (
                        <div key={apt.id_rdv} className="appointment-preview-card">
                          <div className="apt-preview-header">
                            <div className="apt-preview-expert">
                              {apt.expert_prenom} {apt.expert_nom}
                            </div>
                            <span className={`status-badge ${apt.statut}`}>
                              {apt.statut === 'confirme' ? 'Confirmé' : 'En attente'}
                            </span>
                          </div>
                          <div className="apt-preview-details">
                            <span>
                              <Calendar size={16} />
                              {apt.date_rdv}
                            </span>
                            <span>
                              <Clock size={16} />
                              {apt.heure_rdv}
                            </span>
                            <span>{apt.mode}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========== TAB : TROUVER UN EXPERT ========== */}
          {activeTab === 'trouver' && (
            <div className="tab-content">
              <div className="section-header">
                <div>
                  <h2>Trouver un patient partenaire</h2>
                  <p>Choisissez une spécialité, puis sélectionnez le patient partenaire adapté.</p>
                </div>
              </div>

              {!selectedExpertCategory ? (
                <div className="expert-categories-grid">
                  {expertCategories.length === 0 ? (
                    <div className="empty-state">
                      Aucune catégorie disponible pour le moment
                    </div>
                  ) : (
                    expertCategories.map((category) => (
                      <button
                        key={category.name}
                        className="expert-category-card"
                        onClick={() => {
                          setSelectedExpertCategory(category.name);
                          setSearchQuery('');
                        }}
                      >
                        <div className="expert-category-icon">
                          <Stethoscope size={28} />
                        </div>
                        <div>
                          <h3>{category.name}</h3>
                          <p>{category.count} patient{category.count > 1 ? 's' : ''} partenaire{category.count > 1 ? 's' : ''}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              ) : (
                <>
                  <div className="expert-category-toolbar">
                    <button
                      className="expert-back-btn"
                      onClick={() => {
                        setSelectedExpertCategory(null);
                        setSearchQuery('');
                      }}
                    >
                      <ArrowLeft size={18} />
                      Catégories
                    </button>
                    <div>
                      <span>Spécialité sélectionnée</span>
                      <strong>{selectedExpertCategory}</strong>
                    </div>
                  </div>

                  <div className="search-filters">
                    <div className="search-bar">
                      <Search size={20} />
                      <input
                        type="text"
                        placeholder="Rechercher un patient partenaire..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="experts-grid">
                    {filteredExperts.length === 0 ? (
                      <div className="empty-state">
                        Aucun patient partenaire trouvé
                      </div>
                    ) : (
                      filteredExperts.map((expert) => (
                        <div key={expert.id_utilisateur} className="expert-card">
                          <div className="expert-avatar">
                            {expert.prenom?.[0]}{expert.nom?.[0]}
                          </div>
                          <div className="expert-info">
                            <h3>{expert.prenom} {expert.nom}</h3>
                            <span className="expert-service">{expert.service}</span>
                            <div className="expert-details">
                              <span>
                                <Clock size={16} />
                                {expert.experience || 'Expert'}
                              </span>
                              <span>
                                <MapPin size={16} />
                                {expert.ville || 'Toulon'}
                              </span>
                            </div>
                          </div>
                          <button
                            className="expert-contact-btn"
                            onClick={() => navigate(`/patient/appointment/${expert.id_utilisateur}`)}
                          >
                            <MessageCircle size={18} />
                            Contacter
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ========== TAB : MES RENDEZ-VOUS ========== */}
          {activeTab === 'rendez-vous' && (
            <div className="tab-content">
              <div className="section-header">
                <div>
                  <h2>Mes rendez-vous</h2>
                  <p>Gérez vos rendez-vous passés et à venir</p>
                </div>
              </div>

              <div className="appointment-tabs">
                {appointmentTabs.map((tab) => (
                  <button
                    key={tab.key}
                    className={`appointment-tab-btn ${appointmentView === tab.key ? 'active' : ''}`}
                    onClick={() => setAppointmentView(tab.key)}
                  >
                    <span>{tab.label}</span>
                    <strong>{tab.count}</strong>
                  </button>
                ))}
              </div>

              <div className="appointments-list">
                {visibleAppointments.length === 0 ? (
                  <div className="empty-state">
                    {appointmentView === 'upcoming' && 'Aucun rendez-vous confirmé à venir'}
                    {appointmentView === 'pending' && 'Aucune demande de rendez-vous en attente'}
                    {appointmentView === 'history' && 'Aucun rendez-vous dans l’historique'}
                  </div>
                ) : (
                  visibleAppointments.map((apt) => (
                    <div key={apt.id_rdv} className="appointment-card">
                      <div className="apt-card-header">
                        <div className="apt-expert">
                          <div className="apt-avatar">
                            {apt.expert_prenom?.[0]}{apt.expert_nom?.[0]}
                          </div>
                          <div>
                            <h3>{apt.expert_prenom} {apt.expert_nom}</h3>
                            <span className="apt-pathology">{apt.service}</span>
                          </div>
                        </div>
                        <span className={`status-badge ${apt.statut}`}>
                          {apt.statut === 'demande' && 'En attente'}
                          {apt.statut === 'confirme' && 'Confirmé'}
                          {apt.statut === 'termine' && 'Terminé'}
                          {apt.statut === 'annule' && 'Annulé'}
                          {apt.statut === 'refuse' && 'Refusé'}
                        </span>
                      </div>

                      <div className="apt-details-grid">
                        <div className="apt-detail">
                          <Calendar size={20} />
                          <div>
                            <div className="apt-detail-label">Date</div>
                            <div className="apt-detail-value">{apt.date_rdv}</div>
                          </div>
                        </div>

                        <div className="apt-detail">
                          <Clock size={20} />
                          <div>
                            <div className="apt-detail-label">Heure</div>
                            <div className="apt-detail-value">{apt.heure_rdv}</div>
                          </div>
                        </div>

                        <div className="apt-detail">
                          <MapPin size={20} />
                          <div>
                            <div className="apt-detail-label">Mode</div>
                            <div className="apt-detail-value">{apt.mode}</div>
                          </div>
                        </div>
                      </div>

                      {apt.statut === 'demande' && apt.propositions?.filter((proposal) => proposal.statut === 'en_attente').length > 0 && (
                        <div className="appointment-proposals">
                          <div className="appointment-proposals-title">
                            Votre patient expert vous propose ces créneaux :
                          </div>
                          <div className="appointment-proposals-list">
                            {apt.propositions
                              .filter((proposal) => proposal.statut === 'en_attente')
                              .map((proposal) => (
                                <button
                                  key={proposal.id_proposition}
                                  className="proposal-choice-btn"
                                  onClick={() => handleAcceptProposal(proposal)}
                                >
                                  <Calendar size={16} />
                                  {proposal.date_proposition} à {proposal.heure_proposition}
                                </button>
                              ))}
                          </div>
                        </div>
                      )}

                      {['demande', 'confirme'].includes(apt.statut) && (
                        <div className="apt-actions">
                          <button
                            className="apt-btn secondary"
                            onClick={() => handleCancelAppointment(apt.id_rdv)}
                          >
                            Annuler
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ========== TAB : RESSOURCES ========== */}
          {activeTab === 'ressources' && (
            <div className="tab-content">
              <div className="section-header">
                <div>
                  <h2>Ressources</h2>
                  <p>Guides et documents pratiques publiés par l’équipe.</p>
                </div>
              </div>

              {!selectedResourceCategory && (
                <div className="search-filters">
                  <div className="search-bar">
                    <Search size={20} />
                    <input
                      type="text"
                      placeholder="Rechercher une ressource..."
                      value={resourceSearchQuery}
                      onChange={(e) => setResourceSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {!selectedResourceCategory && resourceSearchQuery.trim() ? (
                <div className="resources-grid">
                  {searchedResources.length === 0 ? (
                    <div className="empty-state">Aucune ressource trouvée</div>
                  ) : (
                    searchedResources.map((resource) => (
                      <div key={resource.id_ressource} className="resource-card">
                        <div className="resource-icon">
                          <FileText size={24} />
                        </div>
                        <div className="resource-info">
                          <h3>{resource.titre}</h3>
                          {resource.description && (
                            <p className="resource-description">{resource.description}</p>
                          )}
                          <div className="resource-meta">
                            <span className="resource-service">{resource.service}</span>
                            <span className="resource-type">{resource.type}</span>
                          </div>
                          <div className="resource-validation">
                            <CheckCircle size={16} />
                            Validé par {resource.validateur}
                          </div>
                        </div>
                        <button className="resource-download-btn" onClick={() => handleDownloadResource(resource)}>
                          Télécharger
                        </button>
                      </div>
                    ))
                  )}
                </div>
              ) : !selectedResourceCategory ? (
                <div className="resource-categories-grid">
                  {resourceCategories.length === 0 ? (
                    <div className="empty-state">Aucune ressource disponible</div>
                  ) : (
                    resourceCategories.map((category) => (
                      <button
                        key={category.name}
                        className="resource-category-card"
                        onClick={() => {
                          setSelectedResourceCategory(category.name);
                        setResourceSearchQuery('');
                        }}
                      >
                        <div className="resource-category-icon">
                          <FileText size={28} />
                        </div>
                        <div>
                          <h3>{category.name}</h3>
                          <p>{category.count} document{category.count > 1 ? 's' : ''} disponible{category.count > 1 ? 's' : ''}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              ) : (
                <>
                  <div className="resource-category-toolbar">
                    <button
                      className="resource-back-btn"
                      onClick={() => {
                        setSelectedResourceCategory(null);
                      }}
                    >
                      <ArrowLeft size={18} />
                      Catégories
                    </button>
                    <div>
                      <span>Catégorie sélectionnée</span>
                      <strong>{selectedResourceCategory}</strong>
                    </div>
                  </div>

                  <div className="resources-grid">
                    {filteredResources.length === 0 ? (
                      <div className="empty-state">Aucune ressource trouvée</div>
                    ) : (
                      filteredResources.map((resource) => (
                        <div key={resource.id_ressource} className="resource-card">
                          <div className="resource-icon">
                            <FileText size={24} />
                          </div>
                          <div className="resource-info">
                            <h3>{resource.titre}</h3>
                            {resource.description && (
                              <p className="resource-description">{resource.description}</p>
                            )}
                            <div className="resource-meta">
                              <span className="resource-service">{resource.service}</span>
                              <span className="resource-type">{resource.type}</span>
                            </div>
                            <div className="resource-validation">
                              <CheckCircle size={16} />
                              Validé par {resource.validateur}
                            </div>
                          </div>
                          <button className="resource-download-btn" onClick={() => handleDownloadResource(resource)}>
                            Télécharger
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ========== TAB : MON PROFIL ========== */}
          {activeTab === 'profil' && (
            <div className="tab-content">
              <div className="profile-content">
                <div className="profile-section">
                  <h3>Informations personnelles</h3>
                  <div className="profile-grid">
                    <div className="profile-field">
                      <label>Nom</label>
                      <div className="field-value">
                        <User size={18} />
                        {profile?.nom}
                      </div>
                    </div>

                    <div className="profile-field">
                      <label>Prénom</label>
                      <div className="field-value">
                        <User size={18} />
                        {profile?.prenom}
                      </div>
                    </div>

                    <div className="profile-field">
                      <label>Email</label>
                      <div className="field-value">
                        <Mail size={18} />
                        {profile?.email}
                      </div>
                    </div>

                    <div className="profile-field">
                      <label>Téléphone</label>
                      <div className="field-value">
                        <Phone size={18} />
                        {profile?.telephone}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="profile-section">
                  <h3>Préférences</h3>
                  <div className="profile-preferences">
                    <div className="preference-item">
                      <div>
                        <div className="preference-label">Notifications email</div>
                        <div className="preference-desc">Recevoir des emails pour les RDV</div>
                      </div>
                      <label className="toggle">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
