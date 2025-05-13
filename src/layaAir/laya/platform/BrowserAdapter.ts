import { Event } from "../events/Event";
import { EventDispatcher } from "../events/EventDispatcher";
import { Browser } from "../utils/Browser";
import { ClassUtils } from "../utils/ClassUtils";

/**
 * @ignore
 */
export class BrowserAdapter extends EventDispatcher {
    public requestFrame: Function;
    public safariOffsetY: number = 0;

    protected _visibilityStateKey: string;
    protected _pixelRatio: number = 1;

    constructor() {
        super();

        this.init();
        this.initRequestFrameFunction();
    }

    protected init() {
        //这个遗留逻辑未确认其含义
        if (window.navigator.userAgent.indexOf("Mozilla/6.0(Linux; Android 6.0; HUAWEI NXT-AL10 Build/HUAWEINXT-AL10)") > -1)
            this._pixelRatio = 2;
        else
            this._pixelRatio = Math.max(1, (window.devicePixelRatio || 1));

        if (Browser.onSafari)
            this.safariOffsetY = this.getClientHeight() - window.innerHeight;

        let state = "visibilityState", visibilityChange = "visibilitychange";
        let fullscreenchange = "fullscreenchange";
        let document: any = window.document;
        if (typeof document.hidden !== "undefined") {
            visibilityChange = "visibilitychange";
            state = "visibilityState";
            fullscreenchange = "fullscreenchange";
        } else if (typeof document.mozHidden !== "undefined") {
            visibilityChange = "mozvisibilitychange";
            state = "mozVisibilityState";
            fullscreenchange = "mozfullscreenchange";
        } else if (typeof document.msHidden !== "undefined") {
            visibilityChange = "msvisibilitychange";
            state = "msVisibilityState";
            fullscreenchange = "msfullscreenchange";
        } else if (typeof document.webkitHidden !== "undefined") {
            visibilityChange = "webkitvisibilitychange";
            state = "webkitVisibilityState";
            fullscreenchange = "webkitfullscreenchange";
        }
        this._visibilityStateKey = state;

        document.addEventListener(visibilityChange, () => this.event(Event.VISIBILITY_CHANGE, this.getVisibility()));
        document.addEventListener(fullscreenchange, () => this.event(Event.FULL_SCREEN_CHANGE));

        window.addEventListener("resize", () => this.event(Event.RESIZE));
        window.addEventListener("orientationchange", (e: any) => this.event(Event.ORIENTATION_CHANGE, e));
        window.addEventListener("focus", () => this.event(Event.FOCUS));
        window.addEventListener("blur", () => this.event(Event.BLUR));
        window.addEventListener("error", e => this.event(Event.ERROR, e));
        window.addEventListener("unhandledrejection", e => this.event("unhandledrejection", e));

        //强制修改body样式
        let bodyStyle: any = document.body.style;
        bodyStyle.margin = 0;
        bodyStyle.overflow = 'hidden';
        bodyStyle['-webkit-user-select'] = 'none';
        bodyStyle['-webkit-tap-highlight-color'] = 'rgba(200,200,200,0)';

        //强制修改meta标签，防止开发者写错
        let metas = document.getElementsByTagName('meta');
        let viewportContent: Record<string, string> = {
            "width": "device-width",
            "initial-scale": "1.0",
            "minimum-scale": "1.0",
            "maximum-scale": "1.0",
            "user-scalable": "no"
        };
        let viewport: any;
        for (let i = 0; i < metas.length; i++) {
            let meta = metas[i];
            if (meta.name === "viewport") {
                viewport = meta;
                break;
            }
        }
        if (!viewport) {
            viewport = document.createElement('meta');
            viewport.name = 'viewport';
            document.getElementsByTagName('head')[0]?.appendChild(viewport);
        }
        else {
            let arr: Array<string> = (viewport.content || "").split(",");
            for (let ele of arr) {
                let arr2 = ele.split("=");
                if (!viewportContent[arr2[0].trim()])
                    viewportContent[arr2[0]] = arr2[1];
            }
        }
        viewport.content = Object.keys(viewportContent).map(k => k + "=" + viewportContent[k]);
    }

    protected initRequestFrameFunction(): void {
        this.requestFrame = requestAnimationFrame
            || window.requestAnimationFrame
            || (window as any).webkitRequestAnimationFrame
            || (window as any).mozRequestAnimationFrame
            || (window as any).oRequestAnimationFrame
            || (window as any).msRequestAnimationFrame;

        if (!this.requestFrame)
            this.requestFrame = function (fun: any): any {
                return setTimeout(fun, 1000 / 60);
            }
    }

    getScreenOrientation(): OrientationType {
        let ret = window.screen.orientation.type;
        if (ret == null) {
            let o = window.orientation;
            switch (o) {
                case 0:
                    ret = "portrait-primary";
                    break;
                case 180:
                    ret = "portrait-secondary";
                    break;
                case 90:
                    ret = "landscape-primary";
                    break;
                case -90:
                    ret = "landscape-secondary";
                    break;
            }
        }
        return ret;
    }

    getPixelRatio() {
        return this._pixelRatio;
    }

    getClientWidth(): number {
        return window.innerWidth || document.body.clientWidth || document.documentElement.clientWidth;
    }

    getClientHeight(): number {
        return window.innerHeight || document.body.clientHeight || document.documentElement.clientHeight;
    }

    getVisibility(): boolean {
        return (document as any)[this._visibilityStateKey] !== "hidden";
    }

    requestFullscreen(): void {
        let element: any = document.documentElement;
        if (element.requestFullscreen)
            element.requestFullscreen();
        else if (element.mozRequestFullScreen)
            element.mozRequestFullScreen();
        else if (element.webkitRequestFullscreen)
            element.webkitRequestFullscreen();
        else if (element.msRequestFullscreen)
            element.msRequestFullscreen();
    }

    exitFullscreen() {
        let doc: any = document;
        if (doc.exitFullscreen)
            doc.exitFullscreen();
        else if (doc.mozCancelFullScreen)
            doc.mozCancelFullScreen();
        else if (doc.webkitExitFullscreen)
            doc.webkitExitFullscreen();
    }

    createElement<K extends keyof HTMLElementTagNameMap>(tagName: K): HTMLElementTagNameMap[K] {
        return document.createElement(tagName);
    }

    createMainCanvas() {
        let canvas = this.createElement("canvas");
        canvas.id = "layaCanvas";
        canvas.width = 0;
        canvas.height = 0;

        let style = canvas.style;
        style.position = 'absolute';
        style.top = style.left = "0px";
        style.background = "#000000";

        let container = document.createElement("div");
        container.id = "layaContainer";
        document.body.appendChild(container);

        container.appendChild(canvas);

        return canvas;
    }

    setCursor(cursor: string): void {
        document.body.style.cursor = cursor;
    }

    get supportArrayBufferURL(): boolean {
        return !!window.Blob;
    }

    createBufferURL(data: ArrayBuffer): string {
        if (window.Blob) {
            let blob = new Blob([data], { type: 'application/octet-binary' });
            return window.URL.createObjectURL(blob);
        }
        else
            return null;
    }

    revokeBufferURL(url: string): void {
        window.URL.revokeObjectURL(url);
    }

    getOpenDataContextCanvas(): HTMLCanvasElement {
        return null;
    }

    postMessageToOpenDataContext(msg: any): void {
    }
}

ClassUtils.regClass("PAL.Browser", BrowserAdapter);