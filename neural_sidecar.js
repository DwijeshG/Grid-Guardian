/* global tf */
// Grid Guardian Offscreen AI Inference & Reinforcement Learning Engine
let model = null;
let isTfReady = false;
let tfInitializationPromise = null;

async function initModel() {
    const tfInstance = getTf();
    if (!tfInstance || typeof tfInstance.sequential !== 'function') {
        console.error("[NEXUS AI] TensorFlow (tf) is not ready for model creation.");
        return;
    }
    console.log("[NEXUS AI] Initializing Local Inference Model...");
    try {
        // Try to load existing memories first
        try {
            model = await tfInstance.loadLayersModel('indexeddb://nexus-ai-model');
            console.log("[NEXUS AI] Loaded previously trained model from memory.");
            // Must compile after loading
            model.compile({ optimizer: tfInstance.train.adam(0.01), loss: 'binaryCrossentropy', metrics: ['accuracy'] });
        } catch {
            console.log("[NEXUS AI] No saved memory found. Initializing base model...");
            // Define a simple sequential model for URL/Payload classification
            model = tfInstance.sequential();
            model.add(tfInstance.layers.dense({ units: 16, inputShape: [10], activation: 'relu' }));
            model.add(tfInstance.layers.dense({ units: 1, activation: 'sigmoid' }));
            
            model.compile({
                optimizer: tfInstance.train.adam(0.01),
                loss: 'binaryCrossentropy',
                metrics: ['accuracy']
            });
        }

        console.log("[NEXUS AI] Neural Model Ready");
    } catch (e) {
        console.error("[NEXUS AI] Model Initialization Failed", e);
    }
}

function getTf() {
    return (typeof tf !== 'undefined' ? tf : (typeof window !== 'undefined' ? window.tf : (typeof self !== 'undefined' ? self.tf : (typeof globalThis !== 'undefined' ? globalThis.tf : null))));
}

/**
 * Converts a string payload into a numerical tensor for the model.
 */
function featurize(payload) {
    const tfInstance = getTf();
    if (!tfInstance || !isTfReady) {
        console.warn("[NEXUS AI] featurize called but TF is not ready.");
        return null;
    }
    const features = new Array(10).fill(0);
    const text = typeof payload === 'string' ? payload : JSON.stringify(payload);
    
    // Feature 1: Length
    features[0] = Math.min(text.length / 1000, 1);
    // Feature 2: Entropy (simulated)
    features[1] = text.includes('atob') || text.includes('eval') ? 0.9 : 0.1;
    // Feature 3: Digit density
    features[2] = (text.match(/\d/g) || []).length / text.length || 0;
    // Feature 4: Special char density
    features[3] = (text.match(/[^a-zA-Z0-9]/g) || []).length / text.length || 0;
    
    return tfInstance.tensor2d([features]);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Ensure TF is initialized before handling messages that require it
    if (message.type === 'EVALUATE_THREAT' || message.type === 'SCORE_URL' || message.type === 'SCORE_PAYLOAD') {
        (async () => {
            if (!isTfReady) await tfInitializationPromise;
            
            if (!model) {
                sendResponse({ score: 0.5, error: 'Model not ready' });
                return;
            }
            
            try {
                const input = featurize(message.url || message.payload);
                if (!input) {
                    sendResponse({ score: 0.5, error: 'Featurization failed' });
                    return;
                }
                const prediction = model.predict(input);
                const data = await prediction.data();
                sendResponse({ score: data[0] });
                
                // Cleanup tensors
                input.dispose();
                prediction.dispose();
            } catch (err) {
                console.error("[NEXUS AI] Inference Error:", err);
                sendResponse({ score: 0.5, error: err.message });
            }
        })();
        return true; // Async response
    }

    if (message.type === 'LEARN_FROM_BYPASS') {
        (async () => {
            if (!isTfReady) await tfInitializationPromise;
            handleReinforcementLearning(message.payload, 1.0);
            sendResponse({ success: true });
        })();
        return true;
    }

    if (message.type === 'LEARN_FROM_FALSE_POSITIVE') {
        (async () => {
            if (!isTfReady) await tfInitializationPromise;
            handleReinforcementLearning(message.payload, 0.0);
            sendResponse({ success: true });
        })();
        return true;
    }
    return true;
});

/**
 * Self-Healing Loop: Retrains the model on missed threats or false positives.
 */
async function handleReinforcementLearning(payload, labelValue) {
    const tfInstance = getTf();
    if (!tfInstance || !model || !isTfReady) return;
    console.log(`[NEXUS AI] Initiating Self-Healing Loop for ${labelValue === 1.0 ? 'Bypassed Threat' : 'False Positive'}...`);
    
    try {
        const input = featurize(payload);
        const label = tfInstance.tensor2d([[labelValue]]); // Label as malicious (1.0) or safe (0.0)

        // Fast fine-tuning (Transfer Learning)
        await model.fit(input, label, {
            epochs: 5,
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    console.log(`[NEXUS AI] Retraining Epoch ${epoch + 1}: loss = ${logs.loss.toFixed(4)}`);
                }
            }
        });

        // Save the newly acquired knowledge permanently
        await model.save('indexeddb://nexus-ai-model');
        console.log("[NEXUS AI] Neural weights saved to local storage.");
        
        // Export weights for telemetry
        const weights = await model.getWeights();
        const weightData = await Promise.all(weights.map(w => w.data()));
        
        chrome.runtime.sendMessage({
            type: 'MODEL_UPDATED',
            weights: weightData
        });

        // Cleanup
        input.dispose();
        label.dispose();
    } catch (err) {
        console.error("[NEXUS AI] Reinforcement Learning Error:", err);
    }
}

async function initTensorFlow() {
    console.log("[NEXUS AI] Initializing TensorFlow Environment...");
    
    // Add a safety timeout for initialization
    const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("TensorFlow initialization timed out")), 15000)
    );

    try {
        await Promise.race([
            (async () => {
                const tfInstance = getTf();
                if (!tfInstance) {
                    throw new Error("TensorFlow (tf) is not defined.");
                }

                // Configure environment for Manifest V3 (CSP compliance)
                if (tfInstance.env && typeof tfInstance.env === 'function') {
                    const env = tfInstance.env();
                    env.set('IS_BROWSER', true);
                    // Only set HAS_WEBGL if it's already registered
                    try {
                        if (Object.prototype.hasOwnProperty.call(env.getFlags(), 'HAS_WEBGL')) {
                            env.set('HAS_WEBGL', false);
                        }
                    } catch {
                        // Ignore if flag cannot be set
                    }
                }
                
                // Set WASM path to the local file in the extension or web environment
                if (tfInstance.wasm && typeof tfInstance.wasm.setWasmPaths === 'function') {
                    // Fallback for non-extension environment (like AI Studio)
                    const baseUrl = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) 
                        ? chrome.runtime.getURL('') 
                        : window.location.origin + '/';
                    
                    console.log("[NEXUS AI] Setting WASM paths relative to:", baseUrl);
                    tfInstance.wasm.setWasmPaths({
                        'tfjs-backend-wasm.wasm': baseUrl + 'tfjs-backend-wasm.wasm',
                        'tfjs-backend-wasm-simd.wasm': baseUrl + 'tfjs-backend-wasm-simd.wasm',
                        'tfjs-backend-wasm-threaded-simd.wasm': baseUrl + 'tfjs-backend-wasm-threaded-simd.wasm'
                    });
                }

                // Try multiple ways to set the backend
                if (typeof tfInstance.setBackend === 'function') {
                    try {
                        console.log("[NEXUS AI] Attempting WASM backend initialization...");
                        const hasWasm = tfInstance.findBackend('wasm');
                        
                        if (hasWasm) {
                            // Attempt to set backend to wasm
                            // Note: If the .wasm file is corrupted, this will throw an error
                            await tfInstance.setBackend('wasm');
                            await tfInstance.ready();
                            console.log("[NEXUS AI] Backend successfully initialized to WASM");
                        } else {
                            console.warn("[NEXUS AI] WASM backend not registered in TF.js. Falling back to CPU.");
                            await tfInstance.setBackend('cpu');
                            await tfInstance.ready();
                        }
                    } catch (e) {
                        console.error("[NEXUS AI] WASM initialization failed (likely corrupted .wasm file or network issue). Falling back to CPU.");
                        console.error("[NEXUS AI] Error details:", e.message);
                        
                        // Explicitly fallback to CPU
                        try {
                            await tfInstance.setBackend('cpu');
                            await tfInstance.ready();
                            console.log("[NEXUS AI] Successfully fell back to CPU backend.");
                        } catch (cpuErr) {
                            console.error("[NEXUS AI] Critical: CPU fallback also failed:", cpuErr.message);
                        }
                    }
                } 
                
                if (typeof tfInstance.ready === 'function') {
                    await tfInstance.ready();
                }

                isTfReady = true;
                console.log("[NEXUS AI] TensorFlow Ready. Backend:", tfInstance.getBackend());
                await initModel();
            })(),
            timeoutPromise
        ]);
    } catch (e) {
        console.error("[NEXUS AI] Initialization error or timeout:", e);
        // Fallback to CPU if possible
        try {
            const tfInstance = getTf();
            if (tfInstance) {
                await tfInstance.setBackend('cpu');
                await tfInstance.ready();
                isTfReady = true;
                console.log("[NEXUS AI] Fallback to CPU successful");
                await initModel();
            }
        } catch (fallbackErr) {
            console.error("[NEXUS AI] Fallback failed:", fallbackErr);
        }
    }
}

tfInitializationPromise = initTensorFlow();
