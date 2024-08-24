import { ILaya } from "../../ILaya";
import { Sprite } from "../display/Sprite";
import { Text } from "../display/Text";
import { Loader } from "../net/Loader";
import { HtmlElement } from "./HtmlElement";
import { IHtmlObject } from "./IHtmlObject";

/**
 * @en The `HtmlImage` class represents an image object within an HTML element.
 * @zh `HtmlImage` 类表示 HTML 元素中的图像对象。
 */
export class HtmlImage implements IHtmlObject {
    /**
     * @en The sprite object representing the image.
     * @zh 表示图像的精灵对象。
     */
    public readonly obj: Sprite;

    private _owner: Text;
    private _element: HtmlElement;

    /**
     * @en Creates a new HtmlImage object.
     * @zh 创建一个 HtmlImage 对象。
     */
    public constructor() {
        this.obj = new Sprite();
    }

    /**
     * @en The associated HTML element.
     * @zh 关联的 HTML 元素。
     */
    public get element(): HtmlElement {
        return this._element;
    }

    /**
     * @en The width of the image.
     * @zh 图像的宽度。
     */
    public get width(): number {
        return this.obj.width;
    }

    /**
     * @en The height of the image.
     * @zh 图像的高度。
     */
    public get height(): number {
        return this.obj.height;
    }

    /**
     * @en Creates and loads the image with the specified owner text and HTML element.
     * @param owner The owner text object.
     * @param element The HTML element associated with the image.
     * @zh 使用指定的文本所有者和 HTML 元素创建并加载图像。
     * @param owner 文本对象的所有者。
     * @param element 与图像关联的 HTML 元素。
     */
    public create(owner: Text, element: HtmlElement): void {
        this._owner = owner;
        this._element = element;
        this._owner.objContainer.addChild(this.obj);

        let src = this._element.getAttrString("src");
        if (src)
            this.loadTexture(src);
    }

    protected loadTexture(src: string) {
        let width = this._element.getAttrInt("width", -1);
        let height = this._element.getAttrInt("height", -1);
        if (width != -1)
            this.obj.width = width;
        if (height != -1)
            this.obj.height = height;

        let tex = Loader.getRes(src);
        if (tex) {
            this.obj.texture = tex;
            if (width == -1)
                this.obj.width = tex.sourceWidth;
            if (height == -1)
                this.obj.height = tex.sourceHeight;
        }
        else {
            ILaya.loader.load(src, { silent: true }).then(tex => {
                if (this.obj.destroyed) return;
                let w = this.obj.width;
                let h = this.obj.height;
                this.obj.texture = tex;
                if (width == -1)
                    this.obj.width = tex ? tex.sourceWidth : 0;
                if (height == -1)
                    this.obj.height = tex ? tex.sourceHeight : 0;
                if (this._owner && (w != this.obj.width || h != this.obj.height))
                    this._owner.refreshLayout();
            });
        }
    }

    /**
     * @en Positions the image at the specified coordinates.
     * @param x The x-coordinate.
     * @param y The y-coordinate.
     * @zh 将图像定位到指定的坐标。
     * @param x x 坐标。
     * @param y y 坐标。
     */
    public pos(x: number, y: number): void {
        this.obj.pos(x, y);
    }

    /**
     * @en Releases resources and removes the image object from its parent container.
     * @zh 释放资源并从父容器中移除图像对象。
     */
    public release(): void {
        this.obj.removeSelf();
        this.obj.offAll();
        this.obj.texture = null;
        this._owner = null;
        this._element = null;
    }

    /**
     * @en Destroys the image object.
     * @zh 销毁图像对象。
     */
    public destroy(): void {
        this.obj.destroy();
    }
}