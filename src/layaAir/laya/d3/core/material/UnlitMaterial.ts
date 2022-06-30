import { LayaGL } from "../../../layagl/LayaGL";
import { BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { RenderCapable } from "../../../RenderEngine/RenderEnum/RenderCapable";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { ShaderDefine } from "../../../RenderEngine/RenderShader/ShaderDefine";
import { UniformBufferParamsType, UnifromBufferData } from "../../../RenderEngine/UniformBufferData";
import { UniformBufferObject } from "../../../RenderEngine/UniformBufferObject";
import { BaseTexture } from "../../../resource/BaseTexture";
import { Vector4 } from "../../math/Vector4";
import { ShaderDataType } from "../render/command/SetShaderDataCMD";
import { Material } from "./Material";
import { RenderState } from "./RenderState";

/**
 * <code>UnlitMaterial</code> 类用于实现不受光照影响的材质。
 */
export class UnlitMaterial extends Material {

	/**渲染状态_不透明。*/
	static RENDERMODE_OPAQUE: number = 0;
	/**渲染状态_阿尔法测试。*/
	static RENDERMODE_CUTOUT: number = 1;
	/**渲染状态__透明混合。*/
	static RENDERMODE_TRANSPARENT: number = 2;
	/**渲染状态__加色法混合。*/
	static RENDERMODE_ADDTIVE: number = 3;

	static SHADERDEFINE_ALBEDOTEXTURE: ShaderDefine;
	static SHADERDEFINE_ENABLEVERTEXCOLOR: ShaderDefine;

	static ALBEDOTEXTURE: number;
	static ALBEDOCOLOR: number;
	static TILINGOFFSET: number;

	/** 默认材质，禁止修改*/
	//static defaultMaterial: UnlitMaterial;

	// todo  去掉material类型的时候换到shader 上
	static unlitUniformMap: Map<string, UniformBufferParamsType>;

	/**
	 * @internal
	 */
	static __initDefine__(): void {
		UnlitMaterial.SHADERDEFINE_ALBEDOTEXTURE = Shader3D.getDefineByName("ALBEDOTEXTURE");
		UnlitMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR = Shader3D.getDefineByName("ENABLEVERTEXCOLOR");
		UnlitMaterial.unlitUniformMap = new Map();
		UnlitMaterial.unlitUniformMap.set("u_AlbedoColor", UniformBufferParamsType.Vector4);
		UnlitMaterial.unlitUniformMap.set("u_TilingOffset", UniformBufferParamsType.Vector4);

		UnlitMaterial.ALBEDOTEXTURE = Shader3D.propertyNameToID("u_AlbedoTexture");
		UnlitMaterial.ALBEDOCOLOR = Shader3D.propertyNameToID("u_AlbedoColor");
		UnlitMaterial.TILINGOFFSET = Shader3D.propertyNameToID("u_TilingOffset");
	}


	private _albedoIntensity: number;

	/**
	 * @internal
	 * @deprecated
	 */
	get _ColorR(): number {
		return this.albedoColor.x;
	}

	set _ColorR(value: number) {
		let albedo = this.albedoColor;
		albedo.x = value;
		this.albedoColor = albedo;
	}

	/**
	 * @internal
	 * @deprecated
	 */
	get _ColorG(): number {
		return this.albedoColor.y;
	}

	set _ColorG(value: number) {
		let albedo = this.albedoColor;
		albedo.y = value;
		this.albedoColor = albedo;
	}

	/**
	 * @internal
	 * @deprecated
	 */
	get _ColorB(): number {
		return this.albedoColor.z;
	}

	set _ColorB(value: number) {
		let albedo = this.albedoColor;
		albedo.z = value;
		this.albedoColor = albedo;
	}

	/**
	 * @internal 
	 * @deprecated
	 */
	get _ColorA(): number {
		return this.albedoColor.w;
	}

	set _ColorA(value: number) {
		let albedo = this.albedoColor;
		albedo.w = value;
		this.albedoColor = albedo;
	}

	/**
	 * @internal
	 */
	get _Color(): Vector4 {
		return this._shaderValues.getVector(UnlitMaterial.ALBEDOCOLOR);
	}

	set _Color(value: Vector4) {
		this.albedoColor = value;
	}

	/**
	 * @internal
	 */
	get _AlbedoIntensity(): number {
		return this._albedoIntensity;
	}

	set _AlbedoIntensity(value: number) {
		if (this._albedoIntensity !== value) {
			var finalAlbedo: Vector4 = (<Vector4>this._shaderValues.getVector(UnlitMaterial.ALBEDOCOLOR));
			Vector4.scale(this.albedoColor, value, finalAlbedo);
			this._albedoIntensity = value;
			this._shaderValues.setVector(UnlitMaterial.ALBEDOCOLOR, finalAlbedo);
		}
	}

	/**
	 * @internal
	 */
	get _MainTex_STX(): number {
		return this._shaderValues.getVector(UnlitMaterial.TILINGOFFSET).x;
	}

	set _MainTex_STX(x: number) {
		var tilOff: Vector4 = (<Vector4>this._shaderValues.getVector(UnlitMaterial.TILINGOFFSET));
		tilOff.x = x;
		this.tilingOffset = tilOff;
	}

	/**
	 * @internal
	 */
	get _MainTex_STY(): number {
		return this._shaderValues.getVector(UnlitMaterial.TILINGOFFSET).y;
	}

	set _MainTex_STY(y: number) {
		var tilOff: Vector4 = (<Vector4>this._shaderValues.getVector(UnlitMaterial.TILINGOFFSET));
		tilOff.y = y;
		this.tilingOffset = tilOff;
	}

	/**
	 * @internal
	 */
	get _MainTex_STZ(): number {
		return this._shaderValues.getVector(UnlitMaterial.TILINGOFFSET).z;
	}

	set _MainTex_STZ(z: number) {
		var tilOff: Vector4 = (<Vector4>this._shaderValues.getVector(UnlitMaterial.TILINGOFFSET));
		tilOff.z = z;
		this.tilingOffset = tilOff;
	}

	/**
	 * @internal
	 */
	get _MainTex_STW(): number {
		return this._shaderValues.getVector(UnlitMaterial.TILINGOFFSET).w;
	}

	set _MainTex_STW(w: number) {
		var tilOff: Vector4 = (<Vector4>this._shaderValues.getVector(UnlitMaterial.TILINGOFFSET));
		tilOff.w = w;
		this.tilingOffset = tilOff;
	}

	/**
	 * @internal
	 */
	get _MainTex_ST(): Vector4 {
		return this._shaderValues.getVector(UnlitMaterial.TILINGOFFSET);
	}

	set _MainTex_ST(value: Vector4) {
		this.tilingOffset = value;
	}

	/**
	 * @internal
	 */
	get _Cutoff(): number {
		return this.alphaTestValue;
	}

	set _Cutoff(value: number) {
		this.alphaTestValue = value;
	}

	/**
	 * 反照率颜色R分量。
	 */
	get albedoColorR(): number {
		return this._ColorR;
	}

	set albedoColorR(value: number) {
		this._ColorR = value;
	}

	/**
	 * 反照率颜色G分量。
	 */
	get albedoColorG(): number {
		return this._ColorG;
	}

	set albedoColorG(value: number) {
		this._ColorG = value;
	}

	/**
	 * 反照率颜色B分量。
	 */
	get albedoColorB(): number {
		return this._ColorB;
	}

	set albedoColorB(value: number) {
		this._ColorB = value;
	}

	/**
	 * 反照率颜色Z分量。
	 */
	get albedoColorA(): number {
		return this._ColorA;
	}

	set albedoColorA(value: number) {
		this._ColorA = value;
	}

	/**
	 * 反照率颜色。
	 */
	get albedoColor(): Vector4 {
		return this._shaderValues.getVector(UnlitMaterial.ALBEDOCOLOR);;
	}

	set albedoColor(value: Vector4) {
		var finalAlbedo: Vector4 = (<Vector4>this._shaderValues.getVector(UnlitMaterial.ALBEDOCOLOR));
		Vector4.scale(value, this._albedoIntensity, finalAlbedo);
		this._shaderValues.setVector(UnlitMaterial.ALBEDOCOLOR, finalAlbedo);

		// if (this._uniformBlock) {
		// 	let uniformData = this._uniformBlock._updateDataInfo;
		// 	uniformData.setVector4byIndex(UnlitMaterial.ALBEDOCOLOR, this.albedoColor);
		// 	this._uniformBlock.setDataByUniformBufferData(uniformData);
		// }
		this.setUniformBufferData("UnlitBlock","u_AlbedoColor",ShaderDataType.Vector4,value);
	}

	/**
	 * 反照率强度。
	 */
	get albedoIntensity(): number {
		return this._albedoIntensity;
	}

	set albedoIntensity(value: number) {
		this._AlbedoIntensity = value;
	}

	/**
	 * 反照率贴图。
	 */
	get albedoTexture(): BaseTexture {
		return this._shaderValues.getTexture(UnlitMaterial.ALBEDOTEXTURE);
	}

	set albedoTexture(value: BaseTexture) {
		if (value)
			this._shaderValues.addDefine(UnlitMaterial.SHADERDEFINE_ALBEDOTEXTURE);
		else
			this._shaderValues.removeDefine(UnlitMaterial.SHADERDEFINE_ALBEDOTEXTURE);
		this._shaderValues.setTexture(UnlitMaterial.ALBEDOTEXTURE, value);
	}

	/**
	 * 纹理平铺和偏移X分量。
	 */
	get tilingOffsetX(): number {
		return this._MainTex_STX;
	}

	set tilingOffsetX(x: number) {
		this._MainTex_STX = x;
	}

	/**
	 * 纹理平铺和偏移Y分量。
	 */
	get tilingOffsetY(): number {
		return this._MainTex_STY;
	}

	set tilingOffsetY(y: number) {
		this._MainTex_STY = y;
	}

	/**
	 * 纹理平铺和偏移Z分量。
	 */
	get tilingOffsetZ(): number {
		return this._MainTex_STZ;
	}

	set tilingOffsetZ(z: number) {
		this._MainTex_STZ = z;
	}

	/**
	 * 纹理平铺和偏移W分量。
	 */
	get tilingOffsetW(): number {
		return this._MainTex_STW;
	}

	set tilingOffsetW(w: number) {
		this._MainTex_STW = w;
	}

	/**
	 * 纹理平铺和偏移。
	 */
	get tilingOffset(): Vector4 {
		return (<Vector4>this._shaderValues.getVector(UnlitMaterial.TILINGOFFSET));
	}

	set tilingOffset(value: Vector4) {
		if (value) {
			this._shaderValues.setVector(UnlitMaterial.TILINGOFFSET, value);
			this.setUniformBufferData("UnlitBlock","u_TilingOffset",ShaderDataType.Vector4,value);
		}
		else {
			this._shaderValues.getVector(UnlitMaterial.TILINGOFFSET).setValue(1.0, 1.0, 0.0, 0.0);
			this.setUniformBufferData("UnlitBlock","u_TilingOffset",ShaderDataType.Vector4,new Vector4(1.0,1.0,0.0,0.0));
		}
	}

	/**
	 * 是否支持顶点色。
	 */
	get enableVertexColor(): boolean {
		return this._shaderValues.hasDefine(UnlitMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR);
	}

	set enableVertexColor(value: boolean) {
		if (value)
			this._shaderValues.addDefine(UnlitMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR);
		else
			this._shaderValues.removeDefine(UnlitMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR);
	}

	/**
	 * 渲染模式。
	 */
	set renderMode(value: number) {
		switch (value) {
			case UnlitMaterial.RENDERMODE_OPAQUE:
				this.alphaTest = false;
				this.renderQueue = Material.RENDERQUEUE_OPAQUE;
				this.depthWrite = true;
				this.cull = RenderState.CULL_BACK;
				this.blend = RenderState.BLEND_DISABLE;
				this.depthTest = RenderState.DEPTHTEST_LESS;
				break;
			case UnlitMaterial.RENDERMODE_CUTOUT:
				this.renderQueue = Material.RENDERQUEUE_ALPHATEST;
				this.alphaTest = true;
				this.depthWrite = true;
				this.cull = RenderState.CULL_BACK;
				this.blend = RenderState.BLEND_DISABLE;
				this.depthTest = RenderState.DEPTHTEST_LESS;
				break;
			case UnlitMaterial.RENDERMODE_TRANSPARENT:
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
				throw new Error("UnlitMaterial : renderMode value error.");
		}
	}

	constructor() {
		super();
		this.setShaderName("Unlit");

		this._shaderValues.setVector(UnlitMaterial.ALBEDOCOLOR, new Vector4(1.0, 1.0, 1.0, 1.0));
		this._shaderValues.setVector(UnlitMaterial.TILINGOFFSET, new Vector4(1.0, 1.0, 0.0, 0.0));
		this.renderMode = UnlitMaterial.RENDERMODE_OPAQUE;
		this.albedoIntensity = 1.0;

		this.setUniformBufferData("UnlitBlock","u_AlbedoColor",ShaderDataType.Vector4,new Vector4(1,1,1,1));
		this.setUniformBufferData("UnlitBlock","u_TilingOffset",ShaderDataType.Vector4,new Vector4(1,1,0,0));
		// if (LayaGL.renderEngine.getCapable(RenderCapable.UnifromBufferObject)) {
		// 	let uniformData = new UnifromBufferData(UnlitMaterial.unlitUniformMap);
		// 	this._uniformBlock = UniformBufferObject.creat("UnlitBlock", BufferUsage.Dynamic, uniformData.getbyteLength(), false);

		// 	uniformData.setVector4byIndex(UnlitMaterial.ALBEDOCOLOR, this.albedoColor);
		// 	uniformData.setVector4byIndex(UnlitMaterial.TILINGOFFSET, this.tilingOffset);

		// 	this._uniformBlock.setDataByUniformBufferData(uniformData);
		// 	this.shaderData.setValueData(Shader3D.propertyNameToID(this._uniformBlock._name), this._uniformBlock);
		// }
	}

	/**
	 * 克隆。
	 * @return	 克隆副本。
	 * @override
	 */
	clone(): any {
		var dest: UnlitMaterial = new UnlitMaterial();
		this.cloneTo(dest);
		return dest;
	}
}

