// js/tools/length.js - Length Converter Tool Logic

const LENGTH_UNITS = {
    M: { factor: 1, name: "Meter" },
    KM: { factor: 1000, name: "Kilometer" },
    CM: { factor: 0.01, name: "Centimeter" },
    INCH: { factor: 0.0254, name: "Inch" },
    MILE: { factor: 1609.34, name: "Mile" }
};

export function renderLengthConverterUI(container) {
    // ... (renderLengthConverterUI logic from tools.js)
    container.innerHTML = `
        <style>
            .unit-converter-group {
                display: flex;
                flex-direction: column;
                gap: 1rem;
                padding: 1rem 0;
            }
            .unit-selector {
                display: flex;
                gap: 0.5rem;
                align-items: center;
                color: #00ff00;
            }
            .unit-selector label {
                font-size: 0.9rem;
            }
            .unit-selector select {
                background: #111;
                border: 1px solid #00ff00;
                color: #00ff00;
                padding: 0.4rem;
                font-family: monospace;
                border-radius: 4px;
                flex-grow: 1;
                cursor: pointer;
            }
            #unit-value-input {
                padding: 0.8rem;
                font-size: 1.1rem;
            }
        </style>
        <div class="unit-converter-group">
            <span class="hack-label">Value to Convert:</span>
            <input type="number" id="unit-value-input" class="hack-input" placeholder="Enter numerical value (e.g., 100)" value="1" step="any" />
            <div class="unit-selector">
                <label for="unit-from">FROM:</label>
                <select id="unit-from"></select>
            </div>
            <div class="unit-selector">
                <label for="unit-to">TO:</label>
                <select id="unit-to"></select>
            </div>
        </div>
    `;

    const fromSelect = container.querySelector('#unit-from');
    const toSelect = container.querySelector('#unit-to');
    
    Object.entries(LENGTH_UNITS).forEach(([key, unit]) => {
        const option = new Option(`${key} (${unit.name})`, key);
        fromSelect.add(option);
        const option2 = new Option(`${key} (${unit.name})`, key);
        toSelect.add(option2);
    });
    
    fromSelect.value = 'M';
    toSelect.value = 'KM';
}

export function processLengthConversion() {
    // ... (processLengthConversion logic from tools.js)
    const valueStr = document.getElementById('unit-value-input').value;
    const fromUnitKey = document.getElementById('unit-from').value;
    const toUnitKey = document.getElementById('unit-to').value;
    
    const value = parseFloat(valueStr);

    if (isNaN(value) || valueStr.trim() === '') {
        throw new Error("Please enter a valid numerical value.");
    }

    const fromUnit = LENGTH_UNITS[fromUnitKey];
    const toUnit = LENGTH_UNITS[toUnitKey];

    const valueInMeters = value * fromUnit.factor;
    const result = valueInMeters / toUnit.factor;
    
    const formattedResult = result.toLocaleString('en-US', { maximumFractionDigits: 10 });
    const outputText = `${valueStr} ${fromUnitKey} = ${formattedResult} ${toUnitKey}`;

    return {
        raw: formattedResult, 
        display: outputText
    };
}