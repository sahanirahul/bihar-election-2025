# 🚀 Quick Start - MySQL Migration

## ✅ What Changed
Your app now uses **MySQL database** instead of JSON files. This means:
- ✅ Predictions survive container restarts
- ✅ No data loss when Render sleeps/wakes
- ✅ Better performance and concurrent access

---

## 🎯 What You Need to Do

### 1️⃣ Setup MySQL (Choose One):

#### **Option A: AWS RDS Free Tier** (Recommended - 20 days)
📖 **Full Guide:** [MYSQL_SETUP.md](./MYSQL_SETUP.md)

**Quick Steps:**
1. Go to [AWS RDS Console](https://console.aws.amazon.com/rds/)
2. Create database → MySQL 8.0 → Free tier template
3. Set DB name: `numenor`
4. Set username: `admin` (or your choice)
5. Set password (save it!)
6. Enable "Public access" ✅
7. Wait 5-10 minutes for creation
8. Configure security group (allow port 3306)
9. Copy the endpoint URL

#### **Option B: Use Existing MySQL**
- Any MySQL 5.7+ or 8.0 server
- Must be accessible from internet (for Render)
- Create database: `numenor`

---

### 2️⃣ Add Environment Variables to Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click your service: `bihar-election-2025`
3. Click **"Environment"** (left sidebar)
4. Click **"Add Environment Variable"** for each:

```
DB_HOST = your-rds-endpoint.us-east-1.rds.amazonaws.com
DB_USER = admin
DB_PASSWORD = your-password
DB_NAME = numenor
DB_PORT = 3306
MAX_PREDICTIONS_PER_IP = 5
```

5. Click **"Save Changes"**
6. Render will auto-deploy

---

### 3️⃣ Push Updated Code to GitHub

```bash
cd /Users/rahulsahani/Desktop/AllData/projects/biharelection_results

# Check changes
git status

# Add all changes
git add .

# Commit
git commit -m "Migrate from JSON to MySQL for data persistence"

# Push
git push origin main
```

Render will auto-deploy the new code.

---

### 4️⃣ Verify It Works

1. **Check Logs:**
   - Render Dashboard → Logs
   - Look for: `✅ MySQL connected successfully`

2. **Test Health:**
   ```bash
   curl https://bihar-election-2025.onrender.com/health
   ```
   Should show: `"database":"connected"`

3. **Test Predictions:**
   - Visit: https://bihar-election-2025.onrender.com/
   - Add a prediction
   - Manually restart service (or wait for auto-sleep)
   - Visit again - prediction should still be there! ✅

---

## 🧪 Test Locally First (Optional)

### With Docker Compose (Easiest):
```bash
# Start MySQL + App
docker-compose up

# Open: http://localhost:3000
# Test predictions

# Stop
docker-compose down
```

### Without Docker:
```bash
# Install MySQL locally or use AWS RDS endpoint

# Set environment variables
export DB_HOST=localhost
export DB_USER=root
export DB_PASSWORD=password
export DB_NAME=numenor

# Install dependencies
cd backend
npm install

# Run
node server-combined.js
```

---

## 📋 Checklist

- [ ] MySQL database created (AWS RDS or other)
- [ ] Security group configured (port 3306 open)
- [ ] Connection details saved (endpoint, user, password)
- [ ] Environment variables added to Render
- [ ] Code pushed to GitHub
- [ ] Render deployed successfully
- [ ] Logs show "MySQL connected successfully"
- [ ] Health endpoint shows "database: connected"
- [ ] Predictions persist after container restart

---

## 🆘 Troubleshooting

### "Missing required environment variables"
- Add all 4 required variables to Render: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`

### "Failed to connect to MySQL"
- Check security group allows port 3306 from anywhere (`0.0.0.0/0`)
- Verify RDS is "Publicly accessible"
- Test connection manually: `mysql -h your-endpoint -u admin -p`

### "Unknown database"
- Database name might be wrong
- Create database: `CREATE DATABASE numenor;`
- Or use different name and update `DB_NAME` env variable

### "Table doesn't exist"
- App creates table automatically on first run
- Check logs for errors
- Or manually run: `backend/init-database.sql`

---

## 📚 Full Documentation

- 📖 [MYSQL_SETUP.md](./MYSQL_SETUP.md) - Complete setup guide
- 📖 [ENV_CONFIG.md](./ENV_CONFIG.md) - Environment variables reference
- 📖 [backend/init-database.sql](./backend/init-database.sql) - Database schema

---

## 💡 Pro Tips

1. **Test locally first** with `docker-compose up`
2. **Keep RDS endpoint secure** - don't share publicly
3. **Backup RDS** before making changes (AWS console)
4. **Monitor costs** - RDS is free for 12 months, then ~$15/month
5. **Delete RDS** after 20 days if experiment is done

---

## ✅ You're Done!

Your app now has persistent storage. No more lost predictions! 🎉

Next: Share your YouTube video and watch the predictions roll in! 📺

