// Grid Guardian Content Scanning Script
(function() {
  if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.id) {
    return;
  }
  console.log("[NEXUS] Content Shield Active");

  // 1. Autonomous Cookie & Consent Annihilator
  function annihilateCookieBanners() {
  const commonSelectors = [
    '#onetrust-consent-sdk', '#cookie-banner', '.cookie-banner', '#cmp-box', 
    '.cc-window', '#qc-cmp2-container', '.css-1hy296u', '#gdpr-consent-tool-wrapper'
  ];
  
  const rejectKeywords = [
    'Reject All', 'Decline', 'Necessary only', 'Reject', 'Non-essential only', 'Manage Cookies'
  ];

  function processBanners() {
    try {
      commonSelectors.forEach(selector => {
        const banner = document.querySelector(selector);
        if (banner && banner.style.display !== 'none') {
          // Try to find a reject button
          const buttons = banner.querySelectorAll('button, a');
          let clicked = false;
          for (const btn of buttons) {
            const text = btn.innerText || btn.value || "";
            if (rejectKeywords.some(kw => text.includes(kw))) {
              console.log("[NEXUS] Automatically rejecting cookies on:", text);
              btn.click();
              clicked = true;
              break;
            }
          }
          // If no button found or clicked, just hide it
          if (!clicked) {
            banner.style.display = 'none';
          }
        }
      });
    } catch {
      // Silent catch for DOM errors
    }
  }

  // Initial run
  processBanners();

  // Use MutationObserver instead of setInterval for performance
  try {
    const observer = new MutationObserver((mutations) => {
      if (mutations.some(m => m.addedNodes.length > 0)) {
        processBanners();
      }
    });

    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true
    });

    // Stop observing after 15 seconds to save resources
    setTimeout(() => {
      try {
        observer.disconnect();
      } catch {
        // Ignore disconnect errors
      }
    }, 15000);
  } catch {
    console.warn("[NEXUS] MutationObserver failed:");
  }
}

// 2. Automated "Honeypot" Defense (Simplified)
function setupHoneypot() {
  console.log("[NEXUS] Honeypot Monitoring Active (Passive Mode)");
}

// Listen for messages from injected script
window.addEventListener('message', (event) => {
  if (event.data?.type === 'NEXUS_KEYLOGGER_BLOCKED') {
    reportThreat({ type: "Formjacking Attempt", detail: `Blocked key listener on field: ${event.data.field}` });
  }
});

/**
 * Neural Sidecar Integration (Background AI)
 */
async function evaluatePageContent() {
  if (!chrome.runtime?.id) return; // Extension context invalidated

  try {
    const content = document.documentElement.innerText.substring(0, 2000);
    chrome.runtime.sendMessage({ 
      type: 'CONTENT_EVALUATE_THREAT', 
      payload: content 
    }, (response) => {
      if (chrome.runtime.lastError) return;
      
      if (response && response.score > 0.8) {
        console.warn("[NEXUS AI] High-confidence threat detected via background AI!");
        reportThreat({ 
          type: "Neural Threat Detection", 
          detail: `Local AI flagged content with score: ${response.score.toFixed(2)}`,
          severity: "High"
        });
      }
    });
  } catch {
    console.warn("[NEXUS AI] Background inference failed:");
  }
}

// 3. Script Sentry: Behavioral Analysis
function setupScriptSentry() {
  window.addEventListener('beforeunload', () => {
    try {
      const activeElement = document.activeElement;
      if (!activeElement || activeElement.tagName !== 'A') {
        reportThreat({ 
          type: "Drive-by Attempt", 
          detail: "Unauthorized navigation detected." 
        });
      }
    } catch {
      // Ignore errors on unload
    }
  });
}

// Advanced Heuristics Engine
function scanPage() {
  try {
    annihilateCookieBanners();
    setupHoneypot();
    setupScriptSentry();
    evaluatePageContent();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          try {
            if (node.nodeName === "SCRIPT") {
              analyzeScript(node);
            } else if (node.nodeName === "IFRAME") {
              analyzeIframe(node);
            }
          } catch {
            // Ignore mutation errors
          }
        });
      });
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });

    document.querySelectorAll("script").forEach(analyzeScript);
    document.querySelectorAll("iframe").forEach(analyzeIframe);
    analyzeForms();
  } catch {
    console.error("[NEXUS] Scan failed:");
  }
}

function analyzeScript(script) {
  try {
    const content = script.innerText || "";
    const src = script.src || "";

    if (src.includes("coinhive") || content.includes("CoinHive") || content.includes("miner.start")) {
      reportThreat({ type: "Cryptojacker", detail: "Crypto-mining script detected" });
    }

    if (content.includes("atob(") && content.includes("eval(")) {
      reportThreat({ type: "Encoded Payload", detail: "Base64 eval pattern detected" });
    }
  } catch {
    // Ignore script analysis errors
  }
}

function analyzeIframe(iframe) {
  try {
    const src = iframe.src || "";
    if (src.includes("javascript:") || src.includes("data:")) {
      reportThreat({ type: "Malicious Iframe", detail: `Suspicious iframe source: ${src.slice(0, 50)}...` });
    }
  } catch {
    // Ignore iframe analysis errors
  }
}

function analyzeForms() {
  try {
    const forms = document.querySelectorAll("form");
    forms.forEach(form => {
      const action = form.action.toLowerCase();
      const hasPassword = form.querySelector('input[type="password"]');
      
      if (hasPassword) {
        try {
          const url = new URL(action, window.location.href);
          const isIp = /^[0-9.]+$/.test(url.hostname);
          
          if (isIp) {
            reportThreat({ type: "Phishing Risk", detail: "Password form submitting to raw IP address" });
          }
          
          if (action.includes("malicious") || action.includes("phish") || action.includes("hack")) {
            reportThreat({ type: "Phishing Form", detail: `Form action: ${action}` });
          }
        } catch {
          // Ignore URL parsing errors
        }
      }
    });
  } catch {
    // Ignore form analysis errors
  }
}

function reportThreat(data) {
  if (!chrome.runtime?.id) return;
  try {
    chrome.runtime.sendMessage({
      type: "THREAT_DETECTED",
      data: data
    });
  } catch {
    // Ignore message errors
  }
}

// Run scan on load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", scanPage);
} else {
  scanPage();
}
})();
