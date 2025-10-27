# Bihar Election 2025 - Jan Suraaj Party Impact Calculator

An interactive web calculator to predict Bihar 2025 election results based on vote transfer from existing parties to Jan Suraaj Party (JSP). Users across the internet can create and share predictions!

## Architecture

- **Frontend**: HTML/CSS/JavaScript (hosted on S3 + CloudFront)
- **Backend**: Node.js Express API (hosted on EC2)
- **Storage**: JSON file (no database required)
- **Limit**: Max 3 predictions per IP address (prevents spam)

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

1. **Start Backend**:
```bash
cd backend
npm install
npm start
```

2. **Start Frontend**:
```bash
# Open index.html in browser, or use local server:
python3 -m http.server 8000
```

3. **Update config.js** to use localhost:
```javascript
const API_BASE_URL = 'http://localhost:3000';
```

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions to AWS EC2 + S3.

### Quick Deploy Summary

1. **Backend**: Deploy to EC2 with PM2 + Nginx
2. **Frontend**: Upload to S3 bucket (or CloudFront)
3. **Update config.js**: Set your backend URL
4. **Done!** Users can now access and add predictions

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

