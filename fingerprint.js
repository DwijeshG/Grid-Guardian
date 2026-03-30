// Grid Guardian Fingerprint Shield
// Injected at document_start in MAIN world to mask browser identity
(function() {
    console.log("[NEXUS] Fingerprint Shield Active (MAIN World)");

    // 1. Mask Navigator
    try {
        Object.defineProperty(navigator, 'webdriver', { get: () => false });
    } catch (e) { console.warn("[NEXUS] Failed to mask webdriver", e); }
    
    console.log("[NEXUS] Native API Overrides Applied");
})();
