# Deployment Guide - Bihar Election Prediction Calculator

This guide covers deploying your app to AWS with **no database** - just a JSON file for storage.

## Architecture

- **Frontend**: HTML/CSS/JS (hosted on S3 + CloudFront)
- **Backend**: Node.js Express API (hosted on EC2)
- **Storage**: JSON file on EC2
- **Limit**: 3 predictions per IP address

---

## Option 1: Deploy on EC2 (Recommended - Simplest)

### Step 1: Launch EC2 Instance

1. Go to EC2 Console → Launch Instance
2. Choose **Amazon Linux 2** or **Ubuntu 22.04**
3. Instance type: **t2.micro** (free tier eligible)
4. Security Group: Allow ports `22` (SSH), `80` (HTTP), `443` (HTTPS)
5. Create/select a key pair for SSH access

### Step 2: Connect to EC2 and Install Node.js

```bash
# SSH into your instance
ssh -i your-key.pem ec2-user@your-ec2-ip

# Update system
sudo yum update -y  # For Amazon Linux
# OR
sudo apt update && sudo apt upgrade -y  # For Ubuntu

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -  # Amazon Linux
# OR
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -  # Ubuntu

sudo yum install -y nodejs  # Amazon Linux
# OR
sudo apt install -y nodejs  # Ubuntu

# Verify
node --version
npm --version
```

### Step 3: Deploy Backend

```bash
# Create app directory
mkdir -p /home/ec2-user/bihar-election
cd /home/ec2-user/bihar-election

# Upload your backend files (from your local machine)
# Use SCP or create files manually
```

From your **local machine**, upload backend files:
```bash
scp -i your-key.pem -r backend/ ec2-user@your-ec2-ip:/home/ec2-user/bihar-election/
```

Back on EC2:
```bash
cd /home/ec2-user/bihar-election/backend

# Install dependencies
npm install

# Test the server
npm start
# Should see: "Server running on port 3000"
# Press Ctrl+C to stop
```

### Step 4: Setup PM2 (Process Manager)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start your app with PM2
pm2 start server.js --name bihar-election

# Make PM2 start on system reboot
pm2 startup
pm2 save

# Check status
pm2 status
pm2 logs bihar-election
```

### Step 5: Setup Nginx as Reverse Proxy

```bash
# Install Nginx
sudo yum install -y nginx  # Amazon Linux
# OR
sudo apt install -y nginx  # Ubuntu

# Create Nginx config
sudo nano /etc/nginx/conf.d/bihar-election.conf
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # Or use EC2 public IP

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Step 6: Deploy Frontend to S3

```bash
# From your local machine, upload frontend files
aws s3 sync . s3://your-bucket-name/ \
    --exclude "backend/*" \
    --exclude ".git/*" \
    --exclude "*.md" \
    --include "index.html" \
    --include "*.jpg" \
    --include "config.js"

# Make bucket public (or use CloudFront)
aws s3 website s3://your-bucket-name/ \
    --index-document index.html
```

### Step 7: Update Frontend Config

Edit `config.js` to point to your backend:
```javascript
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000'
    : 'http://your-ec2-public-ip';  // Or your domain

const API_ENDPOINTS = {
    getAllPredictions: `${API_BASE_URL}/api/predictions`,
    getPredictionCount: `${API_BASE_URL}/api/predictions/count`,
    addPrediction: `${API_BASE_URL}/api/predictions`,
    deletePrediction: (id) => `${API_BASE_URL}/api/predictions/${id}`
};
```

Upload the updated `config.js`:
```bash
aws s3 cp config.js s3://your-bucket-name/config.js
```

---

## Option 2: Deploy Backend on Lambda (Serverless)

This is more complex but cheaper for low traffic.

### Step 1: Install Serverless Framework

```bash
npm install -g serverless
```

### Step 2: Create serverless.yml in backend folder

```yaml
service: bihar-election-api

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  environment:
    PREDICTIONS_BUCKET: bihar-predictions-bucket

functions:
  api:
    handler: lambda.handler
    events:
      - http:
          path: /{proxy+}
          method: any
          cors: true

resources:
  Resources:
    PredictionsBucket:
      Type: AWS::S3::Bucket
      Properties:
        BucketName: bihar-predictions-bucket
```

### Step 3: Create Lambda Handler

Create `backend/lambda.js`:
```javascript
const serverless = require('serverless-http');
const express = require('express');
const app = require('./server');  // Your Express app

module.exports.handler = serverless(app);
```

### Step 4: Deploy

```bash
cd backend
serverless deploy
```

---

## Testing

### Test Backend API

```bash
# Health check
curl http://your-backend-url/health

# Get predictions
curl http://your-backend-url/api/predictions

# Get count
curl http://your-backend-url/api/predictions/count

# Add prediction
curl -X POST http://your-backend-url/api/predictions \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","nda":30,"mgb":20,"others":50}'
```

### Test Frontend

1. Open frontend URL in browser
2. Adjust sliders
3. Add a prediction
4. Refresh page - predictions should persist
5. Try adding 4 predictions - should be blocked after 3

---

## Cost Estimate (AWS)

- **EC2 t2.micro**: Free tier (1 year), then ~$8/month
- **S3 Storage**: ~$0.023/GB + requests
- **CloudFront**: ~$0.085/GB (first 10TB)
- **Total for 100 users**: ~$10-15/month

---

## Monitoring

```bash
# Check PM2 logs
pm2 logs bihar-election

# Check Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Check backend status
pm2 status

# Restart if needed
pm2 restart bihar-election
```

---

## Backup Predictions

```bash
# Backup JSON file
cd /home/ec2-user/bihar-election/backend
cp predictions.json predictions.backup.$(date +%Y%m%d).json

# Or setup automatic daily backups
echo "0 0 * * * cp /home/ec2-user/bihar-election/backend/predictions.json /home/ec2-user/bihar-election/backend/predictions.backup.\$(date +\%Y\%m\%d).json" | crontab -
```

---

## Troubleshooting

### Backend not starting
```bash
pm2 logs bihar-election
# Check for port conflicts, missing dependencies
```

### CORS errors
- Make sure CORS is enabled in server.js
- Check that API_BASE_URL in config.js is correct

### Predictions not saving
```bash
# Check file permissions
ls -la /home/ec2-user/bihar-election/backend/predictions.json
chmod 644 predictions.json
```

### Can't reach backend from frontend
- Check EC2 security group allows inbound traffic on port 80
- Check Nginx is running: `sudo systemctl status nginx`
- Check backend is running: `pm2 status`

---

## Security Notes

1. **HTTPS**: Use AWS Certificate Manager + CloudFront for SSL
2. **Rate Limiting**: Consider adding rate limiting middleware
3. **IP Validation**: Backend already tracks IPs
4. **Backup**: Setup automated S3 backups for predictions.json

---

## Quick Start (Local Development)

```bash
# Terminal 1 - Start backend
cd backend
npm install
npm start

# Terminal 2 - Test frontend
cd ..
python3 -m http.server 8000
# Open http://localhost:8000

# Update config.js to use localhost:3000
```

