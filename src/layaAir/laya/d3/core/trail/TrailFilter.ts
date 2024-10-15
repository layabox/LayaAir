import { Camera } from "../Camera";
import { FloatKeyframe } from "../FloatKeyframe";
import { GeometryElement } from "../GeometryElement";
import { GradientMode } from "../GradientMode";
import { BaseRender } from "../render/BaseRender";
import { RenderContext3D } from "../render/RenderContext3D";
import { TrailGeometry } from "./TrailGeometry";
import { TrailMaterial } from "./TrailMaterial";
import { TrailRenderer } from "./TrailRenderer";
import { Sprite3D } from "../Sprite3D";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { TrailAlignment } from "./TrailAlignment";
import { TrailTextureMode } from "../TrailTextureMode";
import { Color } from "../../../maths/Color";
import { Vector3 } from "../../../maths/Vector3";
import { Gradient } from "../Gradient";
import { LayaGL } from "../../../layagl/LayaGL";
import { RenderElement } from "../render/RenderElement";
import { ShaderDataType } from "../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";


/**
 * @en The TrailFilter class is used to create a trailing filter.
 * @zh TrailFilter 类用于创建拖尾过滤器。
 */
export class TrailFilter {
	/**@internal */
	static CURTIME: number;
	/**@internal */
	static LIFETIME: number;
	/**@internal */
	static WIDTHCURVE: number;
	/**@internal */
	static WIDTHCURVEKEYLENGTH: number;

	/**
	 * @internal
	 */
	static __init__() {
		TrailFilter.CURTIME = Shader3D.propertyNameToID("u_CurTime");
		TrailFilter.LIFETIME = Shader3D.propertyNameToID("u_LifeTime");
		TrailFilter.WIDTHCURVE = Shader3D.propertyNameToID("u_WidthCurve");
		TrailFilter.WIDTHCURVEKEYLENGTH = Shader3D.propertyNameToID("u_WidthCurveKeyLength");

		const spriteParms = LayaGL.renderDeviceFactory.createGlobalUniformMap("TrailRender");
		spriteParms.addShaderUniform(TrailFilter.CURTIME, "u_CurTime", ShaderDataType.Float);
		spriteParms.addShaderUniform(TrailFilter.LIFETIME, "u_LifeTime", ShaderDataType.Float);
		spriteParms.addShaderUniform(TrailFilter.WIDTHCURVE, "u_WidthCurve", ShaderDataType.Buffer);
		spriteParms.addShaderUniform(TrailFilter.WIDTHCURVEKEYLENGTH, "u_WidthCurveKeyLength", ShaderDataType.Int);
	}

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
	private _textureMode: TrailTextureMode = TrailTextureMode.Stretch;
	/**@internal */
	private _trialGeometry: GeometryElement;
	/**@internal 拖尾总长度*/
	_totalLength: number = 0;
	/**@internal */
	_ownerRender: TrailRenderer;
	/**@internal */
	_lastPosition: Vector3 = new Vector3();
	/**@internal */
	_curtime: number = 0;

	/**
	 * @en The trail alignment.
	 * @zh 轨迹准线。
	 */
	alignment: TrailAlignment = TrailAlignment.View;

	/**
	 * @en Fade out time.
	 * @zh 淡出时间。
	 */
	get time(): number {
		return this._time;
	}

	set time(value: number) {
		this._time = value;
		this._ownerRender._baseRenderNode.shaderData.setNumber(TrailFilter.LIFETIME, value);
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
		this._ownerRender._baseRenderNode.shaderData.setBuffer(TrailFilter.WIDTHCURVE, widthCurveFloatArray);
		this._ownerRender._baseRenderNode.shaderData.setInt(TrailFilter.WIDTHCURVEKEYLENGTH, value.length);
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

	/** @ignore */
	constructor(owner: TrailRenderer) {
		this._ownerRender = owner;
		this._initDefaultData();
		this.addRenderElement();
	}


	/**
	 * @internal
	 * @en Adds a render element to the renderer.
	 * @zh 向渲染器添加渲染元素。
	 */
	addRenderElement(): void {
		var render: TrailRenderer = (<TrailRenderer>this._ownerRender);
		var elements: RenderElement[] = render._renderElements;
		var material: TrailMaterial = (<TrailMaterial>render.sharedMaterials[0]);
		(material) || (material = TrailMaterial.defaultMaterial);
		var element: RenderElement = new RenderElement();
		element.setTransform((this._ownerRender.owner as Sprite3D)._transform);
		element.render = render;
		element.material = material;
		//element.renderSubShader = element.material.shader.getSubShaderAt(0);
		this._trialGeometry = new TrailGeometry(this);
		element.setGeometry(this._trialGeometry);
		elements.push(element);
	}

	/**
	 * @internal
	 */
	_update(state: RenderContext3D): void {
		var render: BaseRender = this._ownerRender;
		const scene = this._ownerRender.owner.scene
		if (!scene)
			return;
		this._curtime += scene.timer._delta / 1000;
		//设置颜色
		render._baseRenderNode.shaderData.setNumber(TrailFilter.CURTIME, this._curtime);
		//现在的位置记录
		var curPos: Vector3 = (this._ownerRender.owner as Sprite3D).transform.position;
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
		(<TrailGeometry>this._trialGeometry).clear();
		this._lastPosition.setValue(0, 0, 0);
		this._curtime = 0;
		this._totalLength = 0;
	}
}

