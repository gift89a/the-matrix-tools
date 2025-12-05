// js/tools/code-minifier.js

/**
 * Executes basic minification based on the specified format.
 * Note: This is a basic implementation suitable for a browser environment
 * and does not replace professional minification tools (like Terser, Clean-CSS).
 * @param {string} code - The input code string.
 * @param {string} format - The code format ('js', 'css', 'html', 'json').
 * @returns {string} The minified code string.
 */
function minifyCode(code, format) {
    let result = code;

    // 1. Remove comments (通用处理)
    // 移除 /*...*/ 块注释 和 //... 单行注释
    result = result.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '').trim();

    switch (format) {
        case 'json':
            try {
                // 最推荐的 JSON 压缩方式：解析后使用 JSON.stringify(obj)
                // 先尝试用严格模式解析并压缩
                const obj = JSON.parse(code.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, ''));
                return JSON.stringify(obj);
            } catch (e) {
                // 如果解析失败（例如输入的是 JS 对象而不是严格 JSON），执行简单剥离
                result = code.replace(/\s*([,:;{}()=+\-*>\[\]|&!])\s*/g, '$1');
                return result.trim();
            }
        
        case 'css':
            // 移除换行符/Tab
            result = result.replace(/[\r\n\t]/g, ''); 
            // 将所有多个空格折叠为一个空格
            result = result.replace(/\s+/g, ' '); 
            // 移除分隔符 (:,;,{}) 周围的空格
            result = result.replace(/ ?([,:;{}]) ?/g, '$1');
            // 移除大括号前的分号
            result = result.replace(/;}/g, '}'); 
            return result.trim();

        case 'html':
            // 移除标签之间的空格（垂直压缩）
            result = result.replace(/>\s+</g, '><'); 
            // 折叠标签内的多个空格为一个空格（水平压缩）
            result = result.replace(/\s+/g, ' '); 
            return result.trim();

        case 'js':
        default:
            // 移除换行符/Tab
            result = result.replace(/[\r\n\t]/g, '');
            // 移除分隔符 (,:;{}()=+-*><[]|&!) 周围的空格 (对JS来说有风险，但执行基本压缩)
            result = result.replace(/ ?([,:;{}()=+\-*>\[\]|&!]) ?/g, '$1');
            // 将所有多个空格折叠为一个空格
            result = result.replace(/\s+/g, ' '); 
            return result.trim();
    }
}

/**
 * Renders the dynamic UI for the Code Minifier.
 * 渲染代码压缩工具的动态 UI 界面。
 */
export function renderCodeMinifierUI() {
    return `
        <div class="control-group">
            <label for="minifierFormat" class="hack-label">Code Type:</label>
            <select id="minifierFormat" class="hack-select">
                <option value="js">JavaScript (.js)</option>
                <option value="css">CSS (.css)</option>
                <option value="html">HTML (.html)</option>
                <option value="json">JSON (.json)</option>
            </select>
        </div>
        <label for="mainInput" class="hack-label" style="margin-top: 1rem;">Code Input:</label>
        <textarea id="mainInput" class="hack-input" rows="10" placeholder="Paste your code here (JS, CSS, HTML, or JSON)." style="min-height:300px; flex: 1;"></textarea>
    `;
}

// js/tools/code-minifier.js (processCodeMinifier 函数)

/**
 * Processes the Code Minifier tool run.
 * @returns {string} The minified code (plain text).
 */
export function processCodeMinifier() { // 💥 移除 input 参数以明确不再使用
    
    const formatElement = document.getElementById('minifierFormat');
    // 如果没有选择框，默认使用 JavaScript 格式
    const format = formatElement ? formatElement.value : 'js';
    
    // 💥 修复点：直接从动态 UI 中渲染的输入框读取数据
    const codeInputElement = document.getElementById('mainInput');
    const inputCode = codeInputElement ? codeInputElement.value : '';
    
    const trimmedInput = inputCode.trim();

    if (!trimmedInput) {
        if (window.notify) {
            window.notify('Please paste the code before running the minifier.', 'error');
        }
        return '';
    }

    const minifiedCode = minifyCode(trimmedInput, format);
    
    // 返回纯文本结果
    return minifiedCode; 
}