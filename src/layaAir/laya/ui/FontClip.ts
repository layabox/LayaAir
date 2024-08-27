import { Event } from "../events/Event"
import { Texture } from "../resource/Texture"
import { Clip } from "./Clip"

/**
 * @en Font clipping for simplified bitmap fonts, which can be used by setting a slice image and text content, similar to bitmap fonts.
 * Usage: Set the skin for the bitmap font and the corresponding font content sheet (if multiple lines are needed, use spaces for line breaks). 
 * @zh 字体切片，简化版的位图字体，只需设置一个切片图片和文字内容即可使用，效果同位图字体
 * 使用方式：设置位图字体皮肤skin，设置皮肤对应的字体内容sheet（如果多行，可以使用空格换行）
 * 示例：
 * fontClip.skin = "font1.png";//设置皮肤
 * fontClip.sheet = "abc123 456";//设置皮肤对应的内容，空格换行。此皮肤为2行5列（显示时skin会被等分为2行5列），第一行对应的文字为"abc123"，第二行为"456"
 * fontClip.value = "a1326";//显示"a1326"文字
 */
export class FontClip extends Clip {
    /**
     * @en Internal use. The array of values.
     * @zh 内部使用，数值数组。
    */
    protected _valueArr: string = '';
    /**
     * @en Internal use. The array of text content.
     * @zh 内部使用，文字内容数组。
     */
    protected _indexMap: Record<string, number> = null;
    /**
     * @en Internal use. The content of the font clip.
     * @zh 内部使用，字体切片内容。
     */
    protected _sheet: string = null;
    /**
     * @en Internal use. The direction.
     * @zh 内部使用，方向。
     */
    protected _direction: string = "horizontal";
    /**
     * @en Internal use. The gap on the X-axis.
     * @zh 内部使用，X轴方向间隙。
     */
    protected _spaceX: number = 0;
    /**
     * @en Internal use. The gap on the Y-axis.
     * @zh 内部使用，Y轴方向间隙。
     */
    protected _spaceY: number = 0;
    /**
     * @en Internal use. The horizontal alignment method.
     * @zh 内部使用，水平对齐方式。
     */
    private _align: string = "left";
    /**
     * @en Internal use. The width of the displayed text.
     * @zh 内部使用，显示文字的宽度。
     */
    private _wordsW: number = 0;
    /**
     * @en Internal use. The height of the displayed text.
     * @zh 内部使用，显示文字的高度。
     */
    private _wordsH: number = 0;
    
    /**
     * @en Font clip index.
     * @zh 字体切片索引。
     */
    get index(): number {
        return this._index;
    }

    set index(value: number) {
        this._index = value;
        ////屏蔽Clip类操作
    }

    /**
     * @en The content of the font clip, with spaces representing line breaks.
     * @zh 字体切片的内容，空格表示换行符。
     */
    get sheet(): string {
        return this._sheet;
    }

    set sheet(value: string) {
        value += "";
        this._sheet = value;
        //根据空格换行
        var arr: any[] = value.split(" ");
        this._clipX = String(arr[0]).length;
        this.clipY = arr.length;

        this._indexMap = {};
        for (var i: number = 0; i < this._clipY; i++) {
            var line: any[] = arr[i].split("");
            for (var j: number = 0, n: number = line.length; j < n; j++) {
                this._indexMap[line[j]] = i * this._clipX + j;
            }
        }
    }

    /**
     * @en Gets the display content of the font clip.
     * @zh 字体切片的显示内容。
     */
    get value(): string {
        if (!this._valueArr) return "";
        return this._valueArr;
    }

    set value(value: string) {
        value += "";
        this._valueArr = value;
        this.callLater(this.changeValue);
    }

    /**
     * @en Layout direction of the font clip characters.
     * The default value is "horizontal".
     * values:
     * "horizontal": Indicates a horizontal layout.
     * "vertical": Indicates a vertical layout.
     * @zh 字体切片字符的布局方向。
     * 默认值为 "horizontal"。
     * 取值：
     * "horizontal": 表示水平布局。
     * "vertical": 表示垂直布局。
     */
    get direction(): string {
        return this._direction;
    }

    set direction(value: string) {
        this._direction = value;
        this.callLater(this.changeValue);
    }

    /**
     * @en The X-axis spacing between characters in the font clip.
     * @zh 字体切片中字符的X轴方向间隙。
     */
    get spaceX(): number {
        return this._spaceX;
    }

    set spaceX(value: number) {
        this._spaceX = value;
        if (this._direction === "horizontal") this.callLater(this.changeValue);
    }

    /**
     * @en The Y-axis spacing between characters in the font clip.
     * @zh 字体切片中字符的Y轴方向间隙。
     */
    get spaceY(): number {
        return this._spaceY;
    }

    set spaceY(value: number) {
        this._spaceY = value;
        if (!(this._direction === "horizontal")) this.callLater(this.changeValue);
    }

    /**
     * @en Horizontal alignment
     * @zh 水平对齐方式。
     */
    get align(): string {
        return this._align;
    }
    set align(v: string) {
        this._align = v;
        this.callLater(this.changeValue);
    }

    /**
     * @en Creates an instance of the FontClip.
     * @param skin The skin path for the font clip.
     * @param sheet The content string for the font clip, with spaces representing line breaks.
     * @zh 创建 FontClip 实例。
     * @param skin 字体切片的皮肤路径。
     * @param sheet 字体切片的内容字符串，空格代表换行。
     */
    constructor(skin: string = null, sheet: string = null) {
        super();
        if (skin) this.skin = skin;
        if (sheet) this.sheet = sheet;
    }

    /**
     * @internal
     * @inheritDoc 
     * @override
     */
    _setWidth(value: number) {
        super._setWidth(value);
        this.callLater(this.changeValue);
    }

    /**
     * @internal
     * @inheritDoc 
     * @override
     */
    _setHeight(value: number) {
        super._setHeight(value);
        this.callLater(this.changeValue);
    }

    /**
     * @internal
     * @en Resource loading completed
     * @zh 资源加载完毕
     */
    protected loadComplete(url: string, img: Texture): void {
        super.loadComplete(url, img);
        this.callLater(this.changeValue);
    }

    /**
     * @internal
     * @en Implementation logic after font clip property changes
     * @zh 字体切片属性变化后的实现逻辑
     */
    protected changeValue(): void {
        if (!this._sources) return;
        if (!this._valueArr) return;
        this.graphics.clear(true);
        let texture: Texture;
        texture = this._sources[0];
        if (!texture) return;
        var isHorizontal: boolean = (this._direction === "horizontal");
        if (isHorizontal) {
            this._wordsW = this._valueArr.length * (texture.sourceWidth + this.spaceX);
            this._wordsH = texture.sourceHeight;
        } else {
            this._wordsW = texture.sourceWidth;
            this._wordsH = (texture.sourceHeight + this.spaceY) * this._valueArr.length;
        }
        let dX: number = 0;
        if (this._isWidthSet) {
            switch (this._align) {
                case "center":
                    dX = 0.5 * (this._width - this._wordsW);
                    break;
                case "right":
                    dX = this._width - this._wordsW;
                    break;
                default:
                    dX = 0;
            }
        }

        for (let i = 0, sz = this._valueArr.length; i < sz; i++) {
            let index = this._indexMap[this._valueArr.charAt(i)];
            texture = this._sources[index];
            if (!texture)
                continue;

            if (isHorizontal)
                this.graphics.drawImage(texture, dX + i * (texture.sourceWidth + this.spaceX), 0, texture.sourceWidth, texture.sourceHeight);
            else
                this.graphics.drawImage(texture, 0 + dX, i * (texture.sourceHeight + this.spaceY), texture.sourceWidth, texture.sourceHeight);
        }

        if (!this._isWidthSet) {
            this._widget.resetLayoutX();
            this.callLater(this._sizeChanged);
        }
        if (!this._isHeightSet) {
            this._widget.resetLayoutY();
            this.callLater(this._sizeChanged);
        }
    }

    /**
     * @internal
     * @override
     * @en the width of the font clip.
     * @zh 获得字体切片的宽度。
     */
    protected measureWidth(): number {
        return this._wordsW;
    }

    /**
     * @internal
     * @override
     * @en the height of the font clip.
     * @zh 获得字体切片的高度。
     */
    protected measureHeight(): number {
        return this._wordsH;
    }

    /**
     * @override
     * @en Destroys the FontClip instance and optionally its children.
     * @param destroyChild  Whether to destroy the children of the FontClip.
     * @zh 销毁字体切片实例及其子项（如果指定）。
     * @param destroyChild 是否销毁字体切片的子节点。
     */
    destroy(destroyChild: boolean = true): void {
        this._valueArr = null;
        this._indexMap = null;
        this.graphics.clear(true);

        super.destroy(destroyChild);
    }
}