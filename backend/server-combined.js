const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3000;
const MAX_PREDICTIONS_PER_IP = parseInt(process.env.MAX_PREDICTIONS_PER_IP) || 5;

// MySQL Connection Configuration
const dbConfig = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000
};

// Validate required environment variables
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars.join(', '));
    console.error('Please set the following environment variables:');
    console.error('  DB_HOST - MySQL hostname');
    console.error('  DB_USER - MySQL username');
    console.error('  DB_PASSWORD - MySQL password');
    console.error('  DB_NAME - MySQL database name');
    console.error('  DB_PORT - MySQL port (optional, default: 3306)');
    console.error('  MAX_PREDICTIONS_PER_IP - Max predictions per IP (optional, default: 5)');
    process.exit(1);
}

// Create MySQL connection pool
let pool;

async function initDatabase() {
    try {
        pool = mysql.createPool(dbConfig);
        
        // Test connection
        const connection = await pool.getConnection();
        console.log('✅ MySQL connected successfully');
        console.log(`📊 Database: ${dbConfig.database}@${dbConfig.host}`);
        connection.release();
        
        // Create table if it doesn't exist
        await pool.query(`
            CREATE TABLE IF NOT EXISTS bihar_election_predictions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                nda_transfer DECIMAL(5,2) NOT NULL,
                mgb_transfer DECIMAL(5,2) NOT NULL,
                others_transfer DECIMAL(5,2) NOT NULL,
                nda_result DECIMAL(5,2) NOT NULL,
                mgb_result DECIMAL(5,2) NOT NULL,
                others_result DECIMAL(5,2) NOT NULL,
                jsp_result DECIMAL(5,2) NOT NULL,
                ip_address VARCHAR(45) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_ip_address (ip_address),
                INDEX idx_created_at (created_at),
                INDEX idx_name (name)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Database table ready');
        
    } catch (error) {
        console.error('❌ Failed to connect to MySQL:', error.message);
        process.exit(1);
    }
}

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

// Helper function to calculate results (same logic as frontend)
function calculateResults(nda, mgb, others) {
    const BASE_NDA = 41.40;
    const BASE_MGB = 38.75;
    const BASE_OTHERS = 19.85;
    
    const ndaTransfer = nda / 100;
    const mgbTransfer = mgb / 100;
    const othersTransfer = others / 100;
    
    const newNDA = BASE_NDA * (1 - ndaTransfer);
    const newMGB = BASE_MGB * (1 - mgbTransfer);
    const newOthers = BASE_OTHERS * (1 - othersTransfer);
    const newJSP = (BASE_NDA * ndaTransfer) + (BASE_MGB * mgbTransfer) + (BASE_OTHERS * othersTransfer);
    
    return {
        nda_result: parseFloat(newNDA.toFixed(2)),
        mgb_result: parseFloat(newMGB.toFixed(2)),
        others_result: parseFloat(newOthers.toFixed(2)),
        jsp_result: parseFloat(newJSP.toFixed(2))
    };
}

// GET all predictions (with pagination and search)
app.get('/api/predictions', async (req, res) => {
    try {
        // Get query parameters
        const limit = parseInt(req.query.limit) || 20; // Default 20
        const search = req.query.search || '';
        
        let query = `
            SELECT 
                id, name, 
                nda_transfer as nda, 
                mgb_transfer as mgb, 
                others_transfer as others,
                nda_result, mgb_result, others_result, jsp_result,
                created_at as timestamp
            FROM bihar_election_predictions
        `;
        let params = [];
        
        // Add search filter
        if (search) {
            query += ' WHERE name LIKE ?';
            params.push(`%${search}%`);
        }
        
        // Get total count matching search
        const countQuery = search 
            ? 'SELECT COUNT(*) as total FROM bihar_election_predictions WHERE name LIKE ?'
            : 'SELECT COUNT(*) as total FROM bihar_election_predictions';
        const [countResult] = await pool.query(countQuery, search ? [`%${search}%`] : []);
        const filteredTotal = countResult[0].total;
        
        // Get total count (all)
        const [totalCountResult] = await pool.query('SELECT COUNT(*) as total FROM bihar_election_predictions');
        const allTotal = totalCountResult[0].total;
        
        // Order by most recent and apply limit
        query += ' ORDER BY created_at DESC LIMIT ?';
        params.push(limit);
        
        const [predictions] = await pool.query(query, params);
        
        res.json({ 
            predictions,
            total: allTotal, // Total in database
            filtered: filteredTotal, // Total matching search
            showing: predictions.length // Currently returned
        });
    } catch (error) {
        console.error('Error reading predictions:', error);
        res.status(500).json({ error: 'Failed to read predictions' });
    }
});

// GET count for current IP
app.get('/api/predictions/count', async (req, res) => {
    try {
        const clientIP = getClientIP(req);
        const [result] = await pool.query(
            'SELECT COUNT(*) as count FROM bihar_election_predictions WHERE ip_address = ?',
            [clientIP]
        );
        const count = result[0].count;
        res.json({ 
            count, 
            max: MAX_PREDICTIONS_PER_IP, 
            remaining: MAX_PREDICTIONS_PER_IP - count 
        });
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

        // Check IP limit
        const [ipCount] = await pool.query(
            'SELECT COUNT(*) as count FROM bihar_election_predictions WHERE ip_address = ?',
            [clientIP]
        );
        
        if (ipCount[0].count >= MAX_PREDICTIONS_PER_IP) {
            return res.status(429).json({ 
                error: `Maximum ${MAX_PREDICTIONS_PER_IP} predictions per user reached` 
            });
        }

        // Calculate results
        const results = calculateResults(nda, mgb, others);

        // Insert new prediction
        const [insertResult] = await pool.query(
            `INSERT INTO bihar_election_predictions 
            (name, nda_transfer, mgb_transfer, others_transfer, 
             nda_result, mgb_result, others_result, jsp_result, ip_address)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name.trim(),
                nda,
                mgb,
                others,
                results.nda_result,
                results.mgb_result,
                results.others_result,
                results.jsp_result,
                clientIP
            ]
        );

        // Fetch the created prediction
        const [newPrediction] = await pool.query(
            `SELECT id, name, 
                    nda_transfer as nda, 
                    mgb_transfer as mgb, 
                    others_transfer as others,
                    nda_result, mgb_result, others_result, jsp_result,
                    created_at as timestamp
             FROM bihar_election_predictions WHERE id = ?`,
            [insertResult.insertId]
        );

        res.status(201).json({ prediction: newPrediction[0] });
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

        // Check if prediction exists and belongs to this IP
        const [predictions] = await pool.query(
            'SELECT ip_address FROM bihar_election_predictions WHERE id = ?',
            [predictionId]
        );

        if (predictions.length === 0) {
            return res.status(404).json({ error: 'Prediction not found' });
        }

        if (predictions[0].ip_address !== clientIP) {
            return res.status(403).json({ error: 'You can only delete your own predictions' });
        }

        // Delete prediction
        await pool.query('DELETE FROM bihar_election_predictions WHERE id = ?', [predictionId]);

        res.json({ message: 'Prediction deleted successfully' });
    } catch (error) {
        console.error('Error deleting prediction:', error);
        res.status(500).json({ error: 'Failed to delete prediction' });
    }
});

// Health check
app.get('/health', async (req, res) => {
    try {
        // Check database connection
        await pool.query('SELECT 1');
        res.json({ 
            status: 'ok', 
            timestamp: new Date().toISOString(),
            database: 'connected'
        });
    } catch (error) {
        res.status(503).json({ 
            status: 'error', 
            timestamp: new Date().toISOString(),
            database: 'disconnected',
            error: error.message
        });
    }
});

// Serve index.html for root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Initialize database and start server
initDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📱 Frontend: http://localhost:${PORT}`);
        console.log(`🔌 API: http://localhost:${PORT}/api/predictions`);
        console.log(`⚙️  Max predictions per IP: ${MAX_PREDICTIONS_PER_IP}`);
    });
}).catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, closing database connection...');
    if (pool) {
        await pool.end();
    }
    process.exit(0);
});
