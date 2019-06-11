import { Vector2 } from "../math/Vector2";
import { Mesh } from "../resource/models/Mesh";
import { Texture2D } from "laya/resource/Texture2D";
/**
 * <code>HeightMap</code> 类用于实现高度图数据。
 */
export declare class HeightMap {
    /** @private */
    private static _tempRay;
    /**
     * 从网格精灵生成高度图。
     * @param meshSprite 网格精灵。
     * @param width	高度图宽度。
     * @param height 高度图高度。
     * @param outCellSize 输出 单元尺寸。
     */
    static creatFromMesh(mesh: Mesh, width: number, height: number, outCellSize: Vector2): HeightMap;
    /**
     * 从图片生成高度图。
     * @param image 图片。
     * @param maxHeight 最小高度。
     * @param maxHeight 最大高度。
     */
    static createFromImage(texture: Texture2D, minHeight: number, maxHeight: number): HeightMap;
    /** @private */
    private static _getPosition;
    /** @private */
    private _datas;
    /** @private */
    private _w;
    /** @private */
    private _h;
    /** @private */
    private _minHeight;
    /** @private */
    private _maxHeight;
    /**
     * 获取宽度。
     * @return value 宽度。
     */
    readonly width: number;
    /**
     * 获取高度。
     * @return value 高度。
     */
    readonly height: number;
    /**
     * 最大高度。
     * @return value 最大高度。
     */
    readonly maxHeight: number;
    /**
     * 最大高度。
     * @return value 最大高度。
     */
    readonly minHeight: number;
    /**
     * 创建一个 <code>HeightMap</code> 实例。
     * @param width 宽度。
     * @param height 高度。
     * @param minHeight 最大高度。
     * @param maxHeight 最大高度。
     */
    constructor(width: number, height: number, minHeight: number, maxHeight: number);
    /** @private */
    private _inBounds;
    /**
     * 获取高度。
     * @param row 列数。
     * @param col 行数。
     * @return 高度。
     */
    getHeight(row: number, col: number): number;
}
