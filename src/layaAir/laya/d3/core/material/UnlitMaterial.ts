import { Color } from "../../../maths/Color";
import { Vector4 } from "../../../maths/Vector4";
import { RenderState } from "../../../RenderEngine/RenderShader/RenderState";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { ShaderDefine } from "../../../RenderEngine/RenderShader/ShaderDefine";
import { BaseTexture } from "../../../resource/BaseTexture";
import { Material } from "./Material";

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
		return this.getColorByIndex(UnlitMaterial.ALBEDOCOLOR);
	}

	set albedoColor(value: Color) {
		this.setColorByIndex(UnlitMaterial.ALBEDOCOLOR, value.scale(this._albedoIntensity));
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
		return this.getTextureByIndex(UnlitMaterial.ALBEDOTEXTURE);
	}

	set albedoTexture(value: BaseTexture) {
		if (value)
			this.addDefine(UnlitMaterial.SHADERDEFINE_ALBEDOTEXTURE);
		else
			this.removeDefine(UnlitMaterial.SHADERDEFINE_ALBEDOTEXTURE);
		this.setTextureByIndex(UnlitMaterial.ALBEDOTEXTURE, value);
	}

	/**
	 * 纹理平铺和偏移。
	 */
	get tilingOffset(): Vector4 {
		return (<Vector4>this.getVector4ByIndex(UnlitMaterial.TILINGOFFSET));
	}

	set tilingOffset(value: Vector4) {
		if (value) {
			this.setVector4ByIndex(UnlitMaterial.TILINGOFFSET, value);
		}
		else {
			this.setVector4ByIndex(UnlitMaterial.TILINGOFFSET, new Vector4(1.0, 1.0, 0.0, 0.0));
		}
	}

	/**
	 * 是否支持顶点色。
	 */
	get enableVertexColor(): boolean {
		return this.hasDefine(UnlitMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR);
	}

	set enableVertexColor(value: boolean) {
		if (value)
			this.addDefine(UnlitMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR);
		else
			this.removeDefine(UnlitMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR);
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

