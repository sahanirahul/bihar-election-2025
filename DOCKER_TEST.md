# 🐳 Docker Testing Guide (Render Simulation)

## Why Test with Docker?

You're absolutely right to test with Docker! Here's why:

1. ✅ **Render uses Docker** - Your Dockerfile is what Render will build and run
2. ✅ **Environment variables** - Test that your container correctly reads env vars (just like Render)
3. ✅ **Exact simulation** - Catches issues before deploying to production
4. ✅ **No surprises** - If it works locally with Docker, it'll work on Render

---

## 🎯 How Render Works (What We're Simulating)

```
┌─────────────────────────────────────────────────┐
│  Render Dashboard                               │
│  ├─ Environment Variables (UI)                  │
│  │   ├─ DB_HOST = xxx                           │
│  │   ├─ DB_USER = admin                         │
│  │   └─ DB_PASSWORD = ***                       │
│  └─ Auto-Deploy from GitHub                     │
└─────────────────────────────────────────────────┘
                    ⬇️
┌─────────────────────────────────────────────────┐
│  Render Build Process                           │
│  1. git pull from GitHub                        │
│  2. docker build -t app .                       │
│  3. docker run -e DB_HOST -e DB_USER ... app    │
└─────────────────────────────────────────────────┘
                    ⬇️
┌─────────────────────────────────────────────────┐
│  Your Container Running                         │
│  - Reads process.env.DB_HOST                    │
│  - Reads process.env.DB_USER                    │
│  - Connects to MySQL                            │
│  - Serves app on port 3000                      │
└─────────────────────────────────────────────────┘
```

**This is exactly what we're testing locally!**

---

## 🚀 Quick Test (Automated Script)

I created a test script that does everything for you:

```bash
# Just run this! (Make sure .env is configured first)
./test-docker.sh
```

**What it does:**
1. ✅ Loads your `.env` file
2. ✅ Validates all required variables
3. ✅ Builds Docker image
4. ✅ Runs container with environment variables
5. ✅ Tests health endpoint
6. ✅ Shows logs

**Expected output:**
```
📄 Loading environment variables from .env...
✅ Environment variables loaded

📊 Database Configuration:
   Host: numenor.xxxxx.us-east-1.rds.amazonaws.com
   Database: numenor
   User: admin

🔨 Building Docker image...
✅ Docker image built successfully

🚀 Starting Docker container...
✅ Container is running!

🌐 Access your app at: http://localhost:3000
```

---

## 📋 Manual Testing (Step-by-Step)

If you want to understand what's happening:

### Step 1: Export Environment Variables

```bash
# Load from .env file
export $(cat .env | grep -v '^#' | xargs)

# Or set manually
export DB_HOST="numenor.xxxxx.us-east-1.rds.amazonaws.com"
export DB_USER="admin"
export DB_PASSWORD="your-password"
export DB_NAME="numenor"
export DB_PORT="3306"
export MAX_PREDICTIONS_PER_IP="5"
```

### Step 2: Build Docker Image

```bash
docker build -t bihar-election .
```

### Step 3: Run Container with Environment Variables

**Option A: Pass exported variables (recommended)**
```bash
docker run -p 3000:3000 \
  -e DB_HOST \
  -e DB_USER \
  -e DB_PASSWORD \
  -e DB_NAME \
  -e DB_PORT \
  -e MAX_PREDICTIONS_PER_IP \
  bihar-election
```

**Option B: Use .env file directly**
```bash
docker run -p 3000:3000 --env-file .env bihar-election
```

**Option C: Explicit values**
```bash
docker run -p 3000:3000 \
  -e DB_HOST="numenor.xxxxx.us-east-1.rds.amazonaws.com" \
  -e DB_USER="admin" \
  -e DB_PASSWORD="password" \
  -e DB_NAME="numenor" \
  -e DB_PORT="3306" \
  bihar-election
```

### Step 4: Test the App

```bash
# Open in browser
open http://localhost:3000

# Or test with curl
curl http://localhost:3000/health
```

---

## 🔍 Verify It's Working

### 1. Check Container Logs

```bash
# View logs
docker logs bihar-election-test

# Follow logs (live)
docker logs -f bihar-election-test
```

**Expected logs:**
```
✅ MySQL connected successfully
📊 Database: numenor@numenor.xxxxx.us-east-1.rds.amazonaws.com
✅ Database table ready
🚀 Server running on port 3000
```

### 2. Test Health Endpoint

```bash
curl http://localhost:3000/health
```

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-28T...",
  "database": "connected"
}
```

### 3. Test Adding Prediction

```bash
curl -X POST http://localhost:3000/api/predictions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Docker Test",
    "nda": 30,
    "mgb": 20,
    "others": 10
  }'
```

### 4. Check Database

The prediction should be saved in your AWS RDS database!

---

## 🛑 Managing Containers

### View Running Containers
```bash
docker ps
```

### Stop Container
```bash
docker stop bihar-election-test
```

### Remove Container
```bash
docker rm bihar-election-test
```

### Clean Everything
```bash
# Stop and remove container
docker stop bihar-election-test && docker rm bihar-election-test

# Remove image (optional)
docker rmi bihar-election
```

---

## ✅ Verification Checklist

Before deploying to Render, make sure:

- [ ] `.env` file has correct AWS RDS credentials
- [ ] `docker build` completes successfully
- [ ] Container starts without errors
- [ ] Health endpoint returns `"database": "connected"`
- [ ] Can add predictions through the UI
- [ ] Predictions save to AWS RDS database
- [ ] Predictions persist after container restart:
  ```bash
  # Add prediction
  # Stop container: docker stop bihar-election-test
  # Start again: ./test-docker.sh
  # Predictions should still be there!
  ```

---

## 🚀 Deploy to Render (After Testing)

Once Docker test passes locally:

### 1. Push to GitHub
```bash
git add .
git commit -m "MySQL integration with environment variables"
git push origin main
```

### 2. Configure Render Environment Variables

Go to [Render Dashboard](https://dashboard.render.com/) → Your Service → Environment

Add these (same as your `.env` file):
```
DB_HOST = numenor.xxxxx.us-east-1.rds.amazonaws.com
DB_USER = admin
DB_PASSWORD = your-password
DB_NAME = numenor
DB_PORT = 3306
MAX_PREDICTIONS_PER_IP = 5
```

### 3. Render Auto-Deploys

Render will:
1. Pull your code from GitHub
2. Run `docker build` (using your Dockerfile)
3. Run the container with environment variables
4. **Exactly what you tested locally!** ✅

---

## 🆘 Troubleshooting

### ❌ "Missing required environment variables"

**Problem:** Environment variables not set

**Solution:**
```bash
# Check if .env exists
cat .env

# Reload environment
export $(cat .env | grep -v '^#' | xargs)

# Verify
echo $DB_HOST
```

---

### ❌ "Failed to connect to MySQL"

**Problem:** Container can't reach AWS RDS

**Solutions:**

1. **Check RDS Security Group:**
   - Must allow inbound on port 3306
   - From `0.0.0.0/0` (or your IP)

2. **Verify credentials:**
   ```bash
   # Test from host machine
   mysql -h $DB_HOST -u $DB_USER -p
   ```

3. **Check Docker networking:**
   ```bash
   # Use host network (bypasses Docker network)
   docker run -p 3000:3000 --network host --env-file .env bihar-election
   ```

---

### ❌ "Port 3000 already in use"

**Problem:** Another container or process using port 3000

**Solutions:**

1. **Stop existing container:**
   ```bash
   docker stop $(docker ps -q --filter "publish=3000")
   ```

2. **Use different port:**
   ```bash
   docker run -p 3001:3000 --env-file .env bihar-election
   # Access at: http://localhost:3001
   ```

---

### ❌ Container crashes on startup

**Check logs:**
```bash
docker logs bihar-election-test
```

Common issues:
- Missing environment variables
- Wrong database credentials
- RDS not accessible
- Table creation failed

---

## 📊 Comparison: Local vs Docker vs Render

| Feature | `./start-dev.sh` | `./test-docker.sh` | Render |
|---------|------------------|-------------------|---------|
| Uses Dockerfile | ❌ No | ✅ Yes | ✅ Yes |
| Env variables | .env auto-loaded | .env → Docker | UI → Docker |
| Build time | ⚡ Instant | 🐢 ~30s | 🐢 ~30s |
| Exact Render sim | ❌ No | ✅ Yes | ✅ Production |
| Best for | Quick dev | Pre-deploy test | Live deployment |

---

## 💡 Best Practice Workflow

1. **Development:** Use `./start-dev.sh` for quick iterations
2. **Testing:** Use `./test-docker.sh` before pushing to GitHub
3. **Deployment:** Push to GitHub, Render auto-deploys

---

## 🎯 TL;DR

**You're absolutely right!** Test with Docker first:

```bash
# 1. Make sure .env is configured
cat .env

# 2. Run Docker test
./test-docker.sh

# 3. Test in browser
open http://localhost:3000

# 4. If it works, push to GitHub
git push origin main

# 5. Add same env vars to Render UI

# 6. Done! ✅
```

**If Docker test passes, Render deployment will work!** 🚀

