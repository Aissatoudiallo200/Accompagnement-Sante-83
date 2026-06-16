// src/services/patientService.js
import API_URL from '../config/api';

// Helper pour les requêtes authentifiées
const getAuthHeaders = () => {
  const token = localStorage.getItem('patient_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// ========== PROFIL ==========
export const getPatientProfile = async () => {
  const response = await fetch(`${API_URL}/api/patient/profile`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération du profil');
  }
  
  return response.json();
};

export const updatePatientProfile = async (data) => {
  const response = await fetch(`${API_URL}/api/patient/profile`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error('Erreur lors de la mise à jour du profil');
  }
  
  return response.json();
};

// ========== RENDEZ-VOUS ==========
export const getPatientAppointments = async () => {
  const response = await fetch(`${API_URL}/api/appointments/patient`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des rendez-vous');
  }
  
  return response.json();
};

export const createAppointment = async (appointmentData) => {
  const response = await fetch(`${API_URL}/api/appointments`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(appointmentData)
  });
  
  if (!response.ok) {
    throw new Error('Erreur lors de la création du rendez-vous');
  }
  
  return response.json();
};

export const updateAppointment = async (id, data) => {
  const response = await fetch(`${API_URL}/api/appointments/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error('Erreur lors de la modification du rendez-vous');
  }
  
  return response.json();
};

export const cancelAppointment = async (id) => {
  const response = await fetch(`${API_URL}/api/appointments/${id}/cancel`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    throw new Error('Erreur lors de l\'annulation du rendez-vous');
  }
  
  return response.json();
};

// ========== PATIENTS PARTENAIRES (EXPERTS) ==========
export const getAllExperts = async () => {
  const response = await fetch(`${API_URL}/api/experts`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des experts');
  }
  
  return response.json();
};

export const searchExperts = async (query) => {
  const response = await fetch(`${API_URL}/api/experts/search?q=${encodeURIComponent(query)}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    throw new Error('Erreur lors de la recherche');
  }
  
  return response.json();
};

// ========== RESSOURCES ==========
export const getResources = async () => {
  const response = await fetch(`${API_URL}/api/resources`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des ressources');
  }
  
  return response.json();
};

export const downloadResource = async (id) => {
  const response = await fetch(`${API_URL}/api/resources/${id}/download`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    throw new Error('Erreur lors du téléchargement');
  }
  
  return response.blob();
};

// ========== STATISTIQUES ==========
export const getPatientStats = async () => {
  const response = await fetch(`${API_URL}/api/patient/stats`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des statistiques');
  }
  
  return response.json();
};
export const acceptAppointmentProposal = async (proposalId) => {
  const response = await fetch(`${API_URL}/api/appointments/proposals/${proposalId}/accept`, {
    method: 'POST',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Erreur lors de l\'acceptation du créneau');
  }

  return response.json();
};

// ========== NOTIFICATIONS ==========
export const getPatientNotifications = async () => {
  const response = await fetch(`${API_URL}/api/notifications`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des notifications');
  }

  return response.json();
};

export const markPatientNotificationsAsRead = async (typePrefix = null) => {
  const response = await fetch(`${API_URL}/api/notifications/read`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(typePrefix ? { typePrefix } : {})
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la lecture des notifications');
  }

  return response.json();
};
