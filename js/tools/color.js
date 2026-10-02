// js/tools/color.js - HEX ↔ RGB Converter Tool Logic

function hexToRgb(hex) {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    let longHex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });
    
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(longHex);
    if (!result) return null;
    
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    
    return {
        rgb: `rgb(${r}, ${g}, ${b})`,
        rgba: `rgba(${r}, ${g}, ${b}, 1)`,
        r: r, g: g, b: b
    };
}

/**
 * Helper function to synchronize the color picker and text input for live preview.
 * @param {string} hexValue - The HEX code to synchronize (e.g., "#FF00AA").
 */
function updateColorElements(hexValue) {
    const inputEl = document.getElementById('color-hex-input');
    const pickerEl = document.getElementById('color-picker-input');

    // 确保 HEX 格式化为大写并以 # 开头
    const normalizedHex = hexValue.startsWith('#') ? hexValue.toUpperCase() : `#${hexValue}`.toUpperCase();
    
    // 验证
    const rgbData = hexToRgb(normalizedHex);

    if (rgbData) {
        // 只有在有效时才更新所有元素
        if (inputEl) inputEl.value = normalizedHex;
        if (pickerEl) pickerEl.value = normalizedHex.toLowerCase(); // Color picker value must be lowercase
    } else {
        // 保持文本框中的不完整/无效输入
        if (inputEl) inputEl.value = hexValue; 
        // 不更新 picker 的值，因为它不接受无效的 HEX 字符串
    }
}


/**
 * 把当前颜色实时写入 Output 面板（无需点击 RUN）。
 */
function livePreview() {
    const outputEl = document.getElementById('output');
    if (!outputEl) return;
    const result = processColorConversion();
    if (typeof result === 'string') {
        outputEl.value = result;
    } else if (result && typeof result === 'object') {
        outputEl.value = result.display || result.raw || '';
    }
}


export function processColorConversion() {
    // 读取与 Color Picker 同步的文本输入框的值
    const inputEl = document.getElementById('color-hex-input');
    const hex = inputEl.value.trim();
    
    if (!hex) {
        return "Please enter a HEX color code (e.g., #00FFC0).";
    }

    const rgbData = hexToRgb(hex);

    if (!rgbData) {
        return `Error: Invalid HEX format. Try #RRGGBB or #RGB.`;
    }

    // 确保最终状态的输入框和 picker 处于同步状态
    updateColorElements(hex); 
    
    const rawOutput = `${rgbData.rgb}`; 
    const displayOutput = `
Color Preview (In Dynamic Input Area):

-----------------------------------
HEX: ${hex.toUpperCase()}
RGB: ${rgbData.rgb}
RGBA: ${rgbData.rgba}
-----------------------------------

RGB Components:
Red: ${rgbData.r}
Green: ${rgbData.g}
Blue: ${rgbData.b}`;

    return {
        raw: rawOutput,
        display: displayOutput
    };
}

export function renderColorConverterUI(container) {
    const defaultHex = "#00FFC0";

    container.innerHTML = `
        <style>
            .color-converter-group {
                display: flex;
                flex-direction: column;
                gap: 1rem;
                padding: 1rem 0;
            }
            .color-input-line {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            #color-hex-input {
                flex-grow: 1;
                text-transform: uppercase;
                height: 40px;
            }

            #color-picker-input {
                -webkit-appearance: none;
                -moz-appearance: none;
                appearance: none;
                width: 40px;
                height: 40px;
                background-color: transparent;
                border: none;
                padding: 0;
                cursor: pointer;
                border: 1px solid #00ff00;
                border-radius: 4px;
                flex-shrink: 0;
            }
            #color-picker-input::-webkit-color-swatch {
                border-radius: 4px;
                border: none;
                padding: 0;
            }
            #color-picker-input::-moz-color-swatch {
                border-radius: 4px;
                border: none;
                padding: 0;
            }
        </style>
        <div class="color-converter-group">
            <span class="hack-label">Input Color (HEX):</span>
            <div class="color-input-line">
                <input type="color" id="color-picker-input" value="${defaultHex.toLowerCase()}" title="Use Color Picker" />

                <input type="text" id="color-hex-input" class="hack-input" placeholder="#RRGGBB or #RGB (e.g., #00FFC0)" value="${defaultHex}" maxlength="7" />
            </div>
            <p class="hack-hint">Type the HEX code or click the color box to select a color. Click RUN to generate RGB output.</p>
        </div>
    `;

    // ----------------------------------------------------
    // 实时同步逻辑
    // ----------------------------------------------------
    const inputEl = document.getElementById('color-hex-input');
    const pickerEl = document.getElementById('color-picker-input');
    
    // 初始设置
    updateColorElements(defaultHex);

    // 监听文本输入变化 (实时更新 Picker)
    if (inputEl) {
        inputEl.addEventListener('input', (e) => {
            // 💥 修复：移除长度限制，让实时预览更积极地触发 (只有在输入有效HEX时才会实际改变颜色)
            updateColorElements(e.target.value);
            livePreview();
        });
        // 失去焦点时确保格式修正和同步
        inputEl.addEventListener('blur', (e) => {
             updateColorElements(e.target.value);
        });
    }

    // 监听颜色选择器变化 (实时更新 Text Input)
    if (pickerEl) {
        pickerEl.addEventListener('input', (e) => {
            updateColorElements(e.target.value);
            livePreview();
        });
    }
}
