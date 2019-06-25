import { Resource } from "../../resource/Resource";
import { CharRenderInfo } from "./CharRenderInfo";
interface ITextRender {
    atlasWidth: number;
    checkCleanTextureDt: number;
    debugUV: boolean;
    isWan1Wan: boolean;
    destroyUnusedTextureDt: number;
}
export declare class TextTexture extends Resource {
    static gTextRender: ITextRender;
    private static pool;
    private static poolLen;
    private static cleanTm;
    _source: any;
    _texW: number;
    _texH: number;
    __destroyed: boolean;
    _discardTm: number;
    genID: number;
    bitmap: any;
    curUsedCovRate: number;
    curUsedCovRateAtlas: number;
    lastTouchTm: number;
    ri: CharRenderInfo;
    constructor(textureW: number, textureH: number);
    recreateResource(): void;
    /**
     *
     * @param	data
     * @param	x			拷贝位置。
     * @param	y
     * @param  uv
     * @return uv数组  如果uv不为空就返回传入的uv，否则new一个数组
     */
    addChar(data: ImageData, x: number, y: number, uv?: any[]): any[];
    /**
     * 玩一玩不支持 getImageData
     * @param	canv
     * @param	x
     * @param	y
     */
    addCharCanvas(canv: any, x: number, y: number, uv?: any[]): any[];
    /**
     * 填充白色。调试用。
     */
    fillWhite(): void;
    discard(): void;
    static getTextTexture(w: number, h: number): TextTexture;
    destroy(): void;
    /**
     * 定期清理
     * 为了简单，只有发生 getAPage 或者 discardPage的时候才检测是否需要清理
     */
    static clean(): void;
    touchRect(ri: CharRenderInfo, curloop: number): void;
    readonly texture: any;
    _getSource(): any;
    drawOnScreen(x: number, y: number): void;
}
export {};
