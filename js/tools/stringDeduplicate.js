/**
 * Text Deduplication Tool Logic
 */

/**
 * 移除文本中重复的行。
 * @param {string} input - 包含多行的输入文本。
 * @returns {string} - 移除重复行后的文本。
 */
export function processDeduplicateText(input) {
    if (typeof input !== 'string' || !input.trim()) {
        return "";
    }
    
    // 1. 按行分割文本。我们使用正则表达式来处理不同操作系统的换行符 (CRLF, LF)。
    const lines = input.split(/\r?\n/);
    
    // 2. 使用 Set 自动去除重复项，保持插入顺序。
    const uniqueLines = new Set(lines);
    
    // 3. 将唯一的行重新合并成一个字符串，使用默认的换行符 (\n)。
    return Array.from(uniqueLines).join('\n');
}