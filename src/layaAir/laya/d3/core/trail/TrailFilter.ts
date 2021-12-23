import { Color } from "../../math/Color";
import { Vector3 } from "../../math/Vector3";
import { Camera } from "../Camera";
import { FloatKeyframe } from "../FloatKeyframe";
import { GeometryElement } from "../GeometryElement";
import { Gradient } from "../Gradient";
import { GradientMode } from "../GradientMode";
import { BaseRender } from "../render/BaseRender";
import { RenderContext3D } from "../render/RenderContext3D";
import { RenderElement } from "../render/RenderElement";
import { Scene3D } from "../scene/Scene3D";
import { TextureMode } from "../TextureMode";
import { TrailGeometry } from "./TrailGeometry";
import { TrailMaterial } from "./TrailMaterial";
import { TrailRenderer } from "./TrailRenderer";
import { TrailSprite3D } from "./TrailSprite3D";
import { Shader3D } from "../../../d3/shader/Shader3D";

/**
 * <code>TrailFilter</code> 类用于创建拖尾过滤器。
 */
export class TrailFilter {
	static CURTIME: number = Shader3D.propertyNameToID("u_CurTime");
	static LIFETIME: number = Shader3D.propertyNameToID("u_LifeTime");
	static WIDTHCURVE: number = Shader3D.propertyNameToID("u_WidthCurve");
	static WIDTHCURVEKEYLENGTH: number = Shader3D.propertyNameToID("u_WidthCurveKeyLength");

	/**@internal */
	private _minVertexDistance: number;
	/**@internal */
	private _widthMultiplier: number;
	/**@internal */
	private _time: number;
	/**@internal */
	private _widthCurve: FloatKeyframe[];
	/**@internal */
	private _colorGradient: Gradient;
	/**@internal */
	private _textureMode: number;
	/**@internal */
	private _trialGeometry: GeometryElement;
	/**@internal 拖尾总长度*/
	_totalLength: number = 0;

	_owner: TrailSprite3D;
	_lastPosition: Vector3 = new Vector3();

	_curtime: number = 0;

	/**轨迹准线。*/
	alignment: number = TrailFilter.ALIGNMENT_VIEW;

	/**
	 * 获取淡出时间。
	 * @return  淡出时间。
	 */
	get time(): number {
		return this._time;
	}

	/**
	 * 设置淡出时间。
	 * @param value 淡出时间。
	 */
	set time(value: number) {
		this._time = value;
		this._owner._render._shaderValues.setNumber(TrailFilter.LIFETIME, value);
	}

	/**
	 * 获取新旧顶点之间最小距离。
	 * @return  新旧顶点之间最小距离。
	 */
	get minVertexDistance(): number {
		return this._minVertexDistance;
	}

	/**
	 * 设置新旧顶点之间最小距离。
	 * @param value 新旧顶点之间最小距离。
	 */
	set minVertexDistance(value: number) {
		this._minVertexDistance = value;
	}

	/**
	 * 获取宽度倍数。
	 * @return  宽度倍数。
	 */
	get widthMultiplier(): number {
		return this._widthMultiplier;
	}

	/**
	 * 设置宽度倍数。
	 * @param value 宽度倍数。
	 */
	set widthMultiplier(value: number) {
		this._widthMultiplier = value;
	}

	/**
	 * 获取宽度曲线。
	 * @return  宽度曲线。
	 */
	get widthCurve(): FloatKeyframe[] {
		return this._widthCurve;
	}

	/**
	 * 设置宽度曲线。最多10个
	 * @param value 宽度曲线。
	 */
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
		this._owner._render._shaderValues.setBuffer(TrailFilter.WIDTHCURVE, widthCurveFloatArray);
		this._owner._render._shaderValues.setInt(TrailFilter.WIDTHCURVEKEYLENGTH, value.length);
	}

	/**
	 * 获取颜色梯度。
	 * @return  颜色梯度。
	 */
	get colorGradient(): Gradient {
		return this._colorGradient;
	}

	/**
	 * 设置颜色梯度。
	 * @param value 颜色梯度。
	 */
	set colorGradient(value: Gradient) {
		this._colorGradient = value;
	}

	/**
	 * 获取纹理模式。
	 * @return  纹理模式。
	 */
	get textureMode(): number {
		return this._textureMode;
	}

	/**
	 * 设置纹理模式。
	 * @param value 纹理模式。
	 */
	set textureMode(value: number) {
		this._textureMode = value;
	}

	constructor(owner: TrailSprite3D) {
		this._owner = owner;
		this._initDefaultData();
		this.addRenderElement();
	}

	/**
	 * @internal
	 */
	addRenderElement(): void {
		var render: TrailRenderer = (<TrailRenderer>this._owner._render);
		var elements: RenderElement[] = render._renderElements;
		var material: TrailMaterial = (<TrailMaterial>render.sharedMaterials[0]);
		(material) || (material = TrailMaterial.defaultMaterial);
		var element: RenderElement = new RenderElement();
		element.setTransform(this._owner._transform);
		element.render = render;
		element.material = material;
		this._trialGeometry = new TrailGeometry(this);
		element.setGeometry(this._trialGeometry);
		elements.push(element);
	}

	/**
	 * @internal
	 */
	_update(state: RenderContext3D): void {
		var render: BaseRender = this._owner._render;
		this._curtime += ((<Scene3D>state.scene)).timer._delta / 1000;
		//设置颜色
		render._shaderValues.setNumber(TrailFilter.CURTIME, this._curtime);
		//现在的位置记录
		var curPos: Vector3 = this._owner.transform.position;
		var element: TrailGeometry = (<TrailGeometry>render._renderElements[0]._geometry);
		element._updateDisappear();
		element._updateTrail((<Camera>state.camera), this._lastPosition, curPos);
		element._updateVertexBufferUV();
		//克隆到lastPosition
		curPos.cloneTo(this._lastPosition);
	}

	/**
	 * @internal
	 */
	_initDefaultData(): void {
		this.time = 5.0;
		this.minVertexDistance = 0.1;
		this.widthMultiplier = 1;
		this.textureMode = TextureMode.Stretch;

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

		var gradient: Gradient = new Gradient(2, 2);
		gradient.mode = GradientMode.Blend;
		gradient.addColorRGB(0, Color.WHITE);
		gradient.addColorRGB(1, Color.WHITE);
		gradient.addColorAlpha(0, 1);
		gradient.addColorAlpha(1, 1);
		this.colorGradient = gradient;
	}

	/**
	 * @internal
	 */
	destroy(): void {
		this._trialGeometry.destroy();
		this._trialGeometry = null;
		this._widthCurve = null;
		this._colorGradient = null;
	}

	clear(): void {
		(<TrailGeometry>this._trialGeometry).clear();
		this._lastPosition.setValue(0, 0, 0);
		this._curtime = 0;
		this._totalLength = 0;
	}

	//--------------------------------------------------兼容---------------------------------------------------------------------
	/** 轨迹准线_面向摄像机。*/
	static ALIGNMENT_VIEW: number = 0;
	/** 轨迹准线_面向运动方向。*/
	static ALIGNMENT_TRANSFORM_Z: number = 1;
}

