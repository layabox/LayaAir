import { TextTexture } from "././TextTexture";
import { Point } from "../../maths/Point";
/**
 *  文字贴图的大图集。
 */
export declare class TextAtlas {
    texWidth: number;
    texHeight: number;
    private atlasgrid;
    private protectDist;
    texture: TextTexture;
    charMaps: any;
    static atlasGridW: number;
    constructor();
    setProtecteDist(d: number): void;
    /**
     * 如果返回null，则表示无法加入了
     * 分配的时候优先选择最接近自己高度的节点
     * @param	w
     * @param	h
     * @return
     */
    getAEmpty(w: number, h: number, pt: Point): boolean;
    /**
     * 大图集格子单元的占用率，老的也算上了。只是表示这个大图集还能插入多少东西。
     */
    readonly usedRate: number;
    destroy(): void;
    printDebugInfo(): void;
}
