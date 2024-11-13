import { Event } from "../events/Event"
import { EventDispatcher } from "../events/EventDispatcher"
import { Browser } from "../utils/Browser";
import { XML } from "../html/XML";

/**
 * @en The `HttpRequest` class encapsulates the HTML `XMLHttpRequest` object to provide full access to the HTTP protocol, including the ability to make POST and HEAD requests as well as regular GET requests. `HttpRequest` only provides asynchronous responses from web servers and can return content in either text or binary form.
 * - Note: It is recommended to use a new `HttpRequest` object for each request, as each call to the send method of this object will clear previously set data and reset the HTTP request status. This can cause previously unreturned responses to be reset, resulting in the loss of response results from previous requests.
 * - EventType Event.PROGRESS: Dispatch when the request progress changes.
 * - EventType Event.COMPLETE: Dispatch after the request ends.
 * - EventType Event.ERROR: Dispatch when the request fails.
 * @zh `HttpRequest` 类通过封装 HTML `XMLHttpRequest` 对象提供了对 HTTP 协议的完全访问，包括发送 POST 和 HEAD 请求以及普通的 GET 请求的能力。`HttpRequest` 只以异步形式返回 Web 服务器的响应，并且能够以文本或二进制形式返回内容。
 * - 注意：建议每次请求都使用新的 `HttpRequest` 对象，因为每次调用该对象的 send 方法时，都会清空之前设置的数据，并重置 HTTP 请求的状态，这会导致之前还未返回响应的请求被重置，从而得不到之前请求的响应结果。
 * - EventType Event.PROGRESS: 请求进度改变时调度。
 * - EventType Event.COMPLETE: 请求结束后调度。
 * - EventType Event.ERROR: 请求出错时调度。
 */
export class HttpRequest extends EventDispatcher {
    protected _http = new XMLHttpRequest();
    private static _urlEncode: Function = encodeURI;
    protected _responseType: string;
    protected _data: any;
    protected _url: string;

    /**
     * @en Send an HTTP request.
     * @param url The URL to request. Most browsers implement a same-origin security policy and require that the URL has the same hostname and port as the script.
     * @param data (default = null) The data to be sent.
     * @param method (default = "get") The HTTP method used for the request. Values include "get", "post", "head".
     * @param responseType (default = "text") The response type from the web server, can be set to "text", "json", "xml", "arraybuffer".
     * @param headers (default = null) The header information for the HTTP request. Parameters are in the form of a key-value array: key is the name of the header, should not include whitespace, colon, or newline; value is the value of the header, should not include newline. For example ["Content-Type", "application/json"].
     * @zh 发送 HTTP 请求。
     * @param url 请求的地址。大多数浏览器实施了同源安全策略，要求此 URL 与包含脚本的文本具有相同的主机名和端口。
     * @param data (默认值 = null) 发送的数据。
     * @param method (默认值 = "get") 用于请求的 HTTP 方法。值包括 "get"、"post"、"head"。
     * @param responseType (默认值 = "text") Web 服务器的响应类型，可设置为 "text"、"json"、"xml"、"arraybuffer"。
     * @param headers (默认值 = null) HTTP 请求的头部信息。参数形如 key-value 数组：key 是头部的名称，不应包括空白、冒号或换行；value 是头部的值，不应包括换行。例如 ["Content-Type", "application/json"]。
     */
    send(url: string, data: any = null,
        method: "get" | "post" | "head" = "get",
        responseType: "text" | "json" | "xml" | "arraybuffer" = "text",
        headers?: string[]): void {
        this._responseType = responseType;
        this._data = null;

        if (Browser.onVVMiniGame || Browser.onQGMiniGame || Browser.onQQMiniGame || Browser.onAlipayMiniGame || Browser.onBLMiniGame || Browser.onHWMiniGame || Browser.onTTMiniGame || Browser.onTBMiniGame) {
            url = HttpRequest._urlEncode(url);
        }
        this._url = url;

        let http = this._http;
        http.open(method, url, true);

        if (data) {
            if (typeof (data) == 'string') {
                http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            }
            else {
                http.setRequestHeader("Content-Type", "application/json");
                if (!(data instanceof ArrayBuffer))
                    data = JSON.stringify(data);
            }
        }
        else if (Browser.onBLMiniGame && Browser.onAndroid)
            data = {};

        if (headers) {
            for (let i = 0; i < headers.length; i++) {
                http.setRequestHeader(headers[i++], headers[i]);
            }
        }

        let restype: XMLHttpRequestResponseType = responseType !== "arraybuffer" ? "text" : "arraybuffer";
        http.responseType = restype;
        if ((http as any).dataType) {//for Ali
            (http as any).dataType = restype;
        }
        http.onerror = (e: any) => {
            this._onError(e);
        }
        http.onabort = (e: any) => {
            this._onAbort(e);
        }
        http.onprogress = (e: any) => {
            this._onProgress(e);
        }
        http.onload = (e: any) => {
            this._onLoad(e);
        }

        http.send(data);
    }

    /**
     * @en The listening and processing function for requesting progress.
     * @param e The event object.
     * @zh 请求进度的侦听处理函数。
     * @param	e 事件对象。
     */
    protected _onProgress(e: any): void {
        if (e && e.lengthComputable) this.event(Event.PROGRESS, e.loaded / e.total);
    }

    /**
     * @en The listening and processing function for request interruption.
     * @param e The event object.
     * @zh 请求中断的侦听处理函数。
     * @param	e 事件对象。
     */
    protected _onAbort(e: any): void {
        this.error("Request was aborted by user");
    }

    /**
     * @en The listening and processing function for request errors.
     * @param e The event object.
     * @zh 请求出错侦的听处理函数。
     * @param	e 事件对象。
     */
    protected _onError(e: any): void {
        this.error("Request failed Status:" + this._http.status + " text:" + this._http.statusText);
    }

    /**
     * @en The listening and processing function for request completion.
     * @param e The event object.
     * @zh 请求消息返回的侦听处理函数。
     * @param	e 事件对象。
     */
    protected _onLoad(e: any): void {
        var http: any = this._http;
        var status: number = http.status !== undefined ? http.status : 200;

        if (status === 200 || status === 204 || status === 0) {
            this.complete();
        } else {
            this.error("[" + http.status + "]" + http.statusText + ":" + http.responseURL);
        }
    }

    /**
     * @en Request error handling function.
     * @param message The error message.
     * @zh 请求错误的处理函数。
     * @param	message 错误信息。
     */
    protected error(message: string): void {
        this.clear();
        //console.warn(this.url, message);
        this.event(Event.ERROR, message);
    }

    /**
     * @en The processing function for successfully completing the request.
     * @zh 请求成功完成的处理函数。
     */
    protected complete(): void {
        this.clear();
        var flag: boolean = true;
        try {
            if (this._responseType === "json") {
                this._data = JSON.parse(this._http.responseText);
            } else if (this._responseType === "xml") {
                this._data = new XML(this._http.responseText);
            } else {
                this._data = this._http.response || this._http.responseText;
            }
        } catch (e: any) {
            flag = false;
            this.error(e.message);
        }
        flag && this.event(Event.COMPLETE, this._data instanceof Array ? [this._data] : this._data);
    }

    /**
     * @en Clear the current request.
     * @zh 清除当前请求。
     */
    protected clear(): void {
        var http: any = this._http;
        http.onerror = http.onabort = http.onprogress = http.onload = null;
    }

    /**
     * @en The requested URL.
     * @zh 请求的地址。
     */
    get url(): string {
        return this._url;
    }

    /**
     * @en The data.
     * @zh 数据。
     */
    get data(): any {
        return this._data;
    }

    /**
     * @en The reference to the native XMLHttpRequest object encapsulated by this object.
     * @zh 本对象所封装的原生 XMLHttpRequest 引用。
     */
    get http(): any {
        return this._http;
    }

    /**
     * @en Reset the HttpRequest object, clearing all event listeners and data.
     * @zh 重置 HttpRequest 对象，清除所有事件监听器和数据。
     */
    reset() {
        this.offAll();
        this._data = null;
    }
}

