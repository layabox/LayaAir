import { IWebSocket, IWebSocketConnectOptions } from "../../laya/net/IWebSocket";
import { PAL } from "../../laya/platform/PlatformAdapters";

export class MgWebSocket implements IWebSocket {
    ws: WechatMinigame.SocketTask;

    onOpen: (result: any) => void;
    onClose: () => void;
    onError: (e: any) => void;
    onMessage: (data: string | ArrayBuffer) => void;

    open(url: string, options?: IWebSocketConnectOptions) {
        let failed = false;
        this.ws = PAL.g.connectSocket(Object.assign({
            url,
            multiple: true, //支付宝需要这个
            fail: (err: any) => {
                failed = true;
                this.onError(err);
            }
        }, options));
        if (this.ws == null || failed) {
            this.ws = null;
            return;
        }

        this.ws.onOpen(res => this.onOpen(res));
        this.ws.onClose(() => this.onClose());
        this.ws.onError(err => this.onError(err));
        this.ws.onMessage(msg => {
            if (msg.data)
                this.onMessage(msg.data);
        });
    }

    close(): void {
        if (this.ws)
            this.ws.close({});
    }

    send(data: string | ArrayBuffer): Promise<void> {
        if (this.ws == null)
            return Promise.reject("WebSocket is not open");

        return new Promise((resolve, reject) => {
            this.ws.send({
                data,
                success: () => resolve(),
                fail: (e) => reject(e)
            });
        });
    }
}