# OpenLoop 自动化工具使用教程

OpenLoop Network 是一个去中心化的无线网络，旨在增强互联网服务交付，使其更高效、更易访问，并为每个人带来回报。🤩

## 🌟 快速开始
- 项目源码：[GitHub](https://github.com/mumumusf/openloopbot)
- 注册地址：[点击注册](https://openloop.so/auth/register?ref=olcb564fde)

## 📝 VPS 环境配置教程

### 1. 安装 NVM（Node Version Manager）
```bash
# 下载并安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# 根据您使用的终端，运行以下命令之一：
source ~/.bashrc   # 如果使用 bash
source ~/.zshrc    # 如果使用 zsh
```

### 2. 安装 Node.js 22
```bash
# 安装 Node.js 22 版本
nvm install 22

# 查看已安装的版本
nvm list
```

### 3. 设置默认 Node.js 版本
```bash
# 使用 Node.js 22
nvm use 22

# 设置为默认版本
nvm alias default 22
```

### 4. 验证安装
```bash
# 验证 Node.js 版本
node -v   # 预期输出: v22.x.x

# 验证当前使用的 nvm 版本
nvm current # 预期输出: v22.x.x

# 验证 npm 版本
npm -v    # 预期输出: 10.x.x
```

### 5. 获取程序
```bash
# 克隆项目代码
git clone https://github.com/mumumusf/openloopbot.git
cd openloopbot

# 安装所需的依赖
npm install
```

## 🚀 程序使用说明

### 1. 安装 Screen
```bash
# Ubuntu/Debian
apt-get update
apt-get install screen

# CentOS
yum install screen
```

### 2. 使用 Screen 运行程序
```bash
# 创建新的 screen 会话
screen -S openloop

# 在 screen 会话中运行程序
node main.js

# 分离 screen 会话（保持程序在后台运行）
# 按 Ctrl+A 然后按 D

# 查看所有 screen 会话
screen -ls

# 重新连接到 screen 会话
screen -r openloop

# 结束 screen 会话（如需停止程序）
# 1. 重新连接到会话
# 2. 按 Ctrl+C 停止程序
# 3. 输入 exit 退出会话
```

### 3. 程序功能
- ✅ 自动登录账号
- ✅ 自动共享带宽
- ✅ 自动完成任务
- ✅ 多账号管理
- ✅ 代理支持
- ✅ 错误重试机制
- ✅ 账号锁定保护

### 4. 注意事项
- 🔒 首次运行需要输入密码验证
- 🔄 程序支持断线重连
- ⚠️ 建议使用优质代理以提高稳定性
- 🕒 程序运行期间请保持网络通畅
- 💻 使用 screen 可以保持程序在后台运行
- 🔌 VPS 重启后需要重新启动程序

## 💡 常见问题

1. **Q: 如何获取程序密码？**  
   A: 请加入 Telegram 群组 [@YOYOZKS](https://t.me/YOYOZKS) 获取密码

2. **Q: 如何保持程序在后台运行？**  
   A: 使用 screen 命令创建会话并运行程序，然后使用 Ctrl+A D 分离会话

3. **Q: 账号被锁定怎么办？**  
   A: 程序会自动等待一段时间后重试，无需手动操作

4. **Q: 如何停止程序？**  
   A: 重新连接到 screen 会话后，按 Ctrl+C 停止程序

## 📞 联系方式
- Telegram 群组：[@YOYOZKS](https://t.me/YOYOZKS)
- Github：[github.com/mumumusf](https://github.com/mumumusf)

## ⚠️ 免责声明
- 本程序仅供学习交流使用
- 禁止用于商业用途
- 使用本程序产生的任何后果由用户自行承担