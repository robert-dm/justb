// API Base URL
const API_URL = window.location.origin + '/api';

// Get auth token
function getToken() {
  return localStorage.getItem('token');
}

// Set auth token
function setToken(token) {
  localStorage.setItem('token', token);
}

// Remove auth token
function removeToken() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

// Get current user
function getUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

// Set current user
function setUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

// Check if user is authenticated
function isAuthenticated() {
  return !!getToken();
}

// API request helper
async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

// Logout function
function logout() {
  removeToken();
  window.location.href = '/';
}

// Update navigation based on auth status
function updateNavigation() {
  const navLinks = document.querySelector('.nav-links');
  if (!navLinks) return;

  const user = getUser();

  if (isAuthenticated() && user) {
    navLinks.innerHTML = `
      <li><a href="/providers">Find Breakfast</a></li>
      <li><a href="/bookings">My Bookings</a></li>
      ${user.role === 'provider' ? '<li><a href="/dashboard">Dashboard</a></li>' : ''}
      <li><a href="/profile">${user.name}</a></li>
      <li><a href="#" onclick="logout(); return false;" class="btn btn-outline">Logout</a></li>
    `;
  } else {
    navLinks.innerHTML = `
      <li><a href="/providers">Find Breakfast</a></li>
      <li><a href="/login">Login</a></li>
      <li><a href="/register" class="btn btn-primary">Sign Up</a></li>
    `;
  }
}

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

// Format date
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Format time
function formatTime(timeString) {
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

// Show error message
function showError(message, containerId = 'error-container') {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = `<div class="error-message">${message}</div>`;
    container.classList.remove('hidden');
  } else {
    alert(message);
  }
}

// Show success message
function showSuccess(message, containerId = 'success-container') {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = `<div class="success-message">${message}</div>`;
    container.classList.remove('hidden');
  }
}

// Hide message
function hideMessage(containerId) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = '';
    container.classList.add('hidden');
  }
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Get user's location
function getUserLocation() {
  return new Promise((resolve, reject) => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        position => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        error => {
          reject(error);
        }
      );
    } else {
      reject(new Error('Geolocation not supported'));
    }
  });
}

// Initialize app on page load
document.addEventListener('DOMContentLoaded', () => {
  updateNavigation();
});
