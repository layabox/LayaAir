import { Browser } from "../utils/Browser";
import { IWebSocket, IWebSocketConnectOptions } from "./IWebSocket";

/** @internal */
export class _WebSocket implements IWebSocket {
    ws: WebSocket;

    onOpen: (result: any) => void;
    onClose: () => void;
    onError: (e: any) => void;
    onMessage: (data: string | ArrayBuffer) => void;

    open(url: string, options?: IWebSocketConnectOptions) {
        let protocols = options?.protocols;
        if (!protocols || protocols.length == 0)
            this.ws = new Browser.window.WebSocket(url);
        else
            this.ws = new Browser.window.WebSocket(url, protocols);
        this.ws.binaryType = "arraybuffer";

        this.ws.onopen = e => this.onOpen({});
        this.ws.onclose = e => this.onClose();
        this.ws.onerror = err => this.onError(err);
        this.ws.onmessage = msg => {
            if (msg.data)
                this.onMessage(msg.data);
        };
    }

    close(): void {
        this.ws.close();
    }

    send(data: string | ArrayBuffer): Promise<void> {
        this.ws.send(data);
        return Promise.resolve();
    }
}