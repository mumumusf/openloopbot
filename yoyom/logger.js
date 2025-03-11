import chalk from 'chalk';

// 日志级别中文映射
const levelMap = {
    'info': '信息',
    'warn': '警告',
    'error': '错误',
    'success': '成功',
    'debug': '调试'
};

export function logger(message, level = 'info', value = "") {
    const now = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
    const colors = {
        info: chalk.green,
        warn: chalk.yellow,
        error: chalk.red,
        success: chalk.blue,
        debug: chalk.magenta,
    };
    const color = colors[level] || chalk.white;
    const chineseLevel = levelMap[level] || level;
    console.log(color(`[${now}] [${chineseLevel}]: ${message}`), value ? chalk.yellow(value) : '');
}