// TensorFlow.js Configuration for Chrome Extension (Manifest V3)
// Environment flags are now set in offscreen.html via window.tfConfig

// Initialize environment flags as soon as core is available
if (window.tf && window.tf.env) {
    const env = window.tf.env();
    
    // Only set flags if they are already registered
    const flags = env.getFlags();
    
    if ('IS_BROWSER' in flags) {
        env.set('IS_BROWSER', true);
    }
    
    // If we want to force WEBGL off, we should check if it's registered first
    if ('HAS_WEBGL' in flags) {
        env.set('HAS_WEBGL', false);
    }
}

// Set WASM paths if WASM backend is available
if (window.tf && window.tf.wasm && typeof window.tf.wasm.setWasmPaths === 'function') {
    const baseUrl = typeof chrome !== 'undefined' && chrome.runtime ? chrome.runtime.getURL('') : './';
    window.tf.wasm.setWasmPaths({
        'tfjs-backend-wasm.wasm': baseUrl + 'tfjs-backend-wasm.wasm',
        'tfjs-backend-wasm-simd.wasm': baseUrl + 'tfjs-backend-wasm-simd.wasm',
        'tfjs-backend-wasm-threaded-simd.wasm': baseUrl + 'tfjs-backend-wasm-threaded-simd.wasm'
    });
}
