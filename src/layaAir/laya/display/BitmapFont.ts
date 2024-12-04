import { Texture } from "../resource/Texture"
import { Handler } from "../utils/Handler"
import { ILaya } from "../../ILaya";
import { Loader } from "../net/Loader";
import { Resource } from "../resource/Resource";
import { XML } from "../html/XML";

/**
 * @en BitmapFont is a bitmap font class used to define bitmap font information.
 * @zh BitmapFont 是位图字体类，用于定义位图字体信息。
 */
export class BitmapFont extends Resource {
    /**
     * @en Bitmap font texture
     * @zh 位图字体纹理
     */
    texture: Texture;
    /**
     * @en Bitmap font key-value mapping
     * @zh 位图字体键值对映射
     */
    dict: Record<string, BMGlyph> = {};
    /**
     * @en Font padding
     * @zh 字体边距
     */
    padding: any[];

    /**
     * @en Current bitmap font size. When used, if the font size is different from the setting and autoScaleSize=true, it will be scaled according to the set font size ratio.
     * @zh 当前位图字体字号，使用时，如果字号和设置不同，并且autoScaleSize=true，则按照设置字号比率进行缩放显示。
     */
    fontSize: number = 12;
    /**
     * @en Indicates whether to scale the bitmap font size according to the actual font size used.
     * @zh 表示是否根据实际使用的字体大小缩放位图字体大小。
     */
    autoScaleSize: boolean = false;
    /**
     * @en Whether it is a font
     * @zh 是否是字体
     */
    tint: boolean = true;
    /**
     * @en Maximum width
     * @zh 最大宽度
     */
    maxWidth: number = 0;
    /**
     * @en Line height
     * @zh 行高
     */
    lineHeight: number = 12;
    /**
     * @en Letter spacing
     * @zh 字符间隔
     */
    letterSpacing = 0;

    /**
     * @en Load the bitmap font file by specifying the file path. After loading, it will be automatically parsed.
     * @param path The path of the bitmap font file.
     * @param complete The callback function after loading and parsing are completed.
     * @zh 通过指定位图字体文件路径，加载位图字体文件，加载完成后会自动解析。
     * @param path 位图字体文件的路径。
     * @param complete 加载并解析完成的回调。
     */
    static loadFont(path: string, complete: Handler): void {
        ILaya.loader.load(path, Loader.FONT).then(font => {
            complete && complete.runWith(font);
        });
    }

    /**
     * @en BitmapFont constructor.
     * @zh 位图字体构造方法。
     */
    constructor() {
        super(false);
    }

    /**
     * @en Parse the font file.
     * @param xml The XML of the font file.
     * @param texture The texture of the font.
     * @zh 解析字体文件。
     * @param xml 字体文件XML。
     * @param texture 字体的纹理。
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
     * @en Destroys the bitmap font. This is called by default when Text.unregisterBitmapFont is invoked.
     * @zh 销毁位图字体，调用 Text.unregisterBitmapFont 时，默认会销毁。
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
     * @en Get the width of the specified text content.
     * @param text The text content.
     * @param fontSize The font size.
     * @return The width of the text content.
     * @zh 获取指定文本内容的宽度。
     * @param text 文本内容。
     * @param fontSize 字体大小。
     * @return 文本内容的宽度。
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
     * @en Get the maximum character width.
     * @param fontSize The font size.
     * @zh 获取最大字符宽度。
     * @param fontSize 字体大小。
     */
    getMaxWidth(fontSize?: number): number {
        if (fontSize != null && this.autoScaleSize)
            return Math.round(this.maxWidth * (fontSize / this.fontSize));
        else
            return this.maxWidth;
    }

    /**
     * @en Get the maximum character height.
     * @param fontSize The font size.
     * @zh 获取最大字符高度。
     * @param fontSize 字体大小。
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