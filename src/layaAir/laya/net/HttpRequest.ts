import { URL } from "./URL";
import { Event } from "../events/Event"
import { EventDispatcher } from "../events/EventDispatcher"
import { Utils } from "../utils/Utils"
import { Browser } from "../utils/Browser";

/**
 * 请求进度改变时调度。
 * @eventType Event.PROGRESS
 * */
/*[Event(name = "progress", type = "laya.events.Event")]*/
/**
 * 请求结束后调度。
 * @eventType Event.COMPLETE
 * */
/*[Event(name = "complete", type = "laya.events.Event")]*/
/**
 * 请求出错时调度。
 * @eventType Event.ERROR
 * */
/*[Event(name = "error", type = "laya.events.Event")]*/

/**
 * <p> <code>HttpRequest</code> 通过封装 HTML <code>XMLHttpRequest</code> 对象提供了对 HTTP 协议的完全的访问，包括做出 POST 和 HEAD 请求以及普通的 GET 请求的能力。 <code>HttpRequest</code> 只提供以异步的形式返回 Web 服务器的响应，并且能够以文本或者二进制的形式返回内容。</p>
 * <p><b>注意：</b>建议每次请求都使用新的 <code>HttpRequest</code> 对象，因为每次调用该对象的send方法时，都会清空之前设置的数据，并重置 HTTP 请求的状态，这会导致之前还未返回响应的请求被重置，从而得不到之前请求的响应结果。</p>
 */
export class HttpRequest extends EventDispatcher {
    /**@private */
    protected _http = new XMLHttpRequest();
    /**@private */
    private static _urlEncode:Function = encodeURI;
    /**@private */
    protected _responseType: string;
    /**@private */
    protected _data: any;
    /**@private */
    protected _url: string;

    /**
     * 发送 HTTP 请求。
     * @param	url				请求的地址。大多数浏览器实施了一个同源安全策略，并且要求这个 URL 与包含脚本的文本具有相同的主机名和端口。
     * @param	data			(default = null)发送的数据。
     * @param	method			(default = "get")用于请求的 HTTP 方法。值包括 "get"、"post"、"head"。
     * @param	responseType	(default = "text")Web 服务器的响应类型，可设置为 "text"、"json"、"xml"、"arraybuffer"。
     * @param	headers			(default = null) HTTP 请求的头部信息。参数形如key-value数组：key是头部的名称，不应该包括空白、冒号或换行；value是头部的值，不应该包括换行。比如["Content-Type", "application/json"]。
     */
    send(url: string, data: any = null, method: string = "get", responseType: string = "text", headers: any[]|null = null): void {
        this._responseType = responseType;
        this._data = null;

        if (Browser.onVVMiniGame || Browser.onQGMiniGame || Browser.onQQMiniGame || Browser.onAlipayMiniGame || Browser.onBLMiniGame || Browser.onHWMiniGame || Browser.onTTMiniGame || Browser.onTBMiniGame) {
            url = HttpRequest._urlEncode(url);
        }
        this._url = url;
        var _this: HttpRequest = this;
        var http = this._http;
        //临时，因为微信不支持以下文件格式
		http.open(method, url, true);
		let isJson = false;
        if (headers) {
            for (var i: number = 0; i < headers.length; i++) {
                http.setRequestHeader(headers[i++], headers[i]);
            }
        } else if (!(((<any>window)).conch)) {
            if (!data || typeof (data) == 'string') http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			else{ 
                http.setRequestHeader("Content-Type", "application/json");
                if (!(data instanceof ArrayBuffer) && typeof data !== "string") {
                    isJson=true;
                }
			}
        }
        let restype: XMLHttpRequestResponseType = responseType !== "arraybuffer" ? "text" : "arraybuffer";
        http.responseType = restype;
        if ((http as any).dataType) {//for Ali
            (http as any).dataType = restype;
        }
        http.onerror = function (e: any): void {
            _this._onError(e);
        }
        http.onabort = function (e: any): void {
            _this._onAbort(e);
        }
        http.onprogress = function (e: any): void {
            _this._onProgress(e);
        }
        http.onload = function (e: any): void {
            _this._onLoad(e);
        }
        if(Browser.onBLMiniGame&&Browser.onAndroid&&!data)data={};
        http.send( isJson?JSON.stringify(data):data);
    }

    /**
     * @private
     * 请求进度的侦听处理函数。
     * @param	e 事件对象。
     */
    protected _onProgress(e: any): void {
        if (e && e.lengthComputable) this.event(Event.PROGRESS, e.loaded / e.total);
    }

    /**
     * @private
     * 请求中断的侦听处理函数。
     * @param	e 事件对象。
     */
    protected _onAbort(e: any): void {
        this.error("Request was aborted by user");
    }

    /**
     * @private
     * 请求出错侦的听处理函数。
     * @param	e 事件对象。
     */
    protected _onError(e: any): void {
        this.error("Request failed Status:" + this._http.status + " text:" + this._http.statusText);
    }

    /**
     * @private
     * 请求消息返回的侦听处理函数。
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
     * @private
     * 请求错误的处理函数。
     * @param	message 错误信息。
     */
    protected error(message: string): void {
        this.clear();
        console.warn(this.url, message);
        this.event(Event.ERROR, message);
    }

    /**
     * @private
     * 请求成功完成的处理函数。
     */
    protected complete(): void {
        this.clear();
        var flag: boolean = true;
        try {
            if (this._responseType === "json") {
                this._data = JSON.parse(this._http.responseText);
            } else if (this._responseType === "xml") {
                this._data = Utils.parseXMLFromString(this._http.responseText);
            } else {
                this._data = this._http.response || this._http.responseText;
            }
        } catch (e) {
            flag = false;
            this.error(e.message);
        }
        flag && this.event(Event.COMPLETE, this._data instanceof Array ? [this._data] : this._data);
    }

    /**
     * @private
     * 清除当前请求。
     */
    protected clear(): void {
        var http: any = this._http;
        http.onerror = http.onabort = http.onprogress = http.onload = null;
    }

    /** 请求的地址。*/
    get url(): string {
        return this._url;
    }

    /** 返回的数据。*/
    get data(): any {
        return this._data;
    }

    /**
     * 本对象所封装的原生 XMLHttpRequest 引用。
     */
    get http(): any {
        return this._http;
    }
}

