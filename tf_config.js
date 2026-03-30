// TensorFlow.js Configuration for Chrome Extension (Manifest V3)
// This file must be loaded BEFORE tf-core.min.js
window.tfConfig = {
    env: {
        'IS_BROWSER': true,
        'WASM_HAS_SIMD_SUPPORT': true,
        'WASM_HAS_MULTITHREAD_SUPPORT': false
    }
};
