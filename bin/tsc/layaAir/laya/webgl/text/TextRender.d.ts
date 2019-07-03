import { TextAtlas } from "./TextAtlas";
import { Sprite } from "../../display/Sprite";
import { Context } from "../../resource/Context";
import { FontInfo } from "../../utils/FontInfo";
import { HTMLChar } from "../../utils/HTMLChar";
import { WordText } from "../../utils/WordText";
import { CharRenderInfo } from "./CharRenderInfo";
export declare class TextRender {
    static useOldCharBook: boolean;
    static atlasWidth: number;
    static noAtlas: boolean;
    static forceSplitRender: boolean;
    static forceWholeRender: boolean;
    static scaleFontWithCtx: boolean;
    static standardFontSize: number;
    static destroyAtlasDt: number;
    static checkCleanTextureDt: number;
    static destroyUnusedTextureDt: number;
    static cleanMem: number;
    static isWan1Wan: boolean;
    static showLog: boolean;
    static debugUV: boolean;
    /**
     * fontSizeInfo
     * 记录每种字体的像素的大小。标准是32px的字体。由4个byte组成，分别表示[xdist,ydist,w,h]。
     * xdist,ydist 是像素起点到排版原点的距离，都是正的，表示实际数据往左和上偏多少，如果实际往右和下偏，则算作0，毕竟这个只是一个大概
     * 例如 [Arial]=0x00002020, 表示宽高都是32
     */
    private fontSizeInfo;
    static atlasWidth2: number;
    private charRender;
    private static tmpRI;
    private static pixelBBX;
    private mapFont;
    private fontID;
    private mapColor;
    private colorID;
    private fontScaleX;
    private fontScaleY;
    private _curStrPos;
    static textRenderInst: TextRender;
    textAtlases: TextAtlas[];
    private isoTextures;
    private bmpData32;
    private static imgdtRect;
    private lastFont;
    private fontSizeW;
    private fontSizeH;
    private fontSizeOffX;
    private fontSizeOffY;
    private renderPerChar;
    private tmpAtlasPos;
    private textureMem;
    private fontStr;
    static simClean: boolean;
    constructor();
    /**
     * 设置当前字体，获得字体的大小信息。
     * @param	font
     */
    setFont(font: FontInfo): void;
    /**
     * 从string中取出一个完整的char，例如emoji的话要多个
     * 会修改 _curStrPos
     * TODO 由于各种文字中的组合写法，这个需要能扩展，以便支持泰文等
     * @param	str
     * @param	start	开始位置
     */
    getNextChar(str: string): string;
    filltext(ctx: Context, data: string | WordText, x: number, y: number, fontStr: string, color: string, strokeColor: string, lineWidth: number, textAlign: string, underLine?: number): void;
    fillWords(ctx: Context, data: HTMLChar[], x: number, y: number, fontStr: string, color: string, strokeColor: string, lineWidth: number): void;
    _fast_filltext(ctx: Context, data: string | WordText, htmlchars: HTMLChar[], x: number, y: number, font: FontInfo, color: string, strokeColor: string, lineWidth: number, textAlign: number, underLine?: number): void;
    /**
     * 画出重新按照贴图顺序分组的文字。
     * @param	samePagesData
     * @param  startx 保存的数据是相对位置，所以需要加上这个偏移。用相对位置更灵活一些。
     * @param y {int} 因为这个只能画在一行上所以没有必要保存y。所以这里再把y传进来
     */
    protected _drawResortedWords(ctx: Context, startx: number, starty: number, samePagesData: any[]): void;
    /**
     * 检查 txts数组中有没有被释放的资源
     * @param	txts {{ri:CharRenderInfo,...}[][]}
     * @param	startid
     * @return
     */
    hasFreedText(txts: any[]): boolean;
    getCharRenderInfo(str: string, font: FontInfo, color: string, strokeColor: string, lineWidth: number, isoTexture?: boolean): CharRenderInfo;
    /**
     * 添加数据到大图集
     * @param	w
     * @param	h
     * @return
     */
    addBmpData(data: ImageData, ri: CharRenderInfo): TextAtlas;
    /**
     * 清理利用率低的大图集
     */
    GC(): void;
    /**
     * 尝试清理大图集
     */
    cleanAtlases(): void;
    getCharBmp(c: string): any;
    /**
     * 检查当前线是否存在数据
     * @param	data
     * @param	l
     * @param	sx
     * @param	ex
     * @return
     */
    private checkBmpLine;
    /**
     * 根据bmp数据和当前的包围盒，更新包围盒
     * 由于选择的文字是连续的，所以可以用二分法
     * @param	data
     * @param	curbbx 	[l,t,r,b]
     * @param   onlyH 不检查左右
     */
    private updateBbx;
    getFontSizeInfo(font: string): number;
    printDbgInfo(): void;
    showAtlas(n: number, bgcolor: string, x: number, y: number, w: number, h: number): Sprite;
    filltext_native(ctx: Context, data: string | WordText, htmlchars: HTMLChar[], x: number, y: number, fontStr: string, color: string, strokeColor: string, lineWidth: number, textAlign: string, underLine?: number): void;
}
