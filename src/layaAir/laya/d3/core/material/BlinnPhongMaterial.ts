import { RenderState } from "../../../RenderDriver/RenderModuleData/Design/RenderState";
import { ShaderDefine } from "../../../RenderDriver/RenderModuleData/Design/ShaderDefine";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { Color } from "../../../maths/Color";
import { Vector4 } from "../../../maths/Vector4";

import { BaseTexture } from "../../../resource/BaseTexture";
import { Material } from "../../../resource/Material";


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
		return this.hasDefine(BlinnPhongMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR);
	}

	set enableVertexColor(value: boolean) {
		if (value)
			this.addDefine(BlinnPhongMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR);
		else
			this.removeDefine(BlinnPhongMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR);
	}

	/**
	 * 纹理平铺和偏移。
	 */
	get tilingOffset(): Vector4 {
		return (<Vector4>this.getVector4ByIndex(BlinnPhongMaterial.TILINGOFFSET));
	}

	set tilingOffset(value: Vector4) {
		if (value) {
			this.setVector4ByIndex(BlinnPhongMaterial.TILINGOFFSET, value);
		}
		else {
			this.getVector4ByIndex(BlinnPhongMaterial.TILINGOFFSET).setValue(1.0, 1.0, 0.0, 0.0);
		}
	}

	/**
	 * 反照率颜色。
	 */
	get albedoColor(): Color {
		return this.getColorByIndex(BlinnPhongMaterial.ALBEDOCOLOR);
	}

	set albedoColor(value: Color) {
		this.setColorByIndex(BlinnPhongMaterial.ALBEDOCOLOR, value);//修改值后必须调用此接口,否则NATIVE不生效
	}

	/**
	 * 反照率强度。
	 */
	get albedoIntensity(): number {
		return this.getFloatByIndex(BlinnPhongMaterial.AlbedoIntensity);
	}

	set albedoIntensity(value: number) {
		this.setFloatByIndex(BlinnPhongMaterial.AlbedoIntensity, value);
	}

	/**
	 * 高光颜色。
	 */
	get specularColor(): Color {
		return this.getColorByIndex(BlinnPhongMaterial.MATERIALSPECULAR);
	}

	set specularColor(value: Color) {
		this.setColorByIndex(BlinnPhongMaterial.MATERIALSPECULAR, value);
	}

	/**
	 * 高光强度,范围为0到1。
	 */
	get shininess(): number {
		return this.getFloatByIndex(BlinnPhongMaterial.SHININESS);
	}

	set shininess(value: number) {
		value = Math.max(0.0, Math.min(1.0, value));
		this.setFloatByIndex(BlinnPhongMaterial.SHININESS, value);
	}

	/**
	 * 反照率贴图。
	 */
	get albedoTexture(): BaseTexture {
		return this.getTextureByIndex(BlinnPhongMaterial.ALBEDOTEXTURE);
	}

	set albedoTexture(value: BaseTexture) {
		if (value)
			this.addDefine(BlinnPhongMaterial.SHADERDEFINE_DIFFUSEMAP);
		else
			this.removeDefine(BlinnPhongMaterial.SHADERDEFINE_DIFFUSEMAP);
		this.setTextureByIndex(BlinnPhongMaterial.ALBEDOTEXTURE, value);
	}

	/**
	 * 法线贴图。
	 */
	get normalTexture(): BaseTexture {
		return this.getTextureByIndex(BlinnPhongMaterial.NORMALTEXTURE);
	}

	set normalTexture(value: BaseTexture) {
		if (value) {
			this.addDefine(BlinnPhongMaterial.SHADERDEFINE_NORMALMAP);
		}
		else {
			this.removeDefine(BlinnPhongMaterial.SHADERDEFINE_NORMALMAP);
		}
		this.setTextureByIndex(BlinnPhongMaterial.NORMALTEXTURE, value);
	}

	/**
	 * 高光贴图。
	 */
	get specularTexture(): BaseTexture {
		return this.getTextureByIndex(BlinnPhongMaterial.SPECULARTEXTURE);
	}

	set specularTexture(value: BaseTexture) {
		if (value)
			this.addDefine(BlinnPhongMaterial.SHADERDEFINE_SPECULARMAP);
		else
			this.removeDefine(BlinnPhongMaterial.SHADERDEFINE_SPECULARMAP);

		this.setTextureByIndex(BlinnPhongMaterial.SPECULARTEXTURE, value);
	}
	/**
	 * 是否支持透光色。
	 */
	get enableTransmission(): boolean {
		return this.hasDefine(BlinnPhongMaterial.SHADERDEFINE_ENABLETRANSMISSION);
	}

	set enableTransmission(value: boolean) {
		if (value)
			this.addDefine(BlinnPhongMaterial.SHADERDEFINE_ENABLETRANSMISSION);
		else
			this.removeDefine(BlinnPhongMaterial.SHADERDEFINE_ENABLETRANSMISSION);
	}

	/**
	 * 透光率，会影响漫反射以及透光强度
	 */
	get transmissionRata(): number {
		return this.getFloatByIndex(BlinnPhongMaterial.TRANSMISSIONRATE);
	}

	set transmissionRata(value: number) {
		this.setFloatByIndex(BlinnPhongMaterial.TRANSMISSIONRATE, value);
	}

	/**
	 * 透射影响范围指数
	 */
	get backDiffuse(): number {
		return this.getFloatByIndex(BlinnPhongMaterial.IBACKDIFFUSE);
	}
	set backDiffuse(value: number) {
		this.setFloatByIndex(BlinnPhongMaterial.IBACKDIFFUSE, Math.max(value, 1.0));
	}
	/**
	 * 透射光强度
	 */
	get backScale(): number {
		return this.getFloatByIndex(BlinnPhongMaterial.IBACKSCALE);
	}
	set backScale(value: number) {
		this.setFloatByIndex(BlinnPhongMaterial.IBACKSCALE, value);
	}

	/**
	 * 厚度贴图，会影响透视光，越厚，透射光越弱
	 */
	get thinknessTexture(): BaseTexture {
		return this.getTextureByIndex(BlinnPhongMaterial.THINKNESSTEXTURE);
	}
	set thinknessTexture(value: BaseTexture) {
		if (value)
			this.addDefine(BlinnPhongMaterial.SHADERDEFINE_THICKNESSMAP);
		else
			this.removeDefine(BlinnPhongMaterial.SHADERDEFINE_THICKNESSMAP);

		this.setTextureByIndex(BlinnPhongMaterial.THINKNESSTEXTURE, value);
	}

	/**
	 * 透光颜色。模拟透光物质内部颜色吸收率
	 */
	get transmissionColor(): Color {
		return this.getColorByIndex(BlinnPhongMaterial.TRANSMISSIONCOLOR);
	}
	set transmissionColor(value: Color) {
		this.setColorByIndex(BlinnPhongMaterial.TRANSMISSIONCOLOR, value);
	}

	/**
	 * 请使用transmissionRata
	 * @deprecated
	 */
	get transmissionRate(): number {
		return this.getFloatByIndex(BlinnPhongMaterial.TRANSMISSIONRATE);
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


