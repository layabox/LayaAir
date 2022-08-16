import { PixelLineFilter } from "./PixelLineFilter";
import { PixelLineRenderer } from "./PixelLineRenderer";
import { PixelLineData } from "./PixelLineData";
import { RenderableSprite3D } from "../RenderableSprite3D"
import { Color } from "../../math/Color"
import { Vector3 } from "../../math/Vector3"
import { Node } from "../../../display/Node"
import { Sprite3D } from "../Sprite3D";
import { UnlitMaterial } from "../material/UnlitMaterial";

/**
 * <code>PixelLineSprite3D</code> 类用于像素线渲染精灵。
 */
export class PixelLineSprite3D extends RenderableSprite3D {
    /** @private 是否调用active */
    private _isRenderActive: Boolean = false;
    /** @private 是否加入渲染队列*/
    private _isInRenders: Boolean = false;
    /** @internal */
    public _geometryFilter: PixelLineFilter;

    /**
     * 最大线数量
     */
    get maxLineCount(): number {
        return (this._render as PixelLineRenderer).maxLineCount;
    }

    set maxLineCount(value: number) {
        (this._render as PixelLineRenderer).maxLineCount = value;
    }

    /**
     * 获取线数量。
     */
    get lineCount(): number {
        return (this._render as PixelLineRenderer).lineCount;
    }

    /**
     * line渲染器。
     */
    get pixelLineRenderer(): PixelLineRenderer {
        return (<PixelLineRenderer>this._render);
    }

    /**
     * 创建一个 <code>PixelLineSprite3D</code> 实例。
     * @param maxCount 最大线段数量。
     * @param name 名字。
     */
    constructor(maxCount: number = 2, name: string = null) {
        super(name);

        this._render = this.addComponent(PixelLineRenderer);
        this._geometryFilter = (this._render as PixelLineRenderer)._pixelLineFilter;
        (this._render as PixelLineRenderer).maxLineCount = maxCount;
        let material = this._render.material = new UnlitMaterial();
        material.enableVertexColor = true;
    }

    /**
     * 增加一条线。
     * @param	startPosition  初始点位置
     * @param	endPosition	   结束点位置
     * @param	startColor	   初始点颜色
     * @param	endColor	   结束点颜色
     */
    addLine(startPosition: Vector3, endPosition: Vector3, startColor: Color, endColor: Color): void {
        (this._render as PixelLineRenderer).addLine(startPosition, endPosition, startColor, endColor);
    }

    /**
     * 添加多条线段。
     * @param	lines  线段数据
     */
    addLines(lines: PixelLineData[]): void {
        (this._render as PixelLineRenderer).addLines(lines);
    }

    /**
     * 移除一条线段。
     * @param index 索引。
     */
    removeLine(index: number): void {
        (this._render as PixelLineRenderer).removeLine(index);
    }

    /**
     * 更新线
     * @param	index  		   索引
     * @param	startPosition  初始点位置
     * @param	endPosition	   结束点位置
     * @param	startColor	   初始点颜色
     * @param	endColor	   结束点颜色
     */
    setLine(index: number, startPosition: Vector3, endPosition: Vector3, startColor: Color, endColor: Color): void {
        (this._render as PixelLineRenderer).setLine(index, startPosition, endPosition, startColor, endColor);
    }

    /**
     * 获取线段数据
     * @param out 线段数据。
     */
    getLine(index: number, out: PixelLineData): void {
        (this._render as PixelLineRenderer).getLine(index, out);
    }

    /**
     * 清除所有线段。
     */
    clear(): void {
        (this._render as PixelLineRenderer).clear();
    }

    /**
     * @internal
     */
    protected _create(): Node {
        return new Sprite3D();
    }

}

