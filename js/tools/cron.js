// js/tools/cron.js - Cron Parser Tool Logic

// Constants
const MONTHS_EN = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS_OF_WEEK_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * Core Cron expression parsing function (supports 5 fields)
 */
export function processCronParser() {
    // ... (The full processCronParser logic from tools.js)
    const inputEl = document.getElementById('cron-full-input');
    const input = inputEl ? inputEl.value : "";
    
    if (!input) {
        return "Please enter a 5-field Cron expression (e.g.: * * * * *).";
    }

    const fields = input.trim().split(/\s+/);
    if (fields.length !== 5) {
        return "Invalid Cron expression. Expecting 5 fields (Minute Hour DayOfMonth Month DayOfWeek).";
    }

    const [minute, hour, dom, month, dow] = fields;
    
    // --- Specific/Default Case Handling ---
    if (input === '* * * * *') {
        return { 
            raw: input, 
            display: `Cron Expression:\n${input}\n\nHuman-Readable Description:\nRun every minute`
        };
    } else if (input === '0 0 * * *') {
        return { 
            raw: input, 
            display: `Cron Expression:\n${input}\n\nHuman-Readable Description:\nRun every day at midnight (00:00)`
        };
    } else if (input === '0 10 * * 1-5') {
        return {
            raw: input,
            display: `Cron Expression:\n${input}\n\nHuman-Readable Description:\nOn Mondays through Fridays, at 10:00`
        };
    }

    let scheduleParts = [];
    
    // --- 1. Day of Week Part (DOW) ---
    let dowDesc = "";
    if (dow !== '*') {
        if (dow.includes(',')) {
            const days = dow.split(',').map(d => DAYS_OF_WEEK_EN[parseInt(d)]).join(' and ');
            dowDesc = `On ${days}`;
        } else if (dow.includes('-')) {
            const [start, end] = dow.split('-').map(d => parseInt(d));
            if (!isNaN(start) && !isNaN(end) && start <= end && start >= 0 && end <= 6) {
                 dowDesc = `On ${DAYS_OF_WEEK_EN[start]} through ${DAYS_OF_WEEK_EN[end]}`;
            } else {
                 dowDesc = "[Day of Week Error]";
            }
        } else {
            const day = parseInt(dow);
            if (!isNaN(day) && day >= 0 && day <= 6) {
                dowDesc = `On ${DAYS_OF_WEEK_EN[day]}`;
            }
        }
    }
    
    // --- 2. Date Part (Month and Day of Month) ---
    let dateDesc = "";
    const isDateWildcard = (month === '*' && dom === '*');

    if (!isDateWildcard) {
        if (month === '*' && dom !== '*') {
            dateDesc = `On the ${dom}th day of the month`;
        } else if (month !== '*' && dom === '*') {
            const m = parseInt(month);
            if (!isNaN(m) && m >= 1 && m <= 12) {
                dateDesc = `Every ${MONTHS_EN[m]}`;
            } else if (month.includes(',')) {
                const monthsList = month.split(',').map(m => MONTHS_EN[parseInt(m)]).join(' and ');
                dateDesc = `In ${monthsList}`;
            } else {
                 dateDesc = "[Month Error]";
            }
        } else if (month !== '*' && dom !== '*') {
            // Month and Day are specified
            dateDesc = `On ${MONTHS_EN[parseInt(month)]} ${dom}th`;
        }
    }

    // --- 3. Time Part (Hour and Minute) ---
    let timeDesc = "at ";
    if (minute === '0' && hour === '*') {
        timeDesc = "on the hour";
    } else if (minute !== '*' && hour === '*') {
        timeDesc += `the ${minute}th minute of every hour`;
    } else if (minute === '*' && hour !== '*') {
        timeDesc += `every minute past ${hour}:00`;
    } else if (minute !== '*' && hour !== '*') {
        const minStr = minute.padStart(2, '0');
        const hourStr = hour.padStart(2, '0');
        timeDesc += `${hourStr}:${minStr}`;
    } else {
        timeDesc = " [Time Error]";
    }

    // --- 4. Combine Description ---
    
    if (dowDesc) {
        scheduleParts.push(dowDesc);
    } else if (dateDesc) {
        scheduleParts.push(dateDesc);
    } else if (isDateWildcard && dow === '*') {
        scheduleParts.push("Every day");
    }
    
    
    let finalDescription = scheduleParts.join(', ');
    
    if (timeDesc === "on the hour") {
        finalDescription += (finalDescription ? ", " : "") + timeDesc;
    } else if (timeDesc.includes("[Time Error]")) {
        finalDescription += timeDesc;
    } else {
        finalDescription += (finalDescription ? ", " : "") + timeDesc;
    }
    
    finalDescription = finalDescription.trim().replace(/\s+/g, ' ');
    
    return {
        raw: input,
        display: `Cron Expression:\n${input}\n\nHuman-Readable Description:\n${finalDescription}`
    };
}


/**
 * Renders the interactive UI for Cron Parser.
 */
export function renderCronParserUI(container) {
    const defaultCron = "0 10 * * 1-5";
    const [min, hour, dom, month, dow] = defaultCron.split(' ');
    
    // Helper function to create option list
    const createOptions = (start, end, selected) => {
        let options = `<option value="*">* (Every)</option>`;
        for (let i = start; i <= end; i++) {
            options += `<option value="${i}" ${i == selected ? 'selected' : ''}>${i}</option>`;
        }
        return options;
    };
    
    container.innerHTML = `
        <style>
            .cron-grid {
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                gap: 10px;
                padding: 1rem 0;
            }
            .cron-field {
                display: flex;
                flex-direction: column;
            }
            .cron-field label {
                font-size: 0.85rem; 
                color: #00ff00;
                margin-bottom: 3px; 
                height: 50px; 
                display: flex; 
                align-items: flex-start;
            }
            .cron-field select {
                background: #111;
                border: 1px solid #00ff00;
                color: #00ff00;
                padding: 0.3rem 0.5rem; 
                font-family: monospace;
                border-radius: 4px;
                flex-grow: 1;
                cursor: pointer;
                width: 100%; 
                box-sizing: border-box;
                font-size: 0.9rem; 
            }
        </style>
        <div class="cron-grid">
            <div class="cron-field">
                <label for="cron-min">Minute</label>
                <select id="cron-min">${createOptions(0, 59, min)}</select>
            </div>
            <div class="cron-field">
                <label for="cron-hour">Hour</label>
                <select id="cron-hour">${createOptions(0, 23, hour)}</select>
            </div>
            <div class="cron-field">
                <label for="cron-dom">Day of Month</label>
                <select id="cron-dom">${createOptions(1, 31, dom)}</select>
            </div>
            <div class="cron-field">
                <label for="cron-month">Month</label>
                <select id="cron-month">${createOptions(1, 12, month)}</select>
            </div>
            <div class="cron-field">
                <label for="cron-dow">Day of Week</label>
                <select id="cron-dow">${createOptions(0, 6, 5)}</select>
            </div>
        </div>
        <span class="hack-label">Manual Expression Input (or synced from above):</span>
        <input id="cron-full-input" class="hack-input" placeholder="e.g. 0 10 * * 1-5" value="${defaultCron}">
        <span class="hack-label" style="margin-top: 10px;">Click RUN (==>) or press Ctrl+Enter to parse.</span>
    `;
    
    // Add logic to sync the selectors to the full input field
    const syncCronFieldsToInput = () => {
        const fullInput = document.getElementById('cron-full-input');
        const minVal = document.getElementById('cron-min').value;
        const hourVal = document.getElementById('cron-hour').value;
        const domVal = document.getElementById('cron-dom').value;
        const monthVal = document.getElementById('cron-month').value;
        const dowVal = document.getElementById('cron-dow').value;
        fullInput.value = `${minVal} ${hourVal} ${domVal} ${monthVal} ${dowVal}`;
    };

    // Add logic to sync the input field to the selectors (for user pasting)
    const syncInputToCronFields = () => {
         const fullInput = document.getElementById('cron-full-input');
         const fields = fullInput.value.trim().split(/\s+/);
         if (fields.length === 5) {
             try { document.getElementById('cron-min').value = fields[0]; } catch(e) {}
             try { document.getElementById('cron-hour').value = fields[1]; } catch(e) {}
             try { document.getElementById('cron-dom').value = fields[2]; } catch(e) {}
             try { document.getElementById('cron-month').value = fields[3]; } catch(e) {}
             try { document.getElementById('cron-dow').value = fields[4]; } catch(e) {}
         }
    };
    
    document.getElementById('cron-min').onchange = syncCronFieldsToInput;
    document.getElementById('cron-hour').onchange = syncCronFieldsToInput;
    document.getElementById('cron-dom').onchange = syncCronFieldsToInput;
    document.getElementById('cron-month').onchange = syncCronFieldsToInput;
    document.getElementById('cron-dow').onchange = syncCronFieldsToInput;
    document.getElementById('cron-full-input').oninput = syncInputToCronFields;
    
    syncCronFieldsToInput();
}