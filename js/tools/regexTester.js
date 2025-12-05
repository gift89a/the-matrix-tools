// js/tools/regexTester.js - Regular Expression Tester Core Logic

export function renderRegexTesterUI() {
    // UI Layout: Pattern/Flags -> Replace Toggle -> Replacement Text (Conditional) -> Text to Test (BOTTOM)
    return `
        <div class="hack-input-group">
            <span class="hack-label">Regex Pattern / Flags:</span>
            <div style="display: flex; gap: 10px;">
                <input 
                    id="regex-pattern" 
                    class="hack-input" 
                    type="text" 
                    value="^\\w+" 
                    placeholder="Enter regex pattern (e.g. \\d+)" 
                    style="flex-grow: 4;"
                />
                
                <input 
                    id="regex-flags-text" 
                    class="hack-input" 
                    type="text" 
                    value="g" 
                    style="flex-grow: 1; max-width: 80px;"
                />
            </div>
        </div>
        
        <div class="hack-input-group" style="margin-top: 15px;">
            <label style="display: flex; align-items: center; cursor: pointer;">
                <input 
                    id="regex-enable-replace" 
                    type="checkbox" 
                    onchange="document.getElementById('regex-replacement-group').style.display = this.checked ? 'block' : 'none';"
                    style="margin-right: 8px;"
                /> 
                <span class="hack-label" style="margin: 0; font-size: 1em;">Enable Replacement Mode</span>
            </label>
            <p style="font-size: 0.8em; color: #007700; margin-top: 5px;">
                Checking this enables substitution and outputs the replacement result.
            </p>
        </div>

        <div id="regex-replacement-group" style="display: none;">
            <div class="hack-input-group" style="margin-top: 15px;">
                <span class="hack-label">Replacement Text:</span>
                <textarea id="regex-replacement-text" class="hack-input" rows="3" placeholder="Enter replacement string (e.g. $1-REPLACED)"></textarea>
            </div>
        </div>
        
        <label for="regexInputText" class="hack-label" style="margin-top: 15px;">Text to Test:</label>
        <textarea id="regexInputText" class="hack-input" rows="10" placeholder="Paste the text you want to test your regex pattern against." style="min-height:200px; flex: 1;"></textarea>
    `;
}

export function processRegexTester() {
    const pattern = document.getElementById('regex-pattern').value.trim();
    const flags = document.getElementById('regex-flags-text').value.trim();
    const enableReplace = document.getElementById('regex-enable-replace').checked;
    
    // Read data from the dynamic input area
    const inputTextElement = document.getElementById('regexInputText'); 
    const inputText = inputTextElement ? inputTextElement.value : '';
    
    const replacementText = document.getElementById('regex-replacement-text').value;

    if (!pattern) return "Error: Please enter a Regex Pattern.";
    if (!inputText) return "Error: Please paste your data into the 'Text to Test' input area.";
    
    let regex;
    try {
        // Attempt to create RegExp object
        regex = new RegExp(pattern, flags);
    } catch (e) {
        return `Regex Compilation Error: ${e.message}`;
    }

    let output = '';
    
    // --- 1. Replacement Mode (Only if checkbox is checked) ---
    if (enableReplace) {
        if (!replacementText) {
            return "Error: Replacement Mode is enabled, but 'Replacement Text' is empty.";
        }
        
        let resultText = inputText;
        try {
            // Re-create Regex object, ensuring flags are correct for replacement, especially 'g' for global replace
            const replaceRegex = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g'); 
            resultText = inputText.replace(replaceRegex, replacementText);
        } catch(e) {
             return `Replacement Error: ${e.message}`;
        }
        
        output += '--- REPLACEMENT RESULT ---\n';
        output += resultText;
        
        // 返回纯净的替换结果作为 raw content
        return { raw: resultText, display: output };
    }

    // --- 2. Test/Match Mode (If checkbox is NOT checked) ---
    
    let displayRegex = regex;
    if (!flags.includes('g')) {
        // If the user actively removes 'g', we still use a 'g' copy for exec loop to find all matches.
        displayRegex = new RegExp(pattern, flags + 'g'); 
    }

    let match;
    let matchesFound = 0;
    let matchesDetails = [];
    let rawMatches = []; // <-- Collects only the matched strings
    
    // Loop to find all matches
    while ((match = displayRegex.exec(inputText)) !== null) {
        matchesFound++;
        rawMatches.push(match[0]); // <-- Store the raw matched text
        
        let detail = `Match ${matchesFound} (Index: ${match.index}, Length: ${match[0].length}):\n`;
        detail += `  Full Match: "${match[0]}"\n`;
        
        // Include capture groups
        if (match.length > 1) {
            detail += "  Capture Groups:\n";
            for (let i = 1; i < match.length; i++) {
                detail += `    $${i}: "${match[i] || '[Not captured]'}"\n`;
            }
        }
        matchesDetails.push(detail);
    }
    
    if (matchesFound === 0) {
        output += `Test Result: No matches found.`;
    } else {
        output += `Test Result: Found ${matchesFound} matches.\n\n`;
        output += matchesDetails.join('\n');
    }
    
    // 返回一个对象，将纯净的匹配结果作为 raw 属性
    return {
        raw: rawMatches.join('\n'), 
        display: output
    };
}