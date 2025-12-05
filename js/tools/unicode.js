/**
 * Unicode Converter Tool Logic
 */

/**
 * Renders the dynamic UI for Unicode format selection, mode, and the custom input area.
 * @returns {string} - The HTML string for the dynamic input area.
 */
export function renderUnicodeUI() {
    return `
        <div class="control-group">
            <label for="unicode-mode" class="hack-label">Mode:</label>
            <select id="unicode-mode" class="hack-select">
                <option value="encode">Text to Unicode (Encode)</option>
                <option value="decode">Unicode to Text (Decode)</option>
            </select>
            
            <label for="unicode-format" class="hack-label" style="margin-top: 1rem;">Format:</label>
            <select id="unicode-format" class="hack-select">
                <option value="utf16">UTF-16 Escape (\\uXXXX)</option>
                <option value="decimal">Decimal Code Point (Separated by Space)</option>
            </select>
        </div>
        
        <label for="unicodeInput" class="hack-label" style="margin-top: 1rem;">Input Data:</label>
        <textarea id="unicodeInput" class="hack-input" rows="10" placeholder="Paste text or Unicode escapes here." style="min-height:200px; flex: 1;"></textarea>
    `;
}

/**
 * Converts text to Unicode escapes/decimals or vice versa.
 * 读取 DOM 元素 #unicodeInput 中的输入。
 * @returns {string} - The converted string.
 */
export function processUnicodeConversion() {
    // 从 DOM 中读取所有参数
    const inputElement = document.getElementById('unicodeInput');
    const mode = document.getElementById('unicode-mode')?.value; // 'encode' or 'decode'
    const format = document.getElementById('unicode-format')?.value; // 'utf16' or 'decimal'
    
    // 关键：从自定义输入框读取值
    const input = inputElement ? inputElement.value.trim() : '';

    if (!input) {
        if (window.notify) window.notify('Please paste data to convert.', 'error');
        return "";
    }

    if (mode === 'encode') {
        let output = [];
        
        // Iterate by code points to correctly handle characters outside the Basic Multilingual Plane (like emojis).
        for (const char of input) {
            const codePoint = char.codePointAt(0);

            if (format === 'utf16') {
                let charOutput = '';
                // 确保对辅助平面字符（占用两个 code unit）进行正确的 \uXXXX 编码
                for (let i = 0; i < char.length; i++) {
                    const codeUnit = char.charCodeAt(i);
                    charOutput += `\\u${codeUnit.toString(16).toUpperCase().padStart(4, '0')}`;
                }
                output.push(charOutput);
            } 
            else if (format === 'decimal') {
                // Output the Decimal Code Point
                output.push(codePoint.toString(10));
            }
        }
        
        return output.join(format === 'decimal' ? ' ' : ''); // Space separator for Decimal Code Points
    } 
    
    // 【解码功能】
    else if (mode === 'decode') {
        if (format === 'utf16') {
            // 解码 UTF-16 escapes。
            const codeUnits = [];
            const regex = /\\u([0-9a-fA-F]{4})/g;
            let match;
            let lastIndex = 0;

            // 1. 提取所有 code unit 并保持中间文本不变
            while ((match = regex.exec(input)) !== null) {
                // 处理匹配项之间的普通文本
                codeUnits.push(input.substring(lastIndex, match.index));
                
                // 将 \uXXXX 转换为 code unit (16位)
                const codeUnit = parseInt(match[1], 16);
                if (!isNaN(codeUnit)) {
                    codeUnits.push(String.fromCharCode(codeUnit));
                }
                
                lastIndex = regex.lastIndex;
            }
            codeUnits.push(input.substring(lastIndex)); // 剩下的尾部文本
            
            // 2. 拼接字符串
            return codeUnits.join(''); 
        } 
        else if (format === 'decimal') {
            // 解码 Decimal Code Points
            const codes = input.split(/\s+/).filter(Boolean); 
            let result = '';
            for (const code of codes) {
                const num = parseInt(code, 10);
                if (!isNaN(num)) {
                    // 使用 String.fromCodePoint 确保辅助平面字符的正确解码
                    try {
                        result += String.fromCodePoint(num);
                    } catch (e) {
                        result += `[INVALID_CODE:${num}]`;
                    }
                }
            }
            return result;
        }
    }

    return "Error: Invalid mode or format selected.";
}