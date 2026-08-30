// js/app.js - Main Application Logic (ES Module Entry Point)
import { toolCategories } from './tools/definitions.js';

// DOM Elements
const input = document.getElementById('input');
const output = document.getElementById('output');
const richOutput = document.getElementById('rich-output');
const dynamicInput = document.getElementById('dynamic-input-container');
const toolInfo = document.getElementById('tool-info');
const runBtn = document.getElementById('run');
const runLabel = document.getElementById('run-label');
const inputSubtitle = document.getElementById('input-subtitle');
const outputSubtitle = document.getElementById('output-subtitle');
const bidirectionalControls = document.getElementById('bidirectional-controls');
const encodeBtn = document.getElementById('encode-btn');
const decodeBtn = document.getElementById('decode-btn');
const qrCanvas = document.getElementById('qr-canvas');

// State Management
let currentTool = null;
let currentCat = null;
let notificationTimeout = null;

// Ensure QRCode library is loaded (if needed for your other tools)
if (typeof QRCode === "undefined") {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js";
    document.head.appendChild(s);
}

// ----------------------------------------------------
// Utility and Helper Functions (defined locally)
// ----------------------------------------------------

/**
 * Global notification system.
 */
function notify(message, type = 'success') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const div = document.createElement('div');
    div.className = `notification ${type}`;
    div.textContent = message;
    document.body.appendChild(div);

    if (notificationTimeout) clearTimeout(notificationTimeout);
    notificationTimeout = setTimeout(() => {
        div.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => div.remove(), 300);
    }, 3000);
}

/**
 * Applies a visual flash effect to an element.
 */
function flashElement(el) {
    el.style.transition = 'background-color 0.2s, border-color 0.2s';
    el.style.backgroundColor = 'rgba(0, 255, 0, 0.1)'; 
    el.style.borderColor = '#00ff00';
    setTimeout(() => {
        el.style.backgroundColor = ''; 
        el.style.borderColor = ''; 
    }, 200);
}

/**
 * Styles the bidirectional buttons based on active state.
 */
function styleActiveButton(button, isActive) {
    if (isActive) { 
        button.style.border = '1px solid #00ff41';
        button.style.boxShadow = '0 0 5px #00ff41';
        button.style.backgroundColor = button.id === 'encode-btn' ? '#00ff41' : '#003300';
        button.style.color = button.id === 'encode-btn' ? '#000' : '#00ff41';
        button.classList.add('active');
    } else {
        button.style.border = '1px solid transparent';
        button.style.boxShadow = 'none';
        button.style.backgroundColor = button.id === 'encode-btn' ? 'transparent' : '#003300'; 
        button.style.color = button.id === 'encode-btn' ? '#00ff41' : '#00aa33';
        button.classList.remove('active');
    }
}

// ----------------------------------------------------
// CORE LOGIC FUNCTIONS 
// ----------------------------------------------------

/**
 * 获取所有需要隐藏主输入框的动态工具列表。
 * (这些工具只使用 dynamicInput 中的自定义输入字段)
 */
function getCustomInputOnlyTools() {
    return [
        'diffComparator', 
        'unixTimestampDate', 
        'cronParser', 
        'lengthConverter', 
        'hexRgbConverter',
        'passwordGenerator',
        'jsonSchemaValidator',
        'winExpHelper',
        'codeMinifier',
        'unicodeConverter',
        'regexTester', // <--- 已根据您的要求添加
    ];
}


function findToolDefinition(toolId) {
    // 假设 toolCategories 是您 definitions.js 中导出的那个大对象
    for (const categoryId in toolCategories) {
        const tools = toolCategories[categoryId].tools;
        if (tools[toolId]) {
            return tools[toolId];
        }
    }
    return null;
}


/**
 * Activates a specific tool, updating the UI. (Exposed globally)
 */
function activateTool(cat, toolKey) {
    currentCat = cat;
    currentTool = toolKey;

    const tool = toolCategories[cat].tools[toolKey];
    const isBidirectional = (tool.type === 'bidirectional');
    const isDynamic = (tool.type === 'dynamic');
    const customInputOnlyTools = getCustomInputOnlyTools(); // 使用新的专用列表

    // 1. Update Navigation Active State
    document.querySelectorAll('.dropdown-link').forEach(link => link.classList.remove('active'));
    document.querySelector(`.dropdown-link[data-tool-key="${toolKey}"]`)?.classList.add('active');
    document.querySelectorAll('.nav-category').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.nav-category[data-category="${cat}"]`)?.classList.add('active');

    // 2. Reset and Configure Workspace
    output.value = "";
    richOutput.innerHTML = "";
    delete output.dataset.rawValue;
    
    // 重置所有元素到默认/隐藏状态
    input.style.display = 'block'; 
    dynamicInput.style.display = 'none';
    dynamicInput.innerHTML = ''; 
    
    output.style.display = 'none';
    richOutput.style.display = 'none';
    qrCanvas.style.display = 'none';
    bidirectionalControls.style.display = 'none';
    runBtn.style.display = 'block';
    runLabel.style.display = 'block';
    toolInfo.style.display = 'block';
    input.value = "";
    input.placeholder = "Paste your data...";
    input.focus();

    // 3. Update Tool Info Panel
    toolInfo.innerHTML = `<h3>${tool.name}</h3><p>${tool.info}</p>`;
    
    // 4. Handle Tool Types
    if (isBidirectional) {
        // 双向工具
        bidirectionalControls.style.display = 'flex';
        runBtn.style.display = 'none';
        runLabel.style.display = 'none';
        output.style.display = 'block';
        
        styleActiveButton(encodeBtn, true); 
        styleActiveButton(decodeBtn, false);
        encodeBtn.textContent = "Encode ➡"; 
        decodeBtn.textContent = "Decode ⬅";
        
        inputSubtitle.textContent = "Data to Encode";
        outputSubtitle.textContent = "Encoded Output";
    } else if (isDynamic) {
        
        // 1. 判断是否隐藏主输入框
        const hidesMainInput = customInputOnlyTools.includes(toolKey); 
        
        if (hidesMainInput) {
            // 这些工具 (包括 Regex Tester) 只使用 dynamicInput，因此隐藏 input
            input.style.display = 'none';
            inputSubtitle.textContent = tool.name + " Inputs"; 
        } else {
            // 其他工具，如 Regex Tester，需要主输入框来接收文本 (不再适用)
            input.style.display = 'block'; 
            inputSubtitle.textContent = "Data Input & Tool Options";
        }

        // 2. 显示动态容器 ( dynamicInput )
        dynamicInput.style.display = 'flex'; // <--- 确保 dynamicInput 可见
        output.style.display = 'block';
        dynamicInput.innerHTML = ''; // 清空旧内容
        
        // 3. 💥 智能渲染：兼容 tool.renderUI 和 tool.render 两种方法名
        const renderFunc = tool.renderUI || tool.render; // <--- 修正点：兼容命名
        let renderResult;
        
        if (renderFunc) {
            // 默认将 dynamicInput 容器作为参数传入，以支持直接 DOM 操作
            renderResult = renderFunc(dynamicInput); 
        }
        
        if (typeof renderResult === 'string' && renderResult.length > 0) {
            // 如果返回了 HTML 字符串，则赋值给 innerHTML
            dynamicInput.innerHTML = renderResult;
        }
        
        outputSubtitle.textContent = "Results";
    } else {
        // 标准工具
        output.style.display = 'block';
        inputSubtitle.textContent = "Enter your data here";
        outputSubtitle.textContent = "Results will appear here";
    }

    // Special case for Diff Comparator to use rich output
    if (toolKey === 'diffComparator') {
        output.style.display = 'none';
        richOutput.style.display = 'flex';
    }

    // Set initial tool to show if needed
    if (!isDynamic || !customInputOnlyTools.includes(toolKey)) {
        input.value = "";
        input.focus();
    }
}


/**
 * Processes bidirectional tools (Exposed globally)
 */
function processBidirectional(direction) {
    const tool = toolCategories[currentCat].tools[currentTool];
    let sourceEl, targetEl, processor;

    if (direction === 'encode') {
        styleActiveButton(encodeBtn, true);
        styleActiveButton(decodeBtn, false);
        processor = tool.encode;
        sourceEl = input;
        targetEl = output;
        inputSubtitle.textContent = "Data to Encode";
        outputSubtitle.textContent = "Encoded Output";
    } else if (direction === 'decode') {
        styleActiveButton(decodeBtn, true);
        styleActiveButton(encodeBtn, false);
        processor = tool.decode;

        // 优先使用 Output 作为 Source（解码 Encode 的结果）
        if (output.value.trim() !== '') {
            sourceEl = output;
            targetEl = input;
            inputSubtitle.textContent = "Decoded Output"; 
            outputSubtitle.textContent = "Source (Encoded) Text"; 
        } 
        // 否则，如果 Input 有内容，则使用 Input 作为 Source
        else if (input.value.trim() !== '') {
            sourceEl = input;
            targetEl = output;
            inputSubtitle.textContent = "Source (Encoded) Text"; 
            outputSubtitle.textContent = "Decoded Output"; 
        } else {
            notify("Error: Please provide data in either box to proceed.", "error");
            return;
        }
    }

    if (!processor) return notify("Error: Processor missing.", "error");

    flashElement(sourceEl);
    
    const sourceText = sourceEl.value;
    if (!sourceText.trim()) {
        notify(`Please enter text to ${direction}.`, "error");
        return;
    }
    
    targetEl.value = ""; 

    let result;
    try {
        result = processor(sourceText); 
    } catch (e) {
        result = `Error during ${direction}: ${e.message}`;
        notify(`Tool execution failed: ${e.message}`, 'error');
    }
    
    targetEl.value = result;
    flashElement(targetEl);
    
    if (!String(result).includes('Error')) {
        notify(`${direction.charAt(0).toUpperCase() + direction.slice(1)} completed.`);
    }

    encodeBtn.textContent = "Encode ➡"; 
    decodeBtn.textContent = "⬅ Decode";
}

/**
 * Main tool execution function. (Exposed globally)
 */
async function run() {
    if (!currentTool || !currentCat) return notify("Please select a tool first.", "error");

    const tool = toolCategories[currentCat].tools[currentTool];
    if (!tool) return;

    if (tool.type === 'bidirectional') {
        return processBidirectional('encode');
    }
    
    const originalContent = runBtn.innerHTML;
    runBtn.innerHTML = "<span>Running</span><b>…</b>";
    runBtn.setAttribute('aria-busy', 'true');
    runBtn.classList.add('pulsing');
    runBtn.disabled = true;

    output.style.display = 'block'; 
    richOutput.style.display = 'none'; 
    qrCanvas.style.display = 'none';
    output.value = "<Processing... This might take a moment...>";
    delete output.dataset.rawValue; 

    try {
        let result;
        
        // 修正逻辑：处理动态工具的输入参数
        if (tool.type === 'dynamic') {
            
            const customInputOnlyTools = getCustomInputOnlyTools();

            if (customInputOnlyTools.includes(currentTool)) {
                // 这些工具 (包括 Regex Tester) 只使用 dynamicInput 的值，因此不传递参数
                result = await Promise.resolve(tool.process());
            } else {
                // 其他动态工具，例如 Regex Tester：需要传递主输入框的内容 (不再适用)
                const processInput = input.value;
                result = await Promise.resolve(tool.process(processInput));
            }
            
        } else {
            // 标准工具: 接收主输入字符串
            const processInput = input.value;
            result = await Promise.resolve(tool.process(processInput));
        }
        
        if (typeof result === 'string') {
            output.value = result;
            richOutput.innerHTML = "";
        } else if (typeof result === 'object' && result !== null) {
            output.dataset.rawValue = result.raw || "";
            if (result.type === 'html') {
                output.style.display = 'none';
                richOutput.style.display = 'flex';
                richOutput.innerHTML = result.content;
            } else {
                output.value = result.display;
                richOutput.innerHTML = "";
            }
        }
        
        
        // 确保 Diff Comparator 始终使用 richOutput
        output.style.display = currentTool === 'diffComparator' ? 'none' : 'block';
        richOutput.style.display = currentTool === 'diffComparator' ? 'flex' : 'none';

        notify("Tool execution successful.");

    } catch (e) {
        output.value = `Error: ${e.message}`;
        notify(`Tool execution failed: ${e.message}`, 'error');
    } finally {
        runBtn.innerHTML = originalContent;
        runBtn.removeAttribute('aria-busy');
        runBtn.classList.remove('pulsing');
        runBtn.disabled = false;
        flashElement(output.style.display === 'none' ? richOutput : output);
    }
}

/**
 * Utility function to populate the navigation menu.
 */
function buildNavMenu() {
    for (const categoryKey in toolCategories) {
        const category = toolCategories[categoryKey];
        const dropdown = document.getElementById(`dropdown-${categoryKey}`);

        if (dropdown) {
            dropdown.innerHTML = ""; 
            
            for (const toolKey in category.tools) {
                const tool = category.tools[toolKey];
                const link = document.createElement('button');
                link.className = 'dropdown-link';
                link.textContent = tool.name;
                link.dataset.toolKey = toolKey;
                link.onclick = () => window.activateTool(categoryKey, toolKey);
                dropdown.appendChild(link);
            }
        }
    }

    // Auto-select first tool on load (Case Converter for consistency)
    const initialCat = 'text';
    const initialTool = 'caseConverter';
    if (toolCategories[initialCat] && toolCategories[initialCat].tools[initialTool]) {
        window.activateTool(initialCat, initialTool);
    }
}

function setupResponsiveNavigation() {
    const dropdowns = document.querySelectorAll('.nav-category-dropdown');
    dropdowns.forEach(dropdown => {
        const trigger = dropdown.querySelector('.nav-category');
        trigger?.addEventListener('click', event => {
            event.stopPropagation();
            const willOpen = !dropdown.classList.contains('open');
            dropdowns.forEach(item => {
                item.classList.remove('open');
                item.querySelector('.nav-category')?.setAttribute('aria-expanded', 'false');
            });
            dropdown.classList.toggle('open', willOpen);
            trigger.setAttribute('aria-expanded', String(willOpen));
        });
    });
    document.addEventListener('click', () => {
        dropdowns.forEach(item => {
            item.classList.remove('open');
            item.querySelector('.nav-category')?.setAttribute('aria-expanded', 'false');
        });
    });
}


// ----------------------------------------------------
// HELPER ACTIONS (Exposed globally for HTML onclick)
// ----------------------------------------------------

function copyOutput() {
    let text = "";
    if (richOutput.style.display !== "none") {
        text = richOutput.innerText;
    } else if (output.style.display !== "none") {
        text = output.dataset.rawValue || output.value;
    } else {
        return; 
    }

    if (text) {
        navigator.clipboard.writeText(text).then(() => notify("Copied!"));
    }
}

function clearInput() { 
    // 只清除当前可见的输入区域
    if (dynamicInput.style.display !== "none") {
        // 清除动态输入区域的子元素值，数字输入框默认设为 1 
        dynamicInput.querySelectorAll('input, textarea, select').forEach(el => {
            if (el.type === 'number') {
                el.value = '1';
            } else if (el.tagName === 'SELECT') {
                el.selectedIndex = 0; // 重置下拉菜单
            } else {
                el.value = '';
            }
        });
    } 
    if (input.style.display !== 'none') {
        input.value = ""; 
        input.focus(); 
    } 
}

function clearAll() { 
    clearInput();
    output.value = ""; 
    richOutput.innerHTML = "";
    delete output.dataset.rawValue; 
    window.activateTool(currentCat, currentTool); 
}

function selectInput() { 
    // 只选择当前可见的输入区域
    if (input.style.display !== "none") {
        input.select();
    } else {
        const firstInput = dynamicInput.querySelector('input, textarea');
        if (firstInput) firstInput.select();
    }
}

function selectOutput() { 
    if (output.style.display !== "none") {
        output.select(); 
    } else if (richOutput.style.display !== "none") {
        copyOutput(); 
        notify("Selected (Copied rich content)");
    }
}


// ----------------------------------------------------
// EXPOSE FUNCTIONS TO GLOBAL WINDOW SCOPE 
// ----------------------------------------------------
window.activateTool = activateTool;
window.run = run;
window.processBidirectional = processBidirectional;
window.copyOutput = copyOutput;
window.clearInput = clearInput;
window.clearAll = clearAll;
window.selectInput = selectInput;
window.selectOutput = selectOutput;


// ----------------------------------------------------
// EVENT LISTENERS AND INITIALIZATION
// ----------------------------------------------------

// Attach listeners for Bidirectional controls
if (encodeBtn) encodeBtn.onclick = () => window.processBidirectional('encode');
if (decodeBtn) decodeBtn.onclick = () => window.processBidirectional('decode');

// Attach listener for the run button
if (runBtn) runBtn.onclick = () => window.run();

// Bind Ctrl+Enter to RUN 
document.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        window.run();
    }
});

// Attach listener for password generator one-click button
document.addEventListener('click', (e) => {
    if (e.target.id === 'one-click-random') {
        const pwdLen = document.getElementById('pwd-len');
        if (pwdLen) pwdLen.value = '12';
        window.run();
    }
});

// Initial Setup
document.addEventListener('DOMContentLoaded', () => {
    buildNavMenu();
    setupResponsiveNavigation();
});
