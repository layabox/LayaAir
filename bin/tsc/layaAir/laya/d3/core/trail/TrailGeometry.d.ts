import { Vector3 } from "../../math/Vector3";
import { Camera } from "../Camera";
import { GeometryElement } from "../GeometryElement";
import { RenderContext3D } from "../render/RenderContext3D";
import { TrailFilter } from "././TrailFilter";
/**
 * <code>TrailGeometry</code> 类用于创建拖尾渲染单元。
 */
export declare class TrailGeometry extends GeometryElement {
    /** 轨迹准线_面向摄像机。*/
    static ALIGNMENT_VIEW: number;
    /** 轨迹准线_面向运动方向。*/
    static ALIGNMENT_TRANSFORM_Z: number;
    /**@private */
    private static _tempVector30;
    /**@private */
    private static _tempVector31;
    /**@private */
    private static _tempVector32;
    /**@private */
    private static _tempVector33;
    /**@private */
    private static _tempVector34;
    /**@private */
    private static _type;
    /**@private */
    private _floatCountPerVertices1;
    /**@private */
    private _floatCountPerVertices2;
    /**@private */
    private _increaseSegementCount;
    /**@private */
    private _activeIndex;
    /**@private */
    private _endIndex;
    /**@private */
    private _needAddFirstVertex;
    /**@private */
    private _isTempEndVertex;
    /**@private */
    private _subBirthTime;
    /**@private */
    private _subDistance;
    /**@private */
    private _segementCount;
    /**@private */
    private _vertices1;
    /**@private */
    private _vertices2;
    /**@private */
    private _vertexBuffer1;
    /**@private */
    private _vertexBuffer2;
    /**@private */
    private _lastFixedVertexPosition;
    /**@private */
    private _owner;
    /** @private */
    private _bufferState;
    private tmpColor;
    constructor(owner: TrailFilter);
    /**
     * @private
     */
    private _resizeData;
    /**
     * @private
     */
    private _resetData;
    /**
     * @private
     * 更新Trail数据
     */
    _updateTrail(camera: Camera, lastPosition: Vector3, position: Vector3): void;
    /**
     * @private
     * 通过起始位置添加TrailRenderElement起始数据
     */
    private _addTrailByFirstPosition;
    /**
     * @private
     * 通过位置更新TrailRenderElement数据
     */
    private _addTrailByNextPosition;
    /**
     * @private
     * 通过位置更新顶点数据
     */
    private _updateVerticesByPositionData;
    /**
     * @private
     * 通过位置更新顶点数据、距离、出生时间
     */
    private _updateVerticesByPosition;
    /**
     * @private
     * 更新VertexBuffer2数据
     */
    _updateVertexBufferUV(): void;
    /**
     * @private
     */
    _updateDisappear(): void;
    /**
     * @inheritDoc
     */
    _getType(): number;
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
