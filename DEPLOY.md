# Cloud Deployment Instructions

## Deploy to Railway (Free Tier)

### Step 1: Create Railway Account
1. Go to https://railway.app/
2. Sign up with GitHub (easiest)

### Step 2: Deploy This App
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Or use "Empty Project" and upload these files manually

**OR use Railway CLI:**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

### Step 3: Get Your App URL
After deployment, Railway will give you a URL like:
```
https://your-app-name.up.railway.app
```

### Step 4: Update Hammerspoon Script
1. Open `hammerspoon-cloud.lua`
2. Replace `YOUR-APP-URL-HERE.railway.app` with your actual Railway URL
3. Copy the entire file contents
4. On your Mac: Open `~/.hammerspoon/init.lua`
5. Replace everything with the updated script
6. Reload Hammerspoon

### Step 5: Use It
1. **On iPad**: Go to your Railway URL in Safari (e.g., `https://your-app.railway.app`)
2. **On Mac**: Press ESC to toggle keystroke capture
3. **Type on Mac** - appears on iPad instantly

---

## Alternative: Deploy to Render

1. Go to https://render.com/
2. Sign up
3. New > Web Service
4. Connect GitHub repo or upload files
5. Build Command: `npm install`
6. Start Command: `npm start`
7. Deploy

Same process - get URL, update Hammerspoon script.

---

## Alternative: Deploy to Fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
flyctl auth login

# Launch app
flyctl launch

# Deploy
flyctl deploy
```

---

## How It Works (Cloud Version)

```
Mac Keyboard
     ↓
Hammerspoon captures
     ↓
HTTPS POST → Cloud Server (Railway/Render/etc)
     ↓
WebSocket broadcast
     ↓
iPad browser receives
     ↓
Displays text
```

**Latency:** ~100-300ms (vs 30-60ms local)
**Privacy:** Keystrokes go over internet (encrypted via HTTPS)
**Reliability:** Works anywhere with internet, no network blocking

---

## No IP Changes Ever

Both Mac and iPad just use the same cloud URL:
- Mac sends to: `https://your-app.railway.app/keystroke`
- iPad views at: `https://your-app.railway.app`

Never changes. Works on any WiFi. No Grandmarc bullshit.

---

## Security Note

Your keystrokes are transmitted over the internet to the cloud server. While they're encrypted in transit (HTTPS), they pass through a server you're hosting.

**Do NOT use this for:**
- Passwords
- Credit card numbers  
- Sensitive information

**Only use when capture is toggled ON and you know what you're typing.**

The cloud server doesn't log keystrokes, but anyone with the URL can connect and see the text.

---

## Free Tier Limits

**Railway:**
- $5 free credit/month
- Should be plenty for this use case
- Auto-sleeps after inactivity

**Render:**
- Free tier available
- Spins down after 15min inactivity
- Takes ~30sec to wake up

**Fly.io:**
- Free tier: 3 small VMs
- Always-on

All should work fine for your needs.
