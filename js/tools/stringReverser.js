/**
 * String Reverser Tool Logic
 */

/**
 * 反转输入字符串。
 * @param {string} input - 需要反转的字符串。
 * @returns {string} - 反转后的字符串。
 */
export function processStringReverser(input) {
    if (typeof input !== 'string' || !input) {
        return "";
    }
    // 将字符串拆分成字符数组，反转顺序，然后重新连接。
    return input.split('').reverse().join('');
}