import { Sprite3D } from "../Sprite3D"
import { BaseRender } from "../render/BaseRender"
import { TrailFilter } from "./TrailFilter";
import { FloatKeyframe } from "../FloatKeyframe";
import { Gradient } from "../Gradient";
import { Component } from "../../../components/Component";
import { Bounds } from "../../math/Bounds";
import { TrailTextureMode } from "../TrailTextureMode"
import { TrailAlignment } from "./TrailAlignment"
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { RenderContext3D } from "../render/RenderContext3D";
import { Laya3DRender } from "../../RenderObjs/Laya3DRender";
import { IBaseRenderNode } from "../../../RenderDriver/RenderModuleData/Design/3D/I3DRenderModuleData";
import { TrailMaterial } from "./TrailMaterial";

/**
 * @en The `TrailRenderer` class is used to create a trail renderer.
 * @zh `TrailRenderer` 类用于创建拖尾渲染器。
 */
export class TrailRenderer extends BaseRender {

    /**@internal */
    _trailFilter: TrailFilter;

    /**@internal */
    protected _projectionViewWorldMatrix: Matrix4x4 = new Matrix4x4();
    /** @ignore */
    constructor() {
        super();
    }

    protected _getcommonUniformMap(): Array<string> {
        return ["Sprite3D", "TrailRender"];
    }


    protected _createBaseRenderNode(): IBaseRenderNode {
        return Laya3DRender.Render3DModuleDataFactory.createMeshRenderNode();
    }

    /**
     * @internal
     * @protected 
     */
    protected _onAdded(): void {
        super._onAdded();
        this._trailFilter = new TrailFilter(this);
        this._setRenderElements();
    }

    /**
     * @en Fade out time. Unit: s.
     * @zh 淡出时间。单位: 秒。
     */
    get time(): number {
        return this._trailFilter.time;
    }

    set time(value: number) {
        this._trailFilter.time = value;
    }

    /**
     * @en Minimum distance between new and old vertices.
     * @zh 新旧顶点之间最小距离。
     */
    get minVertexDistance(): number {
        return this._trailFilter.minVertexDistance;
    }

    set minVertexDistance(value: number) {
        this._trailFilter.minVertexDistance = value;
    }

    /**
     * @en The width multiplier.
     * @zh 宽度倍数。
     */
    get widthMultiplier(): number {
        return this._trailFilter.widthMultiplier;
    }

    set widthMultiplier(value: number) {
        this._trailFilter.widthMultiplier = value;
    }

    /**
     * @en The width curve. Maximum 10.
     * @zh 宽度曲线。最多10个。
     */
    get widthCurve(): FloatKeyframe[] {
        return this._trailFilter.widthCurve;
    }

    set widthCurve(value: FloatKeyframe[]) {
        this._trailFilter.widthCurve = value;
    }

    /**
     * @en The color gradient.
     * @zh 颜色梯度。
     */
    get colorGradient(): Gradient {
        return this._trailFilter.colorGradient;
    }

    set colorGradient(value: Gradient) {
        this._trailFilter.colorGradient = value;
    }

    /**
     * @en The texture mode.
     * @zh 纹理模式。
     */
    get textureMode(): TrailTextureMode {
        return this._trailFilter.textureMode;
    }

    set textureMode(value: TrailTextureMode) {
        this._trailFilter.textureMode = value;
    }

    /**
     * @en The trail alignment.
     * @zh 拖尾轨迹准线
     */
    get alignment(): TrailAlignment {
        return this._trailFilter.alignment;
    }

    set alignment(value: TrailAlignment) {
        this._trailFilter.alignment = value;
    }

    /**
     * @internal
     * @protected
     */
    protected _onEnable(): void {
        super._onEnable();

        (this.owner as Sprite3D)._transform.position.cloneTo(this._trailFilter._lastPosition);//激活时需要重置上次位置
    }

    /**
     * @en Render update.
     * @param context 3D rendering context.
     * @zh 渲染更新。
     * @param context 3D渲染上下文 
     */
    renderUpdate(context: RenderContext3D) {
        this._calculateBoundingBox();

        this._renderElements.forEach((element, index) => {
            let geometry = element._geometry;
            element._renderElementOBJ.isRender = geometry._prepareRender(context);
            geometry._updateRenderParams(context);

            let material = this.sharedMaterial ?? TrailMaterial.defaultMaterial;
            material = this.sharedMaterials[index] ?? material;
            element.material = material;
            element._renderElementOBJ.materialRenderQueue = material.renderQueue;
        })
    }



    /**
     * @en The bounding box. Read-only, do not modify its value.
     * @zh 包围盒,只读,不允许修改其值。
     */
    get bounds(): Bounds {
        return this._bounds;
    }

    /**
     * @inheritDoc
     * @internal
     * @override
     */
    _calculateBoundingBox(): void {
        let context = RenderContext3D._instance;
        this.boundsChange = false;
        this._trailFilter._update(context);
    }

    /**
     * @en Clear the trail.
     * @zh 清除拖尾
     */
    clear(): void {
        this._trailFilter.clear();
    }

    /**
     * @internal
     */
    protected _onDestroy() {
        this._trailFilter.destroy();
        super._onDestroy();
    }

    /**
     * @internal
     * @param dest 
     */
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

