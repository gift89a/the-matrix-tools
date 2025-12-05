// js/tools/definitions.js - Central Tool Registry (ES Module)

// 导入通用工具
import { base64Encode, base64Decode, sha256, md5 } from '../utils.js';
// 导入模块化工具逻辑
import { processCronParser, renderCronParserUI } from './cron.js';
import { processLengthConversion, renderLengthConverterUI } from './length.js';
import { processColorConversion, renderColorConverterUI } from './color.js';
import { processStringReverser } from './stringReverser.js'; 
import { processDeduplicateText } from './stringDeduplicate.js';
import { processTextSanitizer } from './stringSanitize.js';
import { renderUnicodeUI, processUnicodeConversion } from './unicode.js';
// 💥 确保导入了 hex.js
import { strToHex, hexToStr } from './hex.js'; 

import { renderRegexTesterUI, processRegexTester } from './regexTester.js';

import { renderWinExpUI, processWinExpHelper } from './win-exp.js';

import { processAVChecker } from './av-checker.js'; // <-- 新增这行

import { renderCodeMinifierUI, processCodeMinifier } from './code-minifier.js'; // <-- 新增这行

// =========================================================================
// 1. TOOL PROCESS AND RENDER FUNCTIONS (封装核心逻辑)
// =========================================================================

// --- Diff Comparator Logic ---
function processDiffComparator() {
    const t1El = document.getElementById('diff-1');
    const t2El = document.getElementById('diff-2');
    if (!t1El || !t2El) {
        return "Tool UI not active. Please re-select the Diff Comparator tool.";
    }
    const t1 = t1El.value || "";
    const t2 = t2El.value || "";
    if (!t1 && !t2) return "Please paste text into both input fields.";
    
    // Simple line-by-line diff (visualization handled by result type 'html')
    const lines1 = t1.split('\n');
    const lines2 = t2.split('\n');
    // 💥 修正：重新使用 CSS Class 'rich-output-container'
    let html = '<div class="rich-output-container">'; 
    const max = Math.max(lines1.length, lines2.length);
    let changes = 0;

    for(let i=0; i<max; i++) {
       const l1 = lines1[i];
       const l2 = lines2[i];
       const num = i + 1;
       if (l1 === l2) {
           html += `<div class="diff-line diff-equal"><span class="diff-num">${num}</span><span class="diff-content">${l1 || ''}</span></div>`;
       } else {
           changes++;
           if (l1 !== undefined) {
              html += `<div class="diff-line diff-removed"><span class="diff-num"></span><span class="diff-content">- ${l1}</span></div>`;
           }
           if (l2 !== undefined) {
              html += `<div class="diff-line diff-added"><span class="diff-num">${num}</span><span class="diff-content">+ ${l2}</span></div>`;
           }
       }
    }
    html += '</div>';
    if(changes === 0 && t1 && t2) html = `<div style="padding:1rem; color:#00ff41;">Texts are identical.</div>` + html;
    return { type: 'html', content: html };
}

// --- Diff Comparator Render (应用您想要的简洁样式) ---
function renderDiffComparatorUI() {
    return `
        <div class="hack-input-group">
            <span class="hack-label">Text 1 (Original Text):</span>
            <textarea id="diff-1" class="hack-input" rows="7" placeholder="Paste original text..."></textarea>
        </div>
        <div class="hack-input-group" style="margin-top: 1.5rem;">
            <span class="hack-label">Text 2 (Modified Text):</span>
            <textarea id="diff-2" class="hack-input" rows="7" placeholder="Paste modified text..."></textarea>
        </div>
    `;
}


// --- Unix Timestamp ↔ Date Logic (已清理) ---
function renderTimestampConverterUI() {
    return `
        <div>
            <span class="hack-label">Conversion Mode:</span>
            <select id="ts-mode" class="hack-select" onchange="
                document.getElementById('ts-input').placeholder = this.value === 'ts2date' ? 'Enter timestamp (e.g. 1678888888)' : 'Enter date string';
                document.getElementById('ts-input').value = '';
            ">
                <option value="ts2date">Unix Timestamp ➡ Date String</option>
                <option value="date2ts">Date String ➡ Unix Timestamp</option>
            </select>
        </div>
        
        <div style="margin-top:10px;">
            <span class="hack-label">Input Value:</span>
            <input id="ts-input" class="hack-input" type="text" placeholder="Enter timestamp (e.g. 1678888888)">
        </div>

        <div style="margin-top:10px; border-top:1px dashed #003300; padding-top:10px;">
            <span class="hack-label">Or use Date Picker (Helper):</span>
            
            <input id="ts-picker" class="hack-input" type="datetime-local" lang="en-US" step="1" oninput="
                const val = this.value;
                if(val) {
                    const mode = document.getElementById('ts-mode').value;
                    const input = document.getElementById('ts-input');
                    const d = new Date(val);
                    if(mode === 'date2ts') {
                        // 如果模式是 日期转时间戳，直接填入日期字符串
                        input.value = val.replace('T', ' ');
                    } else {
                        // 如果模式是 时间戳转日期，填入时间戳
                        input.value = Math.floor(d.getTime() / 1000);
                    }
                }
            ">
        </div>
    `;
}

function processTimestampConverter() {
    const mode = document.getElementById('ts-mode').value;
    const val = document.getElementById('ts-input').value.trim();
    
    if(!val) return "Please enter a value or use the date picker.";

    try {
        if (mode === 'ts2date') {
            // 时间戳 -> 日期
            if (/^\d+$/.test(val)) { 
                let ts = parseInt(val);
                // 简单的自动判断毫秒/秒
                if (val.length <= 10) ts *= 1000; 
                const d = new Date(ts);
                // 强制使用英文 (US) 格式显示结果
                return `UTC:   ${d.toUTCString()}\nLocal: ${d.toString()}\nISO:   ${d.toISOString()}`;
            }
            return "Invalid timestamp format. Must be a pure number.";
        } else {
            // 日期 -> 时间戳
            const d = new Date(val);
            if(isNaN(d.getTime())) return "Invalid Date format.";
            return `Unix Timestamp (Seconds): ${Math.floor(d.getTime()/1000)}\nUnix Timestamp (Millis):  ${d.getTime()}`;
        }
    } catch(e) { return "Processing Error: " + e.message; }
}
// --- End Unix Timestamp ↔ Date Logic ---


// --- Password Generator Logic ---
function renderPasswordGeneratorUI() {
    return `
        <div class="hack-input-group">
            <span class="hack-label">Total Length:</span>
            <input id="pwd-len" class="hack-input" type="number" value="12" min="6" max="128">
        </div>
        <div class="hack-input-group">
            <span class="hack-label">Options:</span>
            <label><input id="pwd-upper" type="checkbox" checked> Include Uppercase (A-Z)</label>
            <label><input id="pwd-lower" type="checkbox" checked> Include Lowercase (a-z)</label>
            <label><input id="pwd-number" type="checkbox" checked> Include Numbers (0-9)</label>
            <label><input id="pwd-special" type="checkbox" checked> Include Special Chars (!@#$)</label>
        </div>
        <div class="hack-input-group">
            <button class="hack-select" id="one-click-random" style="background:#004400; border-color:#00ff00; cursor:pointer;">One-Click Random 12 Chars</button>
        </div>
    `;
}

function processPasswordGenerator() {
    const length = parseInt(document.getElementById('pwd-len').value) || 12;
    const useUpper = document.getElementById('pwd-upper').checked;
    const useLower = document.getElementById('pwd-lower').checked;
    const useNumber = document.getElementById('pwd-number').checked;
    const useSpecial = document.getElementById('pwd-special').checked;
    
    if (length < 6 || length > 128) return "Error: Password length must be between 6 and 128 characters.";

    const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const LOWER = 'abcdefghijklmnopqrstuvwxyz';
    const NUMBER = '0123456789';
    const SPECIAL = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let chars = '';
    let mustInclude = [];

    if (useUpper) { chars += UPPER; mustInclude.push(UPPER.charAt(Math.floor(Math.random() * UPPER.length))); }
    if (useLower) { chars += LOWER; mustInclude.push(LOWER.charAt(Math.floor(Math.random() * LOWER.length))); }
    if (useNumber) { chars += NUMBER; mustInclude.push(NUMBER.charAt(Math.floor(Math.random() * NUMBER.length))); }
    if (useSpecial) { chars += SPECIAL; mustInclude.push(SPECIAL.charAt(Math.floor(Math.random() * SPECIAL.length))); }

    if (chars.length === 0) return "Error: Please select at least one character type.";
    
    let password = mustInclude.join('');
    const remainingLength = length - mustInclude.length;
    for (let i = 0; i < remainingLength; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    return { raw: password, display: `Generated Password (${length} chars):\n${password}` };
}

function processLoremIpsum(input) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const count = parseInt(input) || 3;
            const paragraph = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";
            const actualCount = Math.min(count, 100); 
            const result = Array(actualCount).fill(paragraph).join('\n\n');
            resolve({ raw: result, display: `Lorem Ipsum Text (${actualCount} paragraphs):\n\n${result}` });
        }, 500);
    });
}


// =========================================================================
// 2. TOOL DEFINITIONS (Exported)
// =========================================================================

export const toolCategories = {
    text: {
        name: "Text Tools",
        tools: {
            diffComparator: {
                name: "Diff Comparator",
                info: "Compare two text blocks line by line (Optimized UI)",
                type: 'dynamic', 
                renderUI: renderDiffComparatorUI,
                process: processDiffComparator
            },
            caseConverter: {
                name: "Case Converter",
                info: "Upper/Lower/Title/Camel Case conversion",
                process: (input) => {
                    if (!input) return "Please enter text";
                    const titleCase = input.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                    return `Uppercase: ${input.toUpperCase()}\nLowercase: ${input.toLowerCase()}\nTitle Case: ${titleCase}`;
                }
            },
            textCounter: {
                name: "Text Counter",
                info: "Word, character, and line count",
                process: (input) => { 
                    if (!input) return "Please enter text";
                    const chars = input.length;
                    const words = input.trim().split(/\s+/).filter(w => w.length > 0).length;
                    const lines = input.split('\n').length;
                    return `Characters: ${chars}\nWords: ${words}\nLines: ${lines}`;
                }
            },
            stringReverser: {
                name: 'String Reverser',
                info: 'Quickly reverses the order of characters in a string.',
                type: 'one-way', 
                process: processStringReverser, 
            },
            deduplicateText: {
                name: 'Deduplicate Lines',
                info: 'Removes duplicate lines from the input text, preserving the first occurrence. **WARNING: All content entered on a single line will be invalid for deduplication. Please ensure one item per line.**',
                type: 'one-way', 
                process: processDeduplicateText, 
            },
            textSanitizer: {
                name: 'Text Sanitizer (HTML Strip)',
                info: 'Extracts plain text content by stripping all HTML/XML tags (e.g., <br>, <div>) and normalizing whitespace. Useful for cleaning messy data.', 
                type: 'one-way', 
                process: processTextSanitizer, 
            },
        }
    },
    
    time: {
        name: "Time & Date",
        tools: {
            unixTimestampDate: {
                name: "Unix Timestamp ↔ Date",
                info: "Bidirectional conversion with Date Picker.",
                type: 'dynamic',
                // 引用已清理的独立函数
                renderUI: renderTimestampConverterUI, 
                process: processTimestampConverter
            },
            cronParser: {
                name: "Cron Parser",
                info: "Parse Cron Expression to human readable text with interactive builders.",
                type: 'dynamic', 
                renderUI: (container) => {
                    renderCronParserUI(container); 
                    return ""; 
                },
                process: processCronParser      
            }
        }
    },
    
    security: {
        name: "Security",
        tools: {
            passwordGenerator: {
                name: "Password Generator",
                info: "Generate a strong random password with custom length and content.",
                type: 'dynamic', 
                renderUI: renderPasswordGeneratorUI, 
                process: processPasswordGenerator
            },
            winExpHelper: {
                name: "Win-exploit-check",
                // 描述该工具的功能
                info: "Compares installed Windows patches (KB IDs) against known kernel exploits to identify potential privilege escalation vulnerabilities.",
                type: 'dynamic', // 标记为动态UI类型
                renderUI: renderWinExpUI, 
                process: processWinExpHelper
            },
            avChecker: {
                name: "AV Process Checker",
                info: "Compares a list of running processes (e.g., from 'tasklist') against a database of known Anti-Virus and security software process names.",
                type: "standard", 
                process: processAVChecker 
            },
            
        }
    },
    
    encoding: {
        name: "Encoding",
        tools: {
            urlEncoder: {
                name: "URL Encoder/Decoder",
                info: "Percent-encode and decode URL strings",
                type: 'bidirectional',
                encode: (input) => input ? encodeURIComponent(input) : "",
                decode: (input) => {
                    if (!input) return "";
                    try { return decodeURIComponent(input); } catch(e) { return `Decoding Error: ${e.message}`; }
                },
                process: function(input) { return this.encode(input); }
            },
            base64: {
                name: "Base64 Encode/Decode",
                info: "Convert text to Base64 and vice-versa.",
                type: 'bidirectional',
                encode: (input) => input ? base64Encode(input) : "",
                decode: (input) => input ? base64Decode(input) : "",
                process: function(input) { return this.encode(input); } 
            },
            // 💥 确保新工具注册正确
            strToHexConverter: { 
                name: "String ↔ Hex",
                info: "Convert text to hexadecimal string and vice-versa.",
                type: 'bidirectional',
                encode: strToHex, 
                decode: hexToStr, 
                process: function(input) { return this.encode(input); }
            },
            unicodeConverter: {
                name: 'Unicode Converter',
                info: 'Convert between plain text and Unicode escape sequences (\\uXXXX) or Decimal Code Points.',
                type: 'dynamic', 
                renderUI: renderUnicodeUI, 
                process: processUnicodeConversion, 
            },
            sha256: {
                name: "SHA-256 Hash",
                info: "Generate SHA-256 hash",
                process: (input) => { 
                    if (!input) return "Please enter text";
                    const hash = sha256(input); 
                    return { raw: hash, display: `SHA-256 Hash of ${input.length} chars:\n${hash}` }; 
                }
            },
            md5Hash: {
                name: "MD5 Hash",
                info: "Generate MD5 hash",
                process: (input) => { 
                    if (!input) return "Please enter text";
                    // 假设 md5 函数已从 ../utils.js 导入
                    const hash = md5(input); 
                    return { raw: hash, display: `MD5 Hash of ${input.length} chars:\n${hash}` }; 
                }
            }
        }
    },

    unit: {
        name: "Unit",
        tools: {
            lengthConverter: {
                name: "Length Converter",
                info: "Convert between CM, INCH, M, KM, MILE using interactive selectors.",
                type: "dynamic",
                renderUI: (container) => {
                    renderLengthConverterUI(container);
                    return "";
                },
                process: processLengthConversion  
            }
        }
    },

    dev: {
        name: "Dev",
        tools: {
            regexTester: {
                name: "Regex Tester",
                info: "Test, validate, and replace text using Regular Expressions.",
                type: 'dynamic',
                renderUI: renderRegexTesterUI,
                process: processRegexTester 
            },
            uuidGenerator: {
                name: "UUID Generator",
                info: "Generate UUIDs (v4)",
                process: () => {
                    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                        const r = Math.random() * 16 | 0;
                        const v = c === 'x' ? r : (r & 0x3 | 0x8);
                        return v.toString(16);
                    });
                    return { raw: uuid, display: `Generated UUID v4:\n${uuid}` };
                }
            },
            jsonFormatter: {
                name: "JSON Formatter",
                info: "Format, beautify, validate JSON",
                process: (input) => { 
                    if (!input.trim()) return "Please enter JSON";
                    try { return JSON.stringify(JSON.parse(input), null, 2); } 
                    catch (e) { return `Invalid JSON\nError: ${e.message}`; }
                }
            },
            htmlEntities: {
                name: "HTML Entities",
                info: "Encode/Decode HTML special characters",
                type: 'bidirectional',
                encode: (input) => {
                    const tempDiv = document.createElement('div');
                    tempDiv.textContent = input;
                    return tempDiv.innerHTML;
                },
                decode: (input) => {
                    return new DOMParser().parseFromString(input, 'text/html').documentElement.textContent;
                },
                process: function(input) { return this.encode(input); }
            },
            hexRgbConverter: {
                name: "HEX ↔ RGB Converter",
                info: "Convert between HEX and RGB/RGBA with visual preview.",
                type: 'dynamic', 
                renderUI: (container) => {
                    renderColorConverterUI(container);
                    return "";
                },
                process: processColorConversion 
            },
            codeMinifier: {
                name: "Code Minifier",
                info: "Performs basic minification (strips comments and excessive whitespace) for JavaScript, CSS, HTML, and JSON.",
                type: "dynamic", 
                render: renderCodeMinifierUI, // 用于渲染选择框和输入框
                process: processCodeMinifier // 用于处理压缩逻辑
            },
        }
    },

    life: {
        name: "Life",
        tools: {
            loremIpsum: {
                name: "Lorem Ipsum Generator",
                info: "Generate placeholder text",
                process: processLoremIpsum
            }
        }
    }
};