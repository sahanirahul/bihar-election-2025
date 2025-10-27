# Bihar Election Backend API

Simple Node.js Express API for storing and retrieving election predictions.

## Features

- RESTful API for predictions
- JSON file storage (no database required)
- IP-based rate limiting (3 predictions per IP)
- CORS enabled for cross-origin requests
- Simple and lightweight

## Installation

```bash
npm install
```

## Running

### Development
```bash
npm start
```

### Production with PM2
```bash
npm install -g pm2
pm2 start server.js --name bihar-election
pm2 save
pm2 startup
```

## API Endpoints

### GET /health
Health check endpoint

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-27T10:00:00.000Z"
}
```

### GET /api/predictions
Get all predictions

**Response:**
```json
{
  "predictions": [
    {
      "id": 1698765432100,
      "name": "User Name",
      "nda": 30,
      "mgb": 20,
      "others": 50,
      "timestamp": "2025-10-27T10:00:00.000Z"
    }
  ]
}
```

### GET /api/predictions/count
Get prediction count for current IP

**Response:**
```json
{
  "count": 2,
  "max": 3,
  "remaining": 1
}
```

### POST /api/predictions
Add a new prediction

**Request:**
```json
{
  "name": "User Name",
  "nda": 30,
  "mgb": 20,
  "others": 50
}
```

**Response:**
```json
{
  "prediction": {
    "id": 1698765432100,
    "name": "User Name",
    "nda": 30,
    "mgb": 20,
    "others": 50,
    "timestamp": "2025-10-27T10:00:00.000Z"
  }
}
```

**Errors:**
- `400 Bad Request`: Invalid input
- `429 Too Many Requests`: Max 3 predictions per IP reached

### DELETE /api/predictions/:id
Delete a prediction (only if it belongs to your IP)

**Response:**
```json
{
  "message": "Prediction deleted successfully"
}
```

**Errors:**
- `403 Forbidden`: Not your prediction
- `404 Not Found`: Prediction not found

## Testing

```bash
# Make test script executable
chmod +x test-api.sh

# Run tests (make sure server is running first)
./test-api.sh
```

## Configuration

### Port
Default: `3000`
Change via environment variable:
```bash
PORT=8080 npm start
```

### Predictions File
Default: `predictions.json` in backend directory
The file is created automatically on first run.

## Data Structure

The `predictions.json` file structure:
```json
{
  "predictions": [
    {
      "id": 1698765432100,
      "name": "User Name",
      "nda": 30,
      "mgb": 20,
      "others": 50,
      "ip": "192.168.1.1",
      "timestamp": "2025-10-27T10:00:00.000Z"
    }
  ]
}
```

**Note:** IP addresses are stored but never sent to the frontend.

## Security

- **IP-based rate limiting**: 3 predictions per IP
- **Input validation**: All inputs are validated
- **CORS enabled**: Frontend can access API from any domain
- **Delete protection**: Users can only delete their own predictions

## Backup

It's recommended to backup `predictions.json` regularly:

```bash
# Manual backup
cp predictions.json predictions.backup.$(date +%Y%m%d).json

# Automated daily backup (crontab)
0 0 * * * cp /path/to/predictions.json /path/to/predictions.backup.$(date +\%Y\%m\%d).json
```

## Troubleshooting

### Port already in use
```bash
# Find process using port 3000
lsof -i :3000
# Kill it
kill -9 <PID>
```

### Permissions error on predictions.json
```bash
chmod 644 predictions.json
```

### Can't write to file
Check that the backend directory is writable and has sufficient disk space.

## Production Deployment

See [../DEPLOYMENT.md](../DEPLOYMENT.md) for production deployment instructions.

