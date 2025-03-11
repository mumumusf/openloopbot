/**
 * OpenLoop 主程序
 * @author 小林
 * @description 处理带宽共享和任务完成的主要逻辑
 */

// 设置中文警告信息
process.emitWarning = ((emitWarning) => {
    return (warning, type, code, ...args) => {
        if (code === 'DEP0040') {
            // 替换为中文警告
            warning = '`punycode` 模块已弃用。请使用第三方模块替代。';
        }
        return emitWarning.call(process, warning, type, code, ...args);
    };
})(process.emitWarning);

// 设置中文提示信息
process.env.NODE_HELP = `使用 'node --trace-deprecation ...' 来显示警告信息的来源位置`;

import fetch from 'node-fetch';
import fs from 'fs';
import chalk from 'chalk';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { banner, displayBanner } from './yoyom/banner.js';
import { logger } from './yoyom/logger.js';
import readline from 'readline';

// 定义正确的密码
const CORRECT_PASSWORD = 'yoyomyoyoa';
const PASSWORD_INFO = '请加入 @https://t.me/YOYOZKS 获取密码';

// 验证密码函数
const verifyPassword = async () => {
    console.clear();
    // 先显示banner
    displayBanner();
    console.log('');  // 空行
    console.log(chalk.cyan('=== 程序启动验证 ==='));
    console.log(chalk.gray('请输入密码继续：'));
    
    const password = await askQuestion('密码: ');
    
    if (password !== CORRECT_PASSWORD) {
        console.log(chalk.red('❌ 密码错误！程序将退出...'));
        process.exit(1);
    }
    
    console.log(chalk.green('✅ 密码验证成功！'));
    console.log(chalk.gray('程序启动中...\n'));
    await new Promise(resolve => setTimeout(resolve, 1000));
};

// 创建命令行交互界面
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// 封装问题询问函数
const askQuestion = (query) => {
    return new Promise((resolve) => rl.question(query, resolve));
};

// 生成随机质量分数 (60-99)
const getRandomQuality = () => {
    return Math.floor(Math.random() * (99 - 60 + 1)) + 60;
};

// 解析代理字符串
const parseProxyString = (proxyStr) => {
    // 移除所有空格
    proxyStr = proxyStr.trim();

    // 如果已经是http://格式，直接返回
    if (proxyStr.startsWith('http://') || proxyStr.startsWith('https://')) {
        return proxyStr;
    }

    // 处理host:port:username:password格式
    const parts = proxyStr.split(':');
    if (parts.length === 4) {
        const [host, port, username, password] = parts;
        return `http://${username}:${password}@${host}:${port}`;
    }

    throw new Error('无效的代理格式');
};

// 用户登录获取token
const loginUser = async (email, password, proxy) => {
    const proxyAgent = new HttpsProxyAgent(proxy);
    const maxLoginRetries = 3;
    let loginAttempt = 0;
    let isLocked = false;
    const accountId = `[${email.substring(0, 6)}...]`; // 创建账号标识符

    while (loginAttempt < maxLoginRetries) {
        try {
            // 如果账号被锁定，等待1分钟
            if (isLocked) {
                logger(`${accountId} 🔒 账号被锁定，等待 1 分钟后重试...`, 'warn');
                await new Promise(resolve => setTimeout(resolve, 60 * 1000));
                isLocked = false;
                loginAttempt = 0;  // 重置尝试次数
                continue;
            }

            const loginPayload = { username: email, password };
            logger(`${accountId} 🔄 尝试登录...`, 'info');
            
            const loginResponse = await fetch('https://api.openloop.so/users/login', {
                method: 'POST',
                headers: {
                    'authority': 'api.openloop.so',
                    'accept': 'application/json',
                    'accept-encoding': 'identity',  // 不使用任何压缩
                    'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
                    'content-type': 'application/json',
                    'origin': 'https://openloop.so',
                    'referer': 'https://openloop.so/',
                    'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Microsoft Edge";v="134"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"Windows"',
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'same-site',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0'
                },
                body: JSON.stringify(loginPayload),
                agent: proxyAgent,
                timeout: 15000
            });

            // 先检查状态码
            if (loginResponse.status === 400) {
                const text = await loginResponse.text();
                try {
                    const data = JSON.parse(text);
                    if (data.message === 'locked') {
                        isLocked = true;
                        throw new Error('账号已锁定');
                    }
                } catch (e) {
                    if (text.includes('locked')) {
                        isLocked = true;
                        throw new Error('账号已锁定');
                    }
                    throw new Error(`登录失败: ${text}`);
                }
            }

            if (!loginResponse.ok) {
                throw new Error(`登录失败! 状态码: ${loginResponse.status}`);
            }

            let responseText;
            try {
                responseText = await loginResponse.text();
                if (!responseText) {
                    throw new Error('空响应');
                }

                const loginData = JSON.parse(responseText);
                if (!loginData?.data?.accessToken) {
                    throw new Error('登录响应中没有token');
                }

                const accessToken = loginData.data.accessToken;
                logger(`${accountId} ✅ 登录成功`, 'success');
                return accessToken;

            } catch (error) {
                logger(`${accountId} ⚠️ 响应处理失败: ${error.message}`, 'warn');
                if (responseText) {
                    logger(`${accountId} 调试信息: ${responseText.slice(0, 100)}...`, 'debug');
                }
                throw error;
            }

        } catch (error) {
            if (error.message === '账号已锁定') {
                continue;  // 直接进入下一次循环，会触发等待
            }

            loginAttempt++;
            
            if (error.name === 'AbortError' || error.code === 'ETIMEDOUT') {
                logger(`${accountId} ⚠️ 登录请求超时，等待重试...`, 'warn');
            } else {
                logger(`${accountId} ⚠️ 登录失败: ${error.message}`, 'warn');
            }

            if (loginAttempt >= maxLoginRetries) {
                if (isLocked) {
                    logger(`${accountId} 🔒 账号已被锁定，建议等待一段时间后再试`, 'error');
                    return null;
                }
                logger(`${accountId} ❌ 登录失败 ${maxLoginRetries} 次，等待 60 秒后继续...`, 'error');
                await new Promise(resolve => setTimeout(resolve, 60000));
                loginAttempt = 0;
            } else {
                const waitTime = Math.min(loginAttempt * 10000, 30000);  // 10-30秒
                logger(`${accountId} ⏳ 第 ${loginAttempt}/${maxLoginRetries} 次失败，等待 ${waitTime/1000} 秒后重试...`, 'warn');
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
    }
    return null;
};

// 带宽共享函数
const shareBandwidth = async (token, proxy, email) => {
    const quality = getRandomQuality();
    const proxyAgent = new HttpsProxyAgent(proxy);
    const maxRetries = 3; // 减少重试次数
    let attempt = 0;
    const accountId = `[${email.substring(0, 6)}...]`; // 创建账号标识符

    const deviceInfo = {
        cpuCores: Math.floor(Math.random() * 4) + 4,
        memoryGB: Math.floor(Math.random() * 8) + 8,
        networkSpeed: Math.floor(Math.random() * 50) + 50,
        deviceId: `WIN-${Math.random().toString(36).substr(2, 9)}`.toUpperCase(),
        osVersion: 'Windows 10 专业版',
        clientVersion: '1.0.0'
    };

    while (attempt < maxRetries) {
        try {
            // 增加随机延迟 3-5 秒
            const delay = 3000 + Math.floor(Math.random() * 2000);
            if (attempt > 0) {
                logger(`${accountId} 第 ${attempt + 1} 次尝试，等待 ${delay/1000} 秒...`, 'info');
            }
            await new Promise(resolve => setTimeout(resolve, delay));

            logger(`${accountId} 尝试带宽共享...`, 'info');
            const response = await fetch('https://api.openloop.so/bandwidth/share', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0',
                    'Accept': '*/*',
                    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Cache-Control': 'no-cache',
                    'X-Device-ID': deviceInfo.deviceId,
                    'X-Client-Version': deviceInfo.clientVersion,
                    'Connection': 'keep-alive'
                },
                body: JSON.stringify({ 
                    quality,
                    timestamp: Date.now(),
                    version: deviceInfo.clientVersion,
                    client: 'windows',
                    deviceInfo: {
                        ...deviceInfo,
                        networkType: 'wifi',
                        networkQuality: quality,
                        networkLatency: Math.floor(Math.random() * 50) + 10
                    }
                }),
                agent: proxyAgent,
                timeout: 15000
            });

            let responseText;
            try {
                responseText = await response.text();
                let data;
                try {
                    data = JSON.parse(responseText);
                } catch (e) {
                    logger(`${accountId} 响应解析失败，将在 ${delay/1000} 秒后重试`, 'warn');
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }

                if (!response.ok) {
                    if (response.status === 401) {
                        throw new Error('令牌已过期');
                    }
                    throw new Error(`请求失败(${response.status})`);
                }

                if (data && data.data && data.data.balances) {
                    const balance = data.data.balances.POINT;
                    logger(
                        `${accountId} ✅ 得分: ${chalk.yellow(quality)} | 收益: ${chalk.yellow(balance)}`,
                        'success'
                    );
                    // 成功后等待 5-8 秒
                    const waitTime = 5000 + Math.floor(Math.random() * 3000);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                }
            } catch (error) {
                if (error.name === 'AbortError' || error.code === 'ETIMEDOUT') {
                    logger(`${accountId} 请求超时，将在 ${delay/1000} 秒后重试`, 'warn');
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }
                throw error;
            }
            return;
        } catch (error) {
            attempt++;
            if (error.message === '令牌已过期') {
                logger(`${accountId} Token已过期，需要重新登录`, 'warn');
                return '令牌已过期';
            }
            
            if (attempt >= maxRetries) {
                logger(`${accountId} ❌ 达到最大重试次数`, 'error');
                // 最后一次失败后等待较长时间
                await new Promise(resolve => setTimeout(resolve, 10000));
            } else {
                const waitTime = Math.min(Math.pow(2, attempt) * 2000, 10000);
                logger(`${accountId} 第 ${attempt}/${maxRetries} 次失败: ${error.message}，等待 ${waitTime/1000} 秒`, 'warn');
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
    }
};

// 检查可用任务
const checkMissions = async (token, proxy, email) => {
    try {
        const proxyAgent = new HttpsProxyAgent(proxy);

        const response = await fetch('https://api.openloop.so/missions', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            agent: proxyAgent,
        });

        if (response.status === 401) {
            logger(`账号 ${email} Token过期`, 'warn');
            return '令牌已过期';
        }

        if (!response.ok) {
            throw new Error(`获取任务失败! 状态: ${response.status}`);
        }

        const data = await response.json();
        return data.data;

    } catch (error) {
        logger(`账号 ${email} 获取任务出错:`, 'error', error.message);
        return null;
    }
};

// 完成任务函数
const doMissions = async (missionId, token, proxy, email) => {
    try {
        const proxyAgent = new HttpsProxyAgent(proxy);

        const response = await fetch(`https://api.openloop.so/missions/${missionId}/complete`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            agent: proxyAgent,
        });

        if (!response.ok) {
            throw new Error(`完成任务失败! 状态: ${response.status}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        logger(`账号 ${email} 完成任务出错:`, 'error', error.message);
        return null;
    }
};

// 处理单个账号
const processAccount = async (account, proxy) => {
    let token = null;
    let isLocked = false;
    let tokenExpireTime = 0; // 添加token过期时间记录
    const accountId = `[${account.email.substring(0, 6)}...]`; // 创建账号标识符
    
    logger(`🚀 开始处理账号: ${account.email}`, 'info');
    
    while (true) {
        try {
            // 如果账号被锁定，等待1分钟
            if (isLocked) {
                logger(`${accountId} 🔒 账号被锁定，等待 1 分钟后重试...`, 'warn');
                await new Promise(resolve => setTimeout(resolve, 60 * 1000));
                isLocked = false;
                token = null; // 锁定后清除token
            }

            // 检查token是否存在且未过期
            const currentTime = Date.now();
            if (!token || currentTime >= tokenExpireTime) {
                // 需要登录获取新token
                logger(`${accountId} 🔄 需要获取新token，尝试登录...`, 'info');
                token = await loginUser(account.email, account.password, proxy);
                if (!token) {
                    // 如果登录返回null且账号被锁定，继续等待
                    if (isLocked) {
                        continue;
                    }
                    // 其他情况下等待15秒后重试
                    logger(`${accountId} ⚠️ 登录失败，等待 15 秒后重试...`, 'warn');
                    await new Promise(resolve => setTimeout(resolve, 15000));
                    continue;
                }
                // 设置token过期时间为23小时后（保守估计，实际可能更长）
                tokenExpireTime = currentTime + 23 * 60 * 60 * 1000;
                logger(`${accountId} ✅ 获取新token成功，有效期约23小时`, 'success');
            } else {
                logger(`${accountId} 🔑 使用现有token，剩余有效时间: ${Math.round((tokenExpireTime - currentTime) / 60000)} 分钟`, 'info');
            }

            // 检查任务
            const missions = await checkMissions(token, proxy, account.email);
            if (missions === '令牌已过期') {
                logger(`${accountId} ❗ Token已过期，需要重新登录`, 'warn');
                token = null;
                tokenExpireTime = 0;
                continue;
            } else if (missions && Array.isArray(missions.missions)) {
                const availableMissions = missions.missions.filter(m => m.status === 'available');
                if (availableMissions.length > 0) {
                    logger(`${accountId} 📋 发现 ${availableMissions.length} 个可用任务`, 'info');
                    for (const mission of availableMissions) {
                        logger(`${accountId} 🎯 执行任务: ${mission.missionId}`, 'info');
                        await doMissions(mission.missionId, token, proxy, account.email);
                        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
                    }
                }
            }

            // 共享带宽
            const result = await shareBandwidth(token, proxy, account.email);
            if (result === '令牌已过期') {
                logger(`${accountId} ❗ Token已过期，需要重新登录`, 'warn');
                token = null;
                tokenExpireTime = 0;
                continue;
            }

            // 成功执行一轮后等待
            await new Promise(resolve => setTimeout(resolve, 60000));

        } catch (error) {
            if (error.message === '账号已锁定') {
                isLocked = true;
                continue;
            }
            
            if (error.message === '令牌已过期' || error.message.includes('token') || error.message.includes('Token')) {
                logger(`${accountId} ❗ Token可能已过期，将重新登录`, 'warn');
                token = null;
                tokenExpireTime = 0;
                continue;
            }
            
            logger(`${accountId} ❌ 任务执行出错: ${error.message}`, 'error');
            // 出错后等待15秒
            await new Promise(resolve => setTimeout(resolve, 15000));
        }
    }
};

// 主函数
const main = async () => {
    try {
        await verifyPassword();
        
        // 清屏并重新显示banner
        console.clear();
        displayBanner();
        
        logger('OpenLoop 自动化工具 v1.0.0', 'info');
        logger('正在启动...', 'info');
        logger('\n提示: 输入空白邮箱回车即可结束添加账号\n', 'info');

        // 收集所有账号信息和代理信息
        const accounts = [];
        let index = 1;
        
        while (true) {
            logger(`\n第 ${index} 个账号:`, 'info');
            const email = (await askQuestion('邮箱: ')).trim();
            
            // 如果邮箱为空，结束输入
            if (!email) {
                break;
            }
            
            const password = await askQuestion('密码: ');
            const proxyInput = await askQuestion('代理地址: ');

            try {
                const proxy = parseProxyString(proxyInput);
                logger('✅ 代理格式正确', 'success');
                accounts.push({ email, password, proxy });
                index++;
            } catch (error) {
                logger(`❌ 账号 ${email} 的代理格式错误: ${error.message}`, 'error');
                logger('此账号将被跳过，请重新输入下一个账号', 'warn');
                continue;
            }
        }

        if (accounts.length === 0) {
            logger('❌ 没有添加任何有效账号，程序退出', 'error');
            process.exit(1);
        }

        logger(`\n✅ 已添加 ${accounts.length} 个账号`, 'success');
        logger('\n程序已启动，按 Ctrl+C 停止\n', 'info');

        // 为每个账号创建独立的处理进程
        const accountPromises = accounts.map(account => {
            // 使用setTimeout确保每个账号启动时间错开，避免同时发送大量请求
            return new Promise(resolve => {
                const randomDelay = Math.floor(Math.random() * 5000); // 0-5秒随机延迟
                setTimeout(() => {
                    processAccount(account, account.proxy).catch(err => {
                        logger(`账号 ${account.email} 处理出错: ${err.message}`, 'error');
                    });
                    resolve();
                }, randomDelay);
            });
        });

        // 等待所有账号处理进程启动
        await Promise.all(accountPromises);
        
        // 保持程序运行
        process.stdin.resume();

    } catch (error) {
        logger('程序出错:', 'error', error.message);
    }
};

// 启动程序
main();