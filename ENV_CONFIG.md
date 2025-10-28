# Environment Variables Configuration

## Required Environment Variables (MySQL Database)

### `DB_HOST`
**Required:** Yes  
**Description:** MySQL database hostname/IP address  
**Example:** `mydb.xxxx.us-east-1.rds.amazonaws.com`

### `DB_USER`
**Required:** Yes  
**Description:** MySQL username  
**Example:** `admin`

### `DB_PASSWORD`
**Required:** Yes  
**Description:** MySQL password  
**Example:** `your-secure-password`

### `DB_NAME`
**Required:** Yes  
**Description:** MySQL database name  
**Example:** `numenor`

### `DB_PORT`
**Required:** No  
**Default:** `3306`  
**Description:** MySQL port number  
**Example:** `3306`

---

## Optional Environment Variables

### `MAX_PREDICTIONS_PER_IP`
**Required:** No  
**Default:** `5`  
**Description:** Maximum number of predictions each IP address can submit  
**Example:** `5`

### `PORT`
**Required:** No  
**Default:** `3000`  
**Description:** Port the server listens on (Render sets this automatically)  
**Example:** `3000`

---

## How to Set Environment Variables

### 1️⃣ Locally (Development)

#### Mac/Linux:
```bash
export DB_HOST=localhost
export DB_USER=root
export DB_PASSWORD=yourpassword
export DB_NAME=numenor
export DB_PORT=3306
export MAX_PREDICTIONS_PER_IP=5

node backend/server-combined.js
```

#### Or create a `.env` file (recommended):
Create a file called `.env` in the backend directory:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=numenor
DB_PORT=3306
MAX_PREDICTIONS_PER_IP=5
```

Then run:
```bash
# Load .env file and run
export $(cat backend/.env | xargs) && node backend/server-combined.js
```

---

### 2️⃣ On Render.com

1. Go to your service dashboard: https://dashboard.render.com/
2. Click your service name
3. Click **"Environment"** tab (left sidebar)
4. Click **"Add Environment Variable"** for each:

```
Key: DB_HOST
Value: your-mysql-hostname.rds.amazonaws.com

Key: DB_USER
Value: your-username

Key: DB_PASSWORD
Value: your-secure-password

Key: DB_NAME
Value: numenor

Key: DB_PORT
Value: 3306

Key: MAX_PREDICTIONS_PER_IP
Value: 5
```

5. Click **"Save Changes"**
6. Service will auto-restart with new values

**⚠️ Important:** 
- Make sure your AWS RDS security group allows inbound connections from Render's IP ranges
- Or set RDS to "Publicly accessible" (less secure but works)

---

### 3️⃣ With Docker

```bash
docker run -p 3000:3000 \
  -e DB_HOST=your-host \
  -e DB_USER=your-user \
  -e DB_PASSWORD=your-password \
  -e DB_NAME=numenor \
  -e DB_PORT=3306 \
  -e MAX_PREDICTIONS_PER_IP=5 \
  bihar-election
```

Or use Docker Compose (see `docker-compose.yml`)

---

## Current Settings

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DB_HOST` | ✅ Yes | - | MySQL hostname |
| `DB_USER` | ✅ Yes | - | MySQL username |
| `DB_PASSWORD` | ✅ Yes | - | MySQL password |
| `DB_NAME` | ✅ Yes | - | Database name |
| `DB_PORT` | ❌ No | 3306 | MySQL port |
| `MAX_PREDICTIONS_PER_IP` | ❌ No | 5 | Predictions per IP |
| `PORT` | ❌ No | 3000 | Server port |

---

## Validation

The application will validate all required environment variables on startup:

✅ **Success:**
```
✅ MySQL connected successfully
📊 Database: numenor@your-host
✅ Database table ready
🚀 Server running on port 3000
```

❌ **Missing variables:**
```
❌ Missing required environment variables: DB_HOST, DB_PASSWORD
Please set the following environment variables:
  DB_HOST - MySQL hostname
  DB_USER - MySQL username
  DB_PASSWORD - MySQL password
  DB_NAME - MySQL database name
```

---

## Troubleshooting

### Can't connect to MySQL:
1. Check security group rules (AWS RDS)
2. Verify hostname/port are correct
3. Test with MySQL client first:
   ```bash
   mysql -h your-host -u your-user -p -D numenor
   ```

### Table not found:
- The app automatically creates the table on first run
- Or manually run: `backend/init-database.sql`

### Connection timeout:
- Check if RDS is publicly accessible
- Verify VPC/subnet configuration
- Ensure SSL/TLS is not blocking connection

---

## Security Notes

- Never commit `.env` files to Git (already in `.gitignore`)
- Use strong passwords for production
- Restrict MySQL access to only necessary IPs
- Use AWS Secrets Manager for production credentials (optional)
- Consider using IAM authentication for RDS (advanced)
