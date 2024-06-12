// 运行在 Electron 主进程 下的插件入口
import { ipcMain } from 'electron';
ipcMain.handle

// 创建窗口时触发
module.exports.onBrowserWindowCreated = window => {
    // window 为 Electron 的 BrowserWindow 实例
}
