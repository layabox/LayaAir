import { Color } from "../../../maths/Color";
import { FloatKeyframe } from "../../../maths/FloatKeyframe";
import { Gradient } from "../../../maths/Gradient";
import { GradientMode } from "../../../maths/GradientMode";
import { Vector3 } from "../../../maths/Vector3";
import { ShaderData } from "../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { TrailGeometry } from "./Trail/TrailGeometry";
import { TrailShaderCommon } from "./Trail/TrailShaderCommon";
import { TrailTextureMode } from "./Trail/TrailTextureMode";

export class TrailBaseFilter {
    /**@internal */
    protected _minVertexDistance: number;
    /**@internal */
    protected _widthMultiplier: number;
    /**@internal */
    protected _time: number;
    /**@internal */
    protected _widthCurve: FloatKeyframe[];
    /**@internal */
    protected _colorGradient: Gradient;
    /**@internal */
    protected _textureMode: TrailTextureMode = TrailTextureMode.Stretch;
    /**@internal */
    _trialGeometry: TrailGeometry;
    /**@internal 拖尾总长度*/
    _totalLength: number = 0;

    /**@internal */
    _lastPosition: Vector3 = new Vector3();
    /**@internal */
    _curtime: number = 0;

    protected _nodeShaderData: ShaderData;
    /**
         * @en Fade out time.
         * @zh 淡出时间。
         */
    get time(): number {
        return this._time;
    }

    set time(value: number) {
        this._time = value;
        this._nodeShaderData.setNumber(TrailShaderCommon.LIFETIME, value);
    }

    /**
     * @en Minimum distance between new and old vertices
     * @zh 新旧顶点之间最小距离。
     */
    get minVertexDistance(): number {
        return this._minVertexDistance;
    }

    set minVertexDistance(value: number) {
        this._minVertexDistance = value;
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
    }

    /**
     * @en The width curve. The maximum number is 10.
     * @zh 宽度曲线。最多10个。
     */
    get widthCurve(): FloatKeyframe[] {
        return this._widthCurve;
    }

    set widthCurve(value: FloatKeyframe[]) {
        this._widthCurve = value;
        var widthCurveFloatArray: Float32Array = new Float32Array(value.length * 4);
        var i: number, j: number, index: number = 0;
        for (i = 0, j = value.length; i < j; i++) {
            widthCurveFloatArray[index++] = value[i].time;
            widthCurveFloatArray[index++] = value[i].inTangent;
            widthCurveFloatArray[index++] = value[i].outTangent;
            widthCurveFloatArray[index++] = value[i].value;
        }
        this._nodeShaderData.setBuffer(TrailShaderCommon.WIDTHCURVE, widthCurveFloatArray);
        this._nodeShaderData.setInt(TrailShaderCommon.WIDTHCURVEKEYLENGTH, value.length);
    }

    /**
     * @en The color gradient.
     * @zh 颜色梯度。
     */
    get colorGradient(): Gradient {
        return this._colorGradient;
    }

    set colorGradient(value: Gradient) {
        this._colorGradient = value;
    }

    /**
     * @en The texture mode.
     * @zh 纹理模式。
     */
    get textureMode(): TrailTextureMode {
        return this._textureMode;
    }

    set textureMode(value: TrailTextureMode) {
        this._textureMode = value;
    }

    constructor(nodeShaderData: ShaderData) {
        this._nodeShaderData = nodeShaderData;
        this._initDefaultData();
        this._trialGeometry = new TrailGeometry();
    }

    /**
     * @internal
     * @returns 
     */
    _isRender(): boolean {
        return this._trialGeometry._endIndex - this._trialGeometry._activeIndex > 1;//当前分段为0或1时不渲染
    }

    /**
     * @internal
     */
    private _initDefaultData(): void {
        this.time = 5.0;
        this.minVertexDistance = 0.1;
        this.widthMultiplier = 1;
        this.textureMode = TrailTextureMode.Stretch;

        var widthKeyFrames: FloatKeyframe[] = [];
        var widthKeyFrame1: FloatKeyframe = new FloatKeyframe();
        widthKeyFrame1.time = 0;
        widthKeyFrame1.inTangent = 0;
        widthKeyFrame1.outTangent = 0;
        widthKeyFrame1.value = 1;
        widthKeyFrames.push(widthKeyFrame1);
        var widthKeyFrame2: FloatKeyframe = new FloatKeyframe();
        widthKeyFrame2.time = 1;
        widthKeyFrame2.inTangent = 0;
        widthKeyFrame2.outTangent = 0;
        widthKeyFrame2.value = 1;
        widthKeyFrames.push(widthKeyFrame2);
        this.widthCurve = widthKeyFrames;

        var gradient: Gradient = new Gradient();
        gradient.mode = GradientMode.Blend;
        gradient.addColorRGB(0, Color.WHITE);
        gradient.addColorRGB(1, Color.WHITE);
        gradient.addColorAlpha(0, 1);
        gradient.addColorAlpha(1, 1);
        this.colorGradient = gradient;
    }


    /**
     * @internal
     * @en Destroys the instance and releases resources.
     * @zh 销毁实例并释放资源。
     */
    destroy(): void {
        this._trialGeometry.destroy();
        this._trialGeometry = null;
        this._widthCurve = null;
        this._colorGradient = null;
    }

    /**
     * @en Clears the trail.
     * @zh 清除拖尾。
     */
    clear(): void {
        this._trialGeometry.clear();
        this._lastPosition.setValue(0, 0, 0);
        this._curtime = 0;
        this._totalLength = 0;
    }
}