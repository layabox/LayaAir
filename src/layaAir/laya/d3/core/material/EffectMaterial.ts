import { Color } from "../../../maths/Color";
import { Vector4 } from "../../../maths/Vector4";
import { RenderState } from "../../../RenderEngine/RenderShader/RenderState";
import { BaseTexture } from "../../../resource/BaseTexture";
import { Material } from "./Material";
import { UnlitMaterial } from "./UnlitMaterial";

/**
 * <code>EffectMaterial</code> 类用于实现Mesh特效材质。
 */
export class EffectMaterial extends Material {
	/** 默认材质，禁止修改*/
	static defaultMaterial: EffectMaterial;

	

	/**
	 * 获取颜色。
	 */
	get color(): Color {
		return (<Color>this.getColorByIndex(UnlitMaterial.ALBEDOCOLOR));
	}

	set color(value: Color) {
		this.setColorByIndex(UnlitMaterial.ALBEDOCOLOR, value);
	}

	/**
	 * 贴图。
	 */
	get texture(): BaseTexture {
		return this.getTextureByIndex(UnlitMaterial.ALBEDOTEXTURE);
	}

	set texture(value: BaseTexture) {
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
			this.getVector4ByIndex(UnlitMaterial.TILINGOFFSET).setValue(1.0, 1.0, 0.0, 0.0);
		}
	}


	/**
	 * 创建一个 <code>EffectMaterial</code> 实例。
	 */
	constructor() {
		super();
		this.setShaderName("Unlit");
		this.setVector4ByIndex(UnlitMaterial.TILINGOFFSET, new Vector4(1.0, 1.0, 0.0, 0.0));
		this.setColorByIndex(UnlitMaterial.ALBEDOCOLOR, new Color(1.0, 1.0, 1.0, 1.0));
		this.renderMode = EffectMaterial.RENDERMODE_ADDTIVE;
	}

	/**
	 * 克隆。
	 * @return	 克隆副本。
	 * @override
	 */
	clone(): any {
		var dest: EffectMaterial = new EffectMaterial();
		this.cloneTo(dest);
		return dest;
	}

	//----------------deprecated----------------

	/**
	 * @deprecated
	 * 渲染状态_加色法混合。
	 */
	static RENDERMODE_ADDTIVE: number = 0;

	/**
	 * @deprecated
	 * 渲染状态_透明混合。*/
	static RENDERMODE_ALPHABLENDED: number = 1;

	/**
	 * @deprecated
	 * 设置渲染模式。
	 * 可以使用新的渲染状态
	 */
	 set renderMode(value: number) {
		switch (value) {
			case EffectMaterial.RENDERMODE_ADDTIVE:
				this.renderQueue = Material.RENDERQUEUE_TRANSPARENT;
				this.alphaTest = false;
				this.depthWrite = false;
				this.cull = RenderState.CULL_NONE;
				this.blend = RenderState.BLEND_ENABLE_ALL;
				this.blendSrc = RenderState.BLENDPARAM_SRC_ALPHA;
				this.blendDst = RenderState.BLENDPARAM_ONE;
				this.depthTest = RenderState.DEPTHTEST_LEQUAL;
				this.addDefine(Material.SHADERDEFINE_ADDTIVEFOG);
				break;
			case EffectMaterial.RENDERMODE_ALPHABLENDED:
				this.renderQueue = Material.RENDERQUEUE_TRANSPARENT;
				this.alphaTest = false;
				this.depthWrite = false;
				this.cull = RenderState.CULL_NONE;
				this.blend = RenderState.BLEND_ENABLE_ALL;
				this.blendSrc = RenderState.BLENDPARAM_SRC_ALPHA;
				this.blendDst = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
				this.depthTest = RenderState.DEPTHTEST_LEQUAL;
				this.removeDefine(Material.SHADERDEFINE_ADDTIVEFOG);
				break;
			default:
				throw new Error("MeshEffectMaterial : renderMode value error.");
		}
	}
}

