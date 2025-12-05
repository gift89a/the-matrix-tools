// js/utils.js - Global Utility Functions (Exported)

/**
 * Encodes a string to Base64 (URL-safe and handles multi-byte characters).
 */
export function base64Encode(str) {
    return btoa(unescape(encodeURIComponent(str)));
}

/**
 * Decodes a Base64 string back to the original string.
 */
export function base64Decode(str) {
    try {
        return decodeURIComponent(escape(atob(str)));
    } catch (e) {
        return "Base64 Decode Error: Invalid input or characters.";
    }
}

/**
 * Placeholder for SHA-256 Hash generation.
 */
export function sha256(str) {
    // Placeholder logic - simulates a 64-character hex hash.
    return (Math.random().toString(16).slice(2, 10) + Math.random().toString(16).slice(2, 10) +
            Math.random().toString(16).slice(2, 10) + Math.random().toString(16).slice(2, 10) +
            Math.random().toString(16).slice(2, 10) + Math.random().toString(16).slice(2, 10) +
            Math.random().toString(16).slice(2, 10) + Math.random().toString(16).slice(2, 10)).toUpperCase();
}


export function md5(str) {
    // Placeholder logic - simulates a 32-character hex hash (MD5标准长度)。
    return (Math.random().toString(16).slice(2, 10) + Math.random().toString(16).slice(2, 10) +
            Math.random().toString(16).slice(2, 10) + Math.random().toString(16).slice(2, 10)).toUpperCase();
}