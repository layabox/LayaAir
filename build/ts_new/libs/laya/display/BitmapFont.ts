import { Sprite } from "./Sprite";
import { Rectangle } from "../maths/Rectangle"
import { Texture } from "../resource/Texture"
import { Handler } from "../utils/Handler"
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";
/**
 * <code>BitmapFont</code> 是位图字体类，用于定义位图字体信息。
 * 字体制作及使用方法，请参考文章
 * @see http://ldc2.layabox.com/doc/?nav=ch-js-1-2-5
 */
export class BitmapFont {
    private _texture: Texture;
    private _fontCharDic: any = {};
    private _fontWidthMap: any = {};
    private _complete: Handler;
    private _path: string;
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
    loadFont(path: string, complete: Handler): void {
        this._path = path;
        this._complete = complete;

        if (!path || path.indexOf(".fnt") === -1) {
            console.error('Bitmap font configuration information must be a ".fnt" file');
            return;
        }
        ILaya.loader.load([{ url: path, type: ILaya.Loader.XML }, { url: path.replace(".fnt", ".png"), type: ILaya.Loader.IMAGE }], Handler.create(this, this._onLoaded));
    }

    /**
     * @private
     */
    private _onLoaded(): void {
        this.parseFont(ILaya.Loader.getRes(this._path), ILaya.Loader.getRes(this._path.replace(".fnt", ".png")));
        this._complete && this._complete.run();
    }

    /**
     * 解析字体文件。
     * @param	xml			字体文件XML。
     * @param	texture		字体的纹理。
     */
    parseFont(xml: XMLDocument, texture: Texture): void {
        if (xml == null || texture == null) return;
        this._texture = texture;
        var tX: number = 0;
        var tScale: number = 1;

        var tInfo: any = xml.getElementsByTagName("info");
        if (!tInfo[0].getAttributeNode) {
            return this.parseFont2(xml, texture);
        }
        this.fontSize = parseInt(tInfo[0].getAttributeNode("size").nodeValue);

        var tPadding: string = tInfo[0].getAttributeNode("padding").nodeValue;
        var tPaddingArray: any[] = tPadding.split(",");
        this._padding = [parseInt(tPaddingArray[0]), parseInt(tPaddingArray[1]), parseInt(tPaddingArray[2]), parseInt(tPaddingArray[3])];

        var chars = xml.getElementsByTagName("char");
        var i: number = 0;
        for (i = 0; i < chars.length; i++) {
            var tAttribute: any = chars[i];
            var tId: number = parseInt(tAttribute.getAttributeNode("id").nodeValue);

            var xOffset: number = parseInt(tAttribute.getAttributeNode("xoffset").nodeValue) / tScale;
            var yOffset: number = parseInt(tAttribute.getAttributeNode("yoffset").nodeValue) / tScale;
            var xAdvance: number = parseInt(tAttribute.getAttributeNode("xadvance").nodeValue) / tScale;

            var region: Rectangle = new Rectangle();
            region.x = parseInt(tAttribute.getAttributeNode("x").nodeValue);
            region.y = parseInt(tAttribute.getAttributeNode("y").nodeValue);
            region.width = parseInt(tAttribute.getAttributeNode("width").nodeValue);
            region.height = parseInt(tAttribute.getAttributeNode("height").nodeValue);

            var tTexture: Texture = Texture.create(texture, region.x, region.y, region.width, region.height, xOffset, yOffset);
            this._maxWidth = Math.max(this._maxWidth, xAdvance + this.letterSpacing);
            this._fontCharDic[tId] = tTexture;
            this._fontWidthMap[tId] = xAdvance;
        }
    }

    /**
     * 解析字体文件。
     * @param	xml			字体文件XML。
     * @param	texture		字体的纹理。
     */
    parseFont2(xml: XMLDocument, texture: Texture): void {
        if (xml == null || texture == null) return;
        this._texture = texture;
        var tX: number = 0;
        var tScale: number = 1;

        var tInfo: any = xml.getElementsByTagName("info");
        this.fontSize = parseInt(tInfo[0].attributes["size"].nodeValue);

        var tPadding: string = tInfo[0].attributes["padding"].nodeValue;
        var tPaddingArray: any[] = tPadding.split(",");
        this._padding = [parseInt(tPaddingArray[0]), parseInt(tPaddingArray[1]), parseInt(tPaddingArray[2]), parseInt(tPaddingArray[3])];

        var chars = xml.getElementsByTagName("char");
        var i: number = 0;
        for (i = 0; i < chars.length; i++) {
            var tAttribute = chars[i].attributes;
            var tId: number = parseInt((tAttribute as any)["id"].nodeValue);

            var xOffset: number = parseInt((tAttribute as any)["xoffset"].nodeValue) / tScale;
            var yOffset: number = parseInt((tAttribute as any)["yoffset"].nodeValue) / tScale;

            var xAdvance: number = parseInt((tAttribute as any)["xadvance"].nodeValue) / tScale;

            var region: Rectangle = new Rectangle();
            region.x = parseInt((tAttribute as any)["x"].nodeValue);
            region.y = parseInt((tAttribute as any)["y"].nodeValue);
            region.width = parseInt((tAttribute as any)["width"].nodeValue);
            region.height = parseInt((tAttribute as any)["height"].nodeValue);

            var tTexture: Texture = Texture.create(texture, region.x, region.y, region.width, region.height, xOffset, yOffset);
            this._maxWidth = Math.max(this._maxWidth, xAdvance + this.letterSpacing);
            this._fontCharDic[tId] = tTexture;
            this._fontWidthMap[tId] = xAdvance;
        }
    }
    /**
     * 获取指定字符的字体纹理对象。
     * @param	char 字符。
     * @return 指定的字体纹理对象。
     */
    getCharTexture(char: string): Texture {
        return this._fontCharDic[char.charCodeAt(0)];
    }

    /**
     * 销毁位图字体，调用Text.unregisterBitmapFont 时，默认会销毁。
     */
    destroy(): void {
        if (this._texture) {
            for (var p in this._fontCharDic) {
                var tTexture: Texture = this._fontCharDic[p];
                if (tTexture) tTexture.destroy();
            }
            this._texture.destroy();
            this._fontCharDic = null;
            this._fontWidthMap = null;
            this._texture = null;
            this._complete = null;
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
     * 获取指定字符的宽度。
     * @param	char 字符。
     * @return  宽度。
     */
    getCharWidth(char: string): number {
        var code: number = char.charCodeAt(0);
        if (this._fontWidthMap[code]) return this._fontWidthMap[code] + this.letterSpacing;
        if (char === " ") return this._spaceWidth + this.letterSpacing;
        return 0;
    }

    /**
     * 获取指定文本内容的宽度。
     * @param	text 文本内容。
     * @return  宽度。
     */
    getTextWidth(text: string): number {
        var tWidth: number = 0;
        for (var i: number = 0, n: number = text.length; i < n; i++) {
            tWidth += this.getCharWidth(text.charAt(i));
        }
        return tWidth;
    }

    /**
     * 获取最大字符宽度。
     */
    getMaxWidth(): number {
        return this._maxWidth;
    }

    /**
     * 获取最大字符高度。
     */
    getMaxHeight(): number {
        return this.fontSize;
    }

    /**
     * @internal
     * 将指定的文本绘制到指定的显示对象上。
     */
    _drawText(text: string, sprite: Sprite, drawX: number, drawY: number, align: string, width: number): void {
        var tWidth: number = this.getTextWidth(text);
        var tTexture: Texture;
        var dx: number = 0;
        align === "center" && (dx = (width - tWidth) / 2);
        align === "right" && (dx = (width - tWidth));
        var tx: number = 0;
        for (var i: number = 0, n: number = text.length; i < n; i++) {
            tTexture = this.getCharTexture(text.charAt(i));
            if (tTexture) {
                sprite.graphics.drawImage(tTexture, drawX + tx + dx, drawY);
                tx += this.getCharWidth(text.charAt(i));
            }
        }
    }
}


ClassUtils.regClass("laya.display.BitmapFont", BitmapFont);
ClassUtils.regClass("Laya.BitmapFont", BitmapFont);