import { PixelLineSprite3D } from "././PixelLineSprite3D";
import { PixelLineData } from "././PixelLineData";
import { GeometryElement } from "../GeometryElement";
import { RenderContext3D } from "../render/RenderContext3D";
import { Color } from "../../math/Color";
import { Vector3 } from "../../math/Vector3";
/**
 * <code>PixelLineFilter</code> 类用于线过滤器。
 */
export declare class PixelLineFilter extends GeometryElement {
    /**@private */
    private static _type;
    /** @private */
    private _floatCountPerVertices;
    /** @private */
    private _owner;
    /** @private */
    private _vertexBuffer;
    /** @private */
    private _vertices;
    /** @private */
    private _minUpdate;
    /** @private */
    private _maxUpdate;
    /** @private */
    private _bufferState;
    /** @private */
    _maxLineCount: number;
    /** @private */
    _lineCount: number;
    constructor(owner: PixelLineSprite3D, maxLineCount: number);
    /**
     * @inheritDoc
     */
    _getType(): number;
    /**
     * @private
     */
    _resizeLineData(maxCount: number): void;
    /**
     * @private
     */
    private _updateLineVertices;
    /**
     * @private
     */
    _removeLineData(index: number): void;
    /**
     * @private
     */
    _updateLineData(index: number, startPosition: Vector3, endPosition: Vector3, startColor: Color, endColor: Color): void;
    /**
     * @private
     */
    _updateLineDatas(index: number, data: PixelLineData[]): void;
    /**
     * 获取线段数据
     * @return 线段数据。
     */
    _getLineData(index: number, out: PixelLineData): void;
    /**
     * @inheritDoc
     */
    _prepareRender(state: RenderContext3D): boolean;
    /**
     * @inheritDoc
     */
    _render(state: RenderContext3D): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
}
