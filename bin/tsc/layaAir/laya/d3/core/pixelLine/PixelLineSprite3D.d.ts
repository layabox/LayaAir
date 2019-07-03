import { PixelLineRenderer } from "./PixelLineRenderer";
import { PixelLineData } from "./PixelLineData";
import { RenderableSprite3D } from "../RenderableSprite3D";
import { BaseMaterial } from "../material/BaseMaterial";
import { Color } from "../../math/Color";
import { Vector3 } from "../../math/Vector3";
/**
 * <code>PixelLineSprite3D</code> 类用于像素线渲染精灵。
 */
export declare class PixelLineSprite3D extends RenderableSprite3D {
    /**
     * 获取最大线数量
     * @return  最大线数量。
     */
    /**
    * 设置最大线数量
    * @param	value 最大线数量。
    */
    maxLineCount: number;
    /**
     * 获取线数量。
     * @return 线段数量。
     */
    /**
    * 设置获取线数量。
    * @param	value 线段数量。
    */
    lineCount: number;
    /**
     * 获取line渲染器。
     * @return  line渲染器。
     */
    readonly pixelLineRenderer: PixelLineRenderer;
    /**
     * 创建一个 <code>PixelLineSprite3D</code> 实例。
     * @param maxCount 最大线段数量。
     * @param name 名字。
     */
    constructor(maxCount?: number, name?: string);
    /**
     * @inheritDoc
     */
    _changeRenderObjects(sender: PixelLineRenderer, index: number, material: BaseMaterial): void;
    /**
     * 增加一条线。
     * @param	startPosition  初始点位置
     * @param	endPosition	   结束点位置
     * @param	startColor	   初始点颜色
     * @param	endColor	   结束点颜色
     */
    addLine(startPosition: Vector3, endPosition: Vector3, startColor: Color, endColor: Color): void;
    /**
     * 添加多条线段。
     * @param	lines  线段数据
     */
    addLines(lines: PixelLineData[]): void;
    /**
     * 移除一条线段。
     * @param index 索引。
     */
    removeLine(index: number): void;
    /**
     * 更新线
     * @param	index  		   索引
     * @param	startPosition  初始点位置
     * @param	endPosition	   结束点位置
     * @param	startColor	   初始点颜色
     * @param	endColor	   结束点颜色
     */
    setLine(index: number, startPosition: Vector3, endPosition: Vector3, startColor: Color, endColor: Color): void;
    /**
     * 获取线段数据
     * @param out 线段数据。
     */
    getLine(index: number, out: PixelLineData): void;
    /**
     * 清除所有线段。
     */
    clear(): void;
}
