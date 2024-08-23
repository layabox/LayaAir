import { Texture } from "./Texture";
import { Texture2D } from "./Texture2D";
import { Context } from "../renders/Context";
import { Browser } from "../utils/Browser";
import { RenderTexture2D } from "./RenderTexture2D";
import { Resource } from "./Resource";
import { TextureFormat } from "../RenderEngine/RenderEnum/TextureFormat";
import { LayaEnv } from "../../LayaEnv";

/**
 * @en `HTMLCanvas` is a proxy class for the HTML Canvas, encapsulating the properties and methods of the Canvas.
 * @zh `HTMLCanvas` 是 Html Canvas 的代理类，封装了 Canvas 的属性和方法。
 */
export class HTMLCanvas extends Resource {

    private _ctx: any;
    /**@internal */
    _source: HTMLCanvasElement;
    /**@internal */
    _texture: Texture | RenderTexture2D;
    /**@private */
    protected _width: number;
    /**@private */
    protected _height: number;

    /**
     * @inheritDoc
     * @en The source of the canvas element.
     * @zh Canvas 元素的源。
     */
    get source() {
        return this._source;
    }

    /**
     * @en The width of the canvas.
     * @zh 画布宽度。
     */
    get width(): number {
        return this._width;
    }

    set width(width: number) {
        this._width = width;
    }

    /**
     * @en The height of the canvas.
     * @zh 画布高度。
     */
    get height(): number {
        return this._height;
    }

    set height(height: number) {
        this._height = height;
    }

    /**
     * @internal 
     * @override
     */
    _getSource() {
        return this._source;
    }
    /**
     * @en Creates an instance of HTMLCanvas.
     * @param createCanvas If true, creates a new canvas element. If false, uses the instance itself as the canvas source. 
     * @zh 根据指定的类型，创建一个 HTMLCanvas 的实例。
     * @param createCanvas 如果为true，则创建一个新的画布元素。如果为 false，则使用当前实例作为画布源。
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
     * @en Clear the canvas content.
     * @zh 清空画布内容。
     */
    clear(): void {
        if (this._ctx) {
            if (this._ctx.clear) {
                this._ctx.clear();
            } else {
                this._ctx.clearRect(0, 0, this._width, this._height);
            }
        }
        if (this._texture) {
            this._texture.destroy();
            this._texture = null;
        }
    }

    /**
     * @override
     * @en Destroys the HTMLCanvas instance, releasing all associated resources.
     * @zh 销毁 HTMLCanvas 实例，释放所有相关资源。
     */
    destroy(): void {
        super.destroy();
        this._setCPUMemory(0);
        this._ctx && this._ctx.destroy && this._ctx.destroy();
        this._ctx = null;
    }

    /**
     * @en Release.
     * @zh 释放
     */
    release(): void {
    }

    /**
     * @en The Canvas rendering context.
     * @zh Canvas 渲染上下文。
     */
    get context(): Context {
        if (this._ctx) return this._ctx;
        //@ts-ignore
        if (this._source == this) {	//是webgl并且不是真的画布。如果是真的画布，可能真的想要2d context
            // @ts-ignore
            this._ctx = new Context();
        } else {
            //@ts-ignore
            this._ctx = this._source.getContext(LayaEnv.isConch ? 'layagl' : '2d');
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
     * @en Get the Canvas rendering context.
     * @param contextID The context ID.
     * @param other
     * @return The Canvas rendering context Context object.
     * @zh 获取 Canvas 渲染上下文。
     * @param	contextID 上下文ID.
     * @param	other
     * @return  Canvas 渲染上下文 Context 对象。
     */
    getContext(contextID: string, other: any = null): Context {
        return this.context;
    }


    /**
     * @en Get the memory size.
     * @return The memory size.
     * @zh 获取内存大小。
     * @return 内存大小。
     */
    //TODO:coverage
    getMemSize(): number {
        return 0;//TODO:待调整
    }

    /**
     * @en Set the width and height of the Canvas.
     * @param w The width of the Canvas.
     * @param h The height of the Canvas.
     * @zh 设置画布的宽度和高度。
     * @param w 画布的宽度。
     * @param h 画布的高度。
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
     * @en Get the texture instance.
     * @zh 获取纹理实例
     */
    getTexture(): Texture | null | RenderTexture2D {
        if (!this._texture) {
            var bitmap: Texture2D = new Texture2D(this.source.width, this.source.height, TextureFormat.R8G8B8A8, true, false, false);
            bitmap.setImageData(this.source, false, false);
            this._texture = new Texture(bitmap);
        }
        return this._texture;
    }

    /**
     * @en Convert the image to base64 information
     * @param type The image type "image/png"
     * @param encoderOptions quality parameter, range 0-1
     * @zh 把图片转换为base64信息
     * @param type 图片格式 "image/png"
     * @param encoderOptions 质量参数，取值范围为0-1
     */
    toBase64(type: string, encoderOptions: number): string | null {
        if (this._source) {
            return (this._source as HTMLCanvasElement).toDataURL(type, encoderOptions);
        }
        return null;
    }
}

