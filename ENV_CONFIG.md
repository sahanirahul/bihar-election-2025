# Environment Variables Configuration

## Available Environment Variables

### `MAX_PREDICTIONS_PER_IP`
**Default:** `5`  
**Description:** Maximum number of predictions each IP address can submit

**To change:**

#### Locally (Development):
```bash
# Mac/Linux
export MAX_PREDICTIONS_PER_IP=10
node backend/server-combined.js

# Or inline
MAX_PREDICTIONS_PER_IP=10 node backend/server-combined.js
```

#### On Render.com:
1. Go to your service dashboard
2. Click **"Environment"** tab (left sidebar)
3. Click **"Add Environment Variable"**
4. Add:
   ```
   Key: MAX_PREDICTIONS_PER_IP
   Value: 5
   ```
5. Click **"Save Changes"**
6. Service will auto-restart with new value

#### With Docker:
```bash
docker run -p 3000:3000 -e MAX_PREDICTIONS_PER_IP=10 bihar-election
```

---

## Current Settings

| Variable | Default | Your Setting |
|----------|---------|--------------|
| `MAX_PREDICTIONS_PER_IP` | 5 | 5 (configurable) |
| `PORT` | 3000 | Auto (Render sets this) |

---

## Notes

- Frontend automatically fetches the limit from the API
- No frontend changes needed when you change the limit
- Change takes effect immediately after restart

