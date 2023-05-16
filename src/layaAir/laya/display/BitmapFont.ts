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
    texture: Texture;
    dict: Record<string, BMGlyph> = {};

    padding: any[];

    /**当前位图字体字号，使用时，如果字号和设置不同，并且autoScaleSize=true，则按照设置字号比率进行缩放显示。*/
    fontSize: number = 12;
    /**表示是否根据实际使用的字体大小缩放位图字体大小。*/
    autoScaleSize: boolean = false;
    tint: boolean = true;
    maxWidth: number = 0;
    lineHeight: number;

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

        let tScale: number = 1;
        let tInfo = xml.getNode("info");
        this.fontSize = tInfo.getAttrInt("size", 12);
        this.autoScaleSize = tInfo.getAttrBool("autoScaleSize");
        this.lineHeight = this.fontSize;

        let tPadding: string = tInfo.getAttrString("padding", "");
        let tPaddingArray: any[] = tPadding.split(",");
        this.padding = [parseInt(tPaddingArray[0]), parseInt(tPaddingArray[1]), parseInt(tPaddingArray[2]), parseInt(tPaddingArray[3])];

        let chars = xml.getNode("chars")?.elements("char") || [];
        let maxWidth = 0;
        let dict = this.dict;
        for (let i = 0; i < chars.length; i++) {
            let ct = chars[i];
            let tId = ct.getAttrInt("id");

            let xOffset = ct.getAttrInt("xoffset") / tScale;
            let yOffset = ct.getAttrInt("yoffset") / tScale;
            let advance = ct.getAttrInt("xadvance") / tScale;

            let x = ct.getAttrInt("x");
            let y = ct.getAttrInt("y");
            let width = ct.getAttrInt("width");
            let height = ct.getAttrInt("height");

            let tTexture = Texture.create(texture, x, y, width, height, xOffset, yOffset);
            maxWidth = Math.max(maxWidth, advance);
            dict[tId] = { x: 0, y: 0, width, height, advance, texture: tTexture };
        }

        if (maxWidth > 0)
            this.maxWidth = maxWidth;
        else
            this.maxWidth = this.fontSize;

        if (!dict[32]) //space
            dict[32] = { x: 0, y: 0, advance: Math.floor(this.fontSize * 0.5) };
    }

    /**
     * 销毁位图字体，调用Text.unregisterBitmapFont 时，默认会销毁。
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
     */
    getMaxWidth(fontSize?: number): number {
        if (fontSize != null && this.autoScaleSize)
            return Math.round(this.maxWidth * (fontSize / this.fontSize));
        else
            return this.maxWidth;
    }

    /**
     * 获取最大字符高度。
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