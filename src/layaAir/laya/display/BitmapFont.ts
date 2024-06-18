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
    /**位图字体纹理 */
    texture: Texture;
    /**位图字体键值对映射 */
    dict: Record<string, BMGlyph> = {};
    /**字体边距 */
    padding: any[];

    /**当前位图字体字号，使用时，如果字号和设置不同，并且autoScaleSize=true，则按照设置字号比率进行缩放显示。*/
    fontSize: number = 12;
    /**表示是否根据实际使用的字体大小缩放位图字体大小。*/
    autoScaleSize: boolean = false;
    /**是否是字体 */
    tint: boolean = true;
    /**最大宽度 */
    maxWidth: number = 0;
    /**行高 */
    lineHeight: number = 12;
    /**字符间隔 */
    letterSpacing = 0;

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
        this.texture = texture;
        texture._addReference();

        let scale: number = 1;
        let info = xml.getNode("info");
        this.fontSize = info.getAttrInt("size", 12);
        this.autoScaleSize = info.getAttrBool("autoScaleSize");
        this.lineHeight = info.getAttrInt("lineHeight", this.fontSize);
        if (this.lineHeight == 0)
            this.lineHeight = this.fontSize;

        let padding: string = info.getAttrString("padding", "");
        let paddingArray: any[] = padding.split(",");
        this.padding = [parseInt(paddingArray[0]), parseInt(paddingArray[1]), parseInt(paddingArray[2]), parseInt(paddingArray[3])];

        let chars = xml.getNode("chars")?.elements("char") || [];
        let maxWidth = 0;
        let dict = this.dict;
        for (let i = 0, n = chars.length; i < n; i++) {
            let ct = chars[i];
            let id = ct.getAttrInt("id");

            let xOffset = ct.getAttrInt("xoffset") / scale;
            let yOffset = ct.getAttrInt("yoffset") / scale;
            let advance = ct.getAttrInt("xadvance") / scale;

            let x = ct.getAttrInt("x");
            let y = ct.getAttrInt("y");
            let width = ct.getAttrInt("width");
            let height = ct.getAttrInt("height");

            let tex = Texture.create(texture, x, y, width, height, xOffset, yOffset);

            if (advance == 0)
                advance = width;
            advance += this.letterSpacing;
            maxWidth = Math.max(maxWidth, advance);

            dict[id] = { x: 0, y: 0, width, height, advance, texture: tex };
        }

        if (maxWidth > 0)
            this.maxWidth = maxWidth;
        else
            this.maxWidth = this.fontSize;

        if (!dict[32]) //space
            dict[32] = { x: 0, y: 0, advance: Math.floor(this.fontSize * 0.5) + this.letterSpacing };
    }

    /**
     * 销毁位图字体，调用Text.unregisterBitmapFont 时，默认会销毁。
     * @internal
     */
    protected _disposeResource(): void {
        if (this.texture) {
            for (let k in this.dict) {
                this.dict[k].texture?.destroy();
            }
            this.texture._removeReference();
            this.dict = null;
            this.texture = null;
            this.padding = null;
        }
    }

    /**
     * 获取指定文本内容的宽度。
     * @param	text 文本内容。
     * @param   fontSize 字体大小
     * @return  宽度。
     */
    getTextWidth(text: string, fontSize?: number): number {
        let w = 0;
        for (let i = 0, n = text.length; i < n; i++) {
            let g = this.dict[text.charCodeAt(i)];
            if (g) {
                let scale = this.autoScaleSize ? (fontSize / this.fontSize) : 1;
                w += Math.round(g.advance * scale);
            }
        }
        return w;
    }

    /**
     * 获取最大字符宽度。
     * @param fontSize 字体大小 
     */
    getMaxWidth(fontSize?: number): number {
        if (fontSize != null && this.autoScaleSize)
            return Math.round(this.maxWidth * (fontSize / this.fontSize));
        else
            return this.maxWidth;
    }

    /**
     * 获取最大字符高度。
     * @param fontSize 字体大小
     */
    getMaxHeight(fontSize?: number): number {
        if (fontSize != null && this.autoScaleSize)
            return Math.round(this.lineHeight * (fontSize / this.fontSize));
        else
            return this.lineHeight;
    }
}

export interface BMGlyph {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    advance?: number;
    texture?: Texture;
}