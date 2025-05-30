import { Event } from "../events/Event";
import { EventDispatcher } from "../events/EventDispatcher";
import { PAL } from "../platform/PlatformAdapters";
import { Byte } from "../utils/Byte";
import { getErrorMsg } from "../utils/Error";
import { IWebSocket, IWebSocketConnectOptions } from "./IWebSocket";

/**
 * @en Socket encapsulates HTML5 WebSocket, allowing full-duplex real-time communication between server and client, and cross-domain communication. After establishing a connection, both server and Browser/Client Agent can actively send or receive text and binary data to each other.
 * -  To use Socket class methods, first create a Socket object using the constructor new Socket. Socket transmits and receives data asynchronously.
 * - Event.OPEN event: dispatched after successful connection establishment.
 * - Event.MESSAGE event: dispatched after receiving data.
 * - Event.CLOSE event: dispatched after connection closed.
 * - Event.ERROR event: dispatched after an error occurred.
 * @zh Socket 封装了 HTML5 WebSocket，允许服务器端与客户端进行全双工（full-duplex）的实时通信，并且允许跨域通信。在建立连接后，服务器和 Browser/Client Agent 都能主动的向对方发送或接收文本和二进制数据。
 * - 要使用Socket 类的方法，请先使用构造函数 new Socket 创建一个 Socket 对象。 Socket 以异步方式传输和接收数据。
 * - Event.OPEN 事件：连接建立成功后调度。
 * - Event.MESSAGE 事件：接收到数据后调度。
 * - Event.CLOSE 事件：连接被关闭后调度。
 * - Event.ERROR 事件：出现异常后调度。
 * @blueprintable
 */
export class Socket extends EventDispatcher {
    /**
     * @en The data received from the server.
     * @zh 服务端发来的缓存数据。
     */
    readonly input: Byte;
    /**
     * @en The data in the buffer that needs to be sent to the server.
     * @zh 需要发送至服务端的缓冲区中的数据。
     */
    readonly output: Byte;
    /**
     * @en Whether to disable caching of data received from the server. If the transmitted data is in string format, it is recommended to set this to true to reduce binary conversion overhead.
     * @zh 是否禁用服务端发来的数据缓存。如果传输的数据为字符串格式，建议设置为true，减少二进制转换消耗。
     */
    disableInput: boolean = false;

    protected _socket: IWebSocket;
    protected _connected: boolean;
    protected _inputPos: number;

    /** @deprecated */
    constructor(host?: string, port?: number, byteClass?: new () => any, protocols?: string[], isSecure?: boolean);
    /**
     * @en Create a new Socket object. The default byte order is Socket.BIG_ENDIAN. If no parameters are specified, a socket initially in a disconnected state will be created. If valid parameters are specified, it attempts to connect to the specified host and port.
     * @param host The server address.
     * @param port The server port.
     * @param protocols Subprotocol names. A string or an array of strings of subprotocol names.
     * @param isSecure Whether to use the WebSocket secure protocol wss, default (false) uses the ordinary protocol ws.
     * @zh 创建新的 Socket 对象。默认字节序为 Socket.BIG_ENDIAN 。若未指定参数，将创建一个最初处于断开状态的套接字。若指定了有效参数，则尝试连接到指定的主机和端口。
     * @param host 服务器地址。
     * @param port 服务器端口。
     * @param protocols 子协议名称。子协议名称字符串，或由多个子协议名称字符串构成的数组。
     * @param isSecure 是否使用WebSocket安全协议wss，默认（false）使用普通协议ws。
     */
    constructor(host?: string, port?: number, protocols?: string[], isSecure?: boolean);

    constructor(host?: string, port?: number, byteClass?: string[] | (new () => any), protocols?: boolean | string[], isSecure?: boolean) {
        super();

        if (Array.isArray(byteClass))
            protocols = byteClass;
        if (typeof (protocols) === "boolean") {
            isSecure = protocols;
            protocols = null;
        }

        this.output = new Byte();
        this.input = new Byte();
        this.endian = Byte.BIG_ENDIAN;

        if (host && port > 0 && port < 65535)
            this.connect(host, port, isSecure, <string[]>protocols);
    }

    /**
     * @en Indicates whether this Socket object is currently connected.
     * @zh 表示此 Socket 对象目前是否已连接。
     */
    get connected(): boolean {
        return this._connected;
    }

    /**
     * @en The byte order used by this Socket object.
     * @zh 此 Socket 对象使用的字节序。
     */
    get endian(): string {
        return this.output.endian;
    }

    set endian(value: string) {
        this.input.endian = value;
        this.output.endian = value;
    }

    /**
     * @en Connect to the specified host and port.
     * - Dispatches Event.OPEN on successful connection; Event.ERROR on connection failure; Event.CLOSE when the connection is closed; Event.MESSAGE when data is received. Except for Event.MESSAGE where the event parameter is the data content, other event parameters are native HTML DOM Event objects.
     * @param host The server address.
     * @param port The server port.
     * @param isSecure Whether to use the WebSocket secure protocol wss, default (false) uses the ordinary protocol ws.
     * @param protocols Subprotocol names. A string or an array of strings of subprotocol names.
     * @zh 连接到指定的主机和端口。
     * - 连接成功派发 Event.OPEN 事件；连接失败派发 Event.ERROR 事件；连接被关闭派发 Event.CLOSE 事件；接收到数据派发 Event.MESSAGE 事件； 除了 Event.MESSAGE 事件参数为数据内容，其他事件参数都是原生的 HTML DOM Event 对象。
     * @param host 服务器地址。
     * @param port 服务器端口。
     * @param isSecure 是否使用WebSocket安全协议wss，默认（false）使用普通协议ws。
     * @param protocols 子协议名称。子协议名称字符串，或由多个子协议名称字符串构成的数组。
     */
    connect(host: string, port: number, isSecure?: boolean, protocols?: string[]): void;
    /**
     * @en Connect to the specified host and port.
     * - Dispatches Event.OPEN on successful connection; Event.ERROR on connection failure; Event.CLOSE when the connection is closed; Event.MESSAGE when data is received. Except for Event.MESSAGE where the event parameter is the data content, other event parameters are native HTML DOM Event objects.
     * @param host The server address.
     * @param port The server port.
     * @param isSecure Whether to use the WebSocket secure protocol wss, default (false) uses the ordinary protocol ws.
     * @param options Options for the WebSocket connection.
     * @zh 连接到指定的主机和端口。
     * - 连接成功派发 Event.OPEN 事件；连接失败派发 Event.ERROR 事件；连接被关闭派发 Event.CLOSE 事件；接收到数据派发 Event.MESSAGE 事件； 除了 Event.MESSAGE 事件参数为数据内容，其他事件参数都是原生的 HTML DOM Event 对象。
     * @param host 服务器地址。
     * @param port 服务器端口。
     * @param isSecure 是否使用WebSocket安全协议wss，默认（false）使用普通协议ws。
     * @param options WebSocket 连接的选项。
     */
    connect(host: string, port: number, isSecure?: boolean, options?: IWebSocketConnectOptions): void;

    connect(host: string, port: number, isSecure?: boolean, options?: any): void {
        this.connectByUrl(`${isSecure ? "wss" : "ws"}://${host}:${port}`, options);
    }

    /**
     * @en Connect to the specified server WebSocket URL. The URL is similar to ws://yourdomain:port.
     * - Dispatches Event.OPEN on successful connection; Event.ERROR on connection failure; Event.CLOSE when the connection is closed; Event.MESSAGE when data is received. Except for Event.MESSAGE where the event parameter is the data content, other event parameters are native HTML DOM Event objects.
     * @param url The server WebSocket URL to connect to. The URL is similar to ws://yourdomain:port.
     * @param protocols Subprotocol names. A string or an array of strings of subprotocol names.
     * @zh 连接到指定的服务端 WebSocket URL。 URL 类似 ws://yourdomain:port。
     * - 连接成功派发 Event.OPEN 事件；连接失败派发 Event.ERROR 事件；连接被关闭派发 Event.CLOSE 事件；接收到数据派发 Event.MESSAGE 事件； 除了 Event.MESSAGE 事件参数为数据内容，其他事件参数都是原生的 HTML DOM Event 对象。
     * @param url 要连接的服务端 WebSocket URL。 URL 类似 ws://yourdomain:port。
     * @param protocols 子协议名称。子协议名称字符串，或由多个子协议名称字符串构成的数组。
     */
    connectByUrl(url: string, protocols?: string[]): void;
    /**
     * @en Connect to the specified server WebSocket URL. The URL is similar to ws://yourdomain:port.
     * - Dispatches Event.OPEN on successful connection; Event.ERROR on connection failure; Event.CLOSE when the connection is closed; Event.MESSAGE when data is received. Except for Event.MESSAGE where the event parameter is the data content, other event parameters are native HTML DOM Event objects.
     * @param url The server WebSocket URL to connect to. The URL is similar to ws://yourdomain:port.
     * @param options Options for the WebSocket connection.
     * @zh 连接到指定的服务端 WebSocket URL。 URL 类似 ws://yourdomain:port。
     * - 连接成功派发 Event.OPEN 事件；连接失败派发 Event.ERROR 事件；连接被关闭派发 Event.CLOSE 事件；接收到数据派发 Event.MESSAGE 事件； 除了 Event.MESSAGE 事件参数为数据内容，其他事件参数都是原生的 HTML DOM Event 对象。
     * @param url 要连接的服务端 WebSocket URL。 URL 类似 ws://yourdomain:port。
     * @param options WebSocket 连接的选项。
     */
    connectByUrl(url: string, options?: IWebSocketConnectOptions): void;

    connectByUrl(url: string, options?: string[] | IWebSocketConnectOptions): void {
        if (this._socket != null)
            this.close();

        this.output.length = 0;
        this.input.length = 0;
        this._inputPos = 0;

        if (Array.isArray(options)) {
            options = { protocols: options };
        }

        this._socket = PAL.browser.createWebSocket();
        this._socket.onOpen = () => {
            this._connected = true;
            this.event(Event.OPEN);
        };
        this._socket.onClose = () => {
            this._connected = false;
            this.event(Event.CLOSE);
        };
        this._socket.onError = (e: any) => {
            if (this.hasListener(Event.ERROR))
                this.event(Event.ERROR, e);
            else
                console.error("Socket Error: " + getErrorMsg(e));
        };
        this._socket.onMessage = (msg: string | ArrayBuffer) => this._onMessage(msg);
        this._socket.open(url, options);
    }

    /**
     * @en Close the connection.
     * @zh 关闭连接。
     */
    close(): void {
        if (this._socket != null) {
            try {
                this._socket.close();
            } catch (e) {
            }
            this._socket = null;
        }
        this._connected = false;
    }

    /** @deprecated */
    cleanSocket(): void {
        this.close();
    }

    /**
     * @en Send data to the server.
     * @param data The data to be sent, which can be either a String or an ArrayBuffer.
     * @zh 发送数据到服务器。
     * @param data 需要发送的数据，可以是String或者ArrayBuffer。
     */
    send(data: string | ArrayBuffer): Promise<void> {
        return this._socket.send(data);
    }

    /**
     * @en Send the data in the buffer to the server.
     * @zh 发送缓冲区中的数据到服务器。
     */
    flush(): void {
        if (this.output.length === 0 || !this._socket || !this._connected)
            return;

        let err: any;
        try {
            this._socket.send(this.output.rawBuffer.slice(0, this.output.length));
        } catch (e) {
            err = e;
        }
        this.output.clear();

        if (err)
            this.event(Event.ERROR, err);
    }

    protected _onMessage(data: string | ArrayBuffer): void {
        if (this.disableInput) {
            this.event(Event.MESSAGE, data);
            return;
        }

        if (this.input.length > 0 && this.input.bytesAvailable < 1) {
            this.input.clear();
            this._inputPos = 0;
        }
        let pre: number = this.input.pos;
        !this._inputPos && (this._inputPos = 0);
        this.input.pos = this._inputPos;

        if (typeof (data) == 'string') {
            this.input.writeUTFBytes(data);
        } else {
            this.input.writeArrayBuffer(data);
        }
        this._inputPos = this.input.pos;
        this.input.pos = pre;

        this.event(Event.MESSAGE, data);
    }

    /** @internal @blueprintEvent */
    Socket_bpEvent: {
        [Event.OPEN]: () => void;
        [Event.CLOSE]: () => void;
        [Event.ERROR]: (e: any) => void;
        [Event.MESSAGE]: (data: string | ArrayBuffer) => void;
    };
}