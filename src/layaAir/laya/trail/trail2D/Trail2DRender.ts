import { Laya } from "../../../Laya";
import { LayaGL } from "../../layagl/LayaGL";
import { Color } from "../../maths/Color";
import { FloatKeyframe } from "../../maths/FloatKeyframe";
import { Gradient } from "../../maths/Gradient";
import { Point } from "../../maths/Point";
import { Vector3 } from "../../maths/Vector3";
import { BaseRenderNode2D } from "../../NodeRender2D/BaseRenderNode2D";
import { BaseTexture } from "../../resource/BaseTexture";
import { Material } from "../../resource/Material";
import { Texture2D } from "../../resource/Texture2D";
import { ShaderDefines2D } from "../../webgl/shader/d2/ShaderDefines2D";
import { TrailGeometry } from "../trailCommon/RenderFeatureComman/Trail/TrailGeometry";
import { TrailShaderCommon } from "../trailCommon/RenderFeatureComman/Trail/TrailShaderCommon";
import { TrailTextureMode } from "../trailCommon/RenderFeatureComman/Trail/TrailTextureMode";
import { TrailBaseFilter } from "../trailCommon/RenderFeatureComman/TrailBaseFilter";
import { Trail2DShaderInit } from "./Shader/Trail2DShaderInit";

export class Trail2DRender extends BaseRenderNode2D {

    static defaultTrail2DMaterial: Material;

    private _color: Color = new Color(1, 1, 1, 1);

    private _baseRender2DTexture: BaseTexture;

    private _time: number;
    private _widthMultiplier: number;
    _trailFilter: TrailBaseFilter;


    /**
     * @en Fade out time. Unit: s.
     * @zh 淡出时间。单位: 秒。
     */
    get time(): number {
        return this._time;
    }

    set time(value: number) {
        this._time = value;
        if (this._trailFilter)
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
        return this._widthMultiplier;
    }

    set widthMultiplier(value: number) {
        this._widthMultiplier = value;
        if (this._trailFilter)
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
  * @en Rendering textures will not take effect if there is no UV in 2dmesh
  * @zh 渲染纹理，如果2DMesh中没有uv，则不会生效 
  */
    set texture(value: BaseTexture) {
        if (!value) {
            value = Texture2D.whiteTexture;
        }
        if (value == this._baseRender2DTexture)
            return;

        if (this._baseRender2DTexture)
            this._baseRender2DTexture._removeReference(1)

        value._addReference();
        this._baseRender2DTexture = value;

        this._spriteShaderData.setTexture(BaseRenderNode2D.BASERENDER2DTEXTURE, value);
        if (value.gammaCorrection != 1) {//预乘纹理特殊处理
            this._spriteShaderData.addDefine(ShaderDefines2D.GAMMATEXTURE);
        } else {
            this._spriteShaderData.removeDefine(ShaderDefines2D.GAMMATEXTURE);
        }
    }

    get texture(): BaseTexture {
        return this._baseRender2DTexture;
    }

    /**
   * @en The color of the line segment.
   * @zh 线段颜色
   */
    set color(value: Color) {
        if (value != this._color && this._color.equal(value))
            return
        value = value ? value : Color.BLACK;
        value.cloneTo(this._color);
        this._spriteShaderData.setColor(BaseRenderNode2D.BASERENDER2DCOLOR, this._color);
    }

    get color() {
        return this._color;
    }



    /**
     * 基于不同BaseRender的uniform集合
     * @internal
     */
    protected _getcommonUniformMap(): Array<string> {
        return ["BaseRender2D", "TrailRender"];
    }

    /**
     * @internal
     * @protected 
     */
    protected _onAdded(): void {
        super._onAdded();
        this._trailFilter = new TrailBaseFilter(this._spriteShaderData);
        this._trailFilter.time = this._time;
        this._trailFilter.widthMultiplier = this._widthMultiplier;
        this._initRender();
    }

    private _initRender() {
        let renderElement = LayaGL.render2DRenderPassFactory.createRenderElement2D();
        renderElement.geometry = this._trailFilter._trialGeometry._geometryElementOBj;
        renderElement.value2DShaderData = this._spriteShaderData;
        renderElement.renderStateIsBySprite = false;
        renderElement.nodeCommonMap = this._getcommonUniformMap();
        BaseRenderNode2D._setRenderElement2DMaterial(renderElement, this._materials[0] ? this._materials[0] : Trail2DRender.defaultTrail2DMaterial);
        this._renderElements[0] = renderElement;
        this.owner._struct.renderElements = this._renderElements;
        this._renderHandle.needUseMatrix = false;//因为顶点便是world
    }


    onPreRender(): void {
        let curtime = this._trailFilter._curtime += Math.min(Laya.timer.delta / 1000, 0.016);

        let trailGeometry = this._trailFilter._trialGeometry;
        this._spriteShaderData.setNumber(TrailShaderCommon.CURTIME, curtime);
        let globalPos = Point.TEMP;
        this.owner.globalTrans.getScenePos(globalPos);
        let curPosV3 = Vector3.TEMP;
        curPosV3.set(globalPos.x, globalPos.y, 0);

        trailGeometry._updateDisappear(curtime, this.time);
        if (!Vector3.equals(this._trailFilter._lastPosition, curPosV3)) {
            if ((trailGeometry._endIndex - trailGeometry._activeIndex) === 0) {
                trailGeometry._addTrailByFirstPosition(curPosV3, curtime);
            } else {
                var delVector3: Vector3 = TrailGeometry._tempVector36;
                var pointAtoBVector3: Vector3 = TrailGeometry._tempVector35;
                //caculate extends vector
                Vector3.subtract(curPosV3, trailGeometry._lastFixedVertexPosition, delVector3);
                var forward: Vector3 = TrailGeometry._tempVector33;
                forward.setValue(0, 0, 1);
                Vector3.cross(delVector3, forward, pointAtoBVector3);

                Vector3.normalize(pointAtoBVector3, pointAtoBVector3);
                Vector3.scale(pointAtoBVector3, this.widthMultiplier / 2, pointAtoBVector3);
                var delLength: number = Vector3.scalarLength(delVector3);
                trailGeometry._addTrailByNextPosition(curPosV3, curtime, this.minVertexDistance, pointAtoBVector3, delLength)
            }
        }
        trailGeometry._updateVertexBufferUV(this.colorGradient, this.textureMode, 50);
        curPosV3.cloneTo(this._trailFilter._lastPosition);
        if (trailGeometry._disappearBoundsMode) {
            //caculate bound
        }
        trailGeometry._updateRenderParams();
    }

    clear(): void {
        this._trailFilter.clear();
    }

    protected _initDefaultRenderData(): void {
        this._time = 0.5;
        this._widthMultiplier = 50;
        this._spriteShaderData.setColor(BaseRenderNode2D.BASERENDER2DCOLOR, this._color);
        this._spriteShaderData.addDefine(BaseRenderNode2D.SHADERDEFINE_BASERENDER2D);
        this.texture = Texture2D.whiteTexture;
    }
    constructor() {
        super();
        this._renderElements = [];
        this._materials = [];

        if (!Trail2DRender.defaultTrail2DMaterial)
            Trail2DShaderInit.init();
    }
}