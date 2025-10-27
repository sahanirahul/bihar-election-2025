# Quick Start Guide

Get the Bihar Election Calculator running in 5 minutes!

## For Local Testing

### 1. Start the Backend

```bash
cd backend
npm install
npm start
```

You should see: `Server running on port 3000`

### 2. Open the Frontend

Simply open `index.html` in your web browser, or use a local server:

```bash
# From project root
python3 -m http.server 8000
```

Then visit: `http://localhost:8000`

### 3. Test It!

1. Move the sliders to set vote transfer percentages
2. Enter your name (e.g., "User1's prediction")
3. Click "Add Prediction"
4. Your prediction should appear at the bottom!
5. Refresh the page - your prediction persists!

---

## For AWS Deployment

### Quick Deploy (5 Steps)

1. **Launch EC2 Instance** (t2.micro, Amazon Linux 2)
   - Security Group: Allow ports 22, 80

2. **SSH and Setup**
```bash
ssh -i your-key.pem ec2-user@your-ec2-ip

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs git

# Clone or upload your code
git clone <your-repo> bihar-election
# OR upload via SCP from local machine:
# scp -i your-key.pem -r . ec2-user@your-ec2-ip:~/bihar-election/
```

3. **Start Backend**
```bash
cd bihar-election/backend
npm install

# Install PM2
sudo npm install -g pm2

# Start with PM2
pm2 start server.js --name bihar-election
pm2 startup
pm2 save
```

4. **Setup Nginx** (Optional but recommended)
```bash
sudo yum install -y nginx

# Create config
sudo nano /etc/nginx/conf.d/bihar.conf
```

Add:
```nginx
server {
    listen 80;
    server_name _;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

5. **Update Frontend Config**

Edit `config.js`:
```javascript
const API_BASE_URL = 'http://your-ec2-public-ip';
```

Upload to S3:
```bash
# From local machine
aws s3 sync . s3://your-bucket-name/ \
    --exclude "backend/*" \
    --exclude ".git/*" \
    --include "index.html" \
    --include "*.jpg" \
    --include "config.js"
```

**Done!** Visit your S3 bucket URL or CloudFront distribution.

---

## Testing the API

```bash
# Health check
curl http://localhost:3000/health

# Get predictions
curl http://localhost:3000/api/predictions

# Add prediction
curl -X POST http://localhost:3000/api/predictions \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","nda":30,"mgb":20,"others":50}'
```

---

## Troubleshooting

### Backend won't start
```bash
# Check if port 3000 is in use
lsof -i :3000

# Check logs
pm2 logs bihar-election
```

### Frontend can't connect to backend
1. Check `config.js` has correct backend URL
2. Check CORS is enabled (it is by default)
3. Check EC2 security group allows inbound on port 80
4. Check browser console for errors (F12)

### Predictions not saving
```bash
# Check file permissions
ls -la backend/predictions.json
chmod 644 backend/predictions.json
```

---

## Next Steps

- [Full Deployment Guide](DEPLOYMENT.md)
- [Backend API Documentation](backend/README.md)
- [Main README](README.md)

---

## Support

For issues, check:
1. Browser console (F12) for frontend errors
2. `pm2 logs bihar-election` for backend errors
3. Nginx logs: `/var/log/nginx/error.log`

Common fixes:
- Clear browser cache
- Restart backend: `pm2 restart bihar-election`
- Check firewall/security groups
- Verify Node.js version: `node --version` (should be 14+)

