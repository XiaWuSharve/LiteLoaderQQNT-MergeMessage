import { Friend, Group, Member, MessageChain, MessageSource } from '../index.js';

/**
 * `EventChannel` 是 **Euphony** 完成事件操作的通道。
 * 
 * @property { Map<String, Array<Function>> } #registry 事件注册表。
 */
class EventChannel {

    #registry = new Map();

    /**
     * 构造并返回一个带有封装事件触发器的事件通道。
     * 
     * @returns { EventChannel } 带有封装事件触发器的事件通道。
     */
    static withTriggers() {
        const eventChannel = new EventChannel();

        function onReceiveMessage(payload) {
            const msg = payload?.msgList?.[0];
            if (!msg) {
                return;
            }
            if (msg.elements[0]?.grayTipElement) {
                const jsonStr = msg.elements[0].grayTipElement.jsonGrayTipElement.jsonStr;
                const json = JSON.parse(jsonStr).items;
                const source = { isGrayTip: true };
                if (msg.chatType === 1) {
                    source.actor = Friend.make(json[0].uid, json[0].uid);
                    source.acted = Friend.make(json[3].uid, json[3].uid);
                } else {
                    source.actor = Group.make(msg.peerUin).getMemberFromUid(json[0].uid)
                    source.acted = Group.make(msg.peerUin).getMemberFromUid(json[3].uid)
                }
                source.action = json[2].txt;
                source.surfix = json[4].txt;
                eventChannel.call('receive-message', MessageChain.fromNative(msg.elements), source);
                return;
            }
            let contact;
            if (msg.chatType == 1) {
                contact = Friend.make(msg.senderUin, msg.senderUid)
            } else {
                contact = Group.make(msg.peerUin).getMemberFromUid(msg.senderUid)
            }
            const source = new MessageSource(msg.msgId, contact);
            eventChannel.call('receive-message', MessageChain.fromNative(msg.elements), source);
        }

        euphonyNative.subscribeEvent('nodeIKernelMsgListener/onRecvMsg', onReceiveMessage);
        euphonyNative.subscribeEvent('nodeIKernelMsgListener/onRecvActiveMsg', onReceiveMessage);
        // euphonyNative.subscribeEvent('nodeIKernelMsgListener/onAddSendMsg', payload => {
        //     const msgRecord = payload?.msgRecord;
        //     if (!msgRecord) {
        //         return;
        //     }
        //     const contact = msgRecord.chatType == 1 ? Friend.make(msgRecord.peerUin, msgRecord.peerUid) : (msgRecord.chatType == 2 ? Group.make(msgRecord.peerUin) : null);
        //     const source = new MessageSource(msgRecord.msgId, contact);
        //     eventChannel.call('send-message', MessageChain.fromNative(msgRecord.elements), source);
        // });
        return eventChannel;
    }

    /**
     * 为事件 `eventName` 添加一个 `handler` 处理器。
     * 
     * @param { String } eventName 事件名称。
     * @param { Function } handler 事件处理器。
     * @returns { Function } 传入的 `handler`。
     */
    subscribeEvent(eventName, handler) {
        if (!this.#registry.has(eventName)) {
            this.#registry.set(eventName, []);
        }
        this.#registry.get(eventName).push(handler);
        return handler;
    }

    /**
     * 移除事件 `eventName` 的 `handler` 处理器。
     * 
     * @param { String } eventName 事件名称。
     * @param { Function } handler 事件处理器。
     */
    unsubscribeEvent(eventName, handler) {
        const event = this.#registry.get(eventName);
        if (event) {
            const index = event.indexOf(handler);
            if (index != -1) {
                event.splice(index, 1);
            }
        }
    }

    /**
     * 触发事件 `eventName` 并传入参数 `args`。
     * 
     * @param { String } eventName 事件名称。
     * @param  { ...any } args 事件参数。
     */
    call(eventName, ...args) {
        this.#registry.get(eventName)?.forEach(handler => handler(...args));
    }

}

export default EventChannel