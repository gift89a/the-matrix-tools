// js/tools/hex.js - String ↔ Hex Converter Logic

// String to Hexadecimal (Encode)
export function strToHex(input) {
    if (!input) return "";
    let hex = "";
    for (let i = 0; i < input.length; i++) {
        // 使用 charCodeAt 获取字符的 Unicode 码点，并转为十六进制，确保至少两位
        hex += input.charCodeAt(i).toString(16).padStart(2, '0');
    }
    // 惯例上 Hex 编码使用大写
    return hex.toUpperCase(); 
}

// Hexadecimal to String (Decode)
export function hexToStr(hex) {
    if (!hex) return "";
    // 移除空格和非十六进制字符以增加鲁棒性
    hex = hex.replace(/[^0-9A-Fa-f]/g, '');
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
        const chunk = hex.substring(i, i + 2);
        // 确保是完整的两个字符块
        if (chunk.length === 2) {
            str += String.fromCharCode(parseInt(chunk, 16));
        }
    }
    return str;
}