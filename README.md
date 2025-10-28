# Bihar Election 2025 - Jan Suraaj Party Impact Calculator

An interactive web calculator to predict Bihar 2025 election results based on vote transfer from existing parties to Jan Suraaj Party (JSP). Users across the internet can create and share predictions!

## Architecture

- **Frontend**: HTML/CSS/JavaScript (served by backend)
- **Backend**: Node.js Express API (hosted on Render.com)
- **Storage**: MySQL database (AWS RDS or other)
- **Limit**: Max 5 predictions per IP address (configurable)

## Features

- **2020 Baseline Results** - Adjusted for 2025 alliance changes
- **2025 Predictions** - Real-time calculation based on vote transfer percentages
- **Winner Animation** - The party with the highest vote share is highlighted with a glowing animation and "🏆 LEADING" badge
- **Interactive Sliders** - Adjust how much vote share JSP takes from each party
- **Party Logos** - Visual representation of each alliance
- **Shared Predictions** - All users can see everyone's predictions (stored on server)
- **Per-IP Limit** - Each user can add maximum 3 predictions
- **Delete Your Predictions** - Remove your own predictions (enforced by IP)
- **Prediction Dropdown** - Select any prediction from dropdown to view details
- **Average Prediction** - Auto-calculated average of all predictions, updates in real-time

## How to Use

### For End Users

1. Visit the deployed website
2. Adjust the sliders to set what percentage of votes JSP will take from:
   - NDA (National Democratic Alliance)
   - MGB (Mahagathbandan - Congress + RJD alliance)
   - Others
3. See real-time predictions update automatically
4. Enter your name and click "Add Prediction" to save (max 3 per device)
5. Use the dropdown to view any prediction:
   - **Average Prediction** (shown at top) - calculated from all predictions
   - Individual predictions - select any user's prediction to see details
6. Delete your own predictions if needed

### For Developers - Local Development

#### Option 1: Docker Compose (Easiest)
```bash
# Start MySQL + App together
docker-compose up

# Access at: http://localhost:3000
# Stop: docker-compose down
```

#### Option 2: Manual Setup
1. **Setup MySQL:**
   - Install MySQL locally or use remote MySQL server
   - Create database: `numenor`
   - Run: `backend/init-database.sql` (or app creates table automatically)

2. **Set Environment Variables:**
```bash
export DB_HOST=localhost
export DB_USER=root
export DB_PASSWORD=yourpassword
export DB_NAME=numenor
export DB_PORT=3306
```

3. **Start Backend:**
```bash
cd backend
npm install
node server-combined.js
```

4. **Access:** http://localhost:3000

## Deployment

### Quick Deploy to Render.com

1. **Setup MySQL Database** (AWS RDS Free Tier):
   - See [MYSQL_SETUP.md](MYSQL_SETUP.md) for detailed guide
   - Or use any MySQL server accessible from internet

2. **Push to GitHub:**
```bash
git add .
git commit -m "Update"
git push origin main
```

3. **Configure Render Environment Variables:**
   - Go to Render Dashboard → Your Service → Environment
   - Add: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`
   - See [ENV_CONFIG.md](ENV_CONFIG.md) for details

4. **Deploy** - Render auto-deploys from GitHub

📖 **Full Guides:**
- [MYSQL_QUICKSTART.md](MYSQL_QUICKSTART.md) - Quick migration guide
- [MYSQL_SETUP.md](MYSQL_SETUP.md) - Complete MySQL setup
- [RENDER_QUICKSTART.md](RENDER_QUICKSTART.md) - Render deployment

## Alliance Changes (2020 → 2025)

- **LJP (Chirag Paswan)**: 5.66% moved from Others → NDA
- **VIP (Mukesh Sahani)**: 1.52% moved from NDA → MGB

## Party Symbols

Currently using emoji symbols:
- **NDA**: 🪷 Lotus (BJP-led alliance)
- **MGB**: ✋ Hand (Congress + RJD alliance)  
- **JSP**: 🎒 School Bag (Jan Suraaj Party - Prashant Kishor)
- **Others**: 🗳️ Ballot box

## How to Replace Emoji with Actual Logo Images

If you want to use actual party logos instead of emojis:

1. **Download logo images** for each party:
   - NDA logo (Lotus)
   - Congress logo (Hand) for MGB
   - Jan Suraaj Party logo (School Bag)
   - Any logo for Others

2. **Save the images** in the same folder as `index.html`:
   - Suggested names: `nda-logo.png`, `mgb-logo.png`, `jsp-logo.png`, `others-logo.png`

3. **Edit the HTML** - Find each `<div class="party-logo">` and replace the emoji with an `<img>` tag:

   **Before:**
   ```html
   <div class="party-logo">🪷</div>
   ```

   **After:**
   ```html
   <div class="party-logo"><img src="nda-logo.png" alt="NDA" style="width:100%;height:100%;object-fit:contain;"></div>
   ```

4. Repeat for all four parties (NDA, MGB, JSP, Others)

## 2020 Adjusted Results

| Party | Vote Share | Seats |
|-------|-----------|-------|
| NDA | 41.40% | 125 |
| Mahagathbandan | 38.75% | 110 |
| Others | 19.85% | 8 |
| **Total** | **100%** | **243** |

## Technical Details

- **Pure HTML + CSS + JavaScript** - No dependencies
- **Responsive Design** - Works on mobile and desktop
- **Real-time Calculations** - Updates as you move sliders
- **Color Coding** - Each party has distinct colors
  - NDA: Orange (#FF9933)
  - MGB: Green (#138808)
  - JSP: Yellow (#FFD700)
  - Others: Gray (#999999)

## License

Free to use and modify as needed.

