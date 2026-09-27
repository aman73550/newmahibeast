import express from 'express';
import type { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Serve static assets from public directory with zero-cache for instant updates
const PUBLIC_DIR = path.resolve(process.cwd(), 'public');
const IMAGES_LOWER = path.resolve(PUBLIC_DIR, 'images');
const IMAGES_UPPER = path.resolve(PUBLIC_DIR, 'Images');

// Ensure both public/images and public/Images exist
if (!fs.existsSync(IMAGES_LOWER)) fs.mkdirSync(IMAGES_LOWER, { recursive: true });
if (!fs.existsSync(IMAGES_UPPER)) fs.mkdirSync(IMAGES_UPPER, { recursive: true });

// Auto-sync files between public/images and public/Images so files work regardless of folder casing
function syncImageDirectories() {
  try {
    if (fs.existsSync(IMAGES_LOWER) && fs.existsSync(IMAGES_UPPER)) {
      for (const file of fs.readdirSync(IMAGES_LOWER)) {
        if (file.startsWith('.')) continue;
        const src = path.join(IMAGES_LOWER, file);
        const dst = path.join(IMAGES_UPPER, file);
        if (fs.statSync(src).isFile()) {
          if (!fs.existsSync(dst) || fs.statSync(src).mtimeMs > fs.statSync(dst).mtimeMs) {
            fs.copyFileSync(src, dst);
          }
        }
      }
      for (const file of fs.readdirSync(IMAGES_UPPER)) {
        if (file.startsWith('.')) continue;
        const src = path.join(IMAGES_UPPER, file);
        const dst = path.join(IMAGES_LOWER, file);
        if (fs.statSync(src).isFile()) {
          if (!fs.existsSync(dst) || fs.statSync(src).mtimeMs > fs.statSync(dst).mtimeMs) {
            fs.copyFileSync(src, dst);
          }
        }
      }
    }
  } catch (err) {
    console.error('Error syncing image directories:', err);
  }
}
syncImageDirectories();

// Serve images seamlessly whether requested with /images/ or /Images/
app.use((req, res, next) => {
  const match = req.path.match(/^\/(?:images|Images)\/(.+)$/);
  if (match) {
    syncImageDirectories();
    const filename = decodeURIComponent(match[1]);
    const candidates = [
      path.resolve(IMAGES_UPPER, filename),
      path.resolve(IMAGES_LOWER, filename),
    ];
    for (const file of candidates) {
      if (fs.existsSync(file) && fs.statSync(file).isFile()) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        return res.sendFile(file);
      }
    }
  }
  next();
});

app.use(express.static(PUBLIC_DIR, {
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  },
}));

// Path to persist lightweight visitor conversion analytics
const DATA_FILE = path.resolve(process.cwd(), 'analytics-store.json');

interface ClickEvent {
  source: string;
  timestamp: number;
  timeSpentBeforeClickSec: number;
}

interface VisitSession {
  sessionId: string;
  visitorId: string;
  ipHash: string;
  userAgent: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  referrer: string;
  startTime: number;
  lastActiveTime: number;
  durationSeconds: number;
  clicks: ClickEvent[];
}

interface AnalyticsData {
  sessions: VisitSession[];
  totalViews: number;
  totalUniqueVisitors: number;
  totalTelegramClicks: number;
}

let analyticsData: AnalyticsData = {
  sessions: [],
  totalViews: 0,
  totalUniqueVisitors: 0,
  totalTelegramClicks: 0,
};

try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    analyticsData = JSON.parse(raw);
  }
} catch (err) {
  console.error('Error reading analytics store:', err);
}

let saveTimeout: NodeJS.Timeout | null = null;
function persistAnalytics() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(analyticsData, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save analytics:', err);
    }
  }, 1000);
}

function hashIP(ip: string | undefined): string {
  if (!ip) return 'anon';
  return crypto.createHash('sha256').update(ip).digest('hex').substring(0, 10);
}

function detectDevice(ua: string = ''): 'mobile' | 'desktop' | 'tablet' {
  const lower = ua.toLowerCase();
  if (/ipad|tablet|(android(?!.*mobile))/i.test(lower)) return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(lower)) return 'mobile';
  return 'desktop';
}

// ==========================================
// TELEGRAM CONVERSION ANALYTICS ENDPOINTS
// ==========================================

// 1. Record Page Visit
app.post('/api/analytics/visit', (req: Request, res: Response) => {
  try {
    const { visitorId, referrer } = req.body;
    const ua = req.headers['user-agent'] || '';
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '';
    const ipHash = hashIP(ip);
    const deviceType = detectDevice(ua);
    const now = Date.now();

    const sessionId = `sess_${now}_${Math.random().toString(36).substring(2, 9)}`;
    const effectiveVisitorId = visitorId || `vis_${Math.random().toString(36).substring(2, 10)}`;

    const isNewVisitor = !analyticsData.sessions.some((s) => s.visitorId === effectiveVisitorId);

    const newSession: VisitSession = {
      sessionId,
      visitorId: effectiveVisitorId,
      ipHash,
      userAgent: ua.substring(0, 120),
      deviceType,
      referrer: referrer || 'Direct / Organic',
      startTime: now,
      lastActiveTime: now,
      durationSeconds: 0,
      clicks: [],
    };

    analyticsData.sessions.unshift(newSession);
    if (analyticsData.sessions.length > 2000) {
      analyticsData.sessions = analyticsData.sessions.slice(0, 2000);
    }

    analyticsData.totalViews += 1;
    if (isNewVisitor) {
      analyticsData.totalUniqueVisitors += 1;
    }

    persistAnalytics();

    res.json({
      success: true,
      sessionId,
      visitorId: effectiveVisitorId,
    });
  } catch (err) {
    console.error('Visit track error:', err);
    res.status(500).json({ error: 'Internal tracking error' });
  }
});

// 2. Heartbeat to record dwell time
app.post('/api/analytics/heartbeat', (req: Request, res: Response) => {
  try {
    const { sessionId, secondsElapsed } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId required' });
    }

    const session = analyticsData.sessions.find((s) => s.sessionId === sessionId);
    if (session) {
      session.lastActiveTime = Date.now();
      if (typeof secondsElapsed === 'number' && secondsElapsed > session.durationSeconds) {
        session.durationSeconds = Math.min(secondsElapsed, 3600);
      } else {
        const diff = Math.floor((session.lastActiveTime - session.startTime) / 1000);
        session.durationSeconds = Math.max(session.durationSeconds, Math.min(diff, 3600));
      }
      persistAnalytics();
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Heartbeat error' });
  }
});

// 3. Record Telegram CTR Clicks
app.post('/api/analytics/click', (req: Request, res: Response) => {
  try {
    const { sessionId, source, timeSpentSec } = req.body;
    const now = Date.now();

    analyticsData.totalTelegramClicks += 1;

    if (sessionId) {
      const session = analyticsData.sessions.find((s) => s.sessionId === sessionId);
      if (session) {
        session.clicks.push({
          source: source || 'unknown',
          timestamp: now,
          timeSpentBeforeClickSec: typeof timeSpentSec === 'number' ? timeSpentSec : 0,
        });
        session.lastActiveTime = now;
      }
    }

    persistAnalytics();
    res.json({ success: true, totalClicks: analyticsData.totalTelegramClicks });
  } catch (err) {
    res.status(500).json({ error: 'Click track error' });
  }
});

// Helper developer route for founder image upload
app.get('/upload', (_req, res) => {
  res.send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Upload Founder Photo</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    body { background: #05070B; color: #fff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
    .box { border: 2px dashed #f59e0b; padding: 36px 24px; border-radius: 24px; text-align: center; max-width: 420px; width: 100%; background: #0A0D14; box-shadow: 0 10px 40px rgba(0,0,0,0.8); }
    h2 { margin: 0 0 10px 0; color: #f59e0b; font-size: 22px; }
    p { color: #94a3b8; font-size: 14px; margin: 0 0 20px 0; line-height: 1.5; }
    input[type="file"] { display: none; }
    label { background: linear-gradient(135deg, #f59e0b, #d97706); color: #000; font-weight: 700; font-size: 15px; padding: 14px 28px; border-radius: 30px; cursor: pointer; display: inline-block; transition: transform 0.15s ease; box-shadow: 0 4px 20px rgba(245,158,11,0.4); }
    label:active { transform: scale(0.96); }
    #status { margin-top: 20px; font-weight: 600; font-size: 15px; min-height: 24px; }
  </style>
</head>
<body>
  <div class="box">
    <h2>Meet Mahi Section Photo</h2>
    <p>Choose your founder photo file (<code>founder.webp.webp</code> / <code>compressed-image.webp</code>) to apply it immediately to the Meet Mahi section:</p>
    <label for="fileInput">Select Image File</label>
    <input type="file" id="fileInput" accept="image/*">
    <div id="status"></div>
  </div>
  <script>
    document.getElementById('fileInput').onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const statusEl = document.getElementById('status');
      statusEl.style.color = '#38bdf8';
      statusEl.innerText = 'Uploading ' + file.name + '...';
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const res = await fetch('/api/upload-founder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64: reader.result })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            statusEl.style.color = '#10b981';
            statusEl.innerText = '✓ Image saved successfully! Redirecting...';
            setTimeout(() => { window.location.href = '/'; }, 1000);
          } else {
            statusEl.style.color = '#ef4444';
            statusEl.innerText = 'Failed: ' + (data.error || 'Server error');
          }
        } catch (err) {
          statusEl.style.color = '#ef4444';
          statusEl.innerText = 'Upload failed: ' + err.message;
        }
      };
      reader.readAsDataURL(file);
    };
  </script>
</body>
</html>`);
});

app.post('/api/upload-founder', (req: Request, res: Response) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ error: 'imageBase64 required' });
    }

    const matches = imageBase64.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    const base64Data = matches && matches[2] ? matches[2] : imageBase64;
    const buffer = Buffer.from(base64Data, 'base64');

    const imagesDir = path.resolve(PUBLIC_DIR, 'images');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    fs.writeFileSync(path.resolve(imagesDir, 'founder.webp'), buffer);
    if (fs.existsSync(IMAGES_UPPER)) {
      fs.writeFileSync(path.resolve(IMAGES_UPPER, 'founder.webp'), buffer);
    }
    fs.writeFileSync(path.resolve(PUBLIC_DIR, 'founder.webp'), buffer);
    fs.writeFileSync(path.resolve(PUBLIC_DIR, 'founder.webp.webp'), buffer);
    syncImageDirectories();

    const distImagesDir = path.resolve(process.cwd(), 'dist', 'images');
    if (fs.existsSync(distImagesDir)) {
      try {
        fs.writeFileSync(path.resolve(distImagesDir, 'founder.webp'), buffer);
      } catch (e) {}
    }
    const distDir = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distDir)) {
      try {
        fs.writeFileSync(path.resolve(distDir, 'founder.webp'), buffer);
        fs.writeFileSync(path.resolve(distDir, 'founder.webp.webp'), buffer);
      } catch (e) {}
    }

    res.json({ success: true, message: 'Founder image updated successfully' });
  } catch (err) {
    console.error('Founder upload error:', err);
    res.status(500).json({ error: 'Failed to save image' });
  }
});

// ==========================================
// VITE SPA MIDDLEWARE / STATIC SERVING
// ==========================================

async function startServer() {
  if (!isProduction) {
    // Development mode with Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
