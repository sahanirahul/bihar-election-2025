# Deploy to Render.com (FREE) - 5 Minute Setup

Perfect for your 20-day YouTube experiment! No credit card required.

## Why Render.com?

- ✅ **FREE** tier (750 hours/month = 31 days)
- ✅ **No credit card needed** for free tier
- ✅ **Auto HTTPS** (SSL certificate included)
- ✅ **Always online** (not dependent on your laptop)
- ✅ **Auto-deploy** from GitHub
- ✅ **Easy to delete** after 20 days

---

## 📋 Prerequisites

1. GitHub account (free)
2. Render.com account (free, no credit card)
3. Your code pushed to GitHub

---

## 🚀 Step-by-Step Deployment

### Step 1: Push Code to GitHub

```bash
cd /path/to/biharelection_results

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Bihar election calculator ready for deployment"

# Create a new repository on GitHub (github.com/new)
# Then push:
git remote add origin https://github.com/YOUR_USERNAME/bihar-election.git
git branch -M main
git push -u origin main
```

### Step 2: Sign Up for Render.com

1. Go to https://render.com
2. Click "Get Started" or "Sign Up"
3. Sign up with your GitHub account (easiest)
4. **No credit card required!**

### Step 3: Deploy Your App

1. **In Render Dashboard**, click "New +" → "Web Service"

2. **Connect your GitHub repository:**
   - Select "Connect a repository"
   - Choose your `bihar-election` repository
   - Click "Connect"

3. **Configure the service:**
   ```
   Name: bihar-election-calculator
   Region: Oregon (US West) [or closest to you]
   Branch: main
   Root Directory: [leave blank]
   Environment: Docker
   Plan: Free
   ```

4. **Click "Create Web Service"**

5. **Wait 3-5 minutes** for deployment
   - Render will:
     - Pull your code
     - Build Docker image
     - Deploy container
     - Assign you a URL

### Step 4: Get Your URL

Once deployed, you'll get a URL like:
```
https://bihar-election-calculator.onrender.com
```

**That's your website!** ✨

---

## ✅ Testing Your Deployment

1. **Visit your URL**: `https://your-app.onrender.com`
2. **Test the calculator**: Move sliders, see predictions
3. **Add a prediction**: Should work immediately
4. **Refresh page**: Prediction should persist

### Test API Endpoints:
```bash
# Health check
curl https://your-app.onrender.com/health

# Get predictions
curl https://your-app.onrender.com/api/predictions
```

---

## 📊 Monitoring & Management

### View Logs
1. Go to Render Dashboard
2. Click your service
3. Click "Logs" tab
4. See real-time logs

### View Metrics
- Click "Metrics" tab
- See requests, response times, errors

### Check Status
- Dashboard shows "Live" when running
- Shows "Sleeping" when idle (wakes on request)

---

## 🎬 For Your YouTube Video

**Share this URL:**
```
https://bihar-election-calculator.onrender.com
```

**Note for viewers:**
- First visit might take 30 seconds (wakes from sleep)
- Subsequent visits are instant
- Data persists across visits
- Each user can add 3 predictions

---

## ⚠️ Important Notes

### Free Tier Limits (More than enough for you!)
- ✅ 750 hours/month (31 days of continuous running)
- ✅ 100 GB bandwidth/month
- ✅ Auto-sleeps after 15 minutes of inactivity
- ✅ Wakes up automatically on new request

### Sleep Behavior
- **Sleeps**: After 15 min of no traffic
- **Wakes**: Within 30 seconds on new request
- **Impact**: First visitor might wait 30 sec, then instant

### Data Persistence
- ✅ `predictions.json` persists in container
- ⚠️ Resets if you redeploy
- ✅ For 20 days, no problem!

---

## 🔧 Making Updates

If you need to change something:

```bash
# Make changes to your code
git add .
git commit -m "Updated XYZ"
git push

# Render auto-deploys! (2-3 minutes)
```

---

## 🗑️ Deleting After 20 Days

### Option 1: Suspend (Recommended)
1. Go to your service in Render
2. Click "Settings" tab
3. Scroll to "Suspend Service"
4. Click "Suspend"
- ✅ Keeps everything (can resume later)
- ✅ Stops using free hours

### Option 2: Delete Completely
1. Go to your service settings
2. Scroll to "Danger Zone"
3. Click "Delete Service"
4. Confirm

---

## 🐛 Troubleshooting

### "Build Failed"
- Check logs in Render dashboard
- Make sure all files are committed to GitHub
- Verify Dockerfile syntax

### "Service Unavailable"
- Wait 30 seconds (might be waking from sleep)
- Check logs for errors
- Verify health check passes

### Predictions Not Saving
- Check logs: `console.error` messages
- Verify predictions.json has write permissions (should work by default)

### Can't Access Site
- Check service status (should say "Live")
- Try health check: `https://your-app.onrender.com/health`
- Check for deployment errors in logs

---

## 💰 Cost

**For your 20-day experiment:**
- **Cost: $0**
- Free tier includes 750 hours
- 20 days = 480 hours
- You have 270 hours extra

**No billing surprises!**

---

## 📱 Sharing on YouTube

**Short URL:**
```
https://bihar-election-calculator.onrender.com
```

**In video description:**
```
🗳️ Try the Bihar Election Calculator:
https://bihar-election-calculator.onrender.com

Create your own prediction and see what others think!
Max 3 predictions per person.
```

**In comments:**
```
Check out this interactive calculator for Bihar 2025 elections! 
You can add your own predictions: [your-url]
```

---

## 🎯 Expected Traffic from YouTube

**Realistic scenarios:**
- 10-50 visitors: No problem
- 100-500 visitors: Still free, works great
- 1000+ visitors: Still free, but might hit bandwidth limits

**If traffic spikes:**
- Render auto-scales within free tier
- Worst case: Site slows down (still works)
- You get email from Render (info only)

---

## ✨ After 20 Days

**If you want to keep it longer:**
- Free tier continues indefinitely!
- Just leave it running
- Or suspend when not needed

**If you want to delete:**
- Follow deletion steps above
- Delete GitHub repo (optional)
- Done!

---

## 📞 Support

**Render Support:**
- Dashboard → Help icon
- Community forum: community.render.com
- Docs: render.com/docs

**Your App Issues:**
- Check logs in Render dashboard
- Test API endpoints directly
- Review error messages

---

## 🎉 You're Done!

✅ App deployed on Render.com (FREE)
✅ Always online (not dependent on laptop)
✅ Auto HTTPS included
✅ Ready to share on YouTube
✅ Easy to delete after 20 days

**Total time:** 5-10 minutes
**Total cost:** $0

Good luck with your YouTube promotion! 🚀

