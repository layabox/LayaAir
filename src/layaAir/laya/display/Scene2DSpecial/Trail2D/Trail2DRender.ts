import { Laya } from "../../../../Laya";
import { LayaGL } from "../../../layagl/LayaGL";
import { Color } from "../../../maths/Color";
import { FloatKeyframe } from "../../../maths/FloatKeyframe";
import { Gradient } from "../../../maths/Gradient";
import { Point } from "../../../maths/Point";
import { Vector3 } from "../../../maths/Vector3";
import { Vector4 } from "../../../maths/Vector4";
import { BaseRenderNode2D } from "../../../NodeRender2D/BaseRenderNode2D";
import { Context } from "../../../renders/Context";
import { BaseTexture } from "../../../resource/BaseTexture";
import { Material } from "../../../resource/Material";
import { Texture2D } from "../../../resource/Texture2D";
import { ShaderDefines2D } from "../../../webgl/shader/d2/ShaderDefines2D";
import { TrailGeometry } from "../../RenderFeatureComman/Trail/TrailGeometry";
import { TrailShaderCommon } from "../../RenderFeatureComman/Trail/TrailShaderCommon";
import { TrailTextureMode } from "../../RenderFeatureComman/Trail/TrailTextureMode";
import { TrailBaseFilter } from "../../RenderFeatureComman/TrailBaseFilter";
import { Sprite } from "../../Sprite";
import { TrailShaderInit } from "./Shader/Trail2DShaderInit";

export class Trail2DRender extends BaseRenderNode2D {

    /**@internal */
    static defaultTrail2DMaterial: Material;

    private static tempvec2_0: Point = new Point();

    private _color: Color = new Color(1, 1, 1, 1);

    private _tillOffset: Vector4 = new Vector4(0, 0, 1, 1);//贴图偏移量

    private _baseRender2DTexture: BaseTexture;

    /**@internal */
    _trailFilter: TrailBaseFilter;


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
    }

    /**
   * @internal
   * @protected
   * cmd run时调用，可以用来计算matrix等获得即时context属性
   * @param context 
   * @param px 
   * @param py 
   */
    addCMDCall(context: Context, px: number, py: number): void {
        let mat = context._curMat;
        let vec3 = Vector3._tempVector3;
        vec3.x = mat.a;
        vec3.y = mat.c;
        vec3.z = px * mat.a + py * mat.c + mat.tx;
        this._spriteShaderData.setVector3(BaseRenderNode2D.NMATRIX_0, vec3);
        vec3.x = mat.b;
        vec3.y = mat.d;
        vec3.z = px * mat.b + py * mat.d + mat.ty;
        this._spriteShaderData.setVector3(BaseRenderNode2D.NMATRIX_1, vec3);
        this._setRenderSize(context.width, context.height);
        context._copyClipInfoToShaderData(this._spriteShaderData);
    }

    onPreRender(): void {
        let curtime = this._trailFilter._curtime += Laya.timer._delta / 1000;
        let trailGeometry = this._trailFilter._trialGeometry;
        this._spriteShaderData.setNumber(TrailShaderCommon.CURTIME, curtime);
        let globalPos = Trail2DRender.tempvec2_0;
        (this.owner as Sprite).getGlobalPos(globalPos);
        let curPosV3 = Vector3._tempVector3;
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
        trailGeometry._updateVertexBufferUV(this.colorGradient, this.textureMode);
        curPosV3.cloneTo(this._trailFilter._lastPosition);
        if (trailGeometry._disappearBoundsMode) {
            //caculate bound
        }
        trailGeometry._updateRenderParams();
    }

    constructor() {
        super();
        this._renderElements = [];
        this._materials = [];
        this.widthMultiplier = 50;
        this.time = 0.5;
        this._spriteShaderData.addDefine(BaseRenderNode2D.SHADERDEFINE_BASERENDER2D);
        if (!Trail2DRender.defaultTrail2DMaterial)
            TrailShaderInit.init();
    }
}