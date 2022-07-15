import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { ShaderDefine } from "../../../RenderEngine/RenderShader/ShaderDefine";
import { BaseTexture } from "../../../resource/BaseTexture";
import { Vector4 } from "../../math/Vector4";
import { Material } from "./Material";
import { RenderState } from "./RenderState";


/**
 * <code>BlinnPhongMaterial</code> 类用于实现Blinn-Phong材质。
 */
export class BlinnPhongMaterial extends Material {
	/**高光强度数据源_漫反射贴图的Alpha通道。*/
	static SPECULARSOURCE_DIFFUSEMAPALPHA: number;
	/**高光强度数据源_高光贴图的RGB通道。*/
	static SPECULARSOURCE_SPECULARMAP: number;

	/**渲染状态_不透明。*/
	static RENDERMODE_OPAQUE: number = 0;
	/**渲染状态_阿尔法测试。*/
	static RENDERMODE_CUTOUT: number = 1;
	/**渲染状态_透明混合。*/
	static RENDERMODE_TRANSPARENT: number = 2;

	/**@internal */
	static SHADERDEFINE_DIFFUSEMAP: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_NORMALMAP: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_SPECULARMAP: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_ENABLEVERTEXCOLOR: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_ENABLETRANSMISSION: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_THICKNESSMAP: ShaderDefine;
	/**@internal */
	static ALBEDOTEXTURE: number;
	/**@internal */
	static NORMALTEXTURE: number;
	/**@internal */
	static SPECULARTEXTURE: number;
	/**@internal */
	static ALBEDOCOLOR: number;
	/**@internal */
	static MATERIALSPECULAR: number;
	/**@internal */
	static SHININESS: number;
	/**@internal */
	static TILINGOFFSET: number;
	/**@internal */
	static TRANSMISSIONRATE: number;
	/**@internal */
	static IBACKDIFFUSE: number;
	/**@internal */
	static IBACKSCALE: number;
	/**@internal */
	static THINKNESSTEXTURE: number;
	/**@internal */
	static TRANSMISSIONCOLOR: number;
	/**@internal */
	static AlbedoIntensity: number;

	/** 默认材质，禁止修改*/
	static defaultMaterial: BlinnPhongMaterial;

	/**
	 * @internal
	 */
	static __initDefine__(): void {
		BlinnPhongMaterial.SHADERDEFINE_DIFFUSEMAP = Shader3D.getDefineByName("DIFFUSEMAP");
		BlinnPhongMaterial.SHADERDEFINE_NORMALMAP = Shader3D.getDefineByName("NORMALMAP");
		BlinnPhongMaterial.SHADERDEFINE_SPECULARMAP = Shader3D.getDefineByName("SPECULARMAP");
		BlinnPhongMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR = Shader3D.getDefineByName("ENABLEVERTEXCOLOR");
		BlinnPhongMaterial.SHADERDEFINE_ENABLETRANSMISSION = Shader3D.getDefineByName("ENABLETRANSMISSION");
		BlinnPhongMaterial.SHADERDEFINE_THICKNESSMAP = Shader3D.getDefineByName("THICKNESSMAP");

		BlinnPhongMaterial.ALBEDOTEXTURE = Shader3D.propertyNameToID("u_DiffuseTexture");
		BlinnPhongMaterial.NORMALTEXTURE = Shader3D.propertyNameToID("u_NormalTexture");
		BlinnPhongMaterial.SPECULARTEXTURE = Shader3D.propertyNameToID("u_SpecularTexture");
		BlinnPhongMaterial.ALBEDOCOLOR = Shader3D.propertyNameToID("u_DiffuseColor");
		BlinnPhongMaterial.MATERIALSPECULAR = Shader3D.propertyNameToID("u_MaterialSpecular");
		BlinnPhongMaterial.SHININESS = Shader3D.propertyNameToID("u_Shininess");
		BlinnPhongMaterial.TILINGOFFSET = Shader3D.propertyNameToID("u_TilingOffset");
		BlinnPhongMaterial.TRANSMISSIONRATE = Shader3D.propertyNameToID("u_TransmissionRate");
		BlinnPhongMaterial.IBACKDIFFUSE = Shader3D.propertyNameToID("u_BackDiffuse");
		BlinnPhongMaterial.IBACKSCALE = Shader3D.propertyNameToID("u_BackScale");
		BlinnPhongMaterial.THINKNESSTEXTURE = Shader3D.propertyNameToID("u_ThinknessTexture");
		BlinnPhongMaterial.TRANSMISSIONCOLOR = Shader3D.propertyNameToID("u_TransmissionColor");
		BlinnPhongMaterial.AlbedoIntensity = Shader3D.propertyNameToID("u_AlbedoIntensity");
	}

	/**
	 * 设置渲染模式。
	 * @param 渲染模式
	 */
	set renderMode(value: number) {
		switch (value) {
			case BlinnPhongMaterial.RENDERMODE_OPAQUE:
				this.alphaTest = false;
				this.renderQueue = Material.RENDERQUEUE_OPAQUE;
				this.depthWrite = true;
				this.cull = RenderState.CULL_BACK;
				this.blend = RenderState.BLEND_DISABLE;
				this.depthTest = RenderState.DEPTHTEST_LESS;
				break;
			case BlinnPhongMaterial.RENDERMODE_CUTOUT:
				this.renderQueue = Material.RENDERQUEUE_ALPHATEST;
				this.alphaTest = true;
				this.depthWrite = true;
				this.cull = RenderState.CULL_BACK;
				this.blend = RenderState.BLEND_DISABLE;
				this.depthTest = RenderState.DEPTHTEST_LESS;
				break;
			case BlinnPhongMaterial.RENDERMODE_TRANSPARENT:
				this.renderQueue = Material.RENDERQUEUE_TRANSPARENT;
				this.alphaTest = false;
				this.depthWrite = false;
				this.cull = RenderState.CULL_BACK;
				this.blend = RenderState.BLEND_ENABLE_ALL;
				this.blendSrc = RenderState.BLENDPARAM_SRC_ALPHA;
				this.blendDst = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
				this.depthTest = RenderState.DEPTHTEST_LESS;
				break;
			default:
				throw new Error("Material:renderMode value error.");
		}
	}

	/**
	 * 是否支持顶点色。
	 */
	get enableVertexColor(): boolean {
		return this._shaderValues.hasDefine(BlinnPhongMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR);
	}

	set enableVertexColor(value: boolean) {
		if (value)
			this._shaderValues.addDefine(BlinnPhongMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR);
		else
			this._shaderValues.removeDefine(BlinnPhongMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR);
	}

	/**
	 * 纹理平铺和偏移。
	 */
	get tilingOffset(): Vector4 {
		return (<Vector4>this._shaderValues.getVector(BlinnPhongMaterial.TILINGOFFSET));
	}

	set tilingOffset(value: Vector4) {
		if (value) {
			this._shaderValues.setVector(BlinnPhongMaterial.TILINGOFFSET, value);
		}
		else {
			this._shaderValues.getVector(BlinnPhongMaterial.TILINGOFFSET).setValue(1.0, 1.0, 0.0, 0.0);
		}
	}

	/**
	 * 反照率颜色。
	 */
	get albedoColor(): Vector4 {
		return this._shaderValues.getVector(BlinnPhongMaterial.ALBEDOCOLOR);
	}

	set albedoColor(value: Vector4) {
		this._shaderValues.setVector(BlinnPhongMaterial.ALBEDOCOLOR, value);//修改值后必须调用此接口,否则NATIVE不生效
	}

	/**
	 * 反照率强度。
	 */
	get albedoIntensity(): number {
		return this._shaderValues.getNumber(BlinnPhongMaterial.AlbedoIntensity);
	}

	set albedoIntensity(value: number) {
		this._shaderValues.setNumber(BlinnPhongMaterial.AlbedoIntensity, value);
	}

	/**
	 * 高光颜色。
	 */
	get specularColor(): Vector4 {
		return (<Vector4>this._shaderValues.getVector(BlinnPhongMaterial.MATERIALSPECULAR));
	}

	set specularColor(value: Vector4) {
		this._shaderValues.setVector(BlinnPhongMaterial.MATERIALSPECULAR, value);
	}

	/**
	 * 高光强度,范围为0到1。
	 */
	get shininess(): number {
		return this._shaderValues.getNumber(BlinnPhongMaterial.SHININESS);
	}

	set shininess(value: number) {
		value = Math.max(0.0, Math.min(1.0, value));
		this._shaderValues.setNumber(BlinnPhongMaterial.SHININESS, value);
	}

	/**
	 * 反照率贴图。
	 */
	get albedoTexture(): BaseTexture {
		return this._shaderValues.getTexture(BlinnPhongMaterial.ALBEDOTEXTURE);
	}

	set albedoTexture(value: BaseTexture) {
		if (value)
			this._shaderValues.addDefine(BlinnPhongMaterial.SHADERDEFINE_DIFFUSEMAP);
		else
			this._shaderValues.removeDefine(BlinnPhongMaterial.SHADERDEFINE_DIFFUSEMAP);
		this._shaderValues.setTexture(BlinnPhongMaterial.ALBEDOTEXTURE, value);
	}

	/**
	 * 法线贴图。
	 */
	get normalTexture(): BaseTexture {
		return this._shaderValues.getTexture(BlinnPhongMaterial.NORMALTEXTURE);
	}

	set normalTexture(value: BaseTexture) {
		if (value)
			this._shaderValues.addDefine(BlinnPhongMaterial.SHADERDEFINE_NORMALMAP);
		else
			this._shaderValues.removeDefine(BlinnPhongMaterial.SHADERDEFINE_NORMALMAP);
		this._shaderValues.setTexture(BlinnPhongMaterial.NORMALTEXTURE, value);
	}

	/**
	 * 高光贴图。
	 */
	get specularTexture(): BaseTexture {
		return this._shaderValues.getTexture(BlinnPhongMaterial.SPECULARTEXTURE);
	}

	set specularTexture(value: BaseTexture) {
		if (value)
			this._shaderValues.addDefine(BlinnPhongMaterial.SHADERDEFINE_SPECULARMAP);
		else
			this._shaderValues.removeDefine(BlinnPhongMaterial.SHADERDEFINE_SPECULARMAP);

		this._shaderValues.setTexture(BlinnPhongMaterial.SPECULARTEXTURE, value);
	}
	/**
	 * 是否支持透光色。
	 */
	get enableTransmission(): boolean {
		return this._shaderValues.hasDefine(BlinnPhongMaterial.SHADERDEFINE_ENABLETRANSMISSION);
	}

	set enableTransmission(value: boolean) {
		if (value)
			this._shaderValues.addDefine(BlinnPhongMaterial.SHADERDEFINE_ENABLETRANSMISSION);
		else
			this._shaderValues.removeDefine(BlinnPhongMaterial.SHADERDEFINE_ENABLETRANSMISSION);
	}

	/**
	 * 透光率，会影响漫反射以及透光强度
	 */
	get transmissionRata(): number {
		return this._shaderValues.getNumber(BlinnPhongMaterial.TRANSMISSIONRATE);
	}

	set transmissionRata(value: number) {
		this._shaderValues.setNumber(BlinnPhongMaterial.TRANSMISSIONRATE, value);
	}

	/**
	 * 透射影响范围指数
	 */
	get backDiffuse(): number {
		return this._shaderValues.getNumber(BlinnPhongMaterial.IBACKDIFFUSE);
	}
	set backDiffuse(value: number) {
		this._shaderValues.setNumber(BlinnPhongMaterial.IBACKDIFFUSE, Math.max(value, 1.0));
	}
	/**
	 * 透射光强度
	 */
	get backScale(): number {
		return this._shaderValues.getNumber(BlinnPhongMaterial.IBACKSCALE);
	}
	set backScale(value: number) {
		this._shaderValues.setNumber(BlinnPhongMaterial.IBACKSCALE, value);
	}

	/**
	 * 厚度贴图，会影响透视光，越厚，透射光越弱
	 */
	get thinknessTexture(): BaseTexture {
		return this._shaderValues.getTexture(BlinnPhongMaterial.THINKNESSTEXTURE);
	}
	set thinknessTexture(value: BaseTexture) {
		if (value)
			this._shaderValues.addDefine(BlinnPhongMaterial.SHADERDEFINE_THICKNESSMAP);
		else
			this._shaderValues.removeDefine(BlinnPhongMaterial.SHADERDEFINE_THICKNESSMAP);

		this._shaderValues.setTexture(BlinnPhongMaterial.THINKNESSTEXTURE, value);
	}

	/**
	 * 透光颜色。模拟透光物质内部颜色吸收率
	 */
	get transmissionColor(): Vector4 {
		return this._shaderValues.getVector(BlinnPhongMaterial.TRANSMISSIONCOLOR);
	}
	set transmissionColor(value: Vector4) {
		this._shaderValues.setVector(BlinnPhongMaterial.TRANSMISSIONCOLOR, value);
	}

	/**
	 * 请使用transmissionRata
	 * @deprecated
	 */
	get transmissionRate(): number {
		return this._shaderValues.getNumber(BlinnPhongMaterial.TRANSMISSIONRATE);
	}

	/**
	 * 创建一个 <code>BlinnPhongMaterial</code> 实例。
	 */
	constructor() {
		super();
		this.setShaderName("BLINNPHONG");
		this.renderMode = BlinnPhongMaterial.RENDERMODE_OPAQUE;
	}

	/**
	 * 克隆。
	 * @return	 克隆副本。
	 * @override
	 */
	clone(): any {
		var dest: BlinnPhongMaterial = new BlinnPhongMaterial();
		this.cloneTo(dest);
		return dest;
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	cloneTo(destObject: any): void {
		super.cloneTo(destObject);
		var destMaterial: BlinnPhongMaterial = (<BlinnPhongMaterial>destObject);
		destMaterial.albedoIntensity = this.albedoIntensity;
		destMaterial.enableVertexColor = this.enableVertexColor;
		this.albedoColor.cloneTo(destMaterial.albedoColor);
	}


}


