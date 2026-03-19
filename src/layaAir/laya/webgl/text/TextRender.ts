import { TextRenderConfig } from "./TextRenderConfig";
import { type GraphicsRunner } from "../../display/Scene2DSpecial/GraphicsRunner";
import { Browser } from "../../utils/Browser";
import { measureFont } from "./MeasureFont";
import { Texture2D } from "../../resource/Texture2D";
import { TextureFormat } from "../../RenderEngine/RenderEnum/TextureFormat";
import { FilterMode } from "../../RenderEngine/RenderEnum/FilterMode";
import { WrapMode } from "../../RenderEngine/RenderEnum/WrapMode";
import { LayaGL } from "../../layagl/LayaGL";
import { AtlasGrid, IAtlasRegion } from "./AtlasGrid";
import { ILaya } from "../../../ILaya";
import { ColorUtils } from "../../utils/ColorUtils";


/** @ignore @blueprintIgnore */
export class TextRender {
    readonly owner: GraphicsRunner;
    readonly canvas: HTMLCanvasElement;
    readonly ctx: CanvasRenderingContext2D;
    readonly fontMap: Map<string, IFontInfo> = new Map();
    readonly textAtlases: ITextAtlas[] = [];
    readonly charMap: Map<string, ITextRenderInfo> = new Map();
    readonly textMap: Map<string, ITextRenderInfo> = new Map();

    private freeRegions: IAtlasRegionWithOwner[] = [];
    private freeIsoTextures: Texture2D[] = [];

    constructor(owner: GraphicsRunner) {
        this.owner = owner;

        let canvas = <HTMLCanvasElement>Browser.createElement("canvas");
        this.canvas = canvas;
        canvas.width = 1024;
        canvas.height = 512;
        if (Browser.isDomSupported) {
            //这个canvas是用来获取字体渲染结果的。由于不可见canvas的字体不能小于12，所以要加到body上
            //为了避免被发现，设一个在屏幕外的绝对位置。
            canvas.style.left = "-10000px";
            canvas.style.position = "absolute";
            Browser.document.body.appendChild(canvas);
        }
        this.ctx = canvas.getContext('2d', { willReadFrequently: true });
        ILaya.systemTimer.loop(5000, this, this.GC); //5秒清理一次
    }

    draw(text: string, x: number, y: number,
        font: string, fontSize: number, bold: boolean, italic: boolean,
        color: string, stroke: number, strokeColor: string,
        charMode: boolean, preMeasuredWidth: number, renderInfo?: ITextRenderInfo[]): ITextRenderInfo[] {

        let hasEmoji = emojiTest.test(text);
        let curFont = this.getFont(font);
        let info = bold ? curFont.bold : curFont.normal;
        let k = fontSize / TextRenderConfig.standardFontSize;
        fontSizeOffX = Math.ceil(info.xoff * k);
        emojiAdjustY = hasEmoji ? Math.ceil(info.eoff * k) : 0;
        fontSizeOffY = Math.ceil(info.yoff * k) + emojiAdjustY;
        fontSizeH = Math.ceil((hasEmoji ? info.ebbxh : info.bbxh) * k);
        fontScale = TextRenderConfig.fontScale;
        let italicDeg = italic ? 13 : 0;
        let cacheKey = (curFont.id * 10000) + fontSize + (bold ? "b_" : "_");
        let colorNum = ColorUtils.create(color).numColor;
        //let tint = stroke > 0 || !charMode && hasEmoji; //染色的条件： 有描边 或 非字符模式下且包含emoji
        let tint = true; //这种优化机制存在变粗的问题，先屏蔽，统一染色
        if (tint)
            cacheKey += colorNum + "_";
        if (stroke > 0)
            cacheKey += ColorUtils.create(strokeColor).numColor + "_" + stroke + "_";

        let ctx = this.ctx;
        ctx.font = (bold ? "bold " : "") + fontSize + "px " + font;
        ctx.setTransform(fontScale, 0, 0, fontScale, 0, 0);
        ctx.textBaseline = "middle";
        ctx.fillStyle = tint ? color : 'white';
        if (stroke > 0) {
            //设置文本描边为圆角模式，默认值miter会导致在某些字体的转角字符出现尖刺现象。
            ctx.lineJoin = "round";
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = stroke;
        }
        else {
            ctx.lineWidth = 0;
        }

        if (!renderInfo)
            renderInfo = [];
        let drawColor = tint ? 0xffffffff : colorNum;

        if ((charMode || TextRenderConfig.forceSplitRender) && !TextRenderConfig.forceWholeRender) {
            let mat = this.owner._curMat;
            renderInfo.length > 0 && this.freeRenderInfo(renderInfo);

            for (let i = 0, len = text.length; i < len; i++) {
                let cc = text.charAt(i);
                let ccode = cc.charCodeAt(0);

                if (ccode >= 0xD800 && ccode <= 0xDBFF && i + 1 < len) //high surrogate
                    cc += text.charAt(++i);

                let key = cacheKey + cc;
                let ri = this.charMap.get(key);
                if (!ri) {
                    let width = ctx.measureText(cc).width;
                    ri = this.drawOffscreen(ctx, cc, width, fontSize, stroke, true);
                    ri.key = key;
                    ri.isChar = true;
                    this.charMap.set(key, ri);
                }
                ri.ref++;
                renderInfo.push(ri);

                this.owner._inner_drawTexture(ri.tex, ri.tex.id,
                    x + ri.x, y + ri.y, ri.w, ri.h,
                    mat, ri.uv, 1.0,
                    cc.length > 1 ? 0xffffffff : drawColor, //emoji总是用白色绘制
                    italicDeg, true);

                x += ri.advance;
            }
        }
        else {
            let key = cacheKey + text;
            let ri = this.textMap.get(key);
            //先引用住，再清理，对于同一个文本仅改色或者重绘时，有极大优化
            ri && ri.ref++;
            renderInfo[0] && this.free(renderInfo[0]);

            if (!ri) {
                if (preMeasuredWidth == null)
                    preMeasuredWidth = ctx.measureText(text).width;
                ri = this.drawOffscreen(ctx, text, preMeasuredWidth, fontSize, stroke, false);
                ri.key = key;
                ri.ref = 1;
                this.textMap.set(key, ri);
            }
            renderInfo[0] = ri;

            this.owner._inner_drawTexture(ri.tex, ri.tex.id,
                x + ri.x, y + ri.y, ri.w, ri.h,
                this.owner._curMat, ri.uv, 1.0, drawColor, italicDeg, true);

            for (let i = 1, n = renderInfo.length; i < n; i++)
                this.free(renderInfo[i]);
            renderInfo.length = 1;
        }

        return renderInfo;
    }

    private drawOffscreen(ctx: CanvasRenderingContext2D, text: string, width: number, height: number, lineWidth: number, charMode: boolean): ITextRenderInfo {
        let margin = height / 3 | 0 + lineWidth;
        let rectX = ((margin - fontSizeOffX - lineWidth) * fontScale | 0) - blockGap;
        let rectY = ((margin - fontSizeOffY - lineWidth) * fontScale | 0) - blockGap;
        let correctionW = height * 0.08; //某些字体（例如华文行楷，华文隶书，自带斜体效果，测算的宽度可能不够，这里补一些，0.08是经验值
        let rectW = Math.ceil((width + fontSizeOffX + lineWidth * 2 + correctionW) * fontScale) + blockGap * 2;
        let rectH = Math.ceil((fontSizeH + lineWidth * 2) * fontScale) + blockGap * 2;

        let needCanvW = Math.min(rectW + Math.ceil(margin * 2 * fontScale), TextRenderConfig.maxCanvasWidth);
        let needCanvH = Math.min(rectH + Math.ceil(margin * 2 * fontScale), TextRenderConfig.maxCanvasWidth);
        if (needCanvW > this.canvas.width || needCanvH > this.canvas.height)
            this.resizeCanvas(ctx, needCanvW, needCanvH);

        ctx.clearRect(0, 0, Math.ceil(needCanvW / fontScale), Math.ceil(needCanvH / fontScale));
        lineWidth > 0 && ctx.strokeText(text, margin, margin + height / 2);
        ctx.fillText(text, margin, margin + height / 2);

        let imgdt = ctx.getImageData(rectX, rectY, rectW, rectH);

        let ri: ITextRenderInfo = {
            x: - (fontSizeOffX + lineWidth),
            //这里不应该包含fontSizeOffY，否则文字绘制会向上突出
            //y: - (fontSizeOffY + lineWidth),
            y: - lineWidth - emojiAdjustY,
            w: (imgdt.width - blockGap * 2) / fontScale,
            h: (imgdt.height - blockGap * 2) / fontScale,
            advance: width,
            uv: new Array(8),
            tex: null,
            region: null,
            ref: 0
        };

        if (imgdt.width > TextRenderConfig.atlasWidth || imgdt.height > TextRenderConfig.atlasWidth
            || !charMode && TextRenderConfig.noAtlas) { //当需要的贴图过大时，使用独立贴图，不加入图集
            ri.tex = this.createIsoTexture(imgdt.width, imgdt.height);
            this.setPixelsToTexture(imgdt, ri.tex, 0, 0, ri.uv);
        } else {
            ri.region = this.addToAtlas(imgdt.width, imgdt.height);
            ri.tex = ri.region.owner.tex;
            this.setPixelsToTexture(imgdt, ri.tex, ri.region.x, ri.region.y, ri.uv);
        }

        return ri;
    }

    private resizeCanvas(ctx: CanvasRenderingContext2D, newWidth: number, newHeight: number): void {
        newWidth = 512 * Math.ceil(newWidth / 512); //以512为步长增长
        newHeight = 512 * Math.ceil(newHeight / 512);

        //改变Canvas大小会导致状态丢失，所以要保存并恢复相关状态
        let fontStr = ctx.font;
        let fillStyle = ctx.fillStyle;
        let strokeStyle = ctx.strokeStyle;
        let lineWidth = ctx.lineWidth;

        this.canvas.width = newWidth;
        this.canvas.height = newHeight;

        ctx.setTransform(fontScale, 0, 0, fontScale, 0, 0);
        ctx.font = fontStr;
        ctx.textBaseline = "middle";
        ctx.lineJoin = "round";
        ctx.fillStyle = fillStyle;
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = lineWidth;
    }

    private createIsoTexture(w: number, h: number): Texture2D {
        let i = this.freeIsoTextures.findIndex(t => t != null && t.width >= w && t.width <= w + h && t.height >= h && t.height <= h + h);
        if (i !== -1) {
            let tex = this.freeIsoTextures[i];
            this.freeIsoTextures[i] = null; //不用splice，提高性能
            if (++freeIsoTextureNullCnt > 50) {
                this.freeIsoTextures = this.freeIsoTextures.filter(t => t != null);
                freeIsoTextureNullCnt = 0;
            }
            return tex;
        }
        else
            return this.createTextTexture(w, h);
    }

    private addToAtlas(w: number, h: number): IAtlasRegionWithOwner {
        let i = this.freeRegions.findIndex(r => r != null && r.w >= w && r.w <= w + h && r.h >= h && r.h <= h + h);
        if (i !== -1) {
            let region = this.freeRegions[i];
            this.freeRegions[i] = null; //不用splice，提高性能
            if (++freeRegionNullCnt > 50) {
                this.freeRegions = this.freeRegions.filter(r => r != null);
                freeRegionNullCnt = 0;
            }
            region.owner.ref++;
            return region;
        }

        let region: IAtlasRegionWithOwner;
        for (let ele of this.textAtlases) {
            if (region = ele.grid.allocate(w, h) as IAtlasRegionWithOwner) {
                region.owner = ele;
                ele.ref++;
                return region;
            }
        }

        let size = TextRenderConfig.atlasWidth;
        let atlas = {
            tex: this.createTextTexture(size, size),
            grid: new AtlasGrid(size, size, TextRenderConfig.atlasGridW),
            ref: 1
        };
        this.textAtlases.push(atlas);
        region = atlas.grid.allocate(w, h) as IAtlasRegionWithOwner;
        region.owner = atlas;
        return region;
    }

    private createTextTexture(width: number, height: number) {
        let tex = new Texture2D(width, height, TextureFormat.R8G8B8A8, false, false, true, true);
        tex.name = "TextTexture";
        tex.setPixelsData(null, true, false);
        tex.lock = true;//防止被资源管理清除
        tex.filterMode = FilterMode.Bilinear;
        tex.wrapModeU = WrapMode.Clamp;
        tex.wrapModeV = WrapMode.Clamp;

        return tex;
    }

    private setPixelsToTexture(imgdt: ImageData, tex: Texture2D, x: number, y: number, outUv: number[]) {
        let data: Uint8Array | Uint8ClampedArray = imgdt.data;
        if (data instanceof Uint8ClampedArray) //未知原因，是不是WebGL的texSubImage2D不支持Uint8ClampedArray？
            data = new Uint8Array(data.buffer);

        LayaGL.textureContext.setTextureSubPixelsData(tex._texture, data, 0, false, x, y, imgdt.width, imgdt.height, true, false);

        let u0 = (x + blockGap) / tex.width;
        let v0 = (y + blockGap) / tex.height;
        let u1 = (x + imgdt.width - blockGap) / tex.width;
        let v1 = (y + imgdt.height - blockGap) / tex.height;
        outUv[0] = u0, outUv[1] = v0;
        outUv[2] = u1, outUv[3] = v0;
        outUv[4] = u1, outUv[5] = v1;
        outUv[6] = u0, outUv[7] = v1;
    }

    freeRenderInfo(arr: ITextRenderInfo[]): void {
        for (let ri of arr) {
            this.free(ri);
        }
        arr.length = 0;
    }

    private free(ri: ITextRenderInfo): void {
        ri.ref--;

        if (ri.ref > 0)
            return;

        if (ri.isChar) {
            if (ri.ref === 0) //ref要到-1才清理，一般是在GC中请求才会
                return;

            this.charMap.delete(ri.key);
        }
        else
            this.textMap.delete(ri.key);

        if (ri.region != null) {
            let atlas = ri.region.owner;
            atlas.ref--;
            if (atlas.ref === 0) {
                if (this.freeRegions.length > 0)
                    this.freeRegions = this.freeRegions.filter(r => r != null && r.owner !== atlas);
                freeRegionNullCnt = 0;

                //看看是不是已经有空白的了。只保留一个空白的，避免占用过多内存
                if (this.textAtlases.length > 2 && this.textAtlases.findIndex((a) => a.ref === 0) !== -1) {
                    atlas.tex.destroy();
                    let idx = this.textAtlases.indexOf(atlas);
                    this.textAtlases.splice(idx, 1);
                }
                else { //可以保留
                    atlas.grid.reset();
                }
            }
            else
                this.freeRegions.push(ri.region);
        }
        else {
            this.freeIsoTextures.push(ri.tex);
        }
    }

    getFontHeight(font: string, fontSize: number, bold?: boolean): number {
        let inst = this.getFont(font);
        let k = fontSize / TextRenderConfig.standardFontSize;
        let info = bold ? inst.bold : inst.normal;
        return Math.ceil(info.bbxh * k);
    }

    private getFont(font: string): IFontInfo {
        let inst = this.fontMap.get(font);
        if (inst == null) {
            inst = {
                id: fontIdCounter++,
                normal: measureFont(this.ctx, font, false),
                bold: measureFont(this.ctx, font, true)
            }
            this.fontMap.set(font, inst);
            //console.debug("font registered", font, inst.normal, inst.bold);
        }
        return inst;
    }

    /** @internal */
    onFontScaleChanged(): void {
        this.textMap.clear();

        toClearChars.length = 0;
        for (let [_, ri] of this.charMap) {
            if (ri.ref === 0)
                toClearChars.push(ri);
            else
                ri.ref--; //先减掉一个引用，那么它在free时就不会被跳过
        }
        for (let ri of toClearChars) {
            this.free(ri);
        }
        this.charMap.clear(); //没引用的已经清理掉，有引用的可以等free时清理
    }

    GC(): void {
        if (this.freeIsoTextures.length > 0) {
            for (let tex of this.freeIsoTextures)
                tex?.destroy();
            this.freeIsoTextures.length = 0;
            freeIsoTextureNullCnt = 0;
        }

        toClearChars.length = 0;
        for (let [_, ri] of this.charMap) {
            if (ri.ref === 0)
                toClearChars.push(ri);
        }
        for (let ri of toClearChars) {
            this.free(ri);
        }
    }
}

const blockGap = 1;
const emojiTest = /[\uD800-\uDBFF][\uDC00-\uDFFF]/;

var fontIdCounter = 0;
var fontScale = 1.0;
var fontSizeH = 0;
var fontSizeOffX = 0;
var fontSizeOffY = 0;
var emojiAdjustY = 0;

var freeRegionNullCnt: number = 0;
var freeIsoTextureNullCnt: number = 0;

var toClearChars: ITextRenderInfo[] = [];

interface IFontInfo {
    id: number;
    normal: {
        xoff: number;
        yoff: number;
        bbxw: number;
        bbxh: number;
        eoff: number;
        ebbxh: number;
    };
    bold: {
        xoff: number;
        yoff: number;
        bbxw: number;
        bbxh: number;
        eoff: number;
        ebbxh: number;
    };
}

interface ITextRenderInfo {
    x: number;
    y: number;
    w: number;
    h: number;
    advance: number;
    uv: number[];
    tex: Texture2D;
    region: IAtlasRegion & { owner: ITextAtlas };
    key?: string;
    ref: number;
    isChar?: boolean;
}

interface IAtlasRegionWithOwner extends IAtlasRegion {
    owner: ITextAtlas;
}

interface ITextAtlas {
    tex: Texture2D;
    grid: AtlasGrid;
    ref: number;
}