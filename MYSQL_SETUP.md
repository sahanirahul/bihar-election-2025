# 🗄️ MySQL Database Setup Guide

## Overview
Your application now uses MySQL instead of JSON files for persistent data storage. This means predictions won't be lost when the container restarts!

---

## 📋 Prerequisites
- AWS Account
- MySQL database (AWS RDS Free Tier recommended)
- 5-10 minutes

---

## 🚀 Option 1: AWS RDS Free Tier (Recommended)

### Step 1: Create RDS MySQL Database

1. **Go to AWS RDS Console:**
   - https://console.aws.amazon.com/rds/

2. **Create Database:**
   - Click **"Create database"**
   - Choose **"Standard create"**

3. **Engine Options:**
   - Engine type: **MySQL**
   - Version: **MySQL 8.0** (or latest)
   - Templates: **Free tier** ✅

4. **Settings:**
   - DB instance identifier: `bihar-election-db`
   - Master username: `admin` (or your choice)
   - Master password: **Create a strong password** (save this!)
   - Confirm password

5. **DB Instance Class:**
   - Should auto-select **db.t3.micro** (Free tier eligible)

6. **Storage:**
   - Storage type: **General Purpose SSD (gp2)**
   - Allocated storage: **20 GB** (Free tier eligible)
   - Disable storage autoscaling (for free tier)

7. **Connectivity:**
   - ✅ **Important:** Check **"Yes"** for "Public access"
   - VPC security group: Create new or use existing
   - Availability Zone: No preference

8. **Additional Configuration:**
   - Initial database name: **numenor** ✅ (Important!)
   - Backup retention: 1 day (minimum)
   - Disable encryption (for free tier)

9. **Click "Create database"** (takes 5-10 minutes)

### Step 2: Configure Security Group

1. After database is created, click on its name
2. In **"Connectivity & security"** tab, find **"VPC security groups"**
3. Click the security group link
4. Click **"Edit inbound rules"**
5. Click **"Add rule"**:
   - Type: **MySQL/Aurora**
   - Protocol: **TCP**
   - Port: **3306**
   - Source: **Anywhere IPv4** (`0.0.0.0/0`) ⚠️ (for testing)
     - Or better: Specific IP ranges for production
6. Click **"Save rules"**

### Step 3: Get Connection Details

From the RDS dashboard, note:
- **Endpoint:** `bihar-election-db.xxxxx.us-east-1.rds.amazonaws.com`
- **Port:** `3306`
- **Username:** `admin` (or what you set)
- **Password:** (what you set)
- **Database name:** `numenor`

---

## 🗂️ Option 2: Existing MySQL Server

If you already have MySQL:
- Make sure it's accessible from internet (for Render.com)
- Create a new database: `CREATE DATABASE numenor;`
- Create a user with permissions:
  ```sql
  CREATE USER 'biharuser'@'%' IDENTIFIED BY 'yourpassword';
  GRANT ALL PRIVILEGES ON numenor.* TO 'biharuser'@'%';
  FLUSH PRIVILEGES;
  ```

---

## 🎯 Step 4: Initialize Database

### Option A: Automatic (Recommended)
The application automatically creates the table on first run. Just start the server with correct env variables!

### Option B: Manual
```bash
# Connect to your MySQL
mysql -h your-endpoint.rds.amazonaws.com -u admin -p

# Run the init script
source backend/init-database.sql
```

Or use MySQL Workbench and run `backend/init-database.sql`

---

## 🧪 Step 5: Test Locally (Optional)

### With Docker Compose (Easiest):
```bash
# Start MySQL + App together
docker-compose up

# App runs at: http://localhost:3000
# MySQL runs at: localhost:3306

# Stop
docker-compose down
```

### With Existing MySQL:
```bash
# Set environment variables
export DB_HOST=localhost  # or your RDS endpoint
export DB_USER=root
export DB_PASSWORD=yourpassword
export DB_NAME=numenor

# Install dependencies
cd backend
npm install

# Run
node server-combined.js
```

### Test Connection:
```bash
# Health check
curl http://localhost:3000/health

# Should return:
# {"status":"ok","timestamp":"...","database":"connected"}
```

---

## 🚀 Step 6: Deploy to Render.com

1. **Go to Render Dashboard:**
   - https://dashboard.render.com/

2. **Go to your service** (bihar-election-2025)

3. **Click "Environment" tab** (left sidebar)

4. **Add Environment Variables:**
   Click "Add Environment Variable" for each:

   ```
   Key: DB_HOST
   Value: bihar-election-db.xxxxx.us-east-1.rds.amazonaws.com

   Key: DB_USER
   Value: admin

   Key: DB_PASSWORD
   Value: your-mysql-password

   Key: DB_NAME
   Value: numenor

   Key: DB_PORT
   Value: 3306

   Key: MAX_PREDICTIONS_PER_IP
   Value: 5
   ```

5. **Save Changes** - Render will auto-restart

6. **Check Logs:**
   - Click "Logs" tab
   - Should see: `✅ MySQL connected successfully`

---

## ✅ Verification

### Check Health:
```bash
curl https://bihar-election-2025.onrender.com/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2025-10-28T...",
  "database": "connected"
}
```

### Test Adding Prediction:
1. Go to https://bihar-election-2025.onrender.com/
2. Move sliders
3. Add a prediction
4. Restart Render service (or wait for auto-sleep)
5. Visit again - **predictions should still be there!** ✅

---

## 🔍 Troubleshooting

### ❌ "Failed to connect to MySQL"
**Check:**
1. Security group allows port 3306 from anywhere
2. RDS is "Publicly accessible"
3. Endpoint/hostname is correct
4. Username/password are correct
5. Database name is correct

**Test manually:**
```bash
mysql -h your-endpoint.rds.amazonaws.com -u admin -p
# Enter password
# If this works, your credentials are correct
```

### ❌ "Access denied for user"
- Wrong username or password
- User doesn't have permissions
- Check: `GRANT ALL PRIVILEGES ON numenor.* TO 'admin'@'%';`

### ❌ "Unknown database 'numenor'"
- Database wasn't created
- Create it: `CREATE DATABASE numenor;`
- Or set `DB_NAME` to an existing database

### ❌ "Table doesn't exist"
- App creates table automatically
- Or run `backend/init-database.sql` manually

### ❌ Connection timeout
- Security group not configured correctly
- RDS not publicly accessible
- Firewall blocking port 3306

---

## 💰 Cost Estimate

### AWS RDS Free Tier:
- **750 hours/month** of db.t3.micro
- **20 GB storage**
- **Free for 12 months**

### After Free Tier:
- **~$15-20/month** for db.t3.micro
- Can delete when done (within 20 days)

### Alternative Free Options:
- **PlanetScale** (Free tier with MySQL-compatible DB)
- **Railway.app** (Free $5/month credit)
- **Clever Cloud** (Free MySQL 256MB)

---

## 🎉 Benefits Over JSON File

| Feature | JSON File | MySQL |
|---------|-----------|-------|
| Data persistence | ❌ Lost on restart | ✅ Permanent |
| Concurrent writes | ⚠️ Risk of corruption | ✅ Safe |
| Query performance | ❌ Slow (full scan) | ✅ Fast (indexed) |
| Scalability | ❌ Limited | ✅ Excellent |
| Data integrity | ⚠️ Manual | ✅ ACID guarantees |
| Backup | ❌ Manual | ✅ Automated |
| Search | ❌ Slow | ✅ Fast (indexes) |

---

## 📚 Next Steps

1. ✅ Create RDS MySQL database
2. ✅ Configure security group
3. ✅ Get connection details
4. ✅ Add env variables to Render
5. ✅ Deploy and test
6. 🎉 Your predictions are now persistent!

---

## 🆘 Need Help?

- AWS RDS docs: https://docs.aws.amazon.com/rds/
- MySQL docs: https://dev.mysql.com/doc/
- Check logs: `Render Dashboard > Your Service > Logs`

