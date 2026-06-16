import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  BarChart3,
  CalendarCheck,
  CheckCircle,
  Heart,
  Loader,
  LogOut,
  PieChart,
  ShieldCheck,
  Stethoscope,
  UserCheck,
  Users,
  XCircle,
  FileText,
  Upload,
  Eye,
  Pencil,
  Archive,
} from "lucide-react";
import API_URL from "../config/api";
import "../styles/AdminDashboard.css";

function getAdminHeaders() {
  const token = localStorage.getItem("admin_token");
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

function getAdminAuthHeader() {
  const token = localStorage.getItem("admin_token");
  return { Authorization: `Bearer ${token}` };
}

const emptyStats = {
  users: {
    patients: 0,
    experts: 0,
    pendingExperts: 0,
    activeExperts: 0,
    admins: 0,
  },
  appointments: {
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    refused: 0,
  },
  appointmentModes: {},
  recentAppointments: [],
  recentUsers: [],
};

const statusLabels = {
  demande: "En attente",
  confirme: "Confirmés",
  termine: "Terminés",
  annule: "Annulés",
  refuse: "Refusés",
};

const statusColors = {
  pending: "#f59e0b",
  confirmed: "#2f8f6b",
  completed: "#3b82f6",
  cancelled: "#ef4444",
  refused: "#b42318",
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeAdminTab, setActiveAdminTab] = useState("overview");
  const [pendingExperts, setPendingExperts] = useState([]);
  const [resources, setResources] = useState([]);
  const [resourceForm, setResourceForm] = useState({ titre: "", categorie: "", description: "", statut: "published", file: null });
  const [resourceFilter, setResourceFilter] = useState("all");
  const [editingResourceId, setEditingResourceId] = useState(null);
  const [editingResourceForm, setEditingResourceForm] = useState({ titre: "", categorie: "", description: "", statut: "published" });
  const [stats, setStats] = useState(emptyStats);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => { loadAdminData(); }, []);

  async function loadAdminData() {
    setLoading(true);
    setError("");
    try {
      const [pendingRes, statsRes, resourcesRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/experts/pending`, { headers: getAdminHeaders() }),
        fetch(`${API_URL}/api/admin/stats`, { headers: getAdminHeaders() }),
        fetch(`${API_URL}/api/resources/admin`, { headers: getAdminHeaders() }),
      ]);

      if ([pendingRes.status, statsRes.status, resourcesRes.status].includes(401) || [pendingRes.status, statsRes.status, resourcesRes.status].includes(403)) {
        localStorage.removeItem("admin_token");
        navigate("/admin/login", { replace: true });
        return;
      }

      const pendingData = await pendingRes.json();
      const statsData = await statsRes.json();
      const resourcesData = await resourcesRes.json();

      if (!pendingRes.ok) {
        setError(pendingData.error || "Impossible de charger les demandes.");
        return;
      }

      if (!statsRes.ok) {
        setError(statsData.error || "Impossible de charger les statistiques.");
        return;
      }

      if (!resourcesRes.ok) {
        setError(resourcesData.error || "Impossible de charger les ressources.");
        return;
      }

      setPendingExperts(pendingData);
      setResources(resourcesData);
      setStats({ ...emptyStats, ...statsData });
    } catch {
      setError("Impossible de joindre le serveur.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateResource(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!resourceForm.file) {
      setError("Ajoutez un fichier PDF avant de publier la ressource.");
      return;
    }

    const formData = new FormData();
    formData.append("titre", resourceForm.titre);
    formData.append("categorie", resourceForm.categorie);
    formData.append("description", resourceForm.description);
    formData.append("statut", resourceForm.statut);
    formData.append("file", resourceForm.file);

    setActionLoading("create-resource");
    try {
      const res = await fetch(`${API_URL}/api/resources/admin`, {
        method: "POST",
        headers: getAdminAuthHeader(),
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Impossible d’ajouter la ressource.");
        return;
      }

      setSuccess("Ressource ajoutée avec succès.");
      setResourceForm({ titre: "", categorie: "", description: "", statut: "published", file: null });
      await loadAdminData();
    } catch {
      setError("Impossible de joindre le serveur.");
    } finally {
      setActionLoading(null);
    }
  }

  function startEditingResource(resource) {
    setEditingResourceId(resource.id_ressource);
    setEditingResourceForm({
      titre: resource.titre || "",
      categorie: resource.categorie || "",
      description: resource.description || "",
      statut: resource.statut || "published",
    });
  }

  async function handleUpdateResource(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setActionLoading(`edit-resource-${editingResourceId}`);

    try {
      const res = await fetch(`${API_URL}/api/resources/admin/${editingResourceId}`, {
        method: "PATCH",
        headers: getAdminHeaders(),
        body: JSON.stringify(editingResourceForm),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Impossible de modifier la ressource.");
        return;
      }

      setSuccess("Ressource modifiée.");
      setEditingResourceId(null);
      await loadAdminData();
    } catch {
      setError("Impossible de joindre le serveur.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleResourceStatus(id, statut) {
    setError("");
    setSuccess("");
    setActionLoading(`resource-${id}-${statut}`);
    try {
      const res = await fetch(`${API_URL}/api/resources/admin/${id}/status`, {
        method: "PATCH",
        headers: getAdminHeaders(),
        body: JSON.stringify({ statut }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Impossible de modifier la ressource.");
        return;
      }

      setSuccess(statut === "published" ? "Ressource publiée." : "Ressource masquée.");
      await loadAdminData();
    } catch {
      setError("Impossible de joindre le serveur.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleResourceDownload(resource) {
    setError("");
    setActionLoading(`download-${resource.id_ressource}`);
    try {
      const res = await fetch(`${API_URL}/api/resources/${resource.id_ressource}/download`, {
        headers: getAdminAuthHeader(),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Impossible de télécharger le fichier.");
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = resource.fichier_nom || `${resource.titre}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError("Impossible de joindre le serveur.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDecision(id, action) {
    const isApprove = action === "approve";
    if (!window.confirm(isApprove ? "Valider ce patient partenaire ?" : "Refuser cette demande ?")) return;

    setActionLoading(`${action}-${id}`);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`${API_URL}/api/admin/experts/${id}/${action}`, {
        method: "POST",
        headers: getAdminHeaders(),
        body: JSON.stringify({ motif: "" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Action impossible.");
        return;
      }
      setSuccess(isApprove ? "Patient partenaire validé." : "Demande refusée.");
      await loadAdminData();
    } catch {
      setError("Impossible de joindre le serveur.");
    } finally {
      setActionLoading(null);
    }
  }

  function handleLogout() {
    localStorage.removeItem("admin_token");
    navigate("/admin/login", { replace: true });
  }

  const appointmentStatus = useMemo(() => ([
    { key: "pending", label: "En attente", value: stats.appointments.pending, color: statusColors.pending },
    { key: "confirmed", label: "Confirmés", value: stats.appointments.confirmed, color: statusColors.confirmed },
    { key: "completed", label: "Terminés", value: stats.appointments.completed, color: statusColors.completed },
    { key: "cancelled", label: "Annulés/refusés", value: stats.appointments.cancelled + stats.appointments.refused, color: statusColors.cancelled },
  ]), [stats]);

  const pieGradient = useMemo(() => {
    const total = appointmentStatus.reduce((sum, item) => sum + item.value, 0);
    if (!total) return "conic-gradient(#e5f3ed 0deg 360deg)";

    let cursor = 0;
    const parts = appointmentStatus.map((item) => {
      const start = cursor;
      const degrees = (item.value / total) * 360;
      cursor += degrees;
      return `${item.color} ${start}deg ${cursor}deg`;
    });

    return `conic-gradient(${parts.join(", ")})`;
  }, [appointmentStatus]);

  const maxModeCount = Math.max(1, ...Object.values(stats.appointmentModes || {}));
  const filteredAdminResources = resources.filter((resource) => (
    resourceFilter === "all" ? true : resource.statut === resourceFilter
  ));

  return (
    <main className="admin-dashboard-page">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-brand-logo"><Heart size={24} fill="currentColor" /></span>
          <div><strong>Accompagnement Santé 83</strong><span>Administration</span></div>
        </div>
        <nav className="admin-nav">
          <button className={`admin-nav-item ${activeAdminTab === "overview" ? "active" : "muted"}`} onClick={() => setActiveAdminTab("overview")}><BarChart3 size={20} />Vue globale</button>
          <button className={`admin-nav-item ${activeAdminTab === "resources" ? "active" : "muted"}`} onClick={() => setActiveAdminTab("resources")}><FileText size={20} />Ressources</button>
        </nav>
        <button className="admin-logout" onClick={handleLogout}><LogOut size={18} />Déconnexion</button>
      </aside>

      <section className="admin-main">
        <header className="admin-header">
          <div>
            <span className="admin-kicker">Admin global</span>
            <h1>Tableau de bord administrateur</h1>
            <p>{activeAdminTab === "overview" ? "Suivez l’activité de la plateforme et validez les patients partenaires." : "Ajoutez et publiez les documents visibles côté patient."}</p>
          </div>
          <div className="admin-header-card">
            <ShieldCheck size={22} />
            <div><strong>{pendingExperts.length}</strong><span>demande{pendingExperts.length > 1 ? "s" : ""} en attente</span></div>
          </div>
        </header>

        {error && <div className="admin-alert error">{error}</div>}
        {success && <div className="admin-alert success">{success}</div>}

        {loading ? (
          <section className="admin-panel">
            <div className="admin-loading"><Loader className="admin-spinner" size={34} />Chargement du tableau de bord...</div>
          </section>
        ) : activeAdminTab === "overview" ? (
          <>
            <section className="admin-stats-grid">
              <article className="admin-stat-card">
                <div className="admin-stat-icon patients"><Users size={24} /></div>
                <div><span>Patients inscrits</span><strong>{stats.users.patients}</strong></div>
              </article>
              <article className="admin-stat-card">
                <div className="admin-stat-icon experts"><Stethoscope size={24} /></div>
                <div><span>Patients partenaires</span><strong>{stats.users.experts}</strong></div>
              </article>
              <article className="admin-stat-card">
                <div className="admin-stat-icon appointments"><CalendarCheck size={24} /></div>
                <div><span>Rendez-vous créés</span><strong>{stats.appointments.total}</strong></div>
              </article>
              <article className="admin-stat-card urgent">
                <div className="admin-stat-icon pending"><Activity size={24} /></div>
                <div><span>Experts à valider</span><strong>{stats.users.pendingExperts}</strong></div>
              </article>
            </section>

            <section className="admin-analytics-grid">
              <article className="admin-chart-panel">
                <div className="admin-panel-title">
                  <div><PieChart size={20} /><h2>Répartition des rendez-vous</h2></div>
                  <span>{stats.appointments.total} au total</span>
                </div>
                <div className="admin-pie-wrap">
                  <div className="admin-pie-chart" style={{ background: pieGradient }}>
                    <div><strong>{stats.appointments.total}</strong><span>RDV</span></div>
                  </div>
                  <div className="admin-chart-legend">
                    {appointmentStatus.map((item) => (
                      <div key={item.key} className="admin-legend-row">
                        <span className="admin-legend-dot" style={{ backgroundColor: item.color }}></span>
                        <span>{item.label}</span>
                        <strong>{item.value}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </article>

              <article className="admin-chart-panel">
                <div className="admin-panel-title">
                  <div><BarChart3 size={20} /><h2>Modes de rendez-vous</h2></div>
                  <span>Présentiel / visio</span>
                </div>
                <div className="admin-bars">
                  {Object.entries(stats.appointmentModes || {}).length === 0 ? (
                    <div className="admin-small-empty">Aucun rendez-vous pour le moment</div>
                  ) : (
                    Object.entries(stats.appointmentModes).map(([mode, count]) => (
                      <div key={mode} className="admin-bar-row">
                        <div className="admin-bar-label"><span>{mode === "non_renseigne" ? "Non renseigné" : mode}</span><strong>{count}</strong></div>
                        <div className="admin-bar-track"><span style={{ width: `${(count / maxModeCount) * 100}%` }} /></div>
                      </div>
                    ))
                  )}
                </div>
              </article>
            </section>

            <section className="admin-content-grid">
              <article className="admin-panel admin-panel-flat">
                <div className="admin-panel-title">
                  <div><UserCheck size={20} /><h2>Demandes partenaires</h2></div>
                  <span>{pendingExperts.length} en attente</span>
                </div>

                {pendingExperts.length === 0 ? (
                  <div className="admin-empty compact"><UserCheck size={36} /><h2>Aucune demande en attente</h2><p>Les nouvelles demandes patient partenaire apparaîtront ici.</p></div>
                ) : (
                  <div className="admin-requests">
                    {pendingExperts.map((expert) => (
                      <article key={expert.id_utilisateur} className="admin-request-card">
                        <div className="admin-request-avatar">{expert.nom_complet?.[0] || "P"}</div>
                        <div className="admin-request-info">
                          <h2>{expert.nom_complet}</h2>
                          <p>{expert.email}</p>
                          <div className="admin-request-meta">
                            <span>{expert.telephone}</span>
                            <span>{expert.service || "Service non renseigné"}</span>
                            <span>{expert.date_creation ? new Date(expert.date_creation).toLocaleDateString("fr-FR") : "Date inconnue"}</span>
                          </div>
                        </div>
                        <div className="admin-request-actions">
                          <button className="admin-btn reject" onClick={() => handleDecision(expert.id_utilisateur, "reject")} disabled={Boolean(actionLoading)}>
                            <XCircle size={18} />{actionLoading === `reject-${expert.id_utilisateur}` ? "Refus..." : "Refuser"}
                          </button>
                          <button className="admin-btn approve" onClick={() => handleDecision(expert.id_utilisateur, "approve")} disabled={Boolean(actionLoading)}>
                            <CheckCircle size={18} />{actionLoading === `approve-${expert.id_utilisateur}` ? "Validation..." : "Valider"}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </article>

              <article className="admin-panel admin-panel-flat admin-recent-panel">
                <div className="admin-panel-title">
                  <div><Activity size={20} /><h2>Activité récente</h2></div>
                  <span>5 derniers RDV</span>
                </div>
                <div className="admin-recent-list">
                  {stats.recentAppointments.length === 0 ? (
                    <div className="admin-small-empty">Aucune activité récente</div>
                  ) : stats.recentAppointments.map((appointment) => (
                    <div key={appointment.id_rdv} className="admin-recent-item">
                      <div>
                        <strong>{appointment.patient_name}</strong>
                        <span>avec {appointment.expert_name}</span>
                      </div>
                      <div className="admin-recent-meta">
                        <span>{appointment.date_rdv} à {appointment.heure_rdv}</span>
                        <em>{statusLabels[appointment.statut] || appointment.statut}</em>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </section>
          </>
        ) : (
          <section className="admin-resources-layout">
            <article className="admin-panel admin-panel-flat admin-resource-form-panel">
              <div className="admin-panel-title">
                <div><Upload size={20} /><h2>Ajouter une ressource</h2></div>
                <span>PDF</span>
              </div>

              <form className="admin-resource-form" onSubmit={handleCreateResource}>
                <label>
                  Titre
                  <input
                    type="text"
                    value={resourceForm.titre}
                    onChange={(e) => setResourceForm({ ...resourceForm, titre: e.target.value })}
                    placeholder="Ex : Comprendre son suivi"
                    required
                  />
                </label>

                <label>
                  Catégorie / spécialité
                  <input
                    type="text"
                    value={resourceForm.categorie}
                    onChange={(e) => setResourceForm({ ...resourceForm, categorie: e.target.value })}
                    placeholder="Ex : Cardiologie"
                    required
                  />
                </label>

                <label>
                  Description courte
                  <textarea
                    value={resourceForm.description}
                    onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                    placeholder="Expliquez brièvement à quoi sert cette ressource."
                    rows="4"
                  />
                </label>

                <div className="admin-resource-visibility">
                  <span>Visibilité</span>
                  <div className="admin-segmented-control">
                    <button
                      type="button"
                      className={resourceForm.statut === "published" ? "active" : ""}
                      onClick={() => setResourceForm({ ...resourceForm, statut: "published" })}
                    >
                      Publié
                    </button>
                    <button
                      type="button"
                      className={resourceForm.statut === "draft" ? "active" : ""}
                      onClick={() => setResourceForm({ ...resourceForm, statut: "draft" })}
                    >
                      Brouillon
                    </button>
                  </div>
                </div>

                <label className="admin-file-drop">
                  <FileText size={24} />
                  <span>{resourceForm.file ? resourceForm.file.name : "Glisser ou sélectionner un PDF"}</span>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setResourceForm({ ...resourceForm, file: e.target.files?.[0] || null })}
                    required
                  />
                </label>

                <button className="admin-btn approve admin-resource-submit" disabled={actionLoading === "create-resource"}>
                  <Upload size={18} />
                  {actionLoading === "create-resource" ? "Ajout..." : "Ajouter la ressource"}
                </button>
              </form>
            </article>

            <article className="admin-panel admin-panel-flat">
              <div className="admin-panel-title">
                <div><FileText size={20} /><h2>Ressources</h2></div>
                <span>{filteredAdminResources.length} document{filteredAdminResources.length > 1 ? "s" : ""}</span>
              </div>

              <div className="admin-resource-filters">
                {[
                  { key: "all", label: "Toutes" },
                  { key: "published", label: "Publiées" },
                  { key: "draft", label: "Brouillons" },
                  { key: "archived", label: "Archivées" },
                ].map((filter) => (
                  <button
                    key={filter.key}
                    type="button"
                    className={resourceFilter === filter.key ? "active" : ""}
                    onClick={() => setResourceFilter(filter.key)}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {filteredAdminResources.length === 0 ? (
                <div className="admin-empty compact"><FileText size={36} /><h2>Aucune ressource</h2><p>Les documents ajoutés apparaîtront ici.</p></div>
              ) : (
                <div className="admin-resource-list">
                  {filteredAdminResources.map((resource) => (
                    <div key={resource.id_ressource} className="admin-resource-row">
                      <div className="admin-resource-icon"><FileText size={20} /></div>
                      {editingResourceId === resource.id_ressource ? (
                        <form className="admin-resource-edit-form" onSubmit={handleUpdateResource}>
                          <input
                            value={editingResourceForm.titre}
                            onChange={(e) => setEditingResourceForm({ ...editingResourceForm, titre: e.target.value })}
                            placeholder="Titre"
                            required
                          />
                          <input
                            value={editingResourceForm.categorie}
                            onChange={(e) => setEditingResourceForm({ ...editingResourceForm, categorie: e.target.value })}
                            placeholder="Catégorie"
                            required
                          />
                          <textarea
                            value={editingResourceForm.description}
                            onChange={(e) => setEditingResourceForm({ ...editingResourceForm, description: e.target.value })}
                            placeholder="Description"
                            rows="3"
                          />
                          <div className="admin-resource-edit-actions">
                            <select
                              value={editingResourceForm.statut}
                              onChange={(e) => setEditingResourceForm({ ...editingResourceForm, statut: e.target.value })}
                            >
                              <option value="published">Publié</option>
                              <option value="draft">Brouillon</option>
                              <option value="archived">Archivé</option>
                            </select>
                            <button className="admin-btn reject" type="button" onClick={() => setEditingResourceId(null)}>Annuler</button>
                            <button className="admin-btn approve" type="submit" disabled={actionLoading === `edit-resource-${resource.id_ressource}`}>
                              {actionLoading === `edit-resource-${resource.id_ressource}` ? "Enregistrement..." : "Enregistrer"}
                            </button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <div className="admin-resource-info">
                            <h3>{resource.titre}</h3>
                            <p>{resource.description || "Aucune description"}</p>
                            <div className="admin-request-meta">
                              <span>{resource.categorie}</span>
                              <span>{resource.statut === "published" ? "Publié" : resource.statut === "archived" ? "Archivé" : "Brouillon"}</span>
                              <span>{resource.created_at ? new Date(resource.created_at).toLocaleDateString("fr-FR") : "Date inconnue"}</span>
                            </div>
                          </div>
                          <div className="admin-resource-actions">
                            <button className="admin-btn neutral" type="button" onClick={() => startEditingResource(resource)}>
                              <Pencil size={18} />Modifier
                            </button>
                            {resource.statut !== "archived" && (
                              <button className="admin-btn reject" type="button" onClick={() => handleResourceStatus(resource.id_ressource, resource.statut === "published" ? "draft" : "published")} disabled={Boolean(actionLoading)}>
                                {resource.statut === "published" ? "Masquer" : "Publier"}
                              </button>
                            )}
                            {resource.statut !== "archived" && (
                              <button className="admin-btn reject" type="button" onClick={() => handleResourceStatus(resource.id_ressource, "archived")} disabled={Boolean(actionLoading)}>
                                <Archive size={18} />Archiver
                              </button>
                            )}
                            <button className="admin-btn approve" type="button" onClick={() => handleResourceDownload(resource)} disabled={actionLoading === `download-${resource.id_ressource}`}>
                              <Eye size={18} />{actionLoading === `download-${resource.id_ressource}` ? "Téléchargement..." : "Télécharger"}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </article>
          </section>
        )}
      </section>
    </main>
  );
}
