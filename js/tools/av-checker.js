// js/tools/av-checker.js

// AV Process Database (Keeping original names for integrity)
import { avProcesses as curatedAvProcesses } from './av-processes.js';




/**
 * Compares an input task list against a known list of Anti-Virus and security software processes.
 * @param {string} input - The raw text input, expected to be a list of running processes (e.g., from 'tasklist' command).
 * @returns {string} - A plain text list of matching AV processes found.
 */
export function processAVChecker(input) {
    const tasklist = input.trim();
    if (!tasklist) {
        if (window.notify) window.notify('Please input the task list.', 'error');
        return 'Please input the task list.';
    }

    // 正则表达式：查找任何以 .exe 结尾的进程名，捕获 group 1
    // A-Z, a-z, 0-9, _, - 加上 .exe
    const re = /(?:^|[\s\"'])([a-zA-Z0-9_. -]+\.exe)(?=$|[\s\"',])/gi;
    const tasks = [...tasklist.matchAll(re)].map(match => match[1].trim());

    if (!tasks || tasks.length === 0) {
        return 'No .exe process names found in the input. Please ensure you paste the full task list output.';
    }

    let matches = [];
    const lowerCaseAvProcesses = {};

    // 创建一个转换为小写字母的字典用于不区分大小写的查找
    for (const key in curatedAvProcesses) {
        if (Object.prototype.hasOwnProperty.call(curatedAvProcesses, key)) {
            lowerCaseAvProcesses[key.toLowerCase()] = curatedAvProcesses[key];
        }
    }

    // 遍历提取的进程并检查匹配项
    const checkedTasks = new Set();
    for (let i = 0; i < tasks.length; i++) {
        const taskName = tasks[i].toLowerCase();
        
        // 使用 Set 确保同一个进程只检查和列出一次
        if (checkedTasks.has(taskName)) {
            continue;
        }
        checkedTasks.add(taskName);

        if (lowerCaseAvProcesses[taskName]) {
            // 匹配项找到，格式为 "process.exe : AV_Name"
            matches.push(`${taskName} : ${lowerCaseAvProcesses[taskName]}`);
        }
    }

    if (matches.length > 0) {
        // 返回一个简洁的纯文本列表
        return `Found ${matches.length} known security processes:\n\n` + matches.join('\n');
    } else {
        return 'No known security processes found in the input list.';
    }
}
