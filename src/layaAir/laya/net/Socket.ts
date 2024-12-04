import { Event } from "../events/Event"
import { EventDispatcher } from "../events/EventDispatcher"
import { Browser } from "../utils/Browser"
import { Byte } from "../utils/Byte"
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
 */
export class Socket extends EventDispatcher {
    /**
     * @en Little-endian byte order, where the low-order byte is stored in the low address.
     * @zh 小端字节序，地址低位存储值的低位，地址高位存储值的高位。
     */
    static LITTLE_ENDIAN: string = "littleEndian";
    /**
     * @en Big-endian byte order, where the high-order byte is stored in the low address. Also known as network byte order.
     * @zh 大端字节序，地址低位存储值的高位，地址高位存储值的低位。有时也称之为网络字节序。
     */
    static BIG_ENDIAN: string = "bigEndian";
    /**@internal */
    _endian: string;
    protected _socket: any;
    private _connected: boolean;
    private _addInputPosition: number;
    private _input: any;
    private _output: any;

    /**
     * @en Whether to disable caching of data received from the server. If the transmitted data is in string format, it is recommended to set this to true to reduce binary conversion overhead.
     * @zh 是否禁用服务端发来的数据缓存。如果传输的数据为字符串格式，建议设置为true，减少二进制转换消耗。
     */
    disableInput: boolean = false;

    private _byteClass: new () => any;
    /**
     * @en Subprotocol names. A string or an array of strings of subprotocol names. Must be set before calling connect or connectByUrl, otherwise it will be invalid. If specified, the connection will only be established successfully if the server chooses one of these subprotocols, otherwise it will fail and dispatch an Event.ERROR event.
     * @zh 子协议名称。子协议名称字符串，或由多个子协议名称字符串构成的数组。必须在调用 connect 或者 connectByUrl 之前进行赋值，否则无效。指定后，只有当服务器选择了其中的某个子协议，连接才能建立成功，否则建立失败，派发 Event.ERROR 事件。
     */
    protocols: any = [];

    /**
     * @en The data received from the server.
     * @zh 服务端发来的缓存数据。
     */
    get input(): any {
        return this._input;
    }

    /**
     * @en The data in the buffer that needs to be sent to the server.
     * @zh 需要发送至服务端的缓冲区中的数据。
     */
    get output(): any {
        return this._output;
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
        return this._endian;
    }

    set endian(value: string) {
        this._endian = value;
        if (this._input != null) this._input.endian = value;
        if (this._output != null) this._output.endian = value;
    }

    /**
     * @en Create a new Socket object. The default byte order is Socket.BIG_ENDIAN. If no parameters are specified, a socket initially in a disconnected state will be created. If valid parameters are specified, it attempts to connect to the specified host and port.
     * @param host The server address.
     * @param port The server port.
     * @param byteClass The Byte class used for receiving and sending data. If null, the Byte class will be used. You can also pass in a subclass of the Byte class.
     * @param protocols Subprotocol names. A string or an array of strings of subprotocol names.
     * @param isSecure Whether to use the WebSocket secure protocol wss, default (false) uses the ordinary protocol ws.
     * @zh 创建新的 Socket 对象。默认字节序为 Socket.BIG_ENDIAN 。若未指定参数，将创建一个最初处于断开状态的套接字。若指定了有效参数，则尝试连接到指定的主机和端口。
     * @param host 服务器地址。
     * @param port 服务器端口。
     * @param byteClass 用于接收和发送数据的 Byte 类。如果为 null ，则使用 Byte 类，也可传入 Byte 类的子类。
     * @param protocols 子协议名称。子协议名称字符串，或由多个子协议名称字符串构成的数组。
     * @param isSecure 是否使用WebSocket安全协议wss，默认（false）使用普通协议ws。
     */
    constructor(host: string | null = null, port: number = 0, byteClass: new () => any = null, protocols: any[] | null = null, isSecure: boolean = false) {
        super();
        this._byteClass = byteClass ? byteClass : Byte;
        this.protocols = protocols;
        this.endian = Socket.BIG_ENDIAN;
        if (host && port > 0 && port < 65535) this.connect(host, port, isSecure);
    }

    /**
     * @en Connect to the specified host and port.
     * - Dispatches Event.OPEN on successful connection; Event.ERROR on connection failure; Event.CLOSE when the connection is closed; Event.MESSAGE when data is received. Except for Event.MESSAGE where the event parameter is the data content, other event parameters are native HTML DOM Event objects.
     * @param host The server address.
     * @param port The server port.
     * @param isSecure Whether to use the WebSocket secure protocol wss, default (false) uses the ordinary protocol ws.
     * @zh 连接到指定的主机和端口。
     * - 连接成功派发 Event.OPEN 事件；连接失败派发 Event.ERROR 事件；连接被关闭派发 Event.CLOSE 事件；接收到数据派发 Event.MESSAGE 事件； 除了 Event.MESSAGE 事件参数为数据内容，其他事件参数都是原生的 HTML DOM Event 对象。
     * @param host 服务器地址。
     * @param port 服务器端口。
     * @param isSecure 是否使用WebSocket安全协议wss，默认（false）使用普通协议ws。
     */
    connect(host: string, port: number, isSecure: boolean = false): void {
        this.connectByUrl(`${isSecure ? "wss" : "ws"}://${host}:${port}`);
    }

    /**
     * @en Connect to the specified server WebSocket URL. The URL is similar to ws://yourdomain:port.
     * - Dispatches Event.OPEN on successful connection; Event.ERROR on connection failure; Event.CLOSE when the connection is closed; Event.MESSAGE when data is received. Except for Event.MESSAGE where the event parameter is the data content, other event parameters are native HTML DOM Event objects.
     * @param url The server WebSocket URL to connect to. The URL is similar to ws://yourdomain:port.
     * @zh 连接到指定的服务端 WebSocket URL。 URL 类似 ws://yourdomain:port。
     * - 连接成功派发 Event.OPEN 事件；连接失败派发 Event.ERROR 事件；连接被关闭派发 Event.CLOSE 事件；接收到数据派发 Event.MESSAGE 事件； 除了 Event.MESSAGE 事件参数为数据内容，其他事件参数都是原生的 HTML DOM Event 对象。
     * @param url 要连接的服务端 WebSocket URL。 URL 类似 ws://yourdomain:port。
     */
    connectByUrl(url: string): void {
        if (this._socket != null) this.close();

        this._socket && this.cleanSocket();

        if (!this.protocols || this.protocols.length == 0) {
            this._socket = new Browser.window.WebSocket(url);
        } else {
            this._socket = new Browser.window.WebSocket(url, this.protocols);
        }

        this._socket.binaryType = "arraybuffer";

        this._output = new this._byteClass();
        this._output.endian = this.endian;
        this._input = new this._byteClass();
        this._input.endian = this.endian;
        this._addInputPosition = 0;

        this._socket.onopen = (e: any) => {
            this._onOpen(e);
        };
        this._socket.onmessage = (msg: any): void => {
            this._onMessage(msg);
        };
        this._socket.onclose = (e: any): void => {
            this._onClose(e);
        };
        this._socket.onerror = (e: any): void => {
            this._onError(e);
        };
    }

    /**
     * @en Clean up the Socket: close the Socket connection, remove event listeners, and reset the Socket.
     * @zh 清理Socket：关闭Socket连接，移除事件监听，重置Socket。
     */
    cleanSocket(): void {
        this.close();
        this._connected = false;
        this._socket.onopen = null;
        this._socket.onmessage = null;
        this._socket.onclose = null;
        this._socket.onerror = null;
        this._socket = null;
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
        }
    }

    /**
     * @en Connection established successfully
     * @zh 连接建立成功 。
     */
    protected _onOpen(e: any): void {
        this._connected = true;
        this.event(Event.OPEN, e);
    }

    /**
     * @en Received data processing method.
     * @param msg Data.
     * @zh 接收到数据处理方法。
     * @param msg 数据。
     */
    protected _onMessage(msg: any): void {
        if (!msg || !msg.data) return;
        var data: any = msg.data;
        if (this.disableInput && data) {
            this.event(Event.MESSAGE, data);
            return;
        }
        if (this._input.length > 0 && this._input.bytesAvailable < 1) {
            this._input.clear();
            this._addInputPosition = 0;
        }
        var pre: number = this._input.pos;
        !this._addInputPosition && (this._addInputPosition = 0);
        this._input.pos = this._addInputPosition;

        if (data) {
            if (typeof (data) == 'string') {
                this._input.writeUTFBytes(data);
            } else {
                this._input.writeArrayBuffer(data);
            }
            this._addInputPosition = this._input.pos;
            this._input.pos = pre;
        }
        this.event(Event.MESSAGE, data);
    }

    /**
     * @en Connection closed processing method.
     * @zh 连接被关闭处理方法。
     */
    protected _onClose(e: any): void {
        this._connected = false;
        this.event(Event.CLOSE, e)
    }

    /**
     * @en An error occurred processing method.
     * @zh 出现异常处理方法。
     */
    protected _onError(e: any): void {
        this.event(Event.ERROR, e)
    }

    /**
     * @en Send data to the server.
     * @param data The data to be sent, which can be either a String or an ArrayBuffer.
     * @zh 发送数据到服务器。
     * @param data 需要发送的数据，可以是String或者ArrayBuffer。
     */
    send(data: any): void {
        this._socket.send(data);
    }

    /**
     * @en Send the data in the buffer to the server.
     * @zh 发送缓冲区中的数据到服务器。
     */
    flush(): void {
        if (this._output && this._output.length > 0) {
            var evt: any;
            try {
                this._socket && this._socket.send(this._output.__getBuffer().slice(0, this._output.length));
            } catch (e) {
                evt = e;
            }
            this._output.endian = this.endian;
            this._output.clear();
            if (evt) this.event(Event.ERROR, evt);
        }
    }
}


