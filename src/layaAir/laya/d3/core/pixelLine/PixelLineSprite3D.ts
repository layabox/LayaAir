import { PixelLineFilter } from "./PixelLineFilter";
import { PixelLineRenderer } from "./PixelLineRenderer";
import { PixelLineData } from "./PixelLineData";
import { RenderableSprite3D } from "../RenderableSprite3D"
import { Node } from "../../../display/Node"
import { Sprite3D } from "../Sprite3D";
import { UnlitMaterial } from "../material/UnlitMaterial";
import { Color } from "../../../maths/Color";
import { Vector3 } from "../../../maths/Vector3";

/**
 * @en PixelLineSprite3D class is used for pixel line rendering sprites.
 * @zh PixelLineSprite3D 类用于像素线渲染精灵。
 */
export class PixelLineSprite3D extends RenderableSprite3D {

    declare _render: PixelLineRenderer;

    /** @private 是否调用active */
    private _isRenderActive: Boolean = false;
    /** @private 是否加入渲染队列*/
    private _isInRenders: Boolean = false;
    /** @internal */
    public _geometryFilter: PixelLineFilter;

    /**
     * @en The maximum line count.
     * @zh 最大线数量。
     */
    get maxLineCount(): number {
        return (this._render as PixelLineRenderer).maxLineCount;
    }

    set maxLineCount(value: number) {
        (this._render as PixelLineRenderer).maxLineCount = value;
    }

    /**
     * @en The current line count.
     * @zh 当前线数量。
     */
    get lineCount(): number {
        return (this._render as PixelLineRenderer).lineCount;
    }

    /**
     * @en The pixel line renderer.
     * @zh 像素线渲染器。
     */
    get pixelLineRenderer(): PixelLineRenderer {
        return (<PixelLineRenderer>this._render);
    }

    /**
     * @ignore
     * @en Initaialize pixelLineSprite3D instance.
     * @param maxCount Maximum number of line segments. 
     * @param name Name of the instance. 
     * @zh 初始化PixeLineSprite3D实例。
     * @param maxCount 最大线段数量。
     * @param name  实例的名称。
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
     * @en Add a single line.
     * @param startPosition  Start position of the line. 
     * @param endPosition  End position of the line.
     * @param startColor  Start color of the line. 
     * @param endColor  End color of the line.
     * @zh 增加一条线。
     * @param startPosition  线段起点位置。
     * @param endPosition  线段终点位置。
     * @param startColor  线段起点颜色。
     * @param endColor  线段终点颜色。
     */
    addLine(startPosition: Vector3, endPosition: Vector3, startColor: Color, endColor: Color): void {
        this._render.addLine(startPosition, endPosition, startColor, endColor);
    }

    /**
     * @en Add multiple line segments.
     * @param lines  Array of line segment data.
     * @zh 添加多条线段。
     * @param lines  线段数据
     */
    addLines(lines: PixelLineData[]): void {
        this._render.addLines(lines);
    }

    /**
     * @en Remove a line segment.
     * @param index Index of the line to remove.
     * @zh 移除一条线段。
     * @param index 要移除的线段索引。
     */
    removeLine(index: number): void {
        this._render.removeLine(index);
    }

    /**
     * @en Update a line segment.
     * @param index  Index of the line to update. 
     * @param startPosition  New start position of the line.
     * @param endPosition  New end position of the line. 
     * @param startColor - New start color of the line. 
     * @param endColor  New end color of the line. 
     * @zh 更新一条线段。
     * @param index  要更新的线段索引。
     * @param startPosition  新的线段起点位置。
     * @param endPosition  新的线段终点位置。
     * @param startColor  新的线段起点颜色。
     * @param endColor  新的线段终点颜色。
     */
    setLine(index: number, startPosition: Vector3, endPosition: Vector3, startColor: Color, endColor: Color): void {
        (this._render as PixelLineRenderer).setLine(index, startPosition, endPosition, startColor, endColor);
    }

    /**
     * @en Get line segment data.
     * @param index  Index of the line to get.
     * @param out  Output object to store the line data. 
     * @zh 获取线段数据。
     * @param index  要获取的线段索引。
     * @param out  输出对象，用于存储线段数据。
     */
    getLine(index: number, out: PixelLineData): void {
        (this._render as PixelLineRenderer).getLine(index, out);
    }

    /**
     * @en Clear all line segments.
     * @zh 清除所有线段。
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

