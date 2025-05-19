/**
 * @ignore
 */
export interface IWebSocket {
    onOpen: (result: any) => void;
    onClose: () => void;
    onError: (e: any) => void;
    onMessage: (data: string | ArrayBuffer) => void;

    open(url: string, options?: IWebSocketConnectOptions): void;
    close(): void;
    send(data: string | ArrayBuffer): Promise<void>;
}

/**
 * @en WebSocket connection options. Please note that the supported options may vary across different platforms.
 * @zh WebSocket连接选项。请注意，在不同的平台上，支持的选项可能会有所不同。
 */
export interface IWebSocketConnectOptions {
    /**
     * @en The subprotocol array.
     * @zh 子协议数组。
     */
    protocols?: string[];
    /**
     * @en The headers to include in the request.
     * @zh 请求中包含的头部。
     */
    headers?: Record<string, string>;
    /**
     * @en The timeout in milliseconds.
     * @zh 超时时间，单位为毫秒
     */
    timeout?: number;
    /**
     * @en Whether to enable the compression extension
     * @zh 是否开启压缩扩展
     */
    perMessageDeflate?: boolean;
    /**
     * @en Whether to enable TCP_NODELAY.
     * @zh 是否启用TCP_NODELAY。
     */
    tcpNoDelay?: boolean;
    /**
     * @en Force to use cellular network to send request
     * @zh 强制使用蜂窝网络发送请求
     */
    forceCellularNetwork?: boolean;
}