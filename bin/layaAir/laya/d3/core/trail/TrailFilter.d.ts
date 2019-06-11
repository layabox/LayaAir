import { Vector3 } from "../../math/Vector3";
import { FloatKeyframe } from "../FloatKeyframe";
import { Gradient } from "../Gradient";
import { RenderContext3D } from "../render/RenderContext3D";
import { TrailSprite3D } from "././TrailSprite3D";
/**
 * <code>TrailFilter</code> 类用于创建拖尾过滤器。
 */
export declare class TrailFilter {
    static CURTIME: number;
    static LIFETIME: number;
    static WIDTHCURVE: number;
    static WIDTHCURVEKEYLENGTH: number;
    /** 轨迹准线_面向摄像机。*/
    static ALIGNMENT_VIEW: number;
    /** 轨迹准线_面向运动方向。*/
    static ALIGNMENT_TRANSFORM_Z: number;
    /**@private */
    private _minVertexDistance;
    /**@private */
    private _widthMultiplier;
    /**@private */
    private _time;
    /**@private */
    private _widthCurve;
    /**@private */
    private _colorGradient;
    /**@private */
    private _textureMode;
    /**@private */
    private _trialGeometry;
    /**@private 拖尾总长度*/
    _totalLength: number;
    _owner: TrailSprite3D;
    _lastPosition: Vector3;
    _curtime: number;
    private _trailRenderElementIndex;
    /**轨迹准线。*/
    alignment: number;
    /**
     * 获取淡出时间。
     * @return  淡出时间。
     */
    /**
    * 设置淡出时间。
    * @param value 淡出时间。
    */
    time: number;
    /**
     * 获取新旧顶点之间最小距离。
     * @return  新旧顶点之间最小距离。
     */
    /**
    * 设置新旧顶点之间最小距离。
    * @param value 新旧顶点之间最小距离。
    */
    minVertexDistance: number;
    /**
     * 获取宽度倍数。
     * @return  宽度倍数。
     */
    /**
    * 设置宽度倍数。
    * @param value 宽度倍数。
    */
    widthMultiplier: number;
    /**
     * 获取宽度曲线。
     * @return  宽度曲线。
     */
    /**
    * 设置宽度曲线。
    * @param value 宽度曲线。
    */
    widthCurve: FloatKeyframe[];
    /**
     * 获取颜色梯度。
     * @return  颜色梯度。
     */
    /**
    * 设置颜色梯度。
    * @param value 颜色梯度。
    */
    colorGradient: Gradient;
    /**
     * 获取纹理模式。
     * @return  纹理模式。
     */
    /**
    * 设置纹理模式。
    * @param value 纹理模式。
    */
    textureMode: number;
    constructor(owner: TrailSprite3D);
    /**
     * @private
     */
    addRenderElement(): void;
    /**
     * @private
     */
    _update(state: RenderContext3D): void;
    /**
     * @private
     */
    _initDefaultData(): void;
    /**
     * @private
     */
    destroy(): void;
}
