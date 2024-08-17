// 运行在 Electron 主进程 下的插件入口
const { ipcMain } = require('electron');
const fs = require('fs');
const path = require('node:path');

ipcMain.on('update-message', (e, newMessage) => {
    // 等别人或自己设置插件ui
    // const displayMessageCount = 10;
    const filename = 'MergeMessage.txt';
    const filePath = path.join(__dirname, filename);
    const messageLine = newMessage.replace(/\n/g, '。')
    fs.readFile(filePath, { encoding: 'utf-16le' }, (err, data) => {
        if(err) throw err;
        const messages = data.toString('utf16le').split('\n');
        messages.splice(0, 1);
        messages.push(messageLine);
        fs.writeFile(filePath, '\ufeff' + messages.join('\n'), { encoding: 'utf-16le' }, err => {
            throw err;
        });
    })
})

// 创建窗口时触发
module.exports.onBrowserWindowCreated = window => {
    // window 为 Electron 的 BrowserWindow 实例
    
}
