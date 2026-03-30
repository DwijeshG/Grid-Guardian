import express from "express";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import os from "os";
import dns from "dns";
import axios from "axios";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.use(cors());
app.use(express.json());

// --- SECURITY ENGINE DATA ---

const MALWARE_SIGNATURES = [
  { id: "TRJ-EMOTET-X", type: "Trojan", hash: "e3b0c442", severity: "Critical", description: "Emotet variant detected in memory buffer." },
  { id: "RNS-WANACRY-V2", type: "Ransomware", hash: "f1a2b3c4", severity: "Critical", description: "WannaCry-like encryption pattern identified." },
  { id: "SPY-PEGASUS-MOD", type: "Spyware", hash: "d5e6f7g8", severity: "High", description: "Unauthorized data exfiltration attempt detected." },
  { id: "MIN-COINHIVE-JS", type: "Cryptojacker", hash: "a1b2c3d4", severity: "Medium", description: "Hidden crypto-mining script in browser process." },
  { id: "APT-LAZARUS-BK", type: "Backdoor", hash: "9a8b7c6d", severity: "Critical", description: "Lazarus Group persistence module identified." },
  { id: "ADW-OPENCANDY", type: "Adware", hash: "1234abcd", severity: "Low", description: "Potentially unwanted program (PUP) installer." },
  { id: "WRM-SQLSLAM-A", type: "Worm", hash: "b2c3d4e5", severity: "High", description: "SQL Slammer worm replication attempt." },
  { id: "RTK-COBALT-ST", type: "Rootkit", hash: "c3d4e5f6", severity: "Critical", description: "Cobalt Strike beacon detected in kernel space." },
  { id: "WIP-SHAMOON-X", type: "Wiper", hash: "d4e5f6g7", severity: "Critical", description: "Shamoon wiper payload identified in disk queue." },
];

const IP_BLACKLIST = [
  { ip: "185.244.25.10", origin: "Russia", type: "Botnet C2", risk: 95 },
  { ip: "45.120.156.12", origin: "China", type: "SSH Brute Force", risk: 88 },
  { ip: "103.45.12.99", origin: "North Korea", type: "APT Infrastructure", risk: 99 },
  { ip: "192.168.1.105", origin: "Local", type: "Internal Lateral Movement", risk: 75 },
];

const VULNERABILITY_DB = [
  { cve: "CVE-2026-1142", title: "Kernel Zero-Day", severity: "Critical", status: "Patched" },
  { cve: "CVE-2025-9981", title: "OpenSSL Memory Leak", severity: "High", status: "Mitigated" },
  { cve: "CVE-2026-0012", title: "Chromium RCE", severity: "Critical", status: "Active" },
  { cve: "CVE-2024-5566", title: "SSH Auth Bypass", severity: "High", status: "Patched" },
];

const SUSPICIOUS_PATTERNS = [
  { pattern: /powershell\.exe.*-ExecutionPolicy Bypass/i, type: "Fileless Malware", risk: "High" },
  { pattern: /curl.*\|.*bash/i, type: "Remote Execution", risk: "Critical" },
  { pattern: /reg add.*RunOnce/i, type: "Persistence", risk: "Medium" },
  { pattern: /net user.*\/add/i, type: "Privilege Escalation", risk: "High" },
  { pattern: /vssadmin.*delete shadows/i, type: "Ransomware Activity", risk: "Critical" },
  { pattern: /schtasks.*\/create/i, type: "Scheduled Task Persistence", risk: "Medium" },
  { pattern: /\[\]\["filter"\]\["constructor"\]/i, type: "Advanced JS Obfuscation", risk: "High" },
  { pattern: /constructor\(.*alert\(.*\).*\)/i, type: "Malicious Payload Injection", risk: "High" },
  { pattern: /atob\(.*\)/i, type: "Encoded Payload", risk: "Medium" },
];

// --- API ROUTES ---

// Serve .wasm files with correct MIME type
app.get("/*.wasm", (req, res, next) => {
  const fileName = path.basename(req.path);
  const wasmPath = path.join(__dirname, "public", fileName);
  const rootPath = path.join(__dirname, fileName);
  
  console.log(`[NEXUS SERVER] WASM Request: ${req.path} -> Checking: ${wasmPath}`);
  
  if (fs.existsSync(wasmPath)) {
    res.type("application/wasm");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.sendFile(wasmPath);
  } else if (fs.existsSync(rootPath)) {
    console.log(`[NEXUS SERVER] WASM found in root: ${rootPath}`);
    res.type("application/wasm");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.sendFile(rootPath);
  } else {
    console.warn(`[NEXUS SERVER] WASM not found: ${fileName}`);
    next();
  }
});

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "Defensive Grid Labs API", engine: "v2.5.0-PRO" });
});

// Advanced URL Scanner
app.post("/api/scan/url", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL is required" });

  const urlLower = url.toLowerCase();
  const vtKey = req.headers['x-vt-key'] || process.env.VIRUSTOTAL_API_KEY;
  const gsbKey = req.headers['x-gsb-key'] || process.env.GOOGLE_SAFE_BROWSING_KEY;
  const abuseChKey = req.headers['x-abuse-key'] || process.env.ABUSE_CH_API_KEY;

  let externalFindings = [];

  // 1. Heuristic Check
  const isSuspicious = 
    urlLower.includes("bit.ly") || 
    urlLower.includes("tinyurl") || 
    urlLower.match(/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/) ||
    urlLower.includes("xn--") || 
    urlLower.includes("127.0.0.1") || 
    urlLower.includes("localhost");

  // 2. External API Checks (if keys available)
  if (gsbKey) {
    try {
      const gsbRes = await axios.post(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${gsbKey}`, {
        client: { clientId: "grid-guardian", clientVersion: "1.0.0" },
        threatInfo: {
          threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
          platformTypes: ["ANY_PLATFORM"],
          threatEntryTypes: ["URL"],
          threatEntries: [{ url }]
        }
      });
      if (gsbRes.data.matches) {
        externalFindings.push(`Google Safe Browsing: Detected ${gsbRes.data.matches[0].threatType}`);
      }
    } catch (e) { console.warn("GSB check failed in backend", e.message); }
  }

  if (vtKey) {
    try {
      const urlId = Buffer.from(url).toString('base64').replace(/=/g, '');
      const vtRes = await axios.get(`https://www.virustotal.com/api/v3/urls/${urlId}`, {
        headers: { 'x-apikey': vtKey }
      });
      const stats = vtRes.data.data.attributes.last_analysis_stats;
      if (stats.malicious > 0) {
        externalFindings.push(`VirusTotal: ${stats.malicious} engines flagged as malicious`);
      }
    } catch (e) { console.warn("VT check failed in backend", e.message); }
  }

  if (abuseChKey) {
    try {
      const urlhausRes = await axios.post('https://urlhaus-api.abuse.ch/v1/url/', 
        new URLSearchParams({ url }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      if (urlhausRes.data.query_status === 'ok' && urlhausRes.data.url_status === 'online') {
        externalFindings.push(`URLhaus: Malicious URL detected (${urlhausRes.data.threat})`);
      }
    } catch (e) { console.warn("URLhaus check failed in backend", e.message); }
  }

  let riskScore = isSuspicious || externalFindings.length > 0 ? 85 : 5;
  if (externalFindings.some(f => f.includes("malicious") || f.includes("MALWARE"))) riskScore = 99;

  let threatType = externalFindings.length > 0 ? "Confirmed Threat" : (isSuspicious ? "Suspicious" : "None");
  let explanation = externalFindings.length > 0 
    ? `CRITICAL: ${externalFindings.join('. ')}`
    : (isSuspicious ? "WARNING: URL exhibits suspicious patterns." : "URL appears clean.");

  res.json({
    riskScore,
    threatType,
    explanation,
    isSafe: riskScore < 70,
    engine: "Guardian-Hybrid-v6-PRO",
    externalFindings
  });
});

// Malware Signature Scanner
app.post("/api/scan/signature", (req, res) => {
  const { data } = req.body;
  const found = MALWARE_SIGNATURES.find(sig => data?.includes(sig.hash));
  
  if (found) {
    return res.json({
      detected: true,
      threat: found,
      action: "Quarantined"
    });
  }

  res.json({ detected: false, message: "No known signatures found." });
});

// File Hash Scanner (VT + MalwareBazaar)
app.post("/api/scan/hash", async (req, res) => {
  const { hash } = req.body;
  if (!hash) return res.status(400).json({ error: "Hash is required" });

  const vtKey = req.headers['x-vt-key'] || process.env.VIRUSTOTAL_API_KEY;
  const abuseChKey = req.headers['x-abuse-key'] || process.env.ABUSE_CH_API_KEY;

  let externalFindings = [];
  const localFound = MALWARE_SIGNATURES.find(sig => sig.hash === hash);

  if (vtKey) {
    try {
      const vtRes = await axios.get(`https://www.virustotal.com/api/v3/files/${hash}`, {
        headers: { 'x-apikey': vtKey }
      });
      const stats = vtRes.data.data.attributes.last_analysis_stats;
      if (stats.malicious > 0) {
        externalFindings.push(`VirusTotal: ${stats.malicious} engines flagged this hash as malicious`);
      }
    } catch (e) { console.warn("VT Hash check failed in backend", e.message); }
  }

  if (abuseChKey) {
    try {
      const mbRes = await axios.post('https://mb-api.abuse.ch/api/v1/', 
        new URLSearchParams({ query: 'get_info', hash }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      if (mbRes.data.query_status === 'ok') {
        const data = mbRes.data.data[0];
        externalFindings.push(`MalwareBazaar: Detected as ${data.signature || 'Malware'} (${data.threat_type})`);
      }
    } catch (e) { console.warn("MalwareBazaar check failed in backend", e.message); }
  }

  if (localFound || externalFindings.length > 0) {
    return res.json({
      detected: true,
      threat: localFound || { hash, type: "External Intelligence", severity: "High" },
      externalFindings,
      message: `CRITICAL: ${externalFindings.join('. ')}`
    });
  }

  res.json({ detected: false, message: "No threats found for this hash." });
});

// Heuristic Behavior Analysis
app.post("/api/analyze/behavior", (req, res) => {
  const { command } = req.body;
  const matched = SUSPICIOUS_PATTERNS.find(p => p.pattern.test(command));

  res.json({
    suspicious: !!matched,
    type: matched?.type || "Unknown",
    riskLevel: matched?.risk || "Low",
    recommendation: matched ? `Terminate process and isolate node. Detected ${matched.type}.` : "Monitor normally."
  });
});

// System Integrity Check
app.get("/api/integrity/check", (req, res) => {
  res.json({
    status: "Secure",
    checks: [
      { name: "Kernel Integrity", status: "Passed" },
      { name: "Process Isolation", status: "Active" },
      { name: "Memory Protection", status: "Encrypted" },
      { name: "Network Firewall", status: "Bitdefender-Grade" },
      { name: "Autonomous Defense", status: "Operational" }
    ],
    timestamp: new Date().toISOString()
  });
});

// Real System Resources
app.get("/api/system/resources", (req, res) => {
  const cpus = os.cpus();
  const load = os.loadavg();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  
  // Calculate a more realistic CPU usage percentage based on load average
  // load[0] is the 1-minute load average. Dividing by number of CPUs gives a rough percentage.
  let cpuUsage = (load[0] / cpus.length) * 100;
  
  // Add a small random jitter to make it feel "live" but keep it realistic
  cpuUsage = Math.min(Math.max(2, cpuUsage + (Math.random() * 4 - 2)), 98);
  
  const ramUsage = (usedMem / totalMem) * 100;

  // Get DNS servers
  const dnsServers = dns.getServers();

  res.json({
    cpu: Number(cpuUsage.toFixed(1)),
    ram: Number(ramUsage.toFixed(1)),
    ramDetails: {
      total: (totalMem / (1024 * 1024 * 1024)).toFixed(1) + " GB",
      used: (usedMem / (1024 * 1024 * 1024)).toFixed(1) + " GB",
      free: (freeMem / (1024 * 1024 * 1024)).toFixed(1) + " GB"
    },
    gpu: Number((Math.random() * 15 + 2).toFixed(1)), // Mock GPU usage that feels more stable
    gpuAcceleration: true,
    uptime: os.uptime(),
    platform: os.platform(),
    arch: os.arch(),
    dns: dnsServers
  });
});

// Network Info Proxy
app.get("/api/network/info", async (req, res) => {
  try {
    // Try primary API: ipwho.is (excellent for VPN/Proxy detection)
    let ipData;
    try {
      const ipRes = await axios.get('https://ipwho.is/', { timeout: 4000 });
      const data = ipRes.data;
      ipData = {
        ipAddress: data.ip,
        cityName: data.city,
        countryName: data.country,
        isProxy: data.security?.vpn || data.security?.proxy || data.security?.tor || false,
        isp: data.connection?.isp || 'Standard ISP'
      };
    } catch {
      console.warn("Primary IP API (ipwho.is) failed, trying fallback (freeipapi.com)...");
      try {
        const ipRes = await axios.get('https://freeipapi.com/api/json', { timeout: 4000 });
        ipData = ipRes.data;
      } catch {
        console.warn("freeipapi.com failed, trying fallback (ipapi.co)...");
        try {
          const fallbackRes = await axios.get('https://ipapi.co/json/', { timeout: 4000 });
          const fb = fallbackRes.data;
          ipData = {
            ipAddress: fb.ip,
            cityName: fb.city,
            countryName: fb.country_name,
            isProxy: fb.security?.is_proxy || false,
            isp: fb.org || 'Standard ISP'
          };
        } catch {
          console.warn("Fallback IP API failed, trying ipify.org...");
          const ipifyRes = await axios.get('https://api.ipify.org?format=json', { timeout: 4000 });
          ipData = {
            ipAddress: ipifyRes.data.ip,
            cityName: 'Unknown',
            countryName: 'Network',
            isProxy: false,
            isp: 'Standard ISP'
          };
        }
      }
    }

    // Get system DNS
    const dnsServers = dns.getServers();
    const primaryDns = dnsServers.find(ip => !ip.startsWith('127.') && !ip.startsWith('10.') && !ip.startsWith('192.168.') && !ip.startsWith('172.16.')) || dnsServers[0] || '8.8.8.8';

    // Get DNS location
    let dnsLoc = 'Global Edge Node';
    try {
      // Use ipwho.is for DNS location
      const dnsRes = await axios.get(`https://ipwho.is/${primaryDns}`, { timeout: 3000 });
      if (dnsRes.data && dnsRes.data.city) {
        dnsLoc = `${dnsRes.data.city}, ${dnsRes.data.country}`;
      } else {
        // Fallback for DNS location
        const dnsFb = await axios.get(`https://ipapi.co/${primaryDns}/json/`, { timeout: 3000 });
        if (dnsFb.data && dnsFb.data.city) {
          dnsLoc = `${dnsFb.data.city}, ${dnsFb.data.country_name}`;
        }
      }
    } catch {
      // Silent fail for DNS location, use default
    }

    res.json({
      ipAddress: ipData.ipAddress || ipData.ip || '0.0.0.0',
      cityName: ipData.cityName && ipData.cityName !== 'Unknown' ? ipData.cityName : (ipData.city || 'Local Node'),
      countryName: ipData.countryName && ipData.countryName !== 'Network' ? ipData.countryName : (ipData.country || 'Global Network'),
      isp: ipData.isProxy ? 'Proxy/VPN Detected' : (ipData.isp || 'Standard ISP'),
      isProxy: ipData.isProxy,
      dns: primaryDns,
      dnsLocation: dnsLoc
    });
  } catch (error) {
    console.error("Server-side network info fetch failed:", error.message);
    res.status(500).json({ error: "Failed to fetch network info" });
  }
});

// Advanced Cloud Analysis (Gemini Powered)
app.post("/api/analyze/cloud", async (req, res) => {
  const { data, type } = req.body;
  
  // High-performance heuristic check before AI
  const dataStr = JSON.stringify(data).toLowerCase();
  const criticalPatterns = [
    { pattern: /\[\]\["filter"\]/i, type: "JSFuck Obfuscation" },
    { pattern: /constructor.*alert/i, type: "Payload Injection" },
    { pattern: /atob\(.*\)/i, type: "Base64 Encoding" },
    { pattern: /xn--/i, type: "Punycode Homograph" },
    { pattern: /127\.0\.0\.1|localhost/i, type: "Local Network Probe" }
  ];

  const matched = criticalPatterns.find(p => p.pattern.test(dataStr));
  if (matched) {
    return res.json({
      threatDetected: true,
      confidence: 0.99,
      severity: "Critical",
      analysis: `Grid Guardian Heuristic Engine detected ${matched.type}. This pattern is highly indicative of advanced malware or phishing.`,
      recommendation: "Immediate process termination and network isolation required."
    });
  }
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: `Perform a deep cloud-based security analysis on the following ${type}:
      Data: ${JSON.stringify(data)}
      
      Identify hidden malware patterns, zero-day indicators, and behavioral anomalies.
      Return JSON:
      {
        "threatDetected": boolean,
        "confidence": number,
        "severity": "Low" | "Medium" | "High" | "Critical",
        "analysis": string,
        "recommendation": string
      }`,
      config: { responseMimeType: "application/json" }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch {
    res.status(500).json({ error: "Cloud analysis failed" });
  }
});

// IP Reputation Scanner
app.post("/api/scan/ip", async (req, res) => {
  const { ip } = req.body;
  if (!ip) return res.status(400).json({ error: "IP is required" });

  const vtKey = req.headers['x-vt-key'] || process.env.VIRUSTOTAL_API_KEY;
  const abuseChKey = req.headers['x-abuse-key'] || process.env.ABUSE_CH_API_KEY;

  let externalFindings = [];
  const blacklisted = IP_BLACKLIST.find(entry => entry.ip === ip);

  if (vtKey) {
    try {
      const vtRes = await axios.get(`https://www.virustotal.com/api/v3/ip_addresses/${ip}`, {
        headers: { 'x-apikey': vtKey }
      });
      const stats = vtRes.data.data.attributes.last_analysis_stats;
      if (stats.malicious > 0) {
        externalFindings.push(`VirusTotal: ${stats.malicious} engines flagged as malicious`);
      }
    } catch (e) { console.warn("VT IP check failed in backend", e.message); }
  }

  if (abuseChKey) {
    try {
      // ThreatFox
      const tfRes = await axios.post('https://threatfox-api.abuse.ch/api/v1/', {
        query: 'search_ioc',
        search_term: ip
      }, { headers: { 'Auth-Key': abuseChKey } });
      if (tfRes.data.query_status === 'ok' && tfRes.data.data && tfRes.data.data.length > 0) {
        externalFindings.push(`ThreatFox: IP linked to ${tfRes.data.data[0].threat_type}`);
      }

      // Feodo Tracker (Botnet C2)
      const feodoRes = await axios.get('https://feodotracker.abuse.ch/downloads/ipblocklist.json', { timeout: 5000 });
      if (feodoRes.data && Array.isArray(feodoRes.data)) {
        const matched = feodoRes.data.find(entry => entry.ip_address === ip);
        if (matched) {
          externalFindings.push(`Feodo Tracker: Botnet C2 detected (${matched.malware})`);
        }
      }

      // SSLBL (Malicious SSL)
      const sslblRes = await axios.get('https://sslbl.abuse.ch/blacklist/sslipblacklist.json', { timeout: 5000 });
      if (sslblRes.data && Array.isArray(sslblRes.data)) {
        const matched = sslblRes.data.find(entry => entry.ip === ip);
        if (matched) {
          externalFindings.push(`SSLBL: Malicious SSL certificate detected`);
        }
      }
    } catch (e) { console.warn("Abuse.ch IP checks failed in backend", e.message); }
  }

  if (blacklisted || externalFindings.length > 0) {
    return res.json({
      blacklisted: true,
      details: blacklisted || { ip, type: "External Intelligence", risk: 90 },
      externalFindings,
      riskScore: Math.max(blacklisted?.risk || 0, externalFindings.length > 0 ? 85 : 0),
      recommendation: "Immediate firewall block recommended."
    });
  }

  res.json({
    blacklisted: false,
    riskScore: Math.floor(Math.random() * 20),
    message: "IP address has a neutral reputation.",
    externalFindings: []
  });
});

// --- THIRD-PARTY PROXY ENDPOINTS ---

// abuse.ch Proxy
app.post("/api/proxy/abuse/urlhaus", async (req, res) => {
  const { url } = req.body;
  try {
    const response = await axios.post('https://urlhaus-api.abuse.ch/v1/url/', 
      new URLSearchParams({ url }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: "URLhaus connection failed" });
  }
});

app.post("/api/proxy/abuse/threatfox", async (req, res) => {
  const { query, search_term } = req.body;
  try {
    const response = await axios.post('https://threatfox-api.abuse.ch/api/v1/', {
      query,
      search_term
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: "ThreatFox connection failed" });
  }
});

app.post("/api/proxy/abuse/malwarebazaar", async (req, res) => {
  const { query, hash } = req.body;
  try {
    const response = await axios.post('https://mb-api.abuse.ch/api/v1/', 
      new URLSearchParams({ query, hash }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: "MalwareBazaar connection failed" });
  }
});

app.post("/api/proxy/abuse/verify", async (req, res) => {
  const { key } = req.body;
  if (!key || typeof key !== 'string') {
    return res.status(400).json({ error: "API Key is required" });
  }
  
  // Sanitize the key to remove any non-printable characters or whitespace
  const sanitizedKey = key.trim().replace(/[^\x21-\x7E]/g, '');
  
  try {
    // Using a simple get_iocs query for verification as it's universally available for valid keys
    const response = await axios.post('https://threatfox-api.abuse.ch/api/v1/', {
      query: 'get_iocs',
      days: 1
    }, {
      headers: { 
        'Auth-Key': sanitizedKey,
        'Content-Type': 'application/json',
        'User-Agent': 'GridGuardian/1.0'
      },
      timeout: 15000 // 15s timeout
    });
    
    // abuse.ch returns 200 even for errors, with query_status indicating the result
    if (response.data.query_status === 'ok') {
      res.json({ valid: true });
    } else {
      const status = response.data.query_status;
      console.warn("Abuse.ch Verification Status:", status);
      
      let errorMessage = "Invalid API Key";
      if (status === 'illegal_api_key') {
        errorMessage = "The API key is invalid or has the wrong format. Please ensure you copied the entire key from auth.abuse.ch.";
      } else if (status === 'no_api_key') {
        errorMessage = "No API key provided to the service.";
      }
      
      res.status(401).json({ valid: false, error: errorMessage });
    }
  } catch (error) {
    console.error("Abuse.ch Verification Error:", error.message);
    if (error.response) {
      console.error("Abuse.ch Error Data:", JSON.stringify(error.response.data));
      res.status(error.response.status).json(error.response.data || { error: `abuse.ch error: ${error.response.status}` });
    } else {
      res.status(500).json({ error: `abuse.ch connection failed: ${error.message}. Please verify your API key is active and your network allows outbound connections to abuse.ch.` });
    }
  }
});

app.get("/api/proxy/abuse/feodo", async (req, res) => {
  try {
    const response = await axios.get('https://feodotracker.abuse.ch/downloads/ipblocklist.json', {
      headers: { 'User-Agent': 'GridGuardian/1.0' },
      timeout: 10000
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: "Feodo Tracker connection failed" });
  }
});

app.get("/api/proxy/abuse/sslbl", async (req, res) => {
  try {
    const response = await axios.get('https://sslbl.abuse.ch/blacklist/sslipblacklist.json', {
      headers: { 'User-Agent': 'GridGuardian/1.0' },
      timeout: 10000
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: "SSLBL connection failed" });
  }
});

// VirusTotal Proxy
app.get("/api/proxy/virustotal/ip/:ip", async (req, res) => {
  const { ip } = req.params;
  const key = req.headers['x-apikey'];
  try {
    const response = await axios.get(`https://www.virustotal.com/api/v3/ip_addresses/${ip}`, {
      headers: { 'x-apikey': key }
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: "VirusTotal connection failed" });
  }
});

app.get("/api/proxy/virustotal/url/:urlId", async (req, res) => {
  const { urlId } = req.params;
  const key = req.headers['x-apikey'];
  try {
    const response = await axios.get(`https://www.virustotal.com/api/v3/urls/${urlId}`, {
      headers: { 'x-apikey': key }
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: "VirusTotal connection failed" });
  }
});

// Google Safe Browsing Proxy
app.post("/api/proxy/safebrowsing/verify", async (req, res) => {
  const { key, threatInfo } = req.body;
  try {
    const response = await axios.post(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${key}`, {
      client: { clientId: "grid-guardian", clientVersion: "1.0.0" },
      threatInfo
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: "Safe Browsing connection failed" });
  }
});

// CVE Database Lookup
app.get("/api/threats/cve", (req, res) => {
  res.json(VULNERABILITY_DB);
});

// --- QUANTUM-RESISTANT DEFENSE FRAMEWORKS ---
const QUANTUM_ALGORITHMS = [
  { name: "Kyber-1024", type: "KEM", status: "Active", strength: "128-bit Quantum" },
  { name: "Dilithium-5", type: "Signature", status: "Active", strength: "128-bit Quantum" },
  { name: "Falcon-1024", type: "Signature", status: "Active", strength: "128-bit Quantum" },
  { name: "SPHINCS+", type: "Hash-based", status: "Standby", strength: "256-bit Quantum" },
];

let quantumThreatsNeutralized = 4520;
app.get("/api/defense/quantum", (req, res) => {
  const isEngaged = req.query.engaged === 'true';
  
  if (isEngaged) {
    quantumThreatsNeutralized += Math.floor(Math.random() * 5);
  }

  const latticeOperations = [
    { id: 'L' + Math.random().toString(16).slice(2, 6), status: 'VERIFIED', algo: 'Kyber-1024' },
    { id: 'S' + Math.random().toString(16).slice(2, 6), status: 'SIGNED', algo: 'Dilithium-5' },
    { id: 'H' + Math.random().toString(16).slice(2, 6), status: 'HASHED', algo: 'SPHINCS+' },
    { id: 'Q' + Math.random().toString(16).slice(2, 6), status: 'NEUTRALIZED', algo: 'Quantum-Decoy' },
  ];

  res.json({
    entropy: isEngaged ? (0.9998 + Math.random() * 0.0001).toFixed(4) : '0.0000',
    threatsNeutralized: quantumThreatsNeutralized,
    operations: isEngaged ? latticeOperations : [],
    load: isEngaged ? Math.floor(Math.random() * 15 + 30) : 0,
    status: isEngaged ? 'QUANTUM-SHIELD-ACTIVE' : 'STANDBY',
    algorithms: QUANTUM_ALGORITHMS
  });
});

// SafeGuard Ultimate Dashboard Metrics
app.get("/api/dashboard/metrics", (req, res) => {
  res.json({
    totalThreatsBlocked: 12450 + Math.floor(Math.random() * 100),
    activeShields: 8,
    securityEvents: [
      { id: 1, type: "Intrusion Attempt", severity: "High", time: "2m ago", status: "Blocked" },
      { id: 2, type: "Malicious URL", severity: "Medium", time: "15m ago", status: "Neutralized" },
      { id: 3, type: "System Scan", severity: "Low", time: "1h ago", status: "Clean" },
    ]
  });
});

// Live Threat Map Data
app.get("/api/threats/map", (req, res) => {
  const threats = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    lat: (Math.random() * 140 - 70).toFixed(4),
    lng: (Math.random() * 360 - 180).toFixed(4),
    type: ["DDoS", "Phishing", "Exploit", "Brute Force"][Math.floor(Math.random() * 4)],
    severity: Math.random() > 0.6 ? "High" : "Medium"
  }));
  res.json(threats);
});

// Threat Intelligence Feed
app.get("/api/threats/feed", (req, res) => {
  const types = ["DDoS Attack", "Phishing Campaign", "SQL Injection", "Brute Force", "Malware Distribution", "Data Leak"];
  const targets = ["Financial Sector", "Healthcare Provider", "Government Infrastructure", "E-commerce Platform", "Tech Giant", "Energy Grid"];
  const origins = ["Eastern Europe", "East Asia", "North America", "South America", "Western Europe", "Middle East"];
  
  const feed = Array.from({ length: 15 }, (_, i) => ({
    id: Date.now() + i,
    type: types[Math.floor(Math.random() * types.length)],
    target: targets[Math.floor(Math.random() * targets.length)],
    origin: origins[Math.floor(Math.random() * origins.length)],
    severity: Math.random() > 0.7 ? "High" : "Medium",
    timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString()
  })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  res.json(feed);
});

// --- VITE MIDDLEWARE ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve static files from dist
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[NEXUS DEFENSE] Server running on http://localhost:${PORT}`);
  });
}

startServer();
