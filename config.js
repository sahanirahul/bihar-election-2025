// API Configuration
// Change this to your backend URL after deployment
const API_BASE_URL = 'http://localhost:3000' // Development
// const API_BASE_URL = 'https://your-backend-url.com';  // Production - UPDATE THIS!

const API_ENDPOINTS = {
    getAllPredictions: `${API_BASE_URL}/api/predictions`,
    getPredictionCount: `${API_BASE_URL}/api/predictions/count`,
    addPrediction: `${API_BASE_URL}/api/predictions`,
    deletePrediction: (id) => `${API_BASE_URL}/api/predictions/${id}`
};

