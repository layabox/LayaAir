import { Browser } from "../utils/Browser";

/**
 * @en `HTMLCanvas` is a proxy class for the HTML Canvas, encapsulating the properties and methods of the Canvas.
 * @zh `HTMLCanvas` 是 Html Canvas 的代理类，封装了 Canvas 的属性和方法。
 * @blueprintIgnore
 */
export class HTMLCanvas {
    source: HTMLCanvasElement;

    protected _ctx: CanvasRenderingContext2D;

    /**
     * @ignore
     */
    constructor(createCanvas?: boolean) {
        if (createCanvas == null || createCanvas)
            this.source = Browser.createElement("canvas");
    }

    /**
     * @en Clear the canvas content.
     * @zh 清空画布内容。
     */
    clear(): void {
        if (this.source)
            this.context.clearRect(0, 0, this.source.width, this.source.height);
    }

    /**
     * @en The Canvas rendering context.
     * @zh Canvas 渲染上下文。
     */
    get context(): CanvasRenderingContext2D {
        return this._ctx || (this._ctx = this.source.getContext('2d'));
    }

    set context(value: CanvasRenderingContext2D) {
        this._ctx = value;
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
        if (this.source) {
            this.source.height = h;
            this.source.width = w;
        }
    }
}
