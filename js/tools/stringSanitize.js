/**
 * Extracts plain text from input, stripping all HTML tags, control characters,
 * and normalizing whitespace.
 * @param {string} input - The input string, potentially containing messy data.
 * @returns {string} - The cleaned, plain text.
 */
export function processTextSanitizer(input) {
    if (typeof input !== 'string' || !input.trim()) {
        return "";
    }
    
    let cleanText = input;

    // --- 阶段零：HTML 实体解码 (优化版) ---
    
    // 使用更全面的HTML实体解码策略
    const decodeEntities = (text) => {
        // 先处理 &amp;（必须最先处理）
        text = text.replace(/&amp;/gi, '&');
        
        // 解码常见的命名实体
        const entities = {
            '&lt;': '<',
            '&gt;': '>',
            '&quot;': '"',
            '&#39;': "'",
            '&apos;': "'",
            '&nbsp;': ' ',
            '&mdash;': '—',
            '&ndash;': '–',
            '&copy;': '©',
            '&reg;': '®',
            '&hellip;': '…',
            '&bull;': '•'
        };
        
        Object.keys(entities).forEach(entity => {
            const regex = new RegExp(entity, 'gi');
            text = text.replace(regex, entities[entity]);
        });
        
        // 解码数字实体（如 &#65; 或 &#x41;）
        text = text.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));
        text = text.replace(/&#x([0-9a-f]+);/gi, (match, hex) => String.fromCharCode(parseInt(hex, 16)));
        
        return text;
    };
    
    cleanText = decodeEntities(cleanText);

    // --- 第一阶段：内容具有干扰性的标签清理 (清除标签及内部内容) ---

    // 1. 移除脚本、样式等标签及其内容
    cleanText = cleanText.replace(/<(script|style|noscript|svg|math|iframe|frame|frameset|object|embed|applet)[^>]*>[\s\S]*?<\/\1>/gi, '');
    
    // 2. 移除注释
    cleanText = cleanText.replace(/<!--[\s\S]*?-->/g, '');

    // --- 第二阶段：处理可保留内容的标签 ---
    
    // 3. 将块级元素转换为换行（保留文本结构）
    cleanText = cleanText.replace(/<\/?(p|div|h[1-6]|ul|ol|li|blockquote|pre|section|article|header|footer|nav|aside|table|tr|td|th)[^>]*>/gi, '\n');
    
    // 4. 将行内换行元素转换为换行
    cleanText = cleanText.replace(/<br\s*\/?>/gi, '\n');
    
    // 5. 移除所有剩余的HTML标签
    cleanText = cleanText.replace(/<[^>]*>/gi, '');

    // --- 第三阶段：控制字符和不可见字符清理 ---

    // 6. 移除Unicode Zero Width字符和BOM
    cleanText = cleanText.replace(/[\u200B-\u200F\uFEFF\u202A-\u202E\u2060-\u2069]/g, '');

    // 7. 移除非打印ASCII控制字符（保留\t, \n, \r）
    cleanText = cleanText.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    // --- 第四阶段：空格和换行规范化 ---
    
    // 8. 规范化换行符：将所有换行符统一为\n
    cleanText = cleanText.replace(/\r\n|\r/g, '\n');
    
    // 9. 处理缩进和空格：将制表符转换为空格
    cleanText = cleanText.replace(/\t/g, ' ');
    
    // 10. 合并多个空格：将2个及以上空格合并为1个
    cleanText = cleanText.replace(/[ ]{2,}/g, ' ');
    
    // 11. 处理换行周围的空格：移除换行前后的空格
    cleanText = cleanText.replace(/[ ]*\n[ ]*/g, '\n');
    
    // 12. 合并多个连续换行：将3个及以上换行合并为2个
    cleanText = cleanText.replace(/\n{3,}/g, '\n\n');
    
    // 13. 移除首尾空白字符
    cleanText = cleanText.trim();
    
    // 14. 移除每行开头和结尾的空格（可选，根据需求）
    cleanText = cleanText.split('\n')
        .map(line => line.trim())
        .join('\n');

    return cleanText;
}