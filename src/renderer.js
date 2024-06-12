// 运行在 Electron 渲染进程 下的页面脚本
import { EventChannel } from '../LiteLoaderQQNT-Euphony/src/index.js';

const ENTITY = {
    FRIEND: 1,
    MEMBER: 2,
};

function getName(contact) {
    const type = contact.getChatType();
    if(type === ENTITY.FRIEND) {
        return contact.getRemark() || contact.getNick();
    } else if (type === ENTITY.MEMBER) {
        const group = contact.getGroup();
        return `${group.getRemark() || group.getName()}>${contact.getRemark() || contact.getCardName() || contact.getNick()}`;
    }
    return "error";
}
const eventChannel = EventChannel.withTriggers();
eventChannel.subscribeEvent('receive-message', (message, source) => {
    const contact = source.getContact();
    const name = getName(contact);
    const msg = message.contentToString();
    console.log(`${name}: ${msg}`);
    window.plugins.updateMessage(`${name}: ${msg}`);
});

// 打开设置界面时触发
export const onSettingWindowCreated = view => {
    // view 为 Element 对象，修改将同步到插件设置界面
}
