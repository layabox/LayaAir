import { Event } from "../events/Event"
import { EventDispatcher } from "../events/EventDispatcher"
import { Browser } from "../utils/Browser"
import { Byte } from "../utils/Byte"

/**
 * 连接建立成功后调度。
 * @eventType Event.OPEN
 * */
/*[Event(name = "open", type = "laya.events.Event")]*/
/**
 * 接收到数据后调度。
 * @eventType Event.MESSAGE
 * */
/*[Event(name = "message", type = "laya.events.Event")]*/
/**
 * 连接被关闭后调度。
 * @eventType Event.CLOSE
 * */
/*[Event(name = "close", type = "laya.events.Event")]*/
/**
 * 出现异常后调度。
 * @eventType Event.ERROR
 * */
/*[Event(name = "error", type = "laya.events.Event")]*/

/**
 * <p> <code>Socket</code> 封装了 HTML5 WebSocket ，允许服务器端与客户端进行全双工（full-duplex）的实时通信，并且允许跨域通信。在建立连接后，服务器和 Browser/Client Agent 都能主动的向对方发送或接收文本和二进制数据。</p>
 * <p>要使用 <code>Socket</code> 类的方法，请先使用构造函数 <code>new Socket</code> 创建一个 <code>Socket</code> 对象。 <code>Socket</code> 以异步方式传输和接收数据。</p>
 */
export class Socket extends EventDispatcher {
    /**
     * <p>主机字节序，是 CPU 存放数据的两种不同顺序，包括小端字节序和大端字节序。</p>
     * <p> LITTLE_ENDIAN ：小端字节序，地址低位存储值的低位，地址高位存储值的高位。</p>
     * <p> BIG_ENDIAN ：大端字节序，地址低位存储值的高位，地址高位存储值的低位。有时也称之为网络字节序。</p>
     */
    static LITTLE_ENDIAN: string = "littleEndian";
    /**
     * <p>主机字节序，是 CPU 存放数据的两种不同顺序，包括小端字节序和大端字节序。</p>
     * <p> BIG_ENDIAN ：大端字节序，地址低位存储值的高位，地址高位存储值的低位。有时也称之为网络字节序。</p>
     * <p> LITTLE_ENDIAN ：小端字节序，地址低位存储值的低位，地址高位存储值的高位。</p>
     */
    static BIG_ENDIAN: string = "bigEndian";
    /**@internal */
    _endian: string;
    /**@private */
    protected _socket: any;
    /**@private */
    private _connected: boolean;
    /**@private */
    private _addInputPosition: number;
    /**@private */
    private _input: any;
    /**@private */
    private _output: any;

    /**
     * 不再缓存服务端发来的数据，如果传输的数据为字符串格式，建议设置为true，减少二进制转换消耗。
     */
    disableInput: boolean = false;
    /**
     * 用来发送和接收数据的 <code>Byte</code> 类。
     */
    private _byteClass: new () => any;
    /**
     * <p>子协议名称。子协议名称字符串，或由多个子协议名称字符串构成的数组。必须在调用 connect 或者 connectByUrl 之前进行赋值，否则无效。</p>
     * <p>指定后，只有当服务器选择了其中的某个子协议，连接才能建立成功，否则建立失败，派发 Event.ERROR 事件。</p>
     * @see https://html.spec.whatwg.org/multipage/comms.html#dom-websocket
     */
    protocols: any = [];

    /**
     * 缓存的服务端发来的数据。
     */
    get input(): any {
        return this._input;
    }

    /**
     * 表示需要发送至服务端的缓冲区中的数据。
     */
    get output(): any {
        return this._output;
    }

    /**
     * 表示此 Socket 对象目前是否已连接。
     */
    get connected(): boolean {
        return this._connected;
    }

    /**
     * <p>主机字节序，是 CPU 存放数据的两种不同顺序，包括小端字节序和大端字节序。</p>
     * <p> LITTLE_ENDIAN ：小端字节序，地址低位存储值的低位，地址高位存储值的高位。</p>
     * <p> BIG_ENDIAN ：大端字节序，地址低位存储值的高位，地址高位存储值的低位。</p>
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
     * <p>创建新的 Socket 对象。默认字节序为 Socket.BIG_ENDIAN 。若未指定参数，将创建一个最初处于断开状态的套接字。若指定了有效参数，则尝试连接到指定的主机和端口。</p>
     * @param host		服务器地址。
     * @param port		服务器端口。
     * @param byteClass	用于接收和发送数据的 Byte 类。如果为 null ，则使用 Byte 类，也可传入 Byte 类的子类。
     * @param protocols	子协议名称。子协议名称字符串，或由多个子协议名称字符串构成的数组
     * @see laya.utils.Byte
     */
    constructor(host: string|null = null, port: number = 0, byteClass: new () => any = null, protocols: any[]|null = null) {
        super();
        this._byteClass = byteClass ? byteClass : Byte;
        this.protocols = protocols;
        this.endian = Socket.BIG_ENDIAN;
        if (host && port > 0 && port < 65535) this.connect(host, port);
    }

    /**
     * <p>连接到指定的主机和端口。</p>
     * <p>连接成功派发 Event.OPEN 事件；连接失败派发 Event.ERROR 事件；连接被关闭派发 Event.CLOSE 事件；接收到数据派发 Event.MESSAGE 事件； 除了 Event.MESSAGE 事件参数为数据内容，其他事件参数都是原生的 HTML DOM Event 对象。</p>
     * @param host	服务器地址。
     * @param port	服务器端口。
     */
    connect(host: string, port: number): void {
        var url: string = "ws://" + host + ":" + port;
        this.connectByUrl(url);
    }

    /**
     * <p>连接到指定的服务端 WebSocket URL。 URL 类似 ws://yourdomain:port。</p>
     * <p>连接成功派发 Event.OPEN 事件；连接失败派发 Event.ERROR 事件；连接被关闭派发 Event.CLOSE 事件；接收到数据派发 Event.MESSAGE 事件； 除了 Event.MESSAGE 事件参数为数据内容，其他事件参数都是原生的 HTML DOM Event 对象。</p>
     * @param url	要连接的服务端 WebSocket URL。 URL 类似 ws://yourdomain:port。
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
     * 清理Socket：关闭Socket链接，关闭事件监听，重置Socket
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
     * 关闭连接。
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
     * @private
     * 连接建立成功 。
     */
    protected _onOpen(e: any): void {
        this._connected = true;
        this.event(Event.OPEN, e);
    }

    /**
     * @private
     * 接收到数据处理方法。
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
     * @private
     * 连接被关闭处理方法。
     */
    protected _onClose(e: any): void {
        this._connected = false;
        this.event(Event.CLOSE, e)
    }

    /**
     * @private
     * 出现异常处理方法。
     */
    protected _onError(e: any): void {
        this.event(Event.ERROR, e)
    }

    /**
     * 发送数据到服务器。
     * @param	data 需要发送的数据，可以是String或者ArrayBuffer。
     */
    send(data: any): void {
        this._socket.send(data);
    }

    /**
     * 发送缓冲区中的数据到服务器。
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


