const https = require('https');

const BACKEND_URL = 'https://agritrack-backend-jmlf.onrender.com/health';
const PING_INTERVAL = 10 * 60 * 1000; // 10 minutes

function pingBackend() {
  console.log(`[${new Date().toISOString()}] Pinging backend...`);
  
  https.get(BACKEND_URL, (res) => {
    console.log(`[${new Date().toISOString()}] Status: ${res.statusCode}`);
    if (res.statusCode === 200) {
      console.log(`[${new Date().toISOString()}] ✅ Backend is alive`);
    } else {
      console.log(`[${new Date().toISOString()}] ⚠️ Backend returned status: ${res.statusCode}`);
    }
  }).on('error', (err) => {
    console.error(`[${new Date().toISOString()}] ❌ Error pinging backend:`, err.message);
  });
}

// Start pinging immediately
pingBackend();

// Set up interval
setInterval(pingBackend, PING_INTERVAL);

console.log(`Keep-alive service started. Pinging every ${PING_INTERVAL / 1000 / 60} minutes.`); 