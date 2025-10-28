# 🏠 Local Development Setup

## Quick Start - 3 Steps

### Step 1: Edit the `.env` File

I've created a `.env` file for you. Open it and **replace the placeholder values** with your actual AWS RDS credentials:

```bash
# Open in your text editor
open .env

# Or use nano/vim
nano .env
```

**Replace these values:**
```env
DB_HOST=your-rds-endpoint.us-east-1.rds.amazonaws.com  # ← Replace with your RDS endpoint
DB_USER=admin                                           # ← Replace with your username
DB_PASSWORD=your-password                               # ← Replace with your password
DB_NAME=numenor                                         # ✅ Already correct
DB_PORT=3306                                            # ✅ Already correct
```

**Example (what it should look like after editing):**
```env
DB_HOST=numenor.xxxxxx.us-east-1.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD=MySecurePassword123!
DB_NAME=numenor
DB_PORT=3306
MAX_PREDICTIONS_PER_IP=5
PORT=3000
```

**Save and close the file.**

---

### Step 2: Run the App

```bash
# Make sure you're in the project directory
cd /Users/rahulsahani/Desktop/AllData/projects/biharelection_results

# Run the start script (it will auto-load .env file)
./start-dev.sh
```

You should see:
```
========================================
Bihar Election Calculator - Dev Mode
========================================

📄 Loading environment variables from .env file...
✅ Environment variables loaded

📊 Database Configuration:
   Host: numenor.xxxxx.us-east-1.rds.amazonaws.com
   Database: numenor
   User: admin
   Port: 3306

🚀 Starting backend server on port 3000...
✅ Backend started successfully
```

---

### Step 3: Open in Browser

```
http://localhost:3000
```

**Test it:**
1. Move the sliders
2. Add a prediction
3. Check if it saves!

---

## 🛑 To Stop the Server

Press `Ctrl+C` or:
```bash
# If you know the PID
kill <PID>
```

---

## 🔄 Alternative Methods (If `.env` doesn't work)

### Option A: Export in Terminal (Temporary)

```bash
# Set environment variables (valid for current terminal session only)
export DB_HOST="numenor.xxxxx.us-east-1.rds.amazonaws.com"
export DB_USER="admin"
export DB_PASSWORD="your-password"
export DB_NAME="numenor"
export DB_PORT="3306"

# Then run
cd backend
node server-combined.js
```

### Option B: Inline with Command

```bash
DB_HOST="your-host" DB_USER="admin" DB_PASSWORD="your-pass" DB_NAME="numenor" node backend/server-combined.js
```

### Option C: Create Shell Script

Create `run-local.sh`:
```bash
#!/bin/bash
export DB_HOST="numenor.xxxxx.us-east-1.rds.amazonaws.com"
export DB_USER="admin"
export DB_PASSWORD="your-password"
export DB_NAME="numenor"
export DB_PORT="3306"
export MAX_PREDICTIONS_PER_IP=5

cd backend
node server-combined.js
```

Then:
```bash
chmod +x run-local.sh
./run-local.sh
```

---

## ✅ Verification Checklist

- [ ] `.env` file created with correct values
- [ ] All placeholders replaced (no "your-" values left)
- [ ] RDS security group allows your IP (or 0.0.0.0/0)
- [ ] RDS is "Publicly accessible"
- [ ] `./start-dev.sh` runs without errors
- [ ] Browser shows app at http://localhost:3000
- [ ] Health check works: http://localhost:3000/health
- [ ] Can add predictions and they save

---

## 🆘 Troubleshooting

### ❌ "Missing required environment variables"
**Problem:** `.env` file not found or not loaded

**Solution:**
```bash
# Check if .env exists
ls -la .env

# If missing, create it:
cat > .env << 'EOF'
DB_HOST=your-rds-endpoint.us-east-1.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD=your-password
DB_NAME=numenor
DB_PORT=3306
MAX_PREDICTIONS_PER_IP=5
PORT=3000
EOF

# Edit with your values
nano .env
```

---

### ❌ "Failed to connect to MySQL"
**Problem:** Can't reach RDS database

**Solutions:**

1. **Check RDS Security Group:**
   - Go to RDS Console → Your DB → Connectivity
   - Click security group
   - Ensure port 3306 is open from your IP

2. **Check RDS is Publicly Accessible:**
   - RDS Console → Your DB → Connectivity
   - "Publicly accessible" should be "Yes"

3. **Test Connection Manually:**
   ```bash
   mysql -h numenor.xxxxx.us-east-1.rds.amazonaws.com -u admin -p
   # Enter password
   # If this fails, it's a network/RDS issue, not your code
   ```

4. **Check Your Internet Connection:**
   ```bash
   ping numenor.xxxxx.us-east-1.rds.amazonaws.com
   ```

---

### ❌ "Access denied for user"
**Problem:** Wrong username or password

**Solution:**
- Double-check `DB_USER` and `DB_PASSWORD` in `.env`
- Ensure no extra spaces or quotes
- Try connecting manually with mysql client

---

### ❌ "Unknown database 'numenor'"
**Problem:** Database not created

**Solution:**
```bash
# Connect to MySQL
mysql -h your-endpoint -u admin -p

# Create database
CREATE DATABASE numenor;
exit
```

---

### ❌ Port 3000 already in use
**Problem:** Another app is using port 3000

**Solutions:**

1. **Kill existing process:**
   ```bash
   lsof -ti:3000 | xargs kill -9
   ```

2. **Use different port:**
   Edit `.env`:
   ```env
   PORT=3001
   ```

---

## 🧪 Test Everything is Working

### 1. Health Check
```bash
curl http://localhost:3000/health
```

Expected:
```json
{
  "status": "ok",
  "timestamp": "2025-10-28T...",
  "database": "connected"
}
```

### 2. Check IP Limit
```bash
curl http://localhost:3000/api/predictions/count
```

Expected:
```json
{
  "count": 0,
  "max": 5,
  "remaining": 5
}
```

### 3. Add a Test Prediction
```bash
curl -X POST http://localhost:3000/api/predictions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Prediction",
    "nda": 30,
    "mgb": 20,
    "others": 10
  }'
```

### 4. Get All Predictions
```bash
curl http://localhost:3000/api/predictions
```

---

## 📁 File Structure

```
biharelection_results/
├── .env                    ← Your database credentials (DO NOT COMMIT!)
├── start-dev.sh           ← Start script (auto-loads .env)
├── index.html             ← Frontend
├── config.js              ← Frontend config
├── backend/
│   ├── server-combined.js ← Backend server
│   ├── package.json
│   └── init-database.sql  ← Database schema
```

---

## 🔒 Security Note

**IMPORTANT:** The `.env` file contains sensitive credentials!

- ✅ `.env` is already in `.gitignore` (won't be committed)
- ❌ Never commit `.env` to GitHub
- ❌ Never share `.env` file publicly
- ✅ For Render deployment, use their environment variables UI

---

## 🎉 You're All Set!

Once your `.env` file is configured correctly and you run `./start-dev.sh`, you should see:

```
✅ MySQL connected successfully
📊 Database: numenor@your-endpoint
✅ Database table ready
🚀 Server running on port 3000
```

Now you can develop locally with live database connection! 🚀

---

## 🔗 Next Steps

- ✅ Test locally
- ✅ Make changes
- ✅ Push to GitHub: `git push origin main`
- ✅ Render auto-deploys from GitHub
- ✅ Add env variables to Render (same as your `.env`)

Happy coding! 💻

