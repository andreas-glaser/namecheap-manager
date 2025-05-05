// path: src/config.js
require('dotenv').config();
const fs   = require('fs');
const path = require('path');

const fallbackFile = path.join(__dirname, '..', 'config.json');
let fileCfg = {};
if (fs.existsSync(fallbackFile)) fileCfg = JSON.parse(fs.readFileSync(fallbackFile));

function env(key, def) { return process.env[key] || fileCfg[key] || def; }

module.exports = {
  apiUser  : env('NC_API_USER'),
  apiKey   : env('NC_API_KEY'),
  userName : env('NC_USERNAME'),
  clientIp : env('NC_CLIENT_IP'),
  endpoint : env('NC_ENDPOINT', 'https://api.namecheap.com/xml.response'),
};
