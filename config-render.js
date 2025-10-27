// API Configuration for Render.com deployment
// Backend and frontend are served from the same URL
const API_BASE_URL = window.location.origin;  // Uses same domain as frontend

const API_ENDPOINTS = {
    getAllPredictions: `${API_BASE_URL}/api/predictions`,
    getPredictionCount: `${API_BASE_URL}/api/predictions/count`,
    addPrediction: `${API_BASE_URL}/api/predictions`,
    deletePrediction: (id) => `${API_BASE_URL}/api/predictions/${id}`
};

