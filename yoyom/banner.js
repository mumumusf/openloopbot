// 导入chalk包用于控制台彩色输出
import chalk from 'chalk';

// ASCII艺术字体
export const banner = `
   ██╗  ██╗██╗ █████╗  ██████╗    ██╗     ██╗███╗   ██╗
   ╚██╗██╔╝██║██╔══██╗██╔═══██╗   ██║     ██║████╗  ██║
    ╚███╔╝ ██║███████║██║   ██║   ██║     ██║██╔██╗ ██║
    ██╔██╗ ██║██╔══██║██║   ██║   ██║     ██║██║╚██╗██║
   ██╔╝ ██╗██║██║  ██║╚██████╔╝   ███████╗██║██║ ╚████║
   ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝ ╚═════╝    ╚══════╝╚═╝╚═╝  ╚═══╝
`;

// 导出显示banner的函数
export const displayBanner = () => {
    console.log(banner);
    console.log(chalk.yellow('    === OpenLoop 自动化工具 ==='));
    console.log(chalk.cyan('** ====================================== **'));
    console.log(chalk.cyan('*         此脚本仅供免费使用              *'));
    console.log(chalk.cyan('*         禁止出售或用于盈利              *'));
    console.log(chalk.cyan('** ====================================== **'));
    console.log('');
    console.log(chalk.green('* 作者: @YOYOMYOYOA'));
    console.log(chalk.green('* 空投玩家 | 现货玩家 | meme收藏'));
    console.log(chalk.green('* Github: github.com/mumumusf'));
    console.log('');
    console.log(chalk.red('** ====================================== **'));
    console.log(chalk.red('*            免责声明                      *'));
    console.log(chalk.red('* 此脚本仅供学习交流使用                  *'));
    console.log(chalk.red('* 使用本脚本所产生的任何后果由用户自行承担 *'));
    console.log(chalk.red('* 如果因使用本脚本造成任何损失，作者概不负责*'));
    console.log(chalk.red('** ====================================== **'));
    console.log('');
    console.log(chalk.yellow('获取密码 | Get Password:'));
    console.log(chalk.cyan('* 中文: 请加入 Telegram 群组 @https://t.me/YOYOZKS 获取密码'));
    console.log(chalk.cyan('* ENG: Please join Telegram group @https://t.me/YOYOZKS to get password'));
    console.log('');
};