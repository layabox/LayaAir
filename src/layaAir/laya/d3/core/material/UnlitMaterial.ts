import { LayaGL } from "../../../layagl/LayaGL";
import { BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { RenderCapable } from "../../../RenderEngine/RenderEnum/RenderCapable";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { ShaderDataType } from "../../../RenderEngine/RenderShader/ShaderData";
import { ShaderDefine } from "../../../RenderEngine/RenderShader/ShaderDefine";
import { UniformBufferParamsType, UnifromBufferData } from "../../../RenderEngine/UniformBufferData";
import { UniformBufferObject } from "../../../RenderEngine/UniformBufferObject";
import { BaseTexture } from "../../../resource/BaseTexture";
import { Color } from "../../math/Color";
import { Vector4 } from "../../math/Vector4";

import { Material } from "./Material";
import { RenderState } from "./RenderState";

/**
 * <code>UnlitMaterial</code> 类用于实现不受光照影响的材质。
 */
export class UnlitMaterial extends Material {

	static SHADERDEFINE_ALBEDOTEXTURE: ShaderDefine;

	static SHADERDEFINE_ENABLEVERTEXCOLOR: ShaderDefine;

	static ALBEDOTEXTURE: number;

	static ALBEDOCOLOR: number;

	static TILINGOFFSET: number;

	/**
	 * @internal
	 */
	static __initDefine__(): void {
		UnlitMaterial.SHADERDEFINE_ALBEDOTEXTURE = Shader3D.getDefineByName("ALBEDOTEXTURE");
		UnlitMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR = Shader3D.getDefineByName("ENABLEVERTEXCOLOR");

		UnlitMaterial.ALBEDOTEXTURE = Shader3D.propertyNameToID("u_AlbedoTexture");
		UnlitMaterial.ALBEDOCOLOR = Shader3D.propertyNameToID("u_AlbedoColor");
		UnlitMaterial.TILINGOFFSET = Shader3D.propertyNameToID("u_TilingOffset");
	}

	private _albedoIntensity: number;

	/**
	 * 反照率颜色。
	 */
	get albedoColor(): Color {
		return this._shaderValues.getColor(UnlitMaterial.ALBEDOCOLOR);
	}

	set albedoColor(value: Color) {
		this._shaderValues.setColor(UnlitMaterial.ALBEDOCOLOR, value.scale(this._albedoIntensity));
	}

	/**
	 * 反照率强度。
	 */
	get albedoIntensity(): number {
		return this._albedoIntensity;
	}

	set albedoIntensity(value: number) {
		this._albedoIntensity = value;
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
	 * 纹理平铺和偏移。
	 */
	get tilingOffset(): Vector4 {
		return (<Vector4>this._shaderValues.getVector(UnlitMaterial.TILINGOFFSET));
	}

	set tilingOffset(value: Vector4) {
		if (value) {
			this._shaderValues.setVector(UnlitMaterial.TILINGOFFSET, value);
		}
		else {
			this._shaderValues.getVector(UnlitMaterial.TILINGOFFSET).setValue(1.0, 1.0, 0.0, 0.0);
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



	constructor() {
		super();
		this.setShaderName("Unlit");
		this.renderMode = UnlitMaterial.RENDERMODE_OPAQUE;
		this.albedoIntensity = 1.0;
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



	//----------------deprecated----------------
	/**
	 * @deprecated
	 * 渲染状态_不透明。
	 */
	static RENDERMODE_OPAQUE: number = 0;
	/**
	 * @deprecated
	 * 渲染状态_阿尔法测试。
	*/
	static RENDERMODE_CUTOUT: number = 1;
	/**
	 * @deprecated
	 * 渲染状态__透明混合。 
	 */
	static RENDERMODE_TRANSPARENT: number = 2;
	/**
	 * @deprecated
	 * 渲染状态__加色法混合。 
	 */
	static RENDERMODE_ADDTIVE: number = 3;
	/**
	 * @deprecated
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
}

