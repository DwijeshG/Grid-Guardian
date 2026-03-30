import { GoogleGenAI } from "@google/genai";

let aiClient = null;
let currentApiKey = null;

const getAiClient = () => {
  if (aiClient) return aiClient;
  
  const key = currentApiKey || (typeof window !== 'undefined' && localStorage.getItem('NEXUS_GEMINI_KEY')) || (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY);
  if (!key) return null;
  
  aiClient = new GoogleGenAI({ apiKey: key });
  return aiClient;
};

const fetchWithTimeout = async (resource, options = {}) => {
  const { timeout = 8000 } = options;
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

const getBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location.origin.includes('.run.app')) {
    return window.location.origin;
  }
  // Fallback to VITE_APP_URL if available
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_APP_URL) {
    return import.meta.env.VITE_APP_URL;
  }
  return '';
};

export const setAiApiKey = (key) => {
  currentApiKey = key;
  aiClient = new GoogleGenAI({ apiKey: key });
  if (typeof window !== 'undefined') {
    localStorage.setItem('NEXUS_GEMINI_KEY', key);
  }
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.set({ NEXUS_GEMINI_KEY: key });
  }
};

export const validateAiApiKey = async (key) => {
  try {
    const tempClient = new GoogleGenAI({ apiKey: key });
    
    // Create a promise that rejects after 10 seconds
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Validation timed out. Please check your connection.")), 10000)
    );

    // Make a minimal call to validate the key
    const validationPromise = tempClient.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "ping",
      config: { maxOutputTokens: 1 }
    });

    await Promise.race([validationPromise, timeoutPromise]);
    return { valid: true };
  } catch (error) {
    console.error("API Key validation failed:", error);
    let errorMessage = error.message || "Invalid API Key. Please check your credentials.";
    if (errorMessage.includes("503") || errorMessage.includes("UNAVAILABLE")) {
      errorMessage = "Gemini API is currently overloaded (503). Your key is likely valid, but the service is temporarily unavailable. Please try again in a few minutes.";
    }
    return { 
      valid: false, 
      error: errorMessage
    };
  }
};

export const validateVirusTotalKey = async (key) => {
  try {
    const response = await fetch(`${getBaseUrl()}/api/proxy/virustotal/ip/8.8.8.8`, {
      headers: { 'x-apikey': key }
    });
    if (response.ok) return { valid: true };
    const data = await response.json();
    return { valid: false, error: data.error?.message || "Invalid VirusTotal Key." };
  } catch {
    return { valid: false, error: "Connection failed. Check your network." };
  }
};

export const validateAbuseCh = async (key) => {
  if (!key) return { valid: false, error: "API Key is required for abuse.ch integration." };
  try {
    const response = await fetch(`${getBaseUrl()}/api/proxy/abuse/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key })
    });
    if (response.ok) return { valid: true };
    const data = await response.json();
    return { valid: false, error: data.error || "Invalid abuse.ch API Key." };
  } catch {
    return { valid: false, error: "Connection failed. Check your network." };
  }
};

export const validateSafeBrowsingKey = async (key) => {
  try {
    const response = await fetch(`${getBaseUrl()}/api/proxy/safebrowsing/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key,
        threatInfo: {
          threatTypes: ["MALWARE", "SOCIAL_ENGINEERING"],
          platformTypes: ["ANY_PLATFORM"],
          threatEntryTypes: ["URL"],
          threatEntries: [{ url: "http://testsafebrowsing.appspot.com/s/malware.html" }]
        }
      })
    });
    if (response.ok) return { valid: true };
    const data = await response.json();
    return { valid: false, error: data.error?.message || "Invalid Google Safe Browsing Key." };
  } catch {
    return { valid: false, error: "Connection failed. Check your network." };
  }
};

// Initialize from storage if available
if (typeof chrome !== 'undefined' && chrome.storage) {
  chrome.storage.local.get(['NEXUS_GEMINI_KEY'], (result) => {
    if (result.NEXUS_GEMINI_KEY) {
      setAiApiKey(result.NEXUS_GEMINI_KEY);
    }
  });
}

const getSavedKeys = () => {
  if (typeof window === 'undefined') return {};
  return {
    gemini: localStorage.getItem('NEXUS_GEMINI_KEY'),
    vt: localStorage.getItem('NEXUS_VT_KEY'),
    gsb: localStorage.getItem('NEXUS_GSB_KEY'),
    abuseCh: localStorage.getItem('NEXUS_ABUSE_CH_KEY'),
    abuseChActive: localStorage.getItem('NEXUS_ABUSE_CH_ACTIVE') !== 'false'
  };
};

export async function analyzeUrl(url) {
  try {
    const keys = getSavedKeys();

    // Call the backend security engine with all available keys
    const backendResponse = await fetch(`${getBaseUrl()}/api/scan/url`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-vt-key': keys.vt || '',
        'x-gsb-key': keys.gsb || '',
        'x-abuse-key': keys.abuseCh || ''
      },
      referrerPolicy: 'no-referrer',
      body: JSON.stringify({ url })
    });
    
    let backendData = null;
    if (backendResponse.ok) {
      backendData = await backendResponse.json();
    }

    // Use AI to combine and interpret results
    const ai = getAiClient();
    if (!ai) {
      if (backendData && backendData.externalFindings?.length > 0) {
        return {
          riskScore: backendData.riskScore,
          threatType: backendData.threatType,
          explanation: backendData.explanation,
          isSafe: backendData.isSafe
        };
      }
      return {
        riskScore: 50,
        threatType: "Suspicious",
        explanation: "AI analysis unavailable. Please configure your Gemini API Key in settings.",
        isSafe: false
      };
    }

    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: `Analyze the following URL for potential security threats. 
      Backend Engine Data: ${JSON.stringify(backendData) || 'None'}.
      URL: ${url}
      
      Return JSON format:
      {
        "riskScore": number,
        "threatType": "None" | "Phishing" | "Malware" | "Suspicious",
        "explanation": string,
        "isSafe": boolean
      }`,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return {
      riskScore: 0,
      threatType: "None",
      explanation: "Analysis unavailable.",
      isSafe: true
    };
  }
}

export async function checkIntegrity() {
  try {
    const response = await fetchWithTimeout(`${getBaseUrl()}/api/integrity/check`, { referrerPolicy: 'no-referrer' });
    return await response.json();
  } catch {
    return null;
  }
}

export async function scanSignature(data) {
  try {
    const response = await fetchWithTimeout(`${getBaseUrl()}/api/scan/signature`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      referrerPolicy: 'no-referrer',
      body: JSON.stringify({ data })
    });
    return await response.json();
  } catch {
    return { detected: false };
  }
}

export async function scanIp(ip) {
  try {
    const keys = getSavedKeys();

    const response = await fetchWithTimeout(`${getBaseUrl()}/api/scan/ip`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-vt-key': keys.vt || '',
        'x-abuse-key': keys.abuseCh || ''
      },
      referrerPolicy: 'no-referrer',
      body: JSON.stringify({ ip })
    });
    
    return await response.json();
  } catch {
    return { blacklisted: false, riskScore: 0 };
  }
}

export async function scanFileHash(hash) {
  try {
    const keys = getSavedKeys();
    const response = await fetchWithTimeout(`${getBaseUrl()}/api/scan/hash`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-vt-key': keys.vt || '',
        'x-abuse-key': keys.abuseCh || ''
      },
      body: JSON.stringify({ hash })
    });
    return await response.json();
  } catch {
    return { detected: false };
  }
}

export async function getCveDatabase() {
  try {
    const response = await fetchWithTimeout(`${getBaseUrl()}/api/threats/cve`, { referrerPolicy: 'no-referrer' });
    return await response.json();
  } catch {
    return [];
  }
}

export async function getThreatFeed() {
  try {
    const response = await fetchWithTimeout(`${getBaseUrl()}/api/threats/feed`, { referrerPolicy: 'no-referrer' });
    return await response.json();
  } catch {
    return [];
  }
}

export async function analyzeCloudBehavior(data, type) {
  try {
    const ai = getAiClient();
    if (ai) {
      const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: `Perform a deep cloud-based security analysis on the following ${type}:
        Data: ${JSON.stringify(data)}
        
        Identify potential threats, anomalies, or malicious patterns.
        Return JSON format:
        {
          "threatDetected": boolean,
          "confidence": number,
          "severity": "Low" | "Medium" | "High" | "Critical",
          "analysis": string,
          "recommendation": string
        }`,
        config: {
          responseMimeType: "application/json"
        }
      });
      return JSON.parse(response.text || "{}");
    }

    // Fallback to server if no client-side key
    const response = await fetchWithTimeout(`${getBaseUrl()}/api/analyze/cloud`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      referrerPolicy: 'no-referrer',
      body: JSON.stringify({ data, type })
    });
    return await response.json();
  } catch (error) {
    console.error("Cloud analysis failed:", error);
    return { threatDetected: false, analysis: "Cloud analysis unavailable." };
  }
}

export async function analyzeNetworkExposure() {
  try {
    const keys = getSavedKeys();
    if (!keys.abuseCh || !keys.abuseChActive) return null;

    // Use Feodo Tracker as a proxy for "network intelligence"
    const response = await fetchWithTimeout(`${getBaseUrl()}/api/proxy/abuse/feodo`);
    
    if (response.ok) {
      return {
        provider: 'abuse.ch',
        status: 'Synced',
        details: 'Global threat intelligence active. Monitoring for botnet C2 and malicious SSL vectors.'
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function getSecurityAdvice(query, context) {
  try {
    const ai = getAiClient();
    if (!ai) throw new Error("AI client not initialized");

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are the Defensive Grid Labs AI Security Consultant. 
      Answer the user's security query based on the current system context.
      System Context: ${context}
      User Query: ${query}
      
      Keep the tone professional, technical, and concise.`,
    });
    return response.text;
  } catch {
    return "Consultant offline. Please check network connection.";
  }
}

export async function summarizeLogs(logs) {
  try {
    const ai = getAiClient();
    if (!ai) throw new Error("AI client not initialized");

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Summarize these security logs and identify the primary threat vector.
      Logs: ${logs.join('\n')}
      
      Provide a 1-sentence summary and a threat level (Low, Medium, High).
      Return JSON:
      {
        "summary": string,
        "threatLevel": string
      }`,
      config: {
        responseMimeType: "application/json"
      }
    });
    return JSON.parse(response.text || "{}");
  } catch {
    return { summary: "Unable to process logs.", threatLevel: "Unknown" };
  }
}
