import { Bitmap } from "./Bitmap";
import { Texture } from "./Texture";
import { Texture2D } from "./Texture2D";
import { Context } from "./Context";
import { ILaya } from "../../ILaya";
import { Browser } from "../utils/Browser";
import { RenderTexture2D } from "./RenderTexture2D";
import { BaseTexture } from "./BaseTexture";


/**
 * <code>HTMLCanvas</code> 是 Html Canvas 的代理类，封装了 Canvas 的属性和方法。
 */
export class HTMLCanvas extends Bitmap {

    private _ctx: any;
    /**@internal */
    _source: HTMLCanvasElement;
    /**@internal */
    _texture: Texture;
    /**
     * @inheritDoc
     */
    get source() {
        return this._source;
    }
    /**@internal 
     * @override
    */
    _getSource() {
        return this._source;
    }
    /**
     * 根据指定的类型，创建一个 <code>HTMLCanvas</code> 实例。
     */
    constructor(createCanvas: boolean = false) {
        super();
        if (createCanvas)	//webgl模式下不建立。除非强制指，例如绘制文字部分
            this._source = Browser.createElement("canvas");
        else {
            this._source = this as unknown as HTMLCanvasElement;
        }
        this.lock = true;
    }

    /**
     * 清空画布内容。
     */
    clear(): void {
        if (this._ctx){
            if(this._ctx.clear){
                this._ctx.clear();
            }else{
                this._ctx.clearRect(0,0,this._width,this._height);
            }
        }
        if (this._texture) {
            this._texture.destroy();
            this._texture = null;
        }
    }

    /**
     * 销毁。
     * @override
     */
    destroy(): void {
        super.destroy();
        this._setCPUMemory(0);
        this._ctx && this._ctx.destroy && this._ctx.destroy();
        this._ctx = null;
    }

    /**
     * 释放。
     */
    release(): void {
    }

    /**
     * Canvas 渲染上下文。
     */
    get context(): Context {
        if (this._ctx) return this._ctx;
        //@ts-ignore
        if (this._source == this) {	//是webgl并且不是真的画布。如果是真的画布，可能真的想要2d context
            // @ts-ignore
            this._ctx = new ILaya.Context();
        } else {
            //@ts-ignore
            this._ctx = this._source.getContext(ILaya.Render.isConchApp ? 'layagl' : '2d');
        }
        this._ctx._canvas = this;
        return this._ctx;
    }

    /**
     * @internal
     * 设置 Canvas 渲染上下文。是webgl用来替换_ctx用的
     * @param	context Canvas 渲染上下文。
     */
    _setContext(context: Context): void {
        this._ctx = context;
    }

    /**
     * 获取 Canvas 渲染上下文。
     * @param	contextID 上下文ID.
     * @param	other
     * @return  Canvas 渲染上下文 Context 对象。
     */
    getContext(contextID: string, other: any = null): Context {
        return this.context;
    }


    /**
     * 获取内存大小。
     * @return 内存大小。
     */
    //TODO:coverage
    getMemSize(): number {
        return 0;//TODO:待调整
    }

    /**
     * 设置宽高。
     * @param	w 宽度。
     * @param	h 高度。
     */
    size(w: number, h: number): void {
        if (this._width != w || this._height != h || (this._source && (this._source.width != w || this._source.height != h))) {
            this._width = w;
            this._height = h;
            this._setCPUMemory(w * h * 4);
            this._ctx && this._ctx.size && this._ctx.size(w, h);
            if (this._source) {// && this._source instanceof HTMLCanvasElement){
                this._source.height = h;
                this._source.width = w;
            }
            if (this._texture) {
                this._texture.destroy();
                this._texture = null;
            }
        }
    }

    /**
     * 获取texture实例
     */
    getTexture(): Texture|null|RenderTexture2D {
        if (!this._texture) {
            var bitmap: Texture2D = new Texture2D();
            bitmap.loadImageSource(this.source);
            this._texture = new Texture(bitmap);
        }
        return this._texture;
    }

    /**
     * 把图片转换为base64信息
     * @param	type "image/png"
     * @param	encoderOptions	质量参数，取值范围为0-1
     */
    toBase64(type: string, encoderOptions: number): string|null {
        if (this._source) {
            if (ILaya.Render.isConchApp) {
                var win: any = window as any;
                if (win.conchConfig.threadMode == 2) {
                    throw "native 2 thread mode use toBase64Async";
                }
                var width: number = this._ctx._targets.sourceWidth;
                var height: number = this._ctx._targets.sourceHeight;
                var data: any = this._ctx._targets.getData(0, 0, width, height);
                return win.conchToBase64FlipY ? win.conchToBase64FlipY(type, encoderOptions, data.buffer, width, height) : win.conchToBase64(type, encoderOptions, data.buffer, width, height);
            }
            else {
                return (this._source as HTMLCanvasElement).toDataURL(type, encoderOptions);
            }
        }
        return null;
    }
    //native多线程
    toBase64Async(type: string, encoderOptions: number, callBack: Function): void {
        var width: number = this._ctx._targets.sourceWidth;
        var height: number = this._ctx._targets.sourceHeight;
        this._ctx._targets.getDataAsync(0, 0, width, height, function (data: Uint8Array): void {
            let win = window as any;
            var base64 = win.conchToBase64FlipY ? win.conchToBase64FlipY(type, encoderOptions, data.buffer, width, height) : win.conchToBase64(type, encoderOptions, data.buffer, width, height);
            callBack(base64);
        });
    }
}

