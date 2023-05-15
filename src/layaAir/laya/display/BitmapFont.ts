import { Rectangle } from "../maths/Rectangle"
import { Texture } from "../resource/Texture"
import { Handler } from "../utils/Handler"
import { ILaya } from "../../ILaya";
import { Loader } from "../net/Loader";
import { Resource } from "../resource/Resource";
import { XML } from "../html/XML";

/**
 * <code>BitmapFont</code> 是位图字体类，用于定义位图字体信息。
 * 字体制作及使用方法，请参考文章
 * @see http://ldc2.layabox.com/doc/?nav=ch-js-1-2-5
 */
export class BitmapFont extends Resource {
    private _texture: Texture;
    private _fontCharDic: any = {};
    private _fontWidthMap: any = {};
    private _maxWidth: number = 0;
    private _spaceWidth: number = 10;
    private _padding: any[];

    /**当前位图字体字号，使用时，如果字号和设置不同，并且autoScaleSize=true，则按照设置字号比率进行缩放显示。*/
    fontSize: number = 12;
    /**表示是否根据实际使用的字体大小缩放位图字体大小。*/
    autoScaleSize: boolean = false;
    /**字符间距（以像素为单位）。*/
    letterSpacing: number = 0;

    /**
     * 通过指定位图字体文件路径，加载位图字体文件，加载完成后会自动解析。
     * @param	path		位图字体文件的路径。
     * @param	complete	加载并解析完成的回调。
     */
    static loadFont(path: string, complete: Handler): void {
        ILaya.loader.load(path, Loader.FONT).then(font => {
            complete && complete.runWith(font);
        });
    }

    constructor() {
        super(false);
    }

    /**
     * 解析字体文件。
     * @param	xml			字体文件XML。
     * @param	texture		字体的纹理。
     */
    parseFont(xml: XML, texture: Texture): void {
        if (xml == null || texture == null) return;
        this._texture = texture;
        texture._addReference();

        let tScale: number = 1;
        let tInfo = xml.getNode("info");
        this.fontSize = tInfo.getAttrInt("size", 12);
        this.autoScaleSize = tInfo.getAttrBool("autoScaleSize");

        let tPadding: string = tInfo.getAttrString("padding", "");
        let tPaddingArray: any[] = tPadding.split(",");
        this._padding = [parseInt(tPaddingArray[0]), parseInt(tPaddingArray[1]), parseInt(tPaddingArray[2]), parseInt(tPaddingArray[3])];

        let chars = xml.getNode("chars")?.elements("char") || [];
        let maxWidth = 0;
        let fontCharDic = this._fontCharDic;
        let fontWidthMap = this._fontWidthMap;
        let letterSpacing = this.letterSpacing;
        for (let i = 0; i < chars.length; i++) {
            let ct = chars[i];
            let tId = ct.getAttrInt("id");

            let xOffset = ct.getAttrInt("xoffset") / tScale;
            let yOffset = ct.getAttrInt("yoffset") / tScale;
            let xAdvance = ct.getAttrInt("xadvance") / tScale;

            let region = new Rectangle();
            region.x = ct.getAttrInt("x");
            region.y = ct.getAttrInt("y");
            region.width = ct.getAttrInt("width");
            region.height = ct.getAttrInt("height");

            let tTexture = Texture.create(texture, region.x, region.y, region.width, region.height, xOffset, yOffset);
            maxWidth = Math.max(maxWidth, xAdvance + letterSpacing);
            fontCharDic[tId] = tTexture;
            fontWidthMap[tId] = xAdvance;
        }

        if (maxWidth > 0)
            this._maxWidth = maxWidth;
        else
            this._maxWidth = this.fontSize;
    }

    /**
     * 销毁位图字体，调用Text.unregisterBitmapFont 时，默认会销毁。
     */
    protected _disposeResource(): void {
        if (this._texture) {
            for (let k in this._fontCharDic) {
                this._fontCharDic[k].destroy();
            }
            this._texture._removeReference();
            this._fontCharDic = null;
            this._fontWidthMap = null;
            this._texture = null;
            this._padding = null;
        }
    }

    /**
     * 设置空格的宽（如果字体库有空格，这里就可以不用设置了）。
     * @param	spaceWidth 宽度，单位为像素。
     */
    setSpaceWidth(spaceWidth: number): void {
        this._spaceWidth = spaceWidth;
    }

    /**
     * 获取指定字符的字体纹理对象。
     * @param	code 字符编码。
     * @return 指定的字体纹理对象。
    */
    getCharTexture(code: number): Texture {
        return this._fontCharDic[code];
    }

    /**
     * 获取指定字符的宽度。
     * @param	code 字符编码。
     * @return  宽度。
     */
    getCharWidth(code: number, fontSize?: number): number {
        let w: number;
        if (this._fontWidthMap[code])
            w = this._fontWidthMap[code] + this.letterSpacing;
        else if (code === 32)
            w = this._spaceWidth + this.letterSpacing;
        else
            w = 0;
        if (fontSize != null && this.autoScaleSize)
            w = Math.round(w * (fontSize / this.fontSize));
        return w;
    }

    /**
     * 获取指定文本内容的宽度。
     * @param	text 文本内容。
     * @return  宽度。
     */
    getTextWidth(text: string, fontSize?: number): number {
        let w = 0;
        for (let i = 0, n = text.length; i < n; i++) {
            w += this.getCharWidth(text.charCodeAt(i), fontSize);
        }
        return w;
    }

    /**
     * 获取最大字符宽度。
     */
    getMaxWidth(fontSize?: number): number {
        if (fontSize != null && this.autoScaleSize)
            return Math.round(this._maxWidth * (fontSize / this.fontSize));
        else
            return this._maxWidth;
    }

    /**
     * 获取最大字符高度。
     */
    getMaxHeight(fontSize?: number): number {
        if (fontSize != null && this.autoScaleSize)
            return fontSize;
        else
            return this.fontSize;
    }
}