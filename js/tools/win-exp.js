// js/tools/win-exp.js

let exploitDataCache = null;

// --- 模块加载时预加载数据 (使用原生 fetch) ---
(async function loadData() {
    const dataPath = './js/tools/win-patch-exp-data.json';
    try {
        const response = await fetch(dataPath);
        if (!response.ok) {
            if (window.notify) window.notify('Error loading exploit data.', 'error');
            throw new Error(`Failed to load data: ${response.statusText}`);
        }
        exploitDataCache = await response.json();
        console.log("Win EXP data loaded successfully.");
    } catch (error) {
        console.error("Error loading Win EXP data:", error);
    }
})();
// ---------------------------------------------


// 助手函数：生成单个漏洞列表项的纯文本
function createExpListItem(patchid, exp) {
    // 仅返回 KB ID 和 漏洞名，用换行符分隔
    return `- ${patchid}: ${exp}\n`;
}

// 核心逻辑：比较已安装补丁和已知漏洞
function comparePatches(input) {
    const outputLines = []; // 使用数组存储纯文本行
    
    if (!exploitDataCache) {
        return "Error: Exploit database is still loading or failed to load. Please wait a moment and try again.";
    }

    const patch_info_list = [];
    // 使用正则表达式 /(KB\d+)/ig 提取所有 KB ID
    const restr = /(KB\d+)/ig; 
    let patchmat;
    
    while ((patchmat = restr.exec(input)) !== null) {
        patch_info_list.push(patchmat[1].trim().toUpperCase()); 
    }
    
    // 检查是否提取到了 KB ID
    if (patch_info_list.length === 0) {
        return "Error: No KB patch IDs found in the input text. Please paste the full output of 'wmic qfe get Caption, HotFixID, InstalledOn'.";
    }

    let foundExploitsCount = 0;
    
    for (const winver in exploitDataCache) {
        const expinfo = exploitDataCache[winver];
        let osExploitsText = '';
        let osExploitsHeader = false;

        for (const patchid in expinfo) {
            // 核心逻辑：检查所需的补丁是否在已安装的列表中 **缺失**
            if (patch_info_list.indexOf(patchid) < 0) {
                if (!osExploitsHeader) {
                    // 添加 OS 分组纯文本标题
                    osExploitsText += `\n--- Target OS: ${winver} (Missing Patches) ---\n`;
                    osExploitsHeader = true;
                }
                osExploitsText += createExpListItem(patchid, expinfo[patchid]);
                foundExploitsCount++;
            }
        }
        outputLines.push(osExploitsText);
    }

    const resultsText = outputLines.join('');
    
    if (foundExploitsCount === 0) {
        return "Great! The system seems to be fully patched against the known exploits in the database.";
    } else {
        // 返回警告信息和纯文本列表
        return `[WARNING] Found ${foundExploitsCount} potential vulnerabilities:\n` + resultsText;
    }
}

/**
 * 渲染 Win Exp Helper 的动态 UI。
 */
export function renderWinExpUI() {
    return `
        <p class="tool-info" style="
            margin-top: 1.5rem; 
            padding: 10px; /* 增加内边距 */
            border-left: 3px solid #00ff41; /* 添加强调色边框 */
            background-color: #1e1e1e; /* 略微深色的背景，与主色调区分 */
            font-size: 0.95em; /* 略微缩小字体 */
            line-height: 1.4; /* 改善行高 */
        ">
            **Instructions:** This utility is designed for **defensive** security assessment. It compares your system's installed patches against a database of known kernel exploits. Missing patches listed here indicate potential vulnerabilities that should be immediately addressed by installing the latest updates.
        </p>
        
        <label for="mainInput" class="hack-label" style="margin-top: 1rem;">
            **System Patch List Input:**
        </label>
        
        <textarea id="mainInput" 
                  class="hack-input" 
                  rows="5" 
                  placeholder="Paste the output of 'wmic qfe get Caption, HotFixID, InstalledOn' here." 
                  style="height: 120px; flex-shrink: 0; resize: vertical;"> 
        </textarea>
        <p style="font-size: 0.85em; color: #00aa33; margin-top: 0.5rem;">
            *Use this tool for educational and defensive purposes only.*
        </p>
    `;
}

/**
 * 处理工具运行。
 * 返回一个纯文本字符串。
 */
export function processWinExpHelper() {
    const inputElement = document.getElementById('mainInput');
    const input = inputElement ? inputElement.value.trim() : '';

    if (!input) {
        if (window.notify) {
            window.notify('Please paste the patch list before running the check.', 'error');
        }
        return '';
    }

    // 调用比较逻辑并获取纯文本结果
    const plainTextResult = comparePatches(input); 

    // 【关键】：直接返回纯文本字符串
    return plainTextResult; 
}