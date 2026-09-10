const mongoose = require('mongoose');
const dns = require('dns');

// On some platforms (or local ISPs with broken DNS resolution for SRV records),
// setting explicit DNS servers helps. We wrap in try/catch to avoid container crashes.
if (process.env.CUSTOM_DNS_SERVERS || process.env.NODE_ENV !== 'production') {
  try {
    dns.setServers(['1.1.1.1', '8.8.8.8']);
  } catch (err) {
    console.warn('⚠️ Could not override DNS servers:', err.message);
  }
}

async function main() {
  if (!process.env.DB_CONNECTION_STRING) {
    throw new Error('DB_CONNECTION_STRING environment variable is not defined');
  }
  await mongoose.connect(process.env.DB_CONNECTION_STRING);
  console.log('✅ Connected to MongoDB');
}

module.exports = main;