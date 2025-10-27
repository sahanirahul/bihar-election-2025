# Deployment Checklist

Use this checklist to deploy your Bihar Election Calculator to AWS.

## Pre-Deployment

- [ ] You have an AWS account
- [ ] AWS CLI installed and configured (`aws configure`)
- [ ] You have created an EC2 key pair
- [ ] You have the party logo images (nda.jpg, mgb.jpg, jsp.jpg, other.jpg)

## Backend Deployment (EC2)

### EC2 Setup
- [ ] Launch EC2 instance (t2.micro, Amazon Linux 2 or Ubuntu 22.04)
- [ ] Configure Security Group:
  - [ ] Port 22 (SSH) - Your IP only
  - [ ] Port 80 (HTTP) - 0.0.0.0/0
  - [ ] Port 443 (HTTPS) - 0.0.0.0/0 (optional)
- [ ] Note your EC2 Public IP: `___________________`
- [ ] Note your EC2 Public DNS: `___________________`

### Server Setup
- [ ] SSH into EC2: `ssh -i your-key.pem ec2-user@your-ec2-ip`
- [ ] Update system:
  ```bash
  sudo yum update -y  # Amazon Linux
  # OR
  sudo apt update && sudo apt upgrade -y  # Ubuntu
  ```
- [ ] Install Node.js:
  ```bash
  curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
  sudo yum install -y nodejs  # Amazon Linux
  # OR
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt install -y nodejs  # Ubuntu
  ```
- [ ] Verify Node.js: `node --version` (should be v18.x or higher)

### Upload Backend Code
- [ ] Option A - Using SCP (from local machine):
  ```bash
  scp -i your-key.pem -r backend/ ec2-user@your-ec2-ip:~/
  ```
- [ ] Option B - Using Git:
  ```bash
  git clone your-repo-url
  cd your-repo/backend
  ```

### Install Dependencies
- [ ] Navigate to backend: `cd ~/backend`
- [ ] Install packages: `npm install`
- [ ] Test server: `npm start` (Press Ctrl+C to stop)
- [ ] Server should show: "Server running on port 3000"

### Setup PM2
- [ ] Install PM2: `sudo npm install -g pm2`
- [ ] Start app: `pm2 start server.js --name bihar-election`
- [ ] Check status: `pm2 status`
- [ ] Setup auto-restart: `pm2 startup`
- [ ] Run the command PM2 outputs (starts with `sudo`)
- [ ] Save configuration: `pm2 save`
- [ ] Verify logs: `pm2 logs bihar-election`

### Setup Nginx (Recommended)
- [ ] Install Nginx:
  ```bash
  sudo yum install -y nginx  # Amazon Linux
  # OR
  sudo apt install -y nginx  # Ubuntu
  ```
- [ ] Create config: `sudo nano /etc/nginx/conf.d/bihar.conf`
- [ ] Add configuration (see DEPLOYMENT.md)
- [ ] Test config: `sudo nginx -t`
- [ ] Start Nginx: `sudo systemctl start nginx`
- [ ] Enable auto-start: `sudo systemctl enable nginx`
- [ ] Check status: `sudo systemctl status nginx`

### Test Backend
- [ ] Health check: `curl http://localhost:3000/health`
- [ ] From browser: `http://your-ec2-public-ip/health`
- [ ] Should return: `{"status":"ok","timestamp":"..."}`

## Frontend Deployment (S3)

### S3 Bucket Setup
- [ ] Create S3 bucket: `aws s3 mb s3://bihar-election-YOURNAME`
- [ ] Note bucket name: `___________________`
- [ ] Enable static website hosting:
  ```bash
  aws s3 website s3://your-bucket-name/ --index-document index.html
  ```
- [ ] Make bucket public (or use CloudFront):
  ```bash
  aws s3api put-bucket-policy --bucket your-bucket-name --policy file://bucket-policy.json
  ```

### Update Configuration
- [ ] Edit `config.js` locally
- [ ] Update `API_BASE_URL` to: `http://your-ec2-public-ip`
- [ ] Save file

### Upload Files
- [ ] Upload frontend files:
  ```bash
  aws s3 sync . s3://your-bucket-name/ \
      --exclude "backend/*" \
      --exclude ".git/*" \
      --exclude "node_modules/*" \
      --exclude "*.md" \
      --exclude "*.sh"
  ```
- [ ] Verify files:
  ```bash
  aws s3 ls s3://your-bucket-name/
  ```
- [ ] Should see: index.html, config.js, *.jpg files

### Test Frontend
- [ ] Get S3 website URL:
  ```bash
  echo "http://your-bucket-name.s3-website-us-east-1.amazonaws.com"
  ```
- [ ] Note your frontend URL: `___________________`
- [ ] Open in browser
- [ ] Check browser console (F12) for errors

## Integration Testing

### Basic Functionality
- [ ] Page loads without errors
- [ ] All party logos display correctly
- [ ] Sliders work and update percentages
- [ ] 2020 results show correct values
- [ ] 2025 predictions update in real-time
- [ ] Winner badge appears for leading party

### Add Prediction
- [ ] Enter name in input field
- [ ] Adjust sliders to desired values
- [ ] Click "Add Prediction" button
- [ ] Alert shows "Prediction added successfully!"
- [ ] New prediction appears at bottom
- [ ] Button text updates to show remaining predictions

### Persistence
- [ ] Refresh the page (F5 or Cmd+R)
- [ ] Predictions should still be visible
- [ ] Check backend predictions file:
  ```bash
  ssh -i your-key.pem ec2-user@your-ec2-ip "cat ~/backend/predictions.json"
  ```

### Delete Prediction
- [ ] Click "×" button on your prediction
- [ ] Confirm deletion
- [ ] Prediction disappears
- [ ] Button text updates

### IP Limit Testing
- [ ] Add 3 predictions from same browser/device
- [ ] Button should become disabled
- [ ] Text should say "Max 3 Predictions Reached"
- [ ] Try adding 4th prediction - should be blocked

### Multi-Device Testing
- [ ] Open site on different device/browser
- [ ] Should see all predictions from first device
- [ ] Should be able to add 3 more predictions
- [ ] Each device tracked separately by IP

## Optional: CloudFront Setup

### Create Distribution
- [ ] Go to CloudFront console
- [ ] Create distribution
- [ ] Origin domain: Your S3 bucket
- [ ] Default cache behavior: Allow GET, HEAD
- [ ] Price class: Use all edge locations (or select regions)
- [ ] Create distribution
- [ ] Note CloudFront URL: `___________________`
- [ ] Wait for deployment (5-10 minutes)

### Update Config
- [ ] Update `config.js` with CloudFront URL (optional)
- [ ] Re-upload to S3

### Test CloudFront
- [ ] Access via CloudFront URL
- [ ] Should work same as S3 URL
- [ ] Check performance (should be faster)

## Optional: HTTPS Setup

### Request Certificate (ACM)
- [ ] Go to AWS Certificate Manager
- [ ] Request certificate
- [ ] Add your domain name
- [ ] Validate via DNS or Email
- [ ] Wait for "Issued" status

### Update CloudFront
- [ ] Edit CloudFront distribution
- [ ] Add custom SSL certificate
- [ ] Save changes

### Update Config
- [ ] Change API_BASE_URL to `https://` if using HTTPS
- [ ] Re-upload config.js

## Monitoring Setup

### CloudWatch Alarms (Optional)
- [ ] Create CPU utilization alarm (>80%)
- [ ] Create disk space alarm (<10% free)
- [ ] Add SNS topic for email alerts

### Backup Setup
- [ ] Create backup script on EC2:
  ```bash
  echo '#!/bin/bash
  cp ~/backend/predictions.json ~/backend/predictions.backup.$(date +%Y%m%d).json
  aws s3 cp ~/backend/predictions.json s3://your-backup-bucket/predictions-$(date +%Y%m%d).json
  ' > ~/backup.sh
  chmod +x ~/backup.sh
  ```
- [ ] Add to crontab: `crontab -e`
- [ ] Add line: `0 0 * * * /home/ec2-user/backup.sh`

## Post-Deployment

### Documentation
- [ ] Update README.md with your URLs
- [ ] Document any custom changes
- [ ] Share access info with team

### Share with Users
- [ ] Note your final URL: `___________________`
- [ ] Test from multiple locations/devices
- [ ] Share with initial group of testers
- [ ] Collect feedback

## Troubleshooting

If something doesn't work, check:

**Backend Issues:**
```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs bihar-election

# Check Nginx
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log

# Check if port 3000 is listening
netstat -tulpn | grep 3000
```

**Frontend Issues:**
- [ ] Open browser console (F12)
- [ ] Check for errors
- [ ] Verify config.js has correct URL
- [ ] Try accessing backend directly: `http://your-ec2-ip/api/predictions`

**Connection Issues:**
- [ ] Check EC2 security group allows port 80
- [ ] Check Nginx is running
- [ ] Check PM2 is running
- [ ] Ping EC2 instance: `ping your-ec2-ip`

## Cost Optimization

- [ ] Stop EC2 when not in use (development only)
- [ ] Use CloudWatch to monitor usage
- [ ] Set up billing alerts
- [ ] Review CloudFront cache settings
- [ ] Delete old backups periodically

## Maintenance Schedule

**Daily:**
- [ ] Check PM2 status
- [ ] Review error logs

**Weekly:**
- [ ] Review prediction count/usage
- [ ] Check disk space
- [ ] Review CloudWatch metrics

**Monthly:**
- [ ] Review AWS bill
- [ ] Clean up old backups
- [ ] Update Node.js/packages if needed
- [ ] Review security group rules

---

## Success Criteria

Your deployment is successful when:
- ✅ Frontend loads without errors
- ✅ Backend API responds to health checks
- ✅ Users can add predictions
- ✅ Predictions persist after page refresh
- ✅ IP limiting works (max 3 per IP)
- ✅ Delete functionality works
- ✅ Multiple users can see each other's predictions
- ✅ Page works on mobile devices
- ✅ Performance is acceptable (< 2 second load time)

---

**Deployment Date:** ___________________
**Deployed By:** ___________________
**Frontend URL:** ___________________
**Backend URL:** ___________________
**EC2 Instance ID:** ___________________
**S3 Bucket:** ___________________

🎉 **Congratulations! Your Bihar Election Calculator is live!**

