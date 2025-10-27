const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const PREDICTIONS_FILE = path.join(__dirname, 'predictions.json');
const MAX_PREDICTIONS_PER_IP = 3;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (frontend) from parent directory
app.use(express.static(path.join(__dirname, '..')));

// Helper function to get client IP
function getClientIP(req) {
    return req.headers['x-forwarded-for']?.split(',')[0] || 
           req.headers['x-real-ip'] || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress;
}

// Helper function to read predictions
async function readPredictions() {
    try {
        const data = await fs.readFile(PREDICTIONS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            // File doesn't exist, create it
            const initialData = { predictions: [] };
            await fs.writeFile(PREDICTIONS_FILE, JSON.stringify(initialData, null, 2));
            return initialData;
        }
        throw error;
    }
}

// Helper function to write predictions
async function writePredictions(data) {
    await fs.writeFile(PREDICTIONS_FILE, JSON.stringify(data, null, 2));
}

// GET all predictions
app.get('/api/predictions', async (req, res) => {
    try {
        const data = await readPredictions();
        // Don't send IP addresses to frontend
        const predictions = data.predictions.map(({ ip, ...pred }) => pred);
        res.json({ predictions });
    } catch (error) {
        console.error('Error reading predictions:', error);
        res.status(500).json({ error: 'Failed to read predictions' });
    }
});

// GET count for current IP
app.get('/api/predictions/count', async (req, res) => {
    try {
        const clientIP = getClientIP(req);
        const data = await readPredictions();
        const count = data.predictions.filter(p => p.ip === clientIP).length;
        res.json({ count, max: MAX_PREDICTIONS_PER_IP, remaining: MAX_PREDICTIONS_PER_IP - count });
    } catch (error) {
        console.error('Error checking prediction count:', error);
        res.status(500).json({ error: 'Failed to check prediction count' });
    }
});

// POST new prediction
app.post('/api/predictions', async (req, res) => {
    try {
        const clientIP = getClientIP(req);
        const { name, nda, mgb, others } = req.body;

        // Validate input
        if (!name || name.trim().length === 0) {
            return res.status(400).json({ error: 'Name is required' });
        }
        if (name.length > 30) {
            return res.status(400).json({ error: 'Name must be 30 characters or less' });
        }
        if (typeof nda !== 'number' || typeof mgb !== 'number' || typeof others !== 'number') {
            return res.status(400).json({ error: 'Invalid vote transfer values' });
        }
        if (nda < 0 || nda > 100 || mgb < 0 || mgb > 100 || others < 0 || others > 100) {
            return res.status(400).json({ error: 'Vote transfer values must be between 0 and 100' });
        }
        if (nda === 0 && mgb === 0 && others === 0) {
            return res.status(400).json({ error: 'At least one vote transfer must be non-zero' });
        }

        // Read current predictions
        const data = await readPredictions();

        // Check IP limit
        const ipPredictions = data.predictions.filter(p => p.ip === clientIP);
        if (ipPredictions.length >= MAX_PREDICTIONS_PER_IP) {
            return res.status(429).json({ 
                error: `Maximum ${MAX_PREDICTIONS_PER_IP} predictions per user reached` 
            });
        }

        // Create new prediction
        const newPrediction = {
            id: Date.now(),
            name: name.trim(),
            nda,
            mgb,
            others,
            ip: clientIP,
            timestamp: new Date().toISOString()
        };

        // Add and save
        data.predictions.push(newPrediction);
        await writePredictions(data);

        // Return without IP
        const { ip, ...predictionWithoutIP } = newPrediction;
        res.status(201).json({ prediction: predictionWithoutIP });
    } catch (error) {
        console.error('Error adding prediction:', error);
        res.status(500).json({ error: 'Failed to add prediction' });
    }
});

// DELETE prediction
app.delete('/api/predictions/:id', async (req, res) => {
    try {
        const clientIP = getClientIP(req);
        const predictionId = parseInt(req.params.id);

        const data = await readPredictions();
        const predictionIndex = data.predictions.findIndex(p => p.id === predictionId);

        if (predictionIndex === -1) {
            return res.status(404).json({ error: 'Prediction not found' });
        }

        // Check if the prediction belongs to this IP
        if (data.predictions[predictionIndex].ip !== clientIP) {
            return res.status(403).json({ error: 'You can only delete your own predictions' });
        }

        // Remove prediction
        data.predictions.splice(predictionIndex, 1);
        await writePredictions(data);

        res.json({ message: 'Prediction deleted successfully' });
    } catch (error) {
        console.error('Error deleting prediction:', error);
        res.status(500).json({ error: 'Failed to delete prediction' });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve index.html for root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Frontend: http://localhost:${PORT}`);
    console.log(`API: http://localhost:${PORT}/api/predictions`);
    console.log(`Predictions file: ${PREDICTIONS_FILE}`);
});

