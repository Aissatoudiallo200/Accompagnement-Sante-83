// src/services/expertService.js
import API_URL from '../config/api';

// Helper pour les requêtes authentifiées
const getAuthHeaders = () => {
  const token = localStorage.getItem('partner_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// ========== PROFIL EXPERT ==========
export const getExpertProfile = async () => {
  const response = await fetch(`${API_URL}/api/expert/profile`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération du profil');
  }
  
  return response.json();
};

// ========== RENDEZ-VOUS ==========
export const getExpertAppointments = async () => {
  const response = await fetch(`${API_URL}/api/appointments/expert`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des rendez-vous');
  }
  
  return response.json();
};

export const acceptAppointment = async (id_rdv) => {
  const response = await fetch(`${API_URL}/api/appointments/${id_rdv}/accept`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    throw new Error('Erreur lors de l\'acceptation');
  }
  
  return response.json();
};

export const refuseAppointment = async (id_rdv, motif = '') => {
  const response = await fetch(`${API_URL}/api/appointments/${id_rdv}/refuse`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ motif })
  });
  
  if (!response.ok) {
    throw new Error('Erreur lors du refus');
  }
  
  return response.json();
};

export const completeAppointment = async (id_rdv) => {
  const response = await fetch(`${API_URL}/api/appointments/${id_rdv}/complete`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    throw new Error('Erreur lors de la finalisation');
  }
  
  return response.json();
};

// ========== STATISTIQUES ==========
export const getExpertStats = async () => {
  const response = await fetch(`${API_URL}/api/expert/stats`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des statistiques');
  }
  
  return response.json();
};

// ========== PATIENTS ==========
export const getMyPatients = async () => {
  const response = await fetch(`${API_URL}/api/expert/patients`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des patients');
  }
  
  return response.json();
};
export const proposeAppointmentSlots = async (id_rdv, proposals) => {
  const response = await fetch(`${API_URL}/api/appointments/${id_rdv}/proposals`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ proposals })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Erreur lors de la proposition de créneaux');
  }

  return response.json();
};

// ========== NOTIFICATIONS ==========
export const getExpertNotifications = async () => {
  const response = await fetch(`${API_URL}/api/notifications`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des notifications');
  }

  return response.json();
};

export const markExpertNotificationsAsRead = async (typePrefix = null) => {
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
