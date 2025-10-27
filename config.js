// API Configuration
// Automatically detects the correct URL based on environment

const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000'  // Local development
    : window.location.origin;   // Production (Render.com) - uses same URL as frontend

const API_ENDPOINTS = {
    getAllPredictions: `${API_BASE_URL}/api/predictions`,
    getPredictionCount: `${API_BASE_URL}/api/predictions/count`,
    addPrediction: `${API_BASE_URL}/api/predictions`,
    deletePrediction: (id) => `${API_BASE_URL}/api/predictions/${id}`
};

