import { TrailSprite3D } from "./TrailSprite3D";
import { Sprite3D } from "../Sprite3D"
import { Transform3D } from "../Transform3D"
import { BaseRender } from "../render/BaseRender"
import { RenderContext3D } from "../render/RenderContext3D"
import { BoundFrustum } from "../../math/BoundFrustum"
import { Matrix4x4 } from "../../math/Matrix4x4"
import { TrailFilter } from "./TrailFilter";
import { FloatKeyframe } from "../FloatKeyframe";
import { Gradient } from "../Gradient";
import { Component } from "../../../components/Component";
import { Bounds } from "../../math/Bounds";
import { RenderBounds } from "../RenderBounds";

/**
 * <code>TrailRenderer</code> 类用于创建拖尾渲染器。
 */
export class TrailRenderer extends BaseRender {

    /**@internal */
    _trailFilter: TrailFilter;

    protected _projectionViewWorldMatrix: Matrix4x4 = new Matrix4x4();

    /**
     * 
     */
    constructor() {
        super();
        this._supportOctree = false;

    }

    onAdded(): void {
        this._trailFilter = new TrailFilter(this);
    }

    /**
     * 获取淡出时间。
     * @return  淡出时间。
     */
    get time(): number {
        return this._trailFilter.time;
    }

    /**
     * 设置淡出时间。
     * @param value 淡出时间。
     */
    set time(value: number) {
        this._trailFilter.time = value;
    }

    /**
     * 获取新旧顶点之间最小距离。
     * @return  新旧顶点之间最小距离。
     */
    get minVertexDistance(): number {
        return this._trailFilter.minVertexDistance;
    }

    /**
     * 设置新旧顶点之间最小距离。
     * @param value 新旧顶点之间最小距离。
     */
    set minVertexDistance(value: number) {
        this._trailFilter.minVertexDistance = value;
    }

    /**
     * 获取宽度倍数。
     * @return  宽度倍数。
     */
    get widthMultiplier(): number {
        return this._trailFilter.widthMultiplier;
    }

    /**
     * 设置宽度倍数。
     * @param value 宽度倍数。
     */
    set widthMultiplier(value: number) {
        this._trailFilter.widthMultiplier = value;
    }

    /**
     * 获取宽度曲线。
     * @return  宽度曲线。
     */
    get widthCurve(): FloatKeyframe[] {
        return this._trailFilter.widthCurve;
    }

    /**
     * 设置宽度曲线。最多10个
     * @param value 宽度曲线。
     */
    set widthCurve(value: FloatKeyframe[]) {
        this._trailFilter.widthCurve = value;
    }

    /**
     * 获取颜色梯度。
     * @return  颜色梯度。
     */
    get colorGradient(): Gradient {
        return this._trailFilter.colorGradient;
    }

    /**
     * 设置颜色梯度。
     * @param value 颜色梯度。
     */
    set colorGradient(value: Gradient) {
        this._trailFilter.colorGradient = value;
    }

    /**
     * 获取纹理模式。
     * @return  纹理模式。
     */
    get textureMode(): number {
        return this._trailFilter.textureMode;
    }

    /**
     * 设置纹理模式。
     * @param value 纹理模式。
     */
    set textureMode(value: number) {
        this._trailFilter.textureMode = value;
    }

    get alignment(): number {
        return this._trailFilter.alignment;
    }

    set alignment(value: number) {
        this._trailFilter.alignment = value;
    }

    onEnable(): void {
        super.onEnable();

        (this.owner as Sprite3D)._transform.position.cloneTo(this._trailFilter._lastPosition);//激活时需要重置上次位置
    }

    onUpdate(): void {
        this._calculateBoundingBox();
    }

    /**
     * 包围盒,只读,不允许修改其值。
     */
    get bounds(): Bounds {
        return this._bounds as RenderBounds;
    }

    /**
     * @inheritDoc
     * @internal
     * @override
     */
    protected _calculateBoundingBox(): void {
        let context = RenderContext3D._instance;
        this._boundsChange = false;
        (<TrailSprite3D>this.owner).trailFilter._update(context);

    }

    /**
     * @inheritDoc
     * @internal
     * @override
     */
    _renderUpdate(state: RenderContext3D, transform: Transform3D): void {
        super._renderUpdate(state, transform);
    }

    clear(): void {
        this._trailFilter.clear();
    }

    /**
     * @internal
     */
    onDestroy(): void {
        this._trailFilter.destroy();
        super.onDestroy();
    }

    _cloneTo(dest: Component): void {
        super._cloneTo(dest);
        let render = dest as TrailRenderer;
        render.time = this.time;
        render.minVertexDistance = this.minVertexDistance;
        //render.widthCurve = this.widthCurve;
        var widthCurve: FloatKeyframe[] = [];
        var widthCurveData: any[] = this.widthCurve;
        for (let i = 0, n = this.widthCurve.length; i < n; i++) {
            widthCurve.push(widthCurveData[i].clone());
        }
        render.widthCurve = widthCurve;
        render.colorGradient = this.colorGradient.clone();
        render.textureMode = this.textureMode;
        render.alignment = this.alignment;
    }

}

