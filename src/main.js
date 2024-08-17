// 运行在 Electron 主进程 下的插件入口
const { ipcMain } = require('electron');
const fs = require('fs');
const path = require('node:path');
let mutex = Promise.resolve();

ipcMain.on('update-message', async (e, newMessage) => {
    // 等别人或自己设置插件ui
    // const displayMessageCount = 10;
    await mutex;
    mutex = (async () => {
        const filename = 'MergeMessage.txt';
        const filePath = path.join(__dirname, filename);
        const messageLine = newMessage.replace(/\n/g, '。')
        await new Promise(resolve => fs.readFile(filePath, { encoding: 'utf-16le' }, (err, data) => {
            if(err) throw err;
            const messages = data.toString('utf16le').split('\n');
            messages.splice(0, 1);
            messages.push(messageLine);
            fs.writeFile(filePath, '\ufeff' + messages.join('\n'), { encoding: 'utf-16le' }, err => {
                if(err)
                    throw err;
                else
                    resolve();
            });
        }));
        return Promise.resolve();
    })();
})

// 创建窗口时触发
module.exports.onBrowserWindowCreated = window => {
    // window 为 Electron 的 BrowserWindow 实例
    
}
