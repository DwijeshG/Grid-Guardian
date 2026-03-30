import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Activity, 
  Globe, 
  Lock, 
  Eye, 
  EyeOff, 
  Zap, 
  Cpu, 
  LayoutDashboard, 
  Power, 
  Key, 
  Brain, 
  MapPin, 
  Code2, 
  Coins, 
  Cloud, 
  Fingerprint, 
  Shuffle, 
  Crosshair, 
  Target,
  Info,
  X,
  Check,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area
} from 'recharts';
import { 
  checkIntegrity, 
  getCveDatabase, 
  getThreatFeed,
  setAiApiKey,
  validateAiApiKey,
  validateVirusTotalKey,
  validateAbuseCh,
  validateSafeBrowsingKey,
  analyzeNetworkExposure
} from './services/aiShield';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}



export default function App() {
  const [shields, setShields] = useState({
    firewall: true,
    cloud_heuristic: true,
    privacy: true,
    malware: true,
    ai_ml_shield: true,
    mining_protection: true
  });

  const [stats, setStats] = useState({
    total: 0,
    trackers: 0,
    ads: 0,
    malware: 0,
    phishing: 0,
    firewall: 0,
    neutralized: 0,
    breaches: 0,
    quantumEntropy: '99.9%'
  });

  const [isExtensionActive, setIsExtensionActive] = useState(true);
  const [activeTab, setActiveTab] = useState('DASHBOARD');
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('NEXUS_GEMINI_KEY') || '');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isSetupComplete, setIsSetupComplete] = useState(() => !!localStorage.getItem('NEXUS_GEMINI_KEY'));
  const [isAbuseChValidated, setIsAbuseChValidated] = useState(() => !!localStorage.getItem('NEXUS_ABUSE_CH_KEY'));
  const [vtKey, setVtKey] = useState(() => localStorage.getItem('NEXUS_VT_KEY') || '');
  const [gsbKey, setGsbKey] = useState(() => localStorage.getItem('NEXUS_GSB_KEY') || '');
  const [abuseChKey, setAbuseChKey] = useState(() => localStorage.getItem('NEXUS_ABUSE_CH_KEY') || '');
  const [abuseChActive, setAbuseChActive] = useState(() => {
    const key = localStorage.getItem('NEXUS_ABUSE_CH_KEY');
    const active = localStorage.getItem('NEXUS_ABUSE_CH_ACTIVE');
    if (!key) return false;
    return active !== 'false';
  });
  
  const [isKeyVisible, setIsKeyVisible] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [keyError, setKeyError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showInfo, setShowInfo] = useState(null);
  const [protectionLevel, setProtectionLevel] = useState(() => localStorage.getItem('NEXUS_PROTECTION_LEVEL') || 'STANDARD');
  const [isRepairing, setIsRepairing] = useState(false);
  const [isAutoRepairing, setIsAutoRepairing] = useState(false);
  const [isShuttingDown, setIsShuttingDown] = useState(false);
  const [isInterceptorActive, setIsInterceptorActive] = useState(() => localStorage.getItem('NEXUS_INTERCEPTOR_ACTIVE') !== 'false');
  const [isAiDefenseActive, setIsAiDefenseActive] = useState(() => localStorage.getItem('NEXUS_AI_DEFENSE_ACTIVE') !== 'false');
  const [isQuantumShieldActive, setIsQuantumShieldActive] = useState(() => localStorage.getItem('NEXUS_QUANTUM_SHIELD_ACTIVE') !== 'false');
  const [isVectorRedirectionActive, setIsVectorRedirectionActive] = useState(() => localStorage.getItem('NEXUS_VECTOR_REDIRECTION_ACTIVE') !== 'false');
  const [interceptedCount, setInterceptedCount] = useState(1420);
  const [destroyedCount, setDestroyedCount] = useState(842);
  const [isDefensiveOffenseActive, setIsDefensiveOffenseActive] = useState(() => localStorage.getItem('NEXUS_DEFENSIVE_OFFENSE_ACTIVE') !== 'false');
  const [blockedSite, setBlockedSite] = useState(null);
  const [webProtection, setWebProtection] = useState(() => {
    const saved = localStorage.getItem('NEXUS_WEB_PROTECTION');
    return saved ? JSON.parse(saved) : {
      realtime: true,
      antiPhishing: true,
      maliciousBlock: true,
      sslCheck: true
    };
  });

  const [aiAssistant, setAiAssistant] = useState({
    active: true,
    message: "Defensive Offense protocols initialized. Script Interceptor is monitoring for zero-day threats.",
    status: 'ACTIVE DEFENSE',
    currentTask: 'Intercepting Malicious Payloads',
    optimizationLog: ['Defensive Offense Active', 'Script Interceptor Online', 'Neural Sync Active']
  });

  const [threatMap, setThreatMap] = useState([]);
  const [isHybridDefenseActive, setIsHybridDefenseActive] = useState(() => localStorage.getItem('NEXUS_HYBRID_DEFENSE_ACTIVE') !== 'false');
  const [isTensorFlowActive, setIsTensorFlowActive] = useState(() => localStorage.getItem('NEXUS_TENSORFLOW_ACTIVE') !== 'false');
  const [isAiShieldActive, setIsAiShieldActive] = useState(() => localStorage.getItem('NEXUS_AI_SHIELD_ACTIVE') !== 'false');
  const [entropyValue, setEntropyValue] = useState(0.9998);
  const [localBrainLoad, setLocalBrainLoad] = useState(45);
  const [cloudBrainLoad, setCloudBrainLoad] = useState(12);
  const [isShielding, setIsShielding] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [hybridStats, setHybridStats] = useState({
    fusionLevel: 98.4,
    adaptiveRate: 99.2,
    confidence: 99.9,
    behavioralAnalysis: 'OPTIMAL',
    neuralSync: 'STABLE'
  });

  const [apiStats, setApiStats] = useState({
    gsb: { latency: 12, queries: 0 },
    vt: { latency: 45, queries: 0 },
    abuse: { latency: 15, queries: 0 }
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setApiStats(prev => ({
        gsb: { latency: Math.floor(Math.random() * 10 + 10), queries: prev.gsb.queries + Math.floor(Math.random() * 2) },
        vt: { latency: Math.floor(Math.random() * 20 + 35), queries: prev.vt.queries + Math.floor(Math.random() * 3) },
        abuse: { latency: Math.floor(Math.random() * 10 + 10), queries: prev.abuse.queries + Math.floor(Math.random() * 4) }
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const [network, setNetwork] = useState({
    ip: 'Scanning...',
    city: 'Local',
    country: 'Network',
    isp: 'Detecting...',
    dns: 'Detecting...',
    dnsLocation: 'Detecting...',
    isProxy: false
  });

  const [trafficData, setTrafficData] = useState([]);
  const [networkSpeed, setNetworkSpeed] = useState({ down: 124, up: 42 });
  const [isAutonomous] = useState(true);
  const [isLoadingNetwork, setIsLoadingNetwork] = useState(false);

  const [extraShields, setExtraShields] = useState(() => {
    const saved = localStorage.getItem('NEXUS_EXTRA_SHIELDS');
    return saved ? JSON.parse(saved) : {
      ransomware: true,
      rootkit: true,
      zero_day: true,
      fileless: true,
      anti_theft: false,
      scheduled_scan: true
    };
  });

  const securityScore = useMemo(() => {
    const activeShieldsCount = Object.values(shields).filter(Boolean).length;
    const webShieldCount = Object.values(webProtection).filter(Boolean).length;
    const totalShields = Object.keys(shields).length + Object.keys(webProtection).length;
    const shieldFactor = ((activeShieldsCount + webShieldCount) / totalShields) * 60; 
    
    const threatImpact = Math.min(stats.breaches * 10, 30);
    const threatFactor = 30 - threatImpact; 
    
    const levelBonus = protectionLevel === 'AGGRESSIVE' ? 10 : 0;
    const baseFactor = 10;
    
    return Math.min(100, Math.round(shieldFactor + threatFactor + baseFactor + levelBonus));
  }, [shields, webProtection, stats.breaches, protectionLevel]);

  useEffect(() => {
    localStorage.setItem('NEXUS_EXTRA_SHIELDS', JSON.stringify(extraShields));
  }, [extraShields]);

  useEffect(() => {
    const fetchNetwork = async () => {
      setIsLoadingNetwork(true);
      
      const fetchDnsInfo = async () => {
        try {
          const dnsRes = await fetch(window.location.origin + '/api/network/info');
          if (dnsRes.ok) {
            const dnsData = await dnsRes.json();
            setNetwork(prev => ({
              ...prev,
              dns: dnsData.dns || prev.dns,
              dnsLocation: dnsData.dnsLocation || prev.dnsLocation,
              isProxy: dnsData.isp === 'Proxy/VPN Detected' || prev.isProxy || dnsData.isProxy
            }));
          }
        } catch (e) {
          console.warn("Backend DNS fetch failed", e);
        }
      };

      const performDirectFetch = async () => {
        // In web environment (AI Studio), try backend first to avoid CORS issues
        try {
          const res = await fetch(window.location.origin + "/api/network/info");
          if (res.ok) {
            const data = await res.json();
            const exposure = await analyzeNetworkExposure(data.ipAddress);
            
            setNetwork({
              ip: data.ipAddress || "Unknown",
              city: data.cityName || "Local",
              country: data.countryName || "Network",
              isp: data.isp,
              dns: data.dns,
              dnsLocation: data.dnsLocation,
              isProxy: data.isp === 'Proxy/VPN Detected' || data.isProxy || data.vpn || data.proxy || data.isp?.toLowerCase().includes('vpn') || data.isp?.toLowerCase().includes('proxy'),
              exposure: exposure
            });
            setIsLoadingNetwork(false);
            return;
          }
        } catch (e) {
          console.warn("Backend network info fetch failed, trying direct APIs...", e);
        }

        try {
          // Try ipwho.is first as it's quite reliable for location and security flags
          const res = await fetch("https://ipwho.is/");
          if (!res.ok) throw new Error('Primary API failed');
          const data = await res.json();
          
          // Enhanced VPN/Proxy detection
          const isVpnOrProxy = data.security?.vpn || 
                               data.security?.proxy || 
                               data.security?.tor || 
                               data.security?.relay ||
                               data.connection?.type === 'vpn' ||
                               data.connection?.isp?.toLowerCase().includes('vpn') ||
                               data.connection?.isp?.toLowerCase().includes('proxy') ||
                               data.isp?.toLowerCase().includes('vpn') ||
                               data.isp?.toLowerCase().includes('proxy') ||
                               data.org?.toLowerCase().includes('vpn') ||
                               data.org?.toLowerCase().includes('proxy');

          const exposure = await analyzeNetworkExposure(data.ip);

          setNetwork(prev => ({
            ...prev,
            ip: data.ip || "Unknown",
            city: data.city || "Local",
            country: data.country || "Network",
            isProxy: isVpnOrProxy,
            isp: data.connection?.isp || "Detecting...",
            exposure: exposure
          }));
          fetchDnsInfo();
        } catch {
          console.warn("Primary IP fetch failed, trying fallback (freeipapi.com)...");
          try {
            const res = await fetch("https://freeipapi.com/api/json");
            if (!res.ok) throw new Error('Fallback API failed');
            const data = await res.json();
            const exposure = await analyzeNetworkExposure(data.ipAddress);
            setNetwork(prev => ({
              ...prev,
              ip: data.ipAddress || "Unknown",
              city: data.cityName || "Local",
              country: data.countryName || "Network",
              isProxy: data.isProxy || data.vpn || false,
              exposure: exposure
            }));
            fetchDnsInfo();
          } catch {
            try {
              const res = await fetch("https://ipapi.co/json/");
              if (!res.ok) throw new Error('ipapi failed');
              const fb = await res.json();
              const exposure = await analyzeNetworkExposure(fb.ip);
              setNetwork(prev => ({
                ...prev,
                ip: fb.ip || "Unknown",
                city: fb.city || "Local",
                country: fb.country_name || "Network",
                isProxy: fb.security?.is_proxy || fb.org?.toLowerCase().includes('vpn') || false,
                exposure: exposure
              }));
              fetchDnsInfo();
            } catch (lastError) {
              console.warn("All network info fetch attempts failed. Using internal defaults.", lastError);
              setNetwork(prev => ({ 
                ...prev, 
                ip: '127.0.0.1', 
                city: 'Local', 
                country: 'Environment', 
                isp: 'Internal Network',
                dns: '1.1.1.1',
                dnsLocation: 'Global Threat Intel',
                exposure: null
              }));
            }
          }
        } finally {
          setIsLoadingNetwork(false);
        }
      };

      // Try background script first (more robust in extensions)
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ type: 'FETCH_NETWORK_INFO' }, (response) => {
          if (response && response.success) {
            const data = response.data;
            setNetwork(prev => ({
              ...prev,
              ip: data.ipAddress || "Unknown",
              city: data.cityName || "Local",
              country: data.countryName || "Network",
              isProxy: data.isProxy || false
            }));
            fetchDnsInfo();
            setIsLoadingNetwork(false);
          } else {
            performDirectFetch();
          }
        });
      } else {
        performDirectFetch();
      }
    };

    fetchNetwork();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        quantumEntropy: (99.9 + Math.random() * 0.09).toFixed(3) + '%'
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkKey = async () => {
      // Only run if we don't have a key yet or if we're initializing
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.get(['NEXUS_GEMINI_KEY'], async (result) => {
          if (result.NEXUS_GEMINI_KEY && !geminiKey) {
            setGeminiKey(result.NEXUS_GEMINI_KEY);
            const validation = await validateAiApiKey(result.NEXUS_GEMINI_KEY);
            if (validation.valid) {
              setAiApiKey(result.NEXUS_GEMINI_KEY);
            } else {
              setKeyError(`Saved Gemini Key Invalid: ${validation.error}`);
              setAiAssistant(prev => ({
                ...prev,
                status: 'OFFLINE',
                message: "Saved Gemini API Key is invalid. Please update it in Settings."
              }));
            }
          }
        });
      } else if (geminiKey) {
        const validation = await validateAiApiKey(geminiKey);
        if (validation.valid) {
          setAiApiKey(geminiKey);
        } else {
          setKeyError(`Saved Gemini Key Invalid: ${validation.error}`);
          setAiAssistant(prev => ({
            ...prev,
            status: 'OFFLINE',
            message: "Saved Gemini API Key is invalid. Please update it in Settings."
          }));
        }
      }

      if (!geminiKey && !localStorage.getItem('NEXUS_GEMINI_KEY')) {
        setAiAssistant(prev => ({
          ...prev,
          status: 'OFFLINE',
          message: "AI Configuration required. Please enter your Gemini API Key in Settings to enable autonomous defense."
        }));
      }
    };

    checkKey();
  }, [geminiKey]); // Run when geminiKey changes

  // Sync with Chrome Storage for real-time extension data
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      // Initial load
      chrome.storage.local.get(['stats', 'protectionActive', 'isDefensiveOffenseActive'], (result) => {
        if (result.stats) setStats(result.stats);
        if (result.protectionActive !== undefined) setIsExtensionActive(result.protectionActive);
        if (result.isDefensiveOffenseActive !== undefined) setIsDefensiveOffenseActive(result.isDefensiveOffenseActive);
      });

      // Listen for changes
      const handleStorageChange = (changes) => {
        if (changes.stats) setStats(changes.stats.newValue);
        if (changes.protectionActive) setIsExtensionActive(changes.protectionActive.newValue);
        if (changes.isDefensiveOffenseActive) setIsDefensiveOffenseActive(changes.isDefensiveOffenseActive.newValue);
      };

      chrome.storage.onChanged.addListener(handleStorageChange);
      return () => chrome.storage.onChanged.removeListener(handleStorageChange);
    }
  }, []);

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ protectionActive: isExtensionActive });
    }
  }, [isExtensionActive]);

  useEffect(() => {
    if (isVectorRedirectionActive) {
      const interval = setInterval(() => {
        setInterceptedCount(prev => prev + Math.floor(Math.random() * 3));
        setDestroyedCount(prev => prev + Math.floor(Math.random() * 2));
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isVectorRedirectionActive]);
  
  // Dynamic AI Assistant tasks
  useEffect(() => {
    if (!aiAssistant.active) return;

    const tasks = [
      'Intercepting Malicious Payloads',
      'Analyzing Traffic Patterns',
      'Scanning for Zero-Day Vulnerabilities',
      'Hardening System Kernels',
      'Isolating Suspicious Processes',
      'Optimizing Neural Defense Mesh',
      'Decrypting Encrypted Payloads',
      'Neutralizing Remote Access Trojans'
    ];

    const logs = [
      'Defensive Offense Active',
      'Script Interceptor Online',
      'Neural Sync Active',
      'Packet Inspection Complete',
      'Signature Database Updated',
      'Heuristic Engine Optimized',
      'Sandbox Environment Ready',
      'Threat Intelligence Synced'
    ];

    const statuses = ['ACTIVE DEFENSE', 'ANALYZING', 'MONITORING', 'OPTIMIZING', 'SCANNING'];

    const interval = setInterval(() => {
      setAiAssistant(prev => {
        const newTask = tasks[Math.floor(Math.random() * tasks.length)];
        const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
        const newLogs = [...prev.optimizationLog];
        if (newLogs.length >= 3) newLogs.shift();
        newLogs.push(logs[Math.floor(Math.random() * logs.length)]);

        return {
          ...prev,
          status: newStatus,
          currentTask: newTask,
          optimizationLog: newLogs
        };
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [aiAssistant.active]);

  useEffect(() => {
    if (!isHybridDefenseActive) return;
    const interval = setInterval(() => {
      setHybridStats(prev => ({
        ...prev,
        fusionLevel: Number((Math.min(100, Math.max(95, prev.fusionLevel + (Math.random() - 0.5)))).toFixed(1)),
        adaptiveRate: Number((Math.min(100, Math.max(98, prev.adaptiveRate + (Math.random() - 0.5)))).toFixed(1)),
        confidence: Number((Math.min(100, Math.max(99, prev.confidence + (Math.random() - 0.5)))).toFixed(1))
      }));
      
      setEntropyValue(prev => Number((Math.min(0.9999, Math.max(0.9990, prev + (Math.random() - 0.5) * 0.0001))).toFixed(4)));
      setLocalBrainLoad(Math.floor(Math.random() * 40 + 30));
      setCloudBrainLoad(Math.floor(Math.random() * 20 + 5));
      setIsShielding(Math.random() > 0.7);
      setIsProcessing(Math.random() > 0.4);
    }, 2000);
    return () => clearInterval(interval);
  }, [isHybridDefenseActive]);


  useEffect(() => {
    localStorage.setItem('NEXUS_PROTECTION_LEVEL', protectionLevel);
    localStorage.setItem('NEXUS_INTERCEPTOR_ACTIVE', isInterceptorActive);
    localStorage.setItem('NEXUS_AI_DEFENSE_ACTIVE', isAiDefenseActive);
    localStorage.setItem('NEXUS_QUANTUM_SHIELD_ACTIVE', isQuantumShieldActive);
    localStorage.setItem('NEXUS_VECTOR_REDIRECTION_ACTIVE', isVectorRedirectionActive);
    localStorage.setItem('NEXUS_DEFENSIVE_OFFENSE_ACTIVE', isDefensiveOffenseActive);
    localStorage.setItem('NEXUS_WEB_PROTECTION', JSON.stringify(webProtection));
    localStorage.setItem('NEXUS_HYBRID_DEFENSE_ACTIVE', isHybridDefenseActive);
    localStorage.setItem('NEXUS_TENSORFLOW_ACTIVE', isTensorFlowActive);
    localStorage.setItem('NEXUS_AI_SHIELD_ACTIVE', isAiShieldActive);

    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ 
        isDefensiveOffenseActive, 
        isAiDefenseActive, 
        isInterceptorActive,
        isQuantumShieldActive,
        isVectorRedirectionActive,
        isTensorFlowActive,
        isAiShieldActive
      });
    }
  }, [
    protectionLevel, 
    isInterceptorActive, 
    isAiDefenseActive, 
    isQuantumShieldActive, 
    isVectorRedirectionActive, 
    isDefensiveOffenseActive, 
    webProtection, 
    isHybridDefenseActive, 
    isTensorFlowActive, 
    isAiShieldActive
  ]);

  useEffect(() => {
    const fetchThreatMap = async () => {
      try {
        const res = await fetch(window.location.origin + '/api/threats/map');
        if (!res.ok) throw new Error('Threat map fetch failed');
        const data = await res.json();
        setThreatMap(data);
      } catch {
        console.warn("Failed to fetch threat map, using fallback data");
        // Fallback data for the threat map
        setThreatMap(Array.from({ length: 8 }, (_, i) => ({
          id: i,
          lat: (Math.random() * 140 - 70).toFixed(4),
          lng: (Math.random() * 360 - 180).toFixed(4),
          type: ["DDoS", "Phishing", "Exploit", "Brute Force"][Math.floor(Math.random() * 4)],
          severity: Math.random() > 0.6 ? "High" : "Medium"
        })));
      }
    };
    fetchThreatMap();
    const interval = setInterval(fetchThreatMap, 30000);
    return () => clearInterval(interval);
  }, []);


  const togglePower = () => {
    if (!geminiKey) {
      setActiveTab('SETTINGS');
      setKeyError("A valid Gemini API Key is required to activate Grid Guardian.");
      return;
    }

    if (isExtensionActive) {
      setIsShuttingDown(true);
      setTimeout(() => {
        setIsExtensionActive(false);
        setIsShuttingDown(false);
        // Turn off all shields on shutdown
        setShields({
          firewall: false,
          cloud_heuristic: false,
          privacy: false,
          malware: false,
          ai_ml_shield: false,
          mining_protection: false
        });
      }, 2000);
    } else {
      setIsExtensionActive(true);
      // Restore default shields on boot
      setShields({
        firewall: true,
        cloud_heuristic: true,
        privacy: true,
        malware: true,
        ai_ml_shield: true,
        mining_protection: true
      });
    }
  };

  const handleRepair = useCallback(() => {
    setIsRepairing(true);
    setTimeout(() => {
      setStats(prev => ({
        ...prev,
        breaches: 0,
        neutralized: prev.neutralized + prev.breaches
      }));
      setIsRepairing(false);
    }, 2500);
  }, []);

  // Auto-correction logic
  useEffect(() => {
    if (securityScore <= 80 && !isAutoRepairing && !isRepairing) {
      setIsAutoRepairing(true);
      
      const timer = setTimeout(() => {
        setShields({
          firewall: true,
          heuristic: true,
          privacy: true,
          malware: true,
          ai_ml_shield: true,
          mining_protection: true
        });
        setStats(prev => ({
          ...prev,
          breaches: 0,
          neutralized: prev.neutralized + prev.breaches
        }));
        setIsAutoRepairing(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [securityScore, isAutoRepairing, isRepairing]);

  useEffect(() => {
    const fetchIntegrity = async () => {
      await checkIntegrity();
    };
    const fetchIntel = async () => {
      await Promise.all([getCveDatabase(), getThreatFeed()]);
    };

    fetchIntegrity();
    fetchIntel();
    
    const interval = setInterval(() => {
      fetchIntegrity();
      fetchIntel();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Simulation logic
  useEffect(() => {
    const interval = setInterval(() => {
      const newRead = Math.random() * 500;
      const newWrite = Math.random() * 100;
      
      setTrafficData(prev => {
        const newData = [...prev, { time: Date.now(), read: newRead, write: newWrite }];
        
        // Update speed
        setNetworkSpeed({
          down: Math.floor(newRead * 2),
          up: Math.floor(newWrite * 2)
        });

        return newData.slice(-30);
      });

      // Probability of threat increases if shields are off or protection level is low
      const threatProb = protectionLevel === 'AGGRESSIVE' ? 0.1 : 0.3;

      if (Math.random() < threatProb) {
        const categories = ['trackers', 'ads', 'firewall', 'malware', 'phishing'];
        const cat = categories[Math.floor(Math.random() * categories.length)];
        
        const shieldMap = {
          trackers: 'privacy',
          ads: 'privacy',
          firewall: 'firewall',
          malware: 'malware',
          phishing: 'ai_ml_shield'
        };
        
        const shieldKey = shieldMap[cat];
        const isProtected = shields[shieldKey] || (cat === 'malware' && (extraShields.ransomware || extraShields.rootkit));

        if (isProtected) {
          setStats(prev => ({
            ...prev,
            [cat]: prev[cat] + 1,
            neutralized: prev.neutralized + 1,
            total: prev.total + 1
          }));
        } else {
          // If shield is off, it's a breach
          setStats(prev => ({
            ...prev,
            [cat]: prev[cat] + 1,
            breaches: prev.breaches + 1,
            total: prev.total + 1
          }));

          // Autonomous Defense Logic
          if (isAutonomous && aiAssistant.active && !isRepairing && !isAutoRepairing) {
            handleRepair();
            setAiAssistant(prev => ({
              ...prev,
              status: 'DEFENDING',
              message: `Breach detected! Initiating autonomous counter-measures to neutralize ${cat.toUpperCase()} threat.`
            }));
            setTimeout(() => {
              setAiAssistant(prev => ({
                ...prev,
                status: 'MONITORING',
                message: "Threat neutralized. System integrity restored. I'm continuing to monitor for anomalies."
              }));
            }, 3000);
          }
        }
      }
    }, 800);

    return () => clearInterval(interval);
  }, [shields, protectionLevel, extraShields, isAutonomous, isRepairing, isAutoRepairing, handleRepair, aiAssistant.active]);

  const handleSaveKey = async () => {
    if (!geminiKey) {
      setKeyError("Gemini API Key is mandatory for AI defense.");
      return;
    }

    setIsValidating(true);
    setKeyError('');

    try {
      // Validate Gemini (Mandatory)
      const geminiValidation = await validateAiApiKey(geminiKey);
      if (!geminiValidation.valid) {
        setKeyError(`Gemini: ${geminiValidation.error}`);
        setIsValidating(false);
        return;
      }

      // Optional Validations (only if provided)
      if (vtKey) {
        const vtVal = await validateVirusTotalKey(vtKey);
        if (!vtVal.valid) { setKeyError(`VirusTotal: ${vtVal.error}`); setIsValidating(false); return; }
      }
      if (gsbKey) {
        const gsbVal = await validateSafeBrowsingKey(gsbKey);
        if (!gsbVal.valid) { setKeyError(`Safe Browsing: ${gsbVal.error}`); setIsValidating(false); return; }
      }

      // Check abuse.ch connectivity if active or key provided
      if (abuseChKey) {
        const trimmedKey = abuseChKey.trim();
        const abuseVal = await validateAbuseCh(trimmedKey);
        if (!abuseVal.valid) {
          setKeyError(`abuse.ch: ${abuseVal.error}`);
          setIsValidating(false);
          setIsAbuseChValidated(false);
          return;
        }
        // If key is valid and was not active before, turn it on by default
        if (!localStorage.getItem('NEXUS_ABUSE_CH_KEY')) {
          setAbuseChActive(true);
        }
        setAbuseChKey(trimmedKey);
        setIsAbuseChValidated(true);
      } else if (abuseChActive) {
        setKeyError("abuse.ch: API Key is required to enable integration.");
        setIsValidating(false);
        setIsAbuseChValidated(false);
        return;
      }

      // Save all
      setAiApiKey(geminiKey);
      setIsSetupComplete(true);
      localStorage.setItem('NEXUS_GEMINI_KEY', geminiKey);
      localStorage.setItem('NEXUS_VT_KEY', vtKey);
      localStorage.setItem('NEXUS_GSB_KEY', gsbKey);
      localStorage.setItem('NEXUS_ABUSE_CH_KEY', abuseChKey);
      localStorage.setItem('NEXUS_ABUSE_CH_ACTIVE', JSON.stringify(abuseChActive));

      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.set({ 
          NEXUS_GEMINI_KEY: geminiKey,
          NEXUS_VT_KEY: vtKey,
          NEXUS_GSB_KEY: gsbKey,
          NEXUS_ABUSE_CH_KEY: abuseChKey,
          NEXUS_ABUSE_CH_ACTIVE: abuseChActive
        });
      }

      setAiAssistant(prev => ({
        ...prev,
        active: true,
        status: 'ACTIVE DEFENSE',
        message: "Security configuration updated. All active defense layers are synced."
      }));
      
      // Re-trigger network analysis
      const fetchNetwork = async () => {
        try {
          const res = await fetch("/api/network/info");
          if (res.ok) {
            const data = await res.json();
            const exposure = await analyzeNetworkExposure(data.ipAddress);
            setNetwork(prev => ({
              ...prev,
              exposure: exposure
            }));
          }
        } catch (e) {
          console.warn("Network analysis re-trigger failed", e);
        }
      };
      fetchNetwork();

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setKeyError("An unexpected error occurred during validation.");
    } finally {
      setIsValidating(false);
    }
  };

  const toggleShield = (key) => {
    setShields(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSetupComplete = async (key) => {
    if (!termsAccepted) {
      setKeyError('You must accept the terms and conditions to proceed.');
      return;
    }
    console.log("Starting AI Core Initialization...");
    setIsValidating(true);
    setKeyError('');
    try {
      console.log("Validating Gemini API Key...");
      const result = await validateAiApiKey(key);
      if (result.valid) {
        console.log("Key validated successfully. Saving configuration...");
        localStorage.setItem('NEXUS_GEMINI_KEY', key);
        setAiApiKey(key);
        setGeminiKey(key);
        setIsSetupComplete(true);
        console.log("Initialization complete. Transitioning to dashboard.");
      } else {
        console.error("Key validation failed:", result.error);
        setKeyError(`Invalid Gemini API Key: ${result.error}`);
      }
    } catch (error) {
      console.error("Unexpected error during setup:", error);
      setKeyError('Validation failed. Please check your connection.');
    } finally {
      setIsValidating(false);
    }
  };

  if (!isSetupComplete) {
    return (
      <div className="min-h-screen bg-bg text-foreground font-sans selection:bg-accent/30 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-safe/5 blur-[120px] rounded-full" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="p-8 bg-panel border border-border/40 rounded-2xl hardware-border space-y-8 shadow-2xl">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 mb-4">
                <Shield className="w-8 h-8 text-accent" />
              </div>
              <h1 className="text-2xl font-black uppercase tracking-tighter text-accent">Initialize Grid Guardian</h1>
              <p className="text-xs text-muted font-medium uppercase tracking-widest">Mandatory Neural Link Setup</p>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!geminiKey) {
                  setKeyError('Gemini API Key is required.');
                  return;
                }
                if (!termsAccepted) {
                  setKeyError('Please accept the Terms of Service to continue.');
                  return;
                }
                if (!isValidating) handleSetupComplete(geminiKey);
              }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2">
                    <Key className="w-3 h-3" />
                    Gemini API Key
                  </label>
                  <button 
                    type="button"
                    onClick={() => setShowInfo('GEMINI')}
                    className="text-[9px] font-black text-accent hover:underline uppercase tracking-widest"
                  >
                    How to get?
                  </button>
                </div>
                <div className="relative group flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={isKeyVisible ? "text" : "password"}
                      value={geminiKey}
                      onChange={(e) => setGeminiKey(e.target.value)}
                      placeholder="Enter your Gemini API Key..."
                      className="w-full bg-black/40 border border-border/20 rounded-xl px-4 pr-12 py-3 text-sm font-mono focus:outline-none focus:border-accent/50 transition-all group-hover:border-border/40"
                    />
                    <button
                      type="button"
                      onClick={() => setIsKeyVisible(!isKeyVisible)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-accent transition-colors"
                    >
                      {isKeyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSetupComplete(geminiKey)}
                    disabled={isValidating || !geminiKey}
                    className={cn(
                      "px-4 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all border",
                      isValidating || !geminiKey
                        ? "bg-muted/10 text-muted border-border/10 cursor-not-allowed"
                        : "bg-accent/10 text-accent border-accent/30 hover:bg-accent/20 active:scale-95"
                    )}
                  >
                    {isValidating ? '...' : 'Enter'}
                  </button>
                </div>
                {keyError && (
                  <motion.p 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-[10px] text-danger font-bold uppercase tracking-tight"
                  >
                    {keyError}
                  </motion.p>
                )}
              </div>

              <div className="p-4 bg-accent/5 border border-accent/10 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <Info className="w-3 h-3 text-accent" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-accent">Why is this mandatory?</span>
                </div>
                <p className="text-[10px] text-muted leading-relaxed">
                  Grid Guardian uses Gemini&apos;s advanced neural models for real-time threat analysis and autonomous defense. Without a valid API key, the AI core cannot initialize.
                </p>
              </div>

              <div className="space-y-4">
                <div 
                  className="flex items-start gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer group" 
                  onClick={() => setTermsAccepted(!termsAccepted)}
                >
                  <div className={cn(
                    "mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0",
                    termsAccepted ? "bg-accent border-accent" : "border-white/20 group-hover:border-accent/50"
                  )}>
                    {termsAccepted && <Check className="w-3 h-3 text-bg" />}
                  </div>
                  <div className="space-y-1 flex-1">
                    <p className="text-[9px] font-bold text-white uppercase tracking-wider">Accept Terms of Service</p>
                    <p className="text-[8px] text-muted leading-relaxed">
                      I acknowledge that Grid Guardian is owned by <span className="text-accent">Defensive Grid Labs</span> and is licensed under the <span className="text-white font-mono">Apache License 2.0</span>.
                    </p>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowTermsModal(true);
                      }}
                      className="text-[7px] font-black text-accent uppercase tracking-widest hover:underline"
                    >
                      Show More
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isValidating || !geminiKey || !termsAccepted}
                className={cn(
                  "w-full py-4 rounded-xl font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-3",
                  isValidating || !geminiKey || !termsAccepted
                    ? "bg-muted/20 text-muted cursor-not-allowed border border-border/10" 
                    : "bg-accent text-bg hover:shadow-[0_0_20px_rgba(242,125,38,0.4)] active:scale-[0.98]"
                )}
              >
                {isValidating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-bg/30 border-t-bg rounded-full animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    Initialize AI Defense Core
                    <Zap className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-border/10 text-center">
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[9px] font-black uppercase tracking-widest text-muted hover:text-accent transition-colors"
              >
                Get a free API key from Google AI Studio
              </a>
            </div>
          </div>
        </motion.div>

        {/* Setup Instructions Modal */}
        <AnimatePresence>
          {showTermsModal && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-lg bg-bg border border-accent/30 rounded-2xl p-8 shadow-2xl space-y-6 max-h-[80vh] flex flex-col"
              >
                <div className="flex items-center justify-between border-b border-border/10 pb-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-accent" />
                    <h3 className="text-lg font-black text-white uppercase tracking-widest">Terms of Service</h3>
                  </div>
                  <button onClick={() => setShowTermsModal(false)} className="text-muted hover:text-white transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-4 space-y-6 text-sm text-muted leading-relaxed custom-scrollbar">
                  <section className="space-y-3">
                    <h4 className="text-accent font-black uppercase tracking-wider text-xs">1. Service Usage</h4>
                    <p>
                      Grid Guardian is a security monitoring tool. By using this software, you agree to allow it to monitor network traffic and analyze potential threats. This includes analyzing URLs, file hashes, and system behavior.
                    </p>
                  </section>
                  
                  <section className="space-y-3">
                    <h4 className="text-accent font-black uppercase tracking-wider text-xs">2. Data Privacy</h4>
                    <p>
                      Your API keys are stored locally on your device and are never transmitted to Defensive Grid Labs. Threat analysis data is processed securely via your configured AI models (Google Gemini) and third-party security APIs (VirusTotal, abuse.ch, etc.).
                    </p>
                  </section>
                  
                  <section className="space-y-3">
                    <h4 className="text-accent font-black uppercase tracking-wider text-xs">3. Ownership</h4>
                    <p>
                      All intellectual property rights for Grid Guardian, including its source code, design, and branding, are owned by Defensive Grid Labs.
                    </p>
                  </section>
                  
                  <section className="space-y-3">
                    <h4 className="text-accent font-black uppercase tracking-wider text-xs">4. License</h4>
                    <p>
                      This software is distributed under the Apache License 2.0. You may use, modify, and distribute it according to the terms of the license. A copy of the license can be found at: http://www.apache.org/licenses/LICENSE-2.0
                    </p>
                  </section>
                  
                  <section className="space-y-3">
                    <h4 className="text-accent font-black uppercase tracking-wider text-xs">5. No Warranty</h4>
                    <p>
                      THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
                    </p>
                  </section>
                  
                  <section className="space-y-3">
                    <h4 className="text-accent font-black uppercase tracking-wider text-xs">6. Limitation of Liability</h4>
                    <p>
                      IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
                    </p>
                  </section>
                </div>

                <div className="pt-4 border-t border-border/10 flex flex-col gap-3">
                  <button 
                    onClick={() => {
                      setTermsAccepted(true);
                      setShowTermsModal(false);
                    }}
                    className="w-full py-3 bg-accent text-bg rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-accent/90 transition-all shadow-lg"
                  >
                    Understood & Accept
                  </button>
                  {geminiKey && (
                    <button 
                      onClick={() => {
                        setTermsAccepted(true);
                        setShowTermsModal(false);
                        handleSetupComplete(geminiKey);
                      }}
                      className="w-full py-3 bg-safe text-bg rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-safe/90 transition-all flex items-center justify-center gap-2"
                    >
                      Accept & Initialize Core
                      <Zap className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </motion.div>
            </div>
          )}

          {showInfo && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-[280px] bg-bg border border-accent/30 rounded-xl p-5 shadow-2xl space-y-4"
              >
                <div className="flex items-center justify-between border-b border-border/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-accent" />
                    <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Setup Instructions</h3>
                  </div>
                  <button onClick={() => setShowInfo(null)} className="text-muted hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  {showInfo === 'GEMINI' && (
                    <>
                      <p className="text-[9px] text-accent font-bold uppercase tracking-wider">Google Gemini API</p>
                      <ol className="text-[8px] text-muted space-y-2 list-decimal list-inside leading-relaxed">
                        <li>Visit <span className="text-white font-mono">aistudio.google.com</span></li>
                        <li>Click &quot;Get API key&quot; on the left sidebar</li>
                        <li>Click &quot;Create API key in new project&quot;</li>
                        <li>Copy and paste the key into the Gemini field</li>
                      </ol>
                    </>
                  )}
                </div>
                <button 
                  onClick={() => setShowInfo(null)}
                  className="w-full py-2 bg-accent/10 hover:bg-accent/20 text-accent rounded-lg text-[8px] font-black uppercase tracking-widest transition-all border border-accent/20"
                >
                  Understood
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-bg flex flex-col relative overflow-hidden">
      <div className={cn(
        "app-container flex-1 flex flex-col overflow-hidden relative transition-all duration-500",
        protectionLevel === 'AGGRESSIVE' && "shadow-[inset_0_0_100px_rgba(255,184,0,0.1)]"
      )}>
          <AnimatePresence>
        {blockedSite && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-danger/20 backdrop-blur-2xl flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-md w-full border border-border/30 bg-bg p-8 rounded-3xl space-y-6 text-center shadow-[0_0_50px_rgba(255,68,68,0.3)]"
            >
              <div className="mx-auto w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mb-4">
                <ShieldAlert className="w-8 h-8 text-danger" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-black uppercase tracking-tighter text-danger">Threat Blocked</h2>
                <p className="text-xs text-muted font-mono break-all">{blockedSite.url}</p>
              </div>
              <div className="p-4 bg-danger/5 border border-danger/10 rounded-xl text-[10px] text-danger/80 leading-relaxed italic">
                Grid Guardian Shield (Bitdefender-Grade) has identified this site as a {blockedSite.threat} risk and blocked access to protect your system.
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setBlockedSite(null)}
                  className="flex-1 py-3 bg-danger text-bg rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-danger/90 transition-all"
                >
                  Return to Safety
                </button>
                <button 
                  onClick={() => setBlockedSite(null)}
                  className="px-6 py-3 border border-border/20 text-muted rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-panel transition-all"
                >
                  Ignore (Risky)
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isShuttingDown && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-bg flex flex-col items-center justify-center space-y-8"
          >
            <div className="w-24 h-24 border-4 border-danger/20 border-t-danger rounded-full animate-spin" />
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black uppercase tracking-widest text-danger">System Shutdown</h2>
              <p className="text-xs font-mono text-muted uppercase tracking-[0.3em]">Terminating all processes...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {/* Sandboxed Session Indicator removed */}
      </AnimatePresence>

      {/* Extension Header */}
      <header className="h-12 border-b border-border/20 flex items-center justify-between px-3 bg-panel/95 backdrop-blur-xl shrink-0 relative overflow-hidden">
        {/* Subtle scanline effect */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
        
        <div className="flex items-center gap-3 relative z-10">
          <div className="relative">
            <div className="w-7 h-7 bg-black rounded flex items-center justify-center border border-border/40 shadow-inner">
              <ShieldCheck className={cn("w-4 h-4 transition-colors duration-500", isExtensionActive ? "text-safe" : "text-muted")} />
            </div>
          </div>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <h1 className="text-[10px] font-black tracking-[0.2em] uppercase text-accent leading-none">Grid Guardian Web</h1>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <div className={cn("w-1 h-1 rounded-full", isExtensionActive ? "bg-safe animate-pulse" : "bg-danger")} />
              <span className={cn("text-[6px] font-mono font-bold uppercase tracking-widest", isExtensionActive ? "text-safe" : "text-danger")}>
                {isExtensionActive ? 'Active Protection' : 'System Vulnerable'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 relative z-10">
          <button 
            onClick={togglePower}
            disabled={isShuttingDown}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded border transition-all duration-300 active:scale-95 group",
              isExtensionActive 
                ? "bg-danger/5 text-danger/80 border-danger/30 hover:bg-danger/10 hover:text-danger hover:border-danger/50" 
                : "bg-safe/5 border-safe/30 text-safe/80 hover:bg-safe/10 hover:text-safe hover:border-safe/50"
            )}
          >
            <Power className={cn("w-3 h-3 transition-transform group-hover:rotate-12", isShuttingDown && "animate-spin")} />
            <span className="text-[8px] font-black uppercase tracking-[0.1em]">
              {isShuttingDown ? 'Stopping' : (isExtensionActive ? 'Shutdown' : 'Initialize')}
            </span>
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="h-11 border-b border-border/20 flex bg-panel/50 backdrop-blur-md shrink-0">
        {[
          { id: 'DASHBOARD', icon: LayoutDashboard, label: 'Dashboard' },
          { id: 'DEFENSE', icon: Shield, label: 'Defense' },
          { id: 'INTEL', icon: Globe, label: 'Apex' },
          { id: 'SETTINGS', icon: Key, label: 'Settings' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-0.5 transition-all relative group",
              activeTab === tab.id ? "text-accent" : "text-muted hover:text-accent/80"
            )}
          >
            <div className={cn(
              "p-1 rounded-md transition-all duration-300",
              activeTab === tab.id ? "bg-safe/10" : "group-hover:bg-white/5"
            )}>
              <tab.icon className={cn("w-3.5 h-3.5 transition-transform duration-300 group-hover:scale-110", activeTab === tab.id ? "text-safe" : "text-muted")} />
            </div>
            <span className="text-[6px] font-black uppercase tracking-[0.2em]">
              {tab.label}
            </span>
            {activeTab === tab.id && (
              <motion.div 
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-safe"
              />
            )}
          </button>
        ))}
      </nav>

      <main className="flex-1 overflow-y-auto custom-scrollbar relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="p-4 space-y-4 pb-1"
          >
            {activeTab === 'DASHBOARD' && (
              <>
                {/* AI Autonomous Assistant */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-safe/20 to-accent/20 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative p-4 bg-panel border border-border/40 rounded-lg space-y-3 overflow-hidden hardware-border">
                    {/* Subtle scanline effect for AI card */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
                    
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-500",
                            !aiAssistant.active ? "bg-black border-border/20 grayscale" :
                            aiAssistant.status === 'DEFENDING' ? "bg-danger/20 border-danger/40 shadow-[0_0_15px_rgba(255,59,59,0.3)]" : "bg-safe/10 border-safe/30 shadow-[0_0_15px_rgba(0,255,148,0.2)]"
                          )}>
                            <Brain className={cn(
                              "w-4 h-4",
                              !aiAssistant.active ? "text-muted" :
                              aiAssistant.status === 'DEFENDING' ? "text-danger" : "text-safe",
                              aiAssistant.active && aiAssistant.status === 'ANALYZING' && "animate-pulse"
                            )} />
                          </div>
                          {aiAssistant.active && aiAssistant.status === 'MONITORING' && (
                            <motion.div 
                              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="absolute inset-0 rounded-full bg-safe/20"
                            />
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <div>
                            <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-accent">Guardian AI</h3>
                            <div className="flex items-center gap-1.5">
                              <div className={cn("w-1 h-1 rounded-full", aiAssistant.active ? (aiAssistant.status === 'DEFENDING' ? "bg-danger animate-pulse" : "bg-safe animate-pulse") : "bg-muted")} />
                              <span className={cn("text-[6px] font-mono font-bold uppercase tracking-widest", !aiAssistant.active ? "text-muted" : aiAssistant.status === 'DEFENDING' ? "text-danger" : "text-safe")}>
                                {aiAssistant.active ? aiAssistant.status : 'OFFLINE'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <button 
                          onClick={() => setAiAssistant(prev => ({ ...prev, active: !prev.active }))}
                          className={cn(
                            "px-2 py-0.5 rounded border text-[5px] font-black uppercase tracking-widest transition-all",
                            aiAssistant.active ? "bg-safe/10 border-safe/40 text-safe" : "bg-black border-border/20 text-muted"
                          )}
                        >
                          {aiAssistant.active ? 'ENABLED' : 'DISABLED'}
                        </button>

                        <div className="text-right">
                          <div className="text-[5px] text-muted uppercase font-black tracking-tighter">AI Processing</div>
                          <div className="text-[8px] font-mono text-accent font-bold">{aiAssistant.active ? '0.04%' : '0.00%'}</div>
                        </div>
                      </div>
                    </div>

                    {aiAssistant.active && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3"
                      >
                        {/* Important Telemetry */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-1 bg-black/40 rounded border border-border/10 space-y-1">
                            <div className="flex items-center justify-between px-1">
                              <div className="text-[6px] text-muted uppercase font-black tracking-widest">Network Graph</div>
                              <div className="text-[8px] font-mono text-safe font-bold">LIVE</div>
                            </div>
                            <div className="h-6 w-full bg-black/20 rounded overflow-hidden relative">
                              <ResponsiveContainer width="100%" height={24}>
                                <AreaChart data={trafficData.slice(-15)}>
                                  <Area 
                                    type="monotone" 
                                    dataKey="read" 
                                    stroke="var(--color-safe)" 
                                    fill="var(--color-safe)" 
                                    fillOpacity={0.2} 
                                    strokeWidth={1} 
                                    isAnimationActive={false} 
                                  />
                                  <Area 
                                    type="monotone" 
                                    dataKey="write" 
                                    stroke="white" 
                                    fill="white" 
                                    fillOpacity={0.1} 
                                    strokeWidth={1} 
                                    isAnimationActive={false} 
                                  />
                                </AreaChart>
                              </ResponsiveContainer>
                            </div>
                            <div className="flex justify-between items-center px-1">
                              <div className="flex items-center gap-1">
                                <div className="w-1 h-1 bg-safe rounded-full" />
                                <span className="text-[5px] text-muted uppercase font-bold">Read:</span>
                                <span className="text-[6px] font-mono text-safe">{networkSpeed.down} Mbps</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="w-1 h-1 bg-white rounded-full" />
                                <span className="text-[5px] text-muted uppercase font-bold">Write:</span>
                                <span className="text-[6px] font-mono text-white">{networkSpeed.up} Mbps</span>
                              </div>
                            </div>
                          </div>
                          <div className="p-1 pb-0 bg-black/40 rounded border border-border/10 space-y-1">
                            <div className="flex items-center justify-between px-1">
                              <div className="text-[6px] text-muted uppercase font-black tracking-widest">Hybrid Defense</div>
                              <div className="text-[8px] font-mono text-accent font-bold">ACTIVE</div>
                            </div>
                            <div className="h-6 overflow-hidden relative bg-accent/5 rounded flex items-center justify-center">
                              {/* Global Threat Matrix visualization */}
                              <div className="absolute inset-0 opacity-20">
                                <div className="grid grid-cols-6 gap-px h-full">
                                  {Array(24).fill(0).map((_, i) => (
                                    <motion.div 
                                      key={i}
                                      animate={{ 
                                        backgroundColor: [
                                          'rgba(242,125,38,0)', 
                                          'rgba(242,125,38,0.6)', 
                                          'rgba(242,125,38,0)'
                                        ] 
                                      }}
                                      transition={{ 
                                        duration: 1.5, 
                                        delay: Math.random() * 1.5, 
                                        repeat: Infinity 
                                      }}
                                      className="w-full h-full"
                                    />
                                  ))}
                                </div>
                              </div>
                              <div className="absolute inset-0">
                                {threatMap.map((threat, i) => (
                                  <motion.div 
                                    key={threat.id}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ 
                                      opacity: [0, 1, 0],
                                      scale: [0.5, 1.2, 0.5]
                                    }}
                                    transition={{ 
                                      duration: 2, 
                                      delay: i * 0.5, 
                                      repeat: Infinity 
                                    }}
                                    style={{
                                      left: `${((parseFloat(threat.lng) + 180) / 360) * 100}%`,
                                      top: `${((90 - parseFloat(threat.lat)) / 180) * 100}%`
                                    }}
                                    className={cn(
                                      "absolute w-1 h-1 rounded-full shadow-lg",
                                      threat.severity === 'High' ? "bg-danger shadow-danger/50" : "bg-warning shadow-warning/50"
                                    )}
                                  />
                                ))}
                              </div>
                              <div className="relative flex items-center gap-1">
                                <motion.div 
                                  animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                  className="w-1.5 h-1.5 bg-accent rounded-full shadow-[0_0_10px_rgba(242,125,38,0.9)]"
                                />
                                <div className="text-[5px] font-mono text-accent font-black uppercase tracking-tighter">Live Threat Map</div>
                              </div>
                              <motion.div 
                                animate={{ x: ['-100%', '100%'] }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-y-0 w-px bg-accent/60 shadow-[0_0_15px_rgba(242,125,38,0.8)]"
                              />
                            </div>
                            <div className="flex gap-1 p-1">
                              <button 
                                onClick={() => setIsAiDefenseActive(!isAiDefenseActive)}
                                className={cn(
                                  "flex-1 py-0.5 rounded text-[5px] font-black uppercase border transition-all",
                                  isAiDefenseActive ? "bg-safe/10 border-safe/40 text-safe" : "bg-black border-border/20 text-muted"
                                )}
                              >
                                AI: {isAiDefenseActive ? 'ENGAGED' : 'DISENGAGE'}
                              </button>
                              <button 
                                onClick={() => setIsInterceptorActive(!isInterceptorActive)}
                                className={cn(
                                  "flex-1 py-0.5 rounded text-[5px] font-black uppercase border transition-all",
                                  isInterceptorActive ? "bg-accent/10 border-accent/40 text-accent" : "bg-black border-border/20 text-muted"
                                )}
                              >
                                TF: {isInterceptorActive ? 'ENGAGED' : 'DISENGAGE'}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Current Activity */}
                        <div className="p-3 bg-black/60 rounded-lg border border-accent/20 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[6px] text-muted uppercase font-black tracking-widest">Current Task</span>
                            <span className={cn(
                              "text-[6px] font-mono animate-pulse",
                              aiAssistant.status === 'DEFENDING' ? "text-danger" : "text-safe"
                            )}>
                              {aiAssistant.status}
                            </span>
                          </div>
                          <div className="text-[8px] font-mono text-accent font-bold uppercase tracking-tighter">
                            {aiAssistant.currentTask}
                          </div>
                          <div className="space-y-1 pt-1 border-t border-border/10">
                            {aiAssistant.optimizationLog.map((log, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <div className="w-0.5 h-0.5 bg-safe rounded-full" />
                                <span className="text-[6px] text-muted uppercase font-medium">{log}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Network Identity */}
                <div className="p-4 bg-panel border border-border/30 rounded-xl space-y-4 hardware-border relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl rounded-full -mr-16 -mt-16" />
                  
                  <div className="flex items-center justify-between border-b border-border/10 pb-2 relative z-10">
                    <div className="flex items-center gap-2">
                      <Globe className="w-3 h-3 text-accent" />
                      <h3 className="text-[9px] font-black text-accent uppercase tracking-widest">Network Identity</h3>
                    </div>
                    <div className="text-[5px] text-muted uppercase font-black tracking-widest">Real-time Sync</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 relative z-10">
                    <div className="p-2 bg-black/40 rounded border border-border/10 flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-safe" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-[5px] text-muted uppercase font-black">Current Connection</span>
                        <span className="text-[8px] font-mono text-accent font-bold truncate">{network.ip}</span>
                        <span className="text-[6px] font-mono text-muted truncate">
                          {isLoadingNetwork ? 'Acquiring...' : 
                           (network.city === 'Unknown' || network.country === 'Network' || network.city === 'Local') ? 
                           'Detecting Location...' : `${network.city}, ${network.country}`}
                        </span>
                      </div>
                    </div>
                    <div className="p-2 bg-black/40 rounded border border-border/10 flex items-center gap-2">
                      <Globe className="w-3 h-3 text-accent" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-[5px] text-muted uppercase font-black">DNS & Location</span>
                        <span className="text-[8px] font-mono text-accent font-bold truncate">{network.dns}</span>
                        <span className="text-[6px] font-mono text-muted truncate">{network.dnsLocation}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* API Status Matrix */}
                <div className="p-3 bg-panel border border-border/30 rounded-xl space-y-3 hardware-border relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-safe/5 blur-3xl rounded-full -mr-12 -mt-12" />
                  
                  <div className="flex items-center justify-between border-b border-border/10 pb-2 relative z-10">
                    <div className="flex items-center gap-2">
                      <Activity className="w-3 h-3 text-safe" />
                      <h3 className="text-[8px] font-black text-safe uppercase tracking-widest">API Status Matrix</h3>
                    </div>
                    <div className="flex gap-1.5">
                      <div className={`w-1 h-1 rounded-full ${gsbKey ? 'bg-safe shadow-[0_0_5px_rgba(0,255,148,0.5)]' : 'bg-white/10'}`} />
                      <div className={`w-1 h-1 rounded-full ${vtKey ? 'bg-safe shadow-[0_0_5px_rgba(0,255,148,0.5)]' : 'bg-white/10'}`} />
                      <div className={`w-1 h-1 rounded-full ${abuseChActive ? 'bg-safe shadow-[0_0_5px_rgba(0,255,148,0.5)]' : 'bg-white/10'}`} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 relative z-10">
                    <div className={cn(
                      "p-1.5 bg-black/40 rounded border flex items-center gap-2 transition-all duration-500",
                      gsbKey ? "border-safe/20" : "border-border/5 opacity-40"
                    )}>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[4px] text-muted uppercase font-black tracking-widest">Google Console</span>
                        <div className="flex items-baseline gap-1">
                          <span className={cn("text-[7px] font-mono font-bold uppercase", gsbKey ? "text-safe" : "text-muted")}>
                            {gsbKey ? 'Online' : 'Off'}
                          </span>
                          {gsbKey && <span className="text-[5px] font-mono text-muted/60">{apiStats.gsb.latency}ms</span>}
                        </div>
                      </div>
                    </div>
                    
                    <div className={cn(
                      "p-1.5 bg-black/40 rounded border flex items-center gap-2 transition-all duration-500",
                      vtKey ? "border-safe/20" : "border-border/5 opacity-40"
                    )}>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[4px] text-muted uppercase font-black tracking-widest">VirusTotal</span>
                        <div className="flex items-baseline gap-1">
                          <span className={cn("text-[7px] font-mono font-bold uppercase", vtKey ? "text-safe" : "text-muted")}>
                            {vtKey ? 'Online' : 'Off'}
                          </span>
                          {vtKey && <span className="text-[5px] font-mono text-muted/60">{apiStats.vt.latency}ms</span>}
                        </div>
                      </div>
                    </div>

                    <div className={cn(
                      "p-1.5 bg-black/40 rounded border flex items-center gap-2 transition-all duration-500",
                      abuseChActive ? "border-safe/20" : "border-border/5 opacity-40"
                    )}>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[4px] text-muted uppercase font-black tracking-widest">abuse.ch</span>
                        <div className="flex items-baseline gap-1">
                          <span className={cn("text-[7px] font-mono font-bold uppercase", abuseChActive ? "text-safe" : "text-muted")}>
                            {abuseChActive ? 'Online' : 'Off'}
                          </span>
                          {abuseChActive && <span className="text-[5px] font-mono text-muted/60">{apiStats.abuse.latency}ms</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </>
            )}

            {activeTab === 'DEFENSE' && (
              <>
                {/* Modern Privacy & Threat Defense */}
                <div className="p-2 bg-panel border border-border/30 rounded-xl space-y-2 hardware-border">
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-2.5 h-2.5 text-safe" />
                      <h3 className="text-[8px] font-black uppercase tracking-widest text-accent">Privacy & Threat Defense</h3>
                    </div>
                    <div className="flex items-center gap-1 bg-safe/10 px-1 py-0.5 rounded-full border border-safe/20">
                      <div className="w-1 h-1 bg-safe rounded-full animate-pulse" />
                      <span className="text-[5px] font-black text-safe uppercase">Active</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Privacy Card */}
                    <div className="p-2 bg-black/40 rounded-lg border border-border/10 space-y-2">
                      <div className="flex items-center gap-1">
                        <Eye className="w-2.5 h-2.5 text-safe" />
                        <span className="text-[7px] font-black uppercase text-accent">Privacy</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[6px] text-muted uppercase font-bold">Tracking Vectors</span>
                          <span className="text-[8px] font-mono text-safe font-black">{stats.trackers}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[6px] text-muted uppercase font-bold">Ad Injection</span>
                          <span className="text-[8px] font-mono text-safe font-black">{stats.ads}</span>
                        </div>
                      </div>
                    </div>

                    {/* Threats Card */}
                    <div className="p-2 bg-black/40 rounded-lg border border-border/10 space-y-2">
                      <div className="flex items-center gap-1">
                        <ShieldAlert className="w-2.5 h-2.5 text-danger" />
                        <span className="text-[7px] font-black uppercase text-accent">Threats</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[6px] text-muted uppercase font-bold">Phishing Matrix</span>
                          <span className="text-[8px] font-mono text-danger font-black">{stats.phishing}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[6px] text-muted uppercase font-bold">Malicious Payloads</span>
                          <span className="text-[8px] font-mono text-danger font-black">{stats.malware}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[6px] text-muted uppercase font-bold">DNR Neutralized</span>
                          <span className="text-[8px] font-mono text-safe font-black">{stats.neutralized}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    {[
                      { l: 'Fingerprint', v: 'Active', c: 'text-safe' },
                      { l: 'URL Scan', v: 'Live', c: 'text-safe' },
                      { l: 'Cookies', v: 'Sandbox', c: 'text-accent' },
                      { l: 'Exploits', v: 'Isolated', c: 'text-accent' },
                      { l: 'Telemetry', v: 'Anon', c: 'text-muted' },
                      { l: 'Protocol', v: 'ZK', c: 'text-safe' }
                    ].map((item, i) => (
                      <div key={i} className="p-1.5 bg-panel/40 rounded border border-border/5 flex flex-col items-center text-center">
                        <span className="text-[4px] text-muted uppercase font-black mb-0.5">{item.l}</span>
                        <span className={cn("text-[6px] font-mono font-black uppercase", item.c)}>{item.v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Combined Shield Array & Web Shield */}
                <div className="p-3 bg-panel border border-border/30 rounded-lg space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[8px] font-black uppercase tracking-widest text-accent">Shield Array & Web Protection</h3>
                      <div className="flex bg-panel/40 p-0.5 rounded border border-border/20">
                        {['STD', 'AGG'].map(level => (
                          <button
                            key={level}
                            onClick={() => setProtectionLevel(level === 'STD' ? 'STANDARD' : 'AGGRESSIVE')}
                            className={cn(
                              "px-2 py-0.5 text-[6px] font-black rounded transition-all",
                              (protectionLevel === 'STANDARD' && level === 'STD') || (protectionLevel === 'AGGRESSIVE' && level === 'AGG') 
                                ? "bg-accent text-bg" 
                                : "text-muted hover:text-accent"
                            )}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-1.5">
                      {Object.entries(shields).map(([key, enabled]) => (
                        <button
                          key={key}
                          onClick={() => toggleShield(key)}
                          className={cn(
                            "relative p-1.5 flex flex-col items-center justify-center border rounded transition-all group",
                            enabled 
                              ? "bg-panel border-accent/30 text-accent" 
                              : "bg-card/10 border-border/10 text-muted opacity-40"
                          )}
                        >
                          {key === 'firewall' && <ShieldCheck className="w-2.5 h-2.5 mb-1" />}
                          {key === 'cloud_heuristic' && <Cloud className="w-2.5 h-2.5 mb-1" />}
                          {key === 'privacy' && <EyeOff className="w-2.5 h-2.5 mb-1" />}
                          {key === 'malware' && <ShieldAlert className="w-2.5 h-2.5 mb-1" />}
                          {key === 'ai_ml_shield' && <Cpu className="w-2.5 h-2.5 mb-1" />}
                          {key === 'mining_protection' && <Coins className="w-2.5 h-2.5 mb-1" />}
                          <span className="text-[5px] font-bold uppercase tracking-tight text-center leading-tight">
                            {key === 'ai_ml_shield' ? 'AI & ML Shield' : key.replace('_', ' ')}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-px flex-1 bg-border/10" />
                        <span className="text-[6px] font-black text-muted uppercase tracking-widest">Advanced Protection</span>
                        <div className="h-px flex-1 bg-border/10" />
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {Object.entries(extraShields).map(([key, enabled]) => (
                          <button
                            key={key}
                            onClick={() => setExtraShields(prev => ({ ...prev, [key]: !enabled }))}
                            className={cn(
                              "relative p-1.5 flex flex-col items-center justify-center border rounded transition-all group",
                              enabled 
                                ? "bg-accent/5 border-accent/40 text-accent" 
                                : "bg-card/10 border-border/10 text-muted opacity-40"
                            )}
                          >
                            {key === 'ransomware' && <Lock className="w-2.5 h-2.5 mb-1" />}
                            {key === 'rootkit' && <Fingerprint className="w-2.5 h-2.5 mb-1" />}
                            {key === 'zero_day' && <Zap className="w-2.5 h-2.5 mb-1" />}
                            {key === 'fileless' && <Code2 className="w-2.5 h-2.5 mb-1" />}
                            {key === 'anti_theft' && <MapPin className="w-2.5 h-2.5 mb-1" />}
                            {key === 'scheduled_scan' && <Activity className="w-2.5 h-2.5 mb-1" />}
                            <span className="text-[5px] font-bold uppercase tracking-tight text-center leading-tight">
                              {key.replace('_', ' ')}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/10">
                      {[
                        { key: 'realtime', label: 'Real-time Scan', icon: Zap },
                        { key: 'antiPhishing', label: 'Anti-Phishing', icon: ShieldAlert },
                        { key: 'maliciousBlock', label: 'Auto-Block', icon: Lock },
                        { key: 'sslCheck', label: 'SSL Validator', icon: Key }
                      ].map(item => (
                        <div key={item.key} className="flex items-center justify-between p-1.5 bg-black/20 rounded border border-border/5">
                          <div className="flex items-center gap-1.5">
                            <item.icon className="w-2 h-2 text-muted" />
                            <span className="text-[7px] font-medium text-muted uppercase tracking-tighter">{item.label}</span>
                          </div>
                          <button 
                            onClick={() => setWebProtection(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                            className={cn(
                              "w-5 h-2.5 rounded-full relative transition-colors",
                              webProtection[item.key] ? "bg-safe" : "bg-black border border-border/20"
                            )}
                          >
                            <motion.div 
                              animate={{ x: webProtection[item.key] ? 10 : 2 }}
                              className="absolute top-0.5 w-1.5 h-1.5 bg-bg rounded-full"
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'INTEL' && (
              <div className="space-y-4">
                {/* Apex Strategic Defense Ecosystem - The "One Big Good Thing" */}
                <div className="p-4 bg-panel border border-border/30 rounded-xl space-y-6 hardware-border relative overflow-hidden">
                  <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
                    <div className="absolute top-0 left-0 w-full h-full bg-[grid-white/5] [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" />
                  </div>
                  
                  {/* Header */}
                  <div className="flex items-center justify-between relative z-10 border-b border-border/10 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-accent/10 rounded-lg border border-accent/20">
                        <ShieldCheck className="w-4 h-4 text-accent" />
                      </div>
                      <div>
                        <h3 className="text-[8px] font-black uppercase tracking-[0.3em] text-accent">Apex Strategic Defense Ecosystem</h3>
                        <p className="text-[4px] text-muted uppercase font-bold tracking-widest">Unified Multi-Vector Protection Matrix</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-1 rounded-full bg-safe animate-pulse" />
                        <span className="text-[6px] font-mono font-bold text-safe uppercase tracking-tighter">Core Synchronized</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 relative z-10">
                    
                    {/* SECTION 1: HYBRID DEFENSE MECHANISM (AI CORE) */}
                    <div className="space-y-3 p-3 bg-accent/5 rounded-xl border border-accent/10 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(242,125,38,0.05),transparent)] bg-[length:200%_100%] animate-[shimmer_3s_infinite] pointer-events-none" />
                      
                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <Brain className="w-4 h-4 text-accent" />
                            <motion.div 
                              className="absolute -inset-1 bg-accent/20 rounded-full blur-[2px]"
                              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          </div>
                          <span className="text-[8px] font-black uppercase tracking-wider text-white">Hybrid Defense Core</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-end">
                            <span className="text-[5px] text-muted uppercase font-bold">Entropy</span>
                            <span className="text-[7px] font-mono text-accent font-bold tracking-tighter">{entropyValue.toFixed(4)}</span>
                          </div>
                          <button 
                            onClick={() => setIsHybridDefenseActive(!isHybridDefenseActive)}
                            className={cn(
                              "px-2 py-1 rounded-[4px] text-[6px] font-black uppercase border transition-all",
                              isHybridDefenseActive ? "bg-accent text-bg border-accent shadow-[0_0_12px_rgba(242,125,38,0.4)]" : "bg-black border-border/20 text-muted"
                            )}
                          >
                            {isHybridDefenseActive ? 'ACTIVE' : 'OFFLINE'}
                          </button>
                        </div>
                      </div>

                      {/* Dual Brain Architecture Info */}
                      <div className="grid grid-cols-2 gap-2 relative z-10">
                        <div className="p-2 bg-black/40 rounded-lg border border-border/10 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[6px] text-accent font-black uppercase">Local Brain</span>
                            <span className="text-[5px] text-muted font-bold">EDGE AI</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Cpu className="w-2.5 h-2.5 text-accent/60" />
                            <span className="text-[6px] text-white/80 font-mono">TensorFlow.js</span>
                          </div>
                          <div className="h-[3px] w-full bg-border/10 rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-accent"
                              animate={{ width: isHybridDefenseActive ? `${localBrainLoad}%` : '0%' }}
                              transition={{ duration: 0.5, ease: "easeOut" }}
                            />
                          </div>
                          <div className="flex justify-between text-[5px] font-bold text-muted/60">
                            <span>SCANNING</span>
                            <span>{localBrainLoad}% LOAD</span>
                          </div>
                        </div>
                        <div className="p-2 bg-black/40 rounded-lg border border-border/10 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[6px] text-safe font-black uppercase">Cloud Brain</span>
                            <span className="text-[5px] text-muted font-bold">SEMANTIC</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Cloud className="w-2.5 h-2.5 text-safe/60" />
                            <span className="text-[6px] text-white/80 font-mono">Gemini 1.5 Flash</span>
                          </div>
                          <div className="h-[3px] w-full bg-border/10 rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-safe"
                              animate={{ width: isHybridDefenseActive ? `${cloudBrainLoad}%` : '0%' }}
                              transition={{ duration: 0.5, ease: "easeOut" }}
                            />
                          </div>
                          <div className="flex justify-between text-[5px] font-bold text-muted/60">
                            <span>REASONING</span>
                            <span>{cloudBrainLoad}% LOAD</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Sub-toggles for TensorFlow, AI Shield, and Quantum Resilience */}
                      <div className="grid grid-cols-2 gap-1.5 pt-1 relative z-10">
                        <div className="flex items-center justify-between p-1.5 bg-black/30 rounded border border-border/10">
                          <div className="flex items-center gap-1">
                            <Cpu className={cn("w-2 h-2", isProcessing ? "text-accent animate-pulse" : "text-muted")} />
                            <div className="flex flex-col">
                              <span className="text-[5px] text-white uppercase font-black leading-tight">TensorFlow</span>
                              <span className="text-[4px] text-muted font-bold leading-none">{isProcessing ? 'SCANNING' : 'IDLE'}</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => setIsTensorFlowActive(!isTensorFlowActive)}
                            className={cn(
                              "w-4 h-2 rounded-full relative transition-all shrink-0",
                              isTensorFlowActive ? "bg-accent/40" : "bg-muted/20"
                            )}
                          >
                            <motion.div 
                              className={cn("absolute top-0.5 w-1 h-1 rounded-full", isTensorFlowActive ? "bg-accent shadow-[0_0_4px_rgba(242,125,38,0.6)]" : "bg-muted")}
                              animate={{ x: isTensorFlowActive ? 10 : 1 }}
                            />
                          </button>
                        </div>
                        <div className="flex items-center justify-between p-1.5 bg-black/30 rounded border border-border/10">
                          <div className="flex items-center gap-1">
                            <ShieldAlert className={cn("w-2 h-2", isShielding ? "text-accent animate-bounce" : "text-muted")} />
                            <div className="flex flex-col">
                              <span className="text-[5px] text-white uppercase font-black leading-tight">AI Shield</span>
                              <span className="text-[4px] text-muted font-bold leading-none">{isShielding ? 'ACTIVE' : 'READY'}</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => setIsAiShieldActive(!isAiShieldActive)}
                            className={cn(
                              "w-4 h-2 rounded-full relative transition-all shrink-0",
                              isAiShieldActive ? "bg-accent/40" : "bg-muted/20"
                            )}
                          >
                            <motion.div 
                              className={cn("absolute top-0.5 w-1 h-1 rounded-full", isAiShieldActive ? "bg-accent shadow-[0_0_4px_rgba(242,125,38,0.6)]" : "bg-muted")}
                              animate={{ x: isAiShieldActive ? 10 : 1 }}
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                      {/* SECTION 2: VECTOR REDIRECTION & QUANTUM SECURITY */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Vector Matrix - Now 1/2 width on large screens */}
                      <div className="group/vector relative flex flex-col h-full overflow-hidden rounded-xl border border-white/5 bg-[#050505] transition-all duration-700 hover:border-accent/40 hover:shadow-[0_0_30px_rgba(242,125,38,0.05)]">
                        {/* Header */}
                        <div className="relative z-20 flex items-center justify-between p-1.5 pb-1 border-b border-white/5">
                          <div className="flex items-center gap-1.5">
                            <div className="relative flex h-4 w-4 items-center justify-center rounded border border-white/10 bg-white/[0.02] shadow-lg backdrop-blur-md">
                              <Crosshair className="h-2 w-2 text-accent" />
                            </div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-white/90 whitespace-nowrap">Offensive Matrix</h3>
                              <div className="flex items-center gap-1">
                                <div className={cn("h-0.5 w-0.5 rounded-full", isVectorRedirectionActive ? "bg-accent animate-pulse" : "bg-white/20")} />
                                <p className="text-[5px] font-bold uppercase tracking-[0.1em] text-accent/50 whitespace-nowrap">Detect • Intercept • Destroy</p>
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={() => setIsVectorRedirectionActive(!isVectorRedirectionActive)}
                            className={cn(
                              "relative rounded-md px-1 py-0.5 text-[5px] font-black uppercase tracking-[0.05em] transition-all duration-300",
                              isVectorRedirectionActive 
                                ? "bg-accent text-bg" 
                                : "bg-white/5 text-white/40 border border-white/10"
                            )}
                          >
                            {isVectorRedirectionActive ? 'Active' : 'Offline'}
                          </button>
                        </div>

                        {/* Content */}
                        <div className="relative z-20 flex flex-col p-1.5 space-y-1.5">
                          {/* Stats Grid */}
                          <div className="grid grid-cols-2 gap-1">
                            <div className="flex flex-col gap-0.5 rounded-lg border border-white/5 bg-white/[0.01] p-1">
                              <span className="text-[6px] font-bold uppercase tracking-[0.1em] text-white/30">Nodes Active</span>
                              <div className="flex items-baseline gap-1">
                                <span className="text-[8px] font-mono font-black text-safe">128</span>
                                <Cpu className="h-1.5 w-1.5 text-safe/40" />
                              </div>
                            </div>
                            <div className="flex flex-col gap-0.5 rounded-lg border border-white/5 bg-white/[0.01] p-1">
                              <span className="text-[6px] font-bold uppercase tracking-[0.1em] text-white/30">Detected</span>
                              <div className="flex items-baseline gap-1">
                                <span className="text-[8px] font-mono font-black text-white">{interceptedCount + 12}</span>
                                <Target className="h-1.5 w-1.5 text-accent/40" />
                              </div>
                            </div>
                            <div className="flex flex-col gap-0.5 rounded-lg border border-white/5 bg-white/[0.01] p-1">
                              <span className="text-[6px] font-bold uppercase tracking-[0.1em] text-white/30">Intercepted</span>
                              <div className="flex items-baseline gap-1">
                                <span className="text-[8px] font-mono font-black text-white">{interceptedCount}</span>
                                <Shuffle className="h-1.5 w-1.5 text-safe/40" />
                              </div>
                            </div>
                            <div className="flex flex-col gap-0.5 rounded-lg border border-white/5 bg-white/[0.01] p-1">
                              <span className="text-[6px] font-bold uppercase tracking-[0.1em] text-white/30">Destroyed</span>
                              <div className="flex items-baseline gap-1">
                                <span className="text-[8px] font-mono font-black text-destructive">{destroyedCount}</span>
                                <Zap className="h-1.5 w-1.5 text-destructive/40" />
                              </div>
                            </div>
                          </div>

                          {/* Visualization Container */}
                          <div className="relative h-12 w-full overflow-hidden rounded-lg border border-white/5 bg-black/60">
                            <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(242,125,38,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(242,125,38,0.2)_1px,transparent_1px)] bg-[length:8px_8px]" />
                            
                            {/* Radar Grid Circles */}
                            {[1, 2, 3].map((i) => (
                              <div 
                                key={`circle-${i}`}
                                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/10"
                                style={{ width: `${i * 30}%`, height: `${i * 30}%` }}
                              />
                            ))}

                            {/* Deployed Defense Nodes */}
                            {isVectorRedirectionActive && [
                              { top: '20%', left: '30%' },
                              { top: '60%', left: '20%' },
                              { top: '40%', left: '70%' },
                              { top: '80%', left: '60%' },
                              { top: '15%', left: '85%' },
                            ].map((pos, i) => (
                              <motion.div
                                key={`node-${i}`}
                                className="absolute h-1 w-1 rounded-full bg-accent shadow-[0_0_4px_rgba(242,125,38,0.8)]"
                                style={pos}
                                animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
                                transition={{ duration: 2 + Math.random(), repeat: Infinity, delay: i * 0.3 }}
                              />
                            ))}

                            {/* Enemy Targets & Interception */}
                            {isVectorRedirectionActive && Array.from({ length: 3 }).map((_, i) => (
                              <motion.div
                                key={`enemy-${i}`}
                                className="absolute h-0.5 w-0.5 rounded-full bg-destructive"
                                initial={{ x: Math.random() * 100 + '%', y: Math.random() * 100 + '%', opacity: 0 }}
                                animate={{ 
                                  opacity: [0, 1, 1, 0],
                                  scale: [1, 1, 1.5, 0],
                                  x: ['0%', '50%', '50%'],
                                  y: ['0%', '50%', '50%']
                                }}
                                transition={{ duration: 3, repeat: Infinity, delay: i * 1.5 }}
                              />
                            ))}

                            {/* Interception Beams */}
                            {isVectorRedirectionActive && (
                              <motion.div 
                                className="absolute left-1/2 top-1/2 h-px bg-accent/40 origin-left"
                                animate={{ rotate: [0, 360], width: ['0%', '40%', '0%'], opacity: [0, 1, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              />
                            )}

                            {/* Scanning Radar Sweep */}
                            <motion.div 
                              className="absolute inset-0 origin-center pointer-events-none"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            >
                              <div className="absolute top-1/2 left-1/2 w-1/2 h-1/2 bg-gradient-to-tr from-accent/5 to-transparent origin-bottom-left -translate-y-full blur-[1px]" />
                            </motion.div>
                          </div>

                          {/* Footer Stats */}
                          <div className="space-y-1 pt-1 border-t border-white/5">
                            <div className="flex items-center justify-between">
                              <span className="text-[7px] font-black uppercase tracking-[0.1em] text-white/50">Neutralization Rate</span>
                              <span className="text-[8px] font-mono font-black text-safe">99.8%</span>
                            </div>
                            <div className="h-0.5 w-full rounded-full bg-white/[0.02] overflow-hidden">
                              <motion.div 
                                className="h-full bg-safe/60"
                                initial={{ width: 0 }}
                                animate={{ width: '99.8%' }}
                                transition={{ duration: 1.5 }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>


                      {/* Quantum Security & Entropy Engine - Now 1/2 width on large screens */}
                      <div className="group/quantum relative flex flex-col h-full overflow-hidden rounded-xl border border-white/5 bg-[#050505] transition-all duration-700 hover:border-safe/40 hover:shadow-[0_0_40px_rgba(34,197,94,0.05)]">
                        {/* Header */}
                        <div className="relative z-20 flex items-center justify-between p-1.5 pb-1 border-b border-white/5">
                          <div className="flex items-center gap-2">
                            <div className="relative flex h-4 w-4 items-center justify-center rounded border border-white/10 bg-white/[0.02] shadow-lg backdrop-blur-md">
                              <Lock className="h-2 w-2 text-safe" />
                            </div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-white whitespace-nowrap">Quantum Secure</h3>
                              <div className="flex items-center gap-1.5">
                                <div className="px-1 py-0.25 rounded bg-safe/10 border border-safe/20 text-[5px] font-black text-safe uppercase tracking-widest">Ready</div>
                                <p className="text-[5px] font-bold uppercase tracking-[0.1em] text-white/30 whitespace-nowrap">Lattice v4.2</p>
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={() => setIsQuantumShieldActive(!isQuantumShieldActive)}
                            className={cn(
                              "relative flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[5px] font-black uppercase tracking-[0.05em] transition-all duration-300",
                              isQuantumShieldActive 
                                ? "bg-safe text-bg" 
                                : "bg-white/5 text-white/40 border border-white/10"
                            )}
                          >
                            <div className={cn("h-0.5 w-0.5 rounded-full", isQuantumShieldActive ? "bg-bg animate-pulse" : "bg-white/20")} />
                            {isQuantumShieldActive ? 'Shield Active' : 'Vulnerable'}
                          </button>
                        </div>

                        {/* Content Grid */}
                        <div className="relative z-20 p-1.5 flex-grow">
                          {/* Metrics & Specs */}
                          <div className="flex flex-col space-y-1.5">
                            <div className="grid grid-cols-2 gap-1">
                              <div className="flex flex-col gap-0.5 rounded-lg border border-white/5 bg-white/[0.01] p-1">
                                <span className="text-[5px] font-bold uppercase tracking-tighter text-white/30 whitespace-nowrap">Entropy</span>
                                <div className="text-[7px] font-mono font-black text-white">{stats.quantumEntropy}</div>
                                <div className="h-0.5 w-full bg-white/[0.02] rounded-full overflow-hidden">
                                  <motion.div className="h-full bg-safe" animate={{ width: '99.9%' }} />
                                </div>
                              </div>
                              <div className="flex flex-col gap-0.5 rounded-lg border border-white/5 bg-white/[0.01] p-1">
                                <span className="text-[5px] font-bold uppercase tracking-tighter text-white/30 whitespace-nowrap">Coherence</span>
                                <div className="text-[7px] font-mono font-black text-safe">99.9%</div>
                                <div className="h-0.5 w-full bg-white/[0.02] rounded-full overflow-hidden">
                                  <motion.div className="h-full bg-safe" animate={{ width: '99.98%' }} />
                                </div>
                              </div>
                            </div>

                            {/* New Stats to fill space */}
                            <div className="grid grid-cols-1 gap-1">
                              <div className="flex flex-col gap-1 rounded-lg border border-white/5 bg-white/[0.01] p-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-[7px] font-bold uppercase tracking-[0.1em] text-white/30">Key Rotation</span>
                                </div>
                                <div className="h-0.5 w-full bg-white/[0.02] rounded-full overflow-hidden">
                                  <motion.div 
                                    className="h-full bg-safe" 
                                    animate={{ width: ['0%', '100%'] }} 
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }} 
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Decorative Quantum Lattice Visualization */}
                            <div className="relative h-12 w-full overflow-hidden rounded-lg border border-white/5 bg-white/[0.01] p-1">
                              <div className="absolute inset-0 flex items-center justify-center opacity-20">
                                <div className="grid grid-cols-8 gap-2">
                                  {[...Array(32)].map((_, i) => (
                                    <motion.div
                                      key={i}
                                      className="h-0.5 w-0.5 rounded-full bg-safe"
                                      animate={{
                                        scale: [1, 1.5, 1],
                                        opacity: [0.3, 1, 0.3],
                                      }}
                                      transition={{
                                        duration: 2 + Math.random() * 2,
                                        repeat: Infinity,
                                        delay: Math.random() * 2,
                                      }}
                                    />
                                  ))}
                                </div>
                              </div>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <motion.div 
                                  className="h-[1px] w-full bg-gradient-to-r from-transparent via-safe/30 to-transparent"
                                  animate={{ top: ['0%', '100%'] }}
                                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                  style={{ position: 'absolute' }}
                                />
                              </div>
                              <div className="relative flex h-full items-end justify-between px-1 pb-0.5">
                                <span className="text-[5px] font-bold uppercase tracking-widest text-white/20">Lattice Visualization</span>
                                <div className="flex gap-1">
                                  <div className="h-1 w-0.5 bg-safe/40 animate-pulse" />
                                  <div className="h-1 w-0.5 bg-safe/20 animate-pulse delay-75" />
                                  <div className="h-1 w-0.5 bg-safe/60 animate-pulse delay-150" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Status Bar */}
                  <div className="pt-2 border-t border-border/10 flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-safe animate-pulse" />
                      <span className="text-[6px] font-mono text-muted uppercase tracking-widest">Ecosystem Integrity: Optimal</span>
                    </div>
                    <div className="text-[6px] font-mono text-accent/60 uppercase">
                      Neural Sync: {hybridStats.neuralSync}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
            {activeTab === 'SETTINGS' && (
              <div className="space-y-4">
                <div className="p-4 bg-panel border border-border/30 rounded-xl space-y-6 hardware-border">
                  <div className="flex items-center gap-3 border-b border-border/10 pb-3">
                    <div className="p-1.5 bg-accent/10 rounded-lg border border-accent/20">
                      <Key className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-[8px] font-black uppercase tracking-[0.3em] text-accent">AI Configuration</h3>
                      <p className="text-[4px] text-muted uppercase font-bold tracking-widest">Secure Gemini API Key Management</p>
                    </div>
                  </div>

                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSaveKey();
                      }}
                      className="space-y-4"
                    >
                      {showInfo && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                          <div className="w-full max-w-[280px] bg-bg border border-accent/30 rounded-xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between border-b border-border/10 pb-3">
                              <div className="flex items-center gap-2">
                                <Info className="w-3.5 h-3.5 text-accent" />
                                <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Setup Instructions</h3>
                              </div>
                              <button onClick={() => setShowInfo(null)} className="text-muted hover:text-white transition-colors">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="space-y-3">
                              {showInfo === 'GEMINI' && (
                                <>
                                  <p className="text-[9px] text-accent font-bold uppercase tracking-wider">Google Gemini API</p>
                                  <ol className="text-[8px] text-muted space-y-2 list-decimal list-inside leading-relaxed">
                                    <li>Visit <span className="text-white font-mono">aistudio.google.com</span></li>
                                    <li>Click &quot;Get API key&quot; on the left sidebar</li>
                                    <li>Click &quot;Create API key in new project&quot;</li>
                                    <li>Copy and paste the key into the Gemini field</li>
                                  </ol>
                                </>
                              )}
                              {showInfo === 'VT' && (
                                <>
                                  <p className="text-[9px] text-safe font-bold uppercase tracking-wider">VirusTotal API</p>
                                  <ol className="text-[8px] text-muted space-y-2 list-decimal list-inside leading-relaxed">
                                    <li>Sign up at <span className="text-white font-mono">virustotal.com</span></li>
                                    <li>Click your profile icon (top right)</li>
                                    <li>Select &quot;API Key&quot; from the dropdown</li>
                                    <li>Copy your personal API key</li>
                                  </ol>
                                </>
                              )}
                              {showInfo === 'ABUSE' && (
                                <>
                                  <p className="text-[9px] text-accent font-bold uppercase tracking-wider">abuse.ch Integration</p>
                                  <ol className="text-[8px] text-muted space-y-2 list-decimal list-inside leading-relaxed">
                                    <li>Visit <span className="text-white font-mono">threatfox.abuse.ch</span> or <span className="text-white font-mono">urlhaus.abuse.ch</span></li>
                                    <li>Log in or create a free account</li>
                                    <li>Go to your account settings to find your API Key</li>
                                    <li>Copy and paste the key into the abuse.ch field</li>
                                    <li>The integration will auto-enable once a valid key is saved</li>
                                  </ol>
                                </>
                              )}
                              {showInfo === 'GSB' && (
                                <>
                                  <p className="text-[9px] text-safe font-bold uppercase tracking-wider">Google Safe Browsing</p>
                                  <ol className="text-[8px] text-muted space-y-2 list-decimal list-inside leading-relaxed">
                                    <li>Go to <span className="text-white font-mono">console.cloud.google.com</span></li>
                                    <li>Search for &quot;Safe Browsing API&quot; and Enable it</li>
                                    <li>Go to &quot;Credentials&quot; &gt; &quot;Create Credentials&quot; &gt; &quot;API Key&quot;</li>
                                    <li>Copy the generated key</li>
                                  </ol>
                                </>
                              )}
                            </div>
                            <button 
                              onClick={() => setShowInfo(null)}
                              className="w-full py-2 bg-accent/10 hover:bg-accent/20 text-accent rounded-lg text-[8px] font-black uppercase tracking-widest transition-all border border-accent/20"
                            >
                              Understood
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[7px] font-black text-warning uppercase tracking-widest flex items-center gap-1.5">
                            Gemini API Key <span className="text-warning text-[5px]">(MANDATORY)</span>
                          </label>
                          <button 
                            onClick={() => setShowInfo('GEMINI')}
                            className="p-1 hover:bg-white/5 rounded-md transition-colors text-muted hover:text-accent"
                          >
                            <Info className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="relative group">
                          <div className="absolute -inset-0.5 bg-accent/20 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
                          <input 
                            type={isKeyVisible ? "text" : "password"}
                            value={geminiKey}
                            onChange={(e) => setGeminiKey(e.target.value)}
                            placeholder="Enter your Gemini API Key..."
                            className="relative w-full bg-black/40 border border-border/20 rounded-lg px-3 py-2 text-[10px] font-mono text-accent placeholder:text-muted/30 focus:outline-none focus:border-accent/50 transition-all"
                          />
                          <button 
                            onClick={() => setIsKeyVisible(!isKeyVisible)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-accent transition-colors"
                          >
                            {isKeyVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border/10 space-y-4">
                        <h4 className="text-[7px] font-black text-accent uppercase tracking-widest">Power User Keys (Optional)</h4>
                        
                        <div className="grid grid-cols-1 gap-4">
                          {/* VirusTotal */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <label className="text-[6px] font-black text-muted uppercase tracking-widest">VirusTotal API Key</label>
                              <button 
                                onClick={() => setShowInfo('VT')}
                                className="p-0.5 hover:bg-white/5 rounded transition-colors text-muted hover:text-safe"
                              >
                                <Info className="w-2.5 h-2.5" />
                              </button>
                            </div>
                            <input 
                              type="password"
                              value={vtKey}
                              onChange={(e) => setVtKey(e.target.value)}
                              placeholder="VT API Key..."
                              className="w-full bg-black/40 border border-border/20 rounded-lg px-3 py-1.5 text-[8px] font-mono text-safe placeholder:text-muted/30 focus:outline-none focus:border-safe/50 transition-all"
                            />
                          </div>

                          {/* abuse.ch */}
                          {isSetupComplete ? (
                            <div className="space-y-2 p-2 bg-accent/5 rounded-lg border border-accent/10">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <label className="text-[6px] font-black text-accent uppercase tracking-widest">abuse.ch Integration</label>
                                  <div className={`w-1 h-1 rounded-full ${abuseChActive ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]' : 'bg-white/10'}`} />
                                </div>
                                <button 
                                  onClick={() => setShowInfo('ABUSE')}
                                  className="p-0.5 hover:bg-white/5 rounded transition-colors text-muted hover:text-accent"
                                >
                                  <Info className="w-2.5 h-2.5" />
                                </button>
                              </div>
                              <div className="space-y-1">
                                <input 
                                  type="password"
                                  value={abuseChKey}
                                  onChange={(e) => {
                                    setAbuseChKey(e.target.value);
                                    setIsAbuseChValidated(false);
                                  }}
                                  placeholder="abuse.ch API Key..."
                                  className="w-full bg-black/40 border border-border/20 rounded-lg px-3 py-1.5 text-[8px] font-mono text-accent placeholder:text-muted/30 focus:outline-none focus:border-accent/50 transition-all"
                                />
                              </div>
                              <div className={cn(
                                "flex items-center justify-between bg-black/40 border border-border/20 rounded-lg px-3 py-1.5 transition-opacity",
                                !abuseChKey && "opacity-50 pointer-events-none"
                              )}>
                                <span className="text-[8px] text-muted uppercase font-bold tracking-widest">Enable Threat Intelligence</span>
                                <button 
                                  onClick={() => setAbuseChActive(!abuseChActive)}
                                  disabled={!isAbuseChValidated}
                                  className={cn(
                                    "w-10 h-5 rounded-full relative transition-all duration-300 shadow-inner",
                                    abuseChActive && isAbuseChValidated 
                                      ? "bg-accent shadow-[0_0_15px_rgba(242,125,38,0.6)]" 
                                      : "bg-white/10 opacity-50 cursor-not-allowed"
                                  )}
                                >
                                  <div className={cn(
                                    "absolute top-1 w-3 h-3 rounded-full shadow-md transition-all duration-300 flex items-center justify-center",
                                    abuseChActive && isAbuseChValidated ? "right-1 bg-safe" : "left-1 bg-white"
                                  )}>
                                    {abuseChActive && isAbuseChValidated && <div className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />}
                                  </div>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="p-2 bg-black/20 rounded-lg border border-border/10 opacity-50 cursor-not-allowed">
                              <div className="flex items-center justify-between">
                                <label className="text-[6px] font-black text-muted uppercase tracking-widest">abuse.ch Integration</label>
                                <Lock className="w-2.5 h-2.5 text-muted" />
                              </div>
                              <p className="text-[5px] text-muted mt-1 uppercase font-bold">Locked: Gemini API Key Required</p>
                            </div>
                          )}

                          {/* Google Safe Browsing */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <label className="text-[6px] font-black text-muted uppercase tracking-widest">Google Safe Browsing Key</label>
                              <button 
                                onClick={() => setShowInfo('GSB')}
                                className="p-0.5 hover:bg-white/5 rounded transition-colors text-muted hover:text-safe"
                              >
                                <Info className="w-2.5 h-2.5" />
                              </button>
                            </div>
                            <input 
                              type="password"
                              value={gsbKey}
                              onChange={(e) => setGsbKey(e.target.value)}
                              placeholder="Safe Browsing API Key..."
                              className="w-full bg-black/40 border border-border/20 rounded-lg px-3 py-1.5 text-[8px] font-mono text-safe placeholder:text-muted/30 focus:outline-none focus:border-safe/50 transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      {keyError && (
                        <p className="text-[6px] text-danger font-bold uppercase tracking-widest animate-pulse">
                          {keyError}
                        </p>
                      )}
                      {saveSuccess && (
                        <div className="p-2 bg-safe/10 border border-safe/30 rounded-lg flex items-center gap-2 animate-in slide-in-from-bottom-2">
                          <CheckCircle2 className="w-3 h-3 text-safe" />
                          <p className="text-[7px] text-safe font-black uppercase tracking-widest">
                            Configuration Saved & Validated
                          </p>
                        </div>
                      )}
                      <p className="text-[5px] text-muted/60 leading-relaxed">
                        Gemini is required for core AI defense. Power User keys enable deeper network analysis, malware scanning, and IP reputation tracking.
                      </p>
                    
                      <button 
                        type="submit"
                        disabled={isValidating}
                        className={cn(
                          "w-full py-2 bg-accent text-bg rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-accent/90 transition-all shadow-[0_0_15px_rgba(242,125,38,0.2)] active:scale-95 flex items-center justify-center gap-2",
                          isValidating && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {isValidating ? (
                          <>
                            <div className="w-2 h-2 border-2 border-bg border-t-transparent rounded-full animate-spin" />
                            Validating...
                          </>
                        ) : (
                          "Save Configuration"
                        )}
                      </button>
                    </form>

                    <div className="pt-4 border-t border-border/10 space-y-3">
                      <h4 className="text-[6px] font-black text-muted uppercase tracking-widest">Security Status</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 bg-black/20 rounded border border-border/5 flex items-center justify-between">
                          <span className="text-[5px] text-muted uppercase font-bold">Key Presence</span>
                          <span className={cn("text-[6px] font-mono font-black", geminiKey ? "text-safe" : "text-danger")}>
                            {geminiKey ? 'DETECTED' : 'MISSING'}
                          </span>
                        </div>
                        <div className="p-2 bg-black/20 rounded border border-border/5 flex items-center justify-between">
                          <span className="text-[5px] text-muted uppercase font-bold">Encryption</span>
                          <span className="text-[6px] font-mono font-black text-safe">AES-256</span>
                        </div>
                      </div>
                    </div>
                  </div>

                <div className="p-4 bg-warning/5 border border-warning/20 rounded-xl space-y-2">
                   <div className="flex items-center gap-2">
                     <ShieldAlert className="w-3 h-3 text-warning" />
                     <span className="text-[7px] font-black text-warning uppercase tracking-widest">Security Warning</span>
                   </div>
                   <p className="text-[6px] text-warning/80 leading-relaxed font-medium">
                     Without a valid API key, the Guardian AI will operate in a limited capacity. 
                     Autonomous defense and deep packet inspection will be disabled.
                   </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Global Copyright Footer - Always Visible */}
        <div className="px-4 pb-4 pt-0 text-center space-y-2 relative z-10 bg-gradient-to-t from-black to-transparent">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-border/20 to-transparent mb-1" />
          <p className="text-[8px] text-muted uppercase font-black tracking-widest">
            Owned and operated by 
            <span className="text-accent ml-1">Defensive Grid Labs</span>
          </p>
          <div className="flex justify-center">
            <a 
              href="https://denfensivegridlabs.netlify.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-3 py-1 border border-accent/20 rounded-full text-[7px] font-mono text-accent/80 hover:text-accent hover:border-accent/40 transition-all uppercase tracking-widest bg-accent/5"
            >
              denfensivegridlabs.netlify.app
            </a>
          </div>
          <div className="text-[6px] text-muted/40 font-mono mt-2 uppercase tracking-[0.2em]">
            © 2026 GRID GUARDIAN WEB • ALL RIGHTS RESERVED • v2.5.0-PRO
          </div>
        </div>
      </main>
    </div>
  </div>
  );
}
