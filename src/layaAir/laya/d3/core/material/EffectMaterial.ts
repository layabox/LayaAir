import { RenderState } from "../../../RenderDriver/RenderModuleData/Design/RenderState";
import { Color } from "../../../maths/Color";
import { Vector4 } from "../../../maths/Vector4";
import { BaseTexture } from "../../../resource/BaseTexture";
import { Material } from "../../../resource/Material";
import { UnlitMaterial } from "./UnlitMaterial";

/**
 * @en The AffectMaterial class is used to implement Mesh effect materials.
 * @zh EffectMaterial 类用于实现Mesh特效材质。
 */
export class EffectMaterial extends Material {
	/**
	 * @en Default material, no modification allowed
	 * @zh 默认材质，禁止修改
	 */
	static defaultMaterial: EffectMaterial;

	/**
	 * @en The color of the material.
	 * @zh 材质的颜色。
	 */
	get color(): Color {
		return (<Color>this.getColorByIndex(UnlitMaterial.ALBEDOCOLOR));
	}

	set color(value: Color) {
		this.setColorByIndex(UnlitMaterial.ALBEDOCOLOR, value);
	}

	/**
	 * @en The texture of the material.
	 * @zh 材质的贴图。
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
	 * @en The tiling and offset values for the material's textures.
	 * @zh 材质纹理的平铺和偏移值。
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
	 * @ignore
	 * @en Creates an instance of EffectMaterial.
	 * @zh 创建EffectMaterial实例。
	 */
	constructor() {
		super();
		this.setShaderName("Unlit");
		this.setVector4ByIndex(UnlitMaterial.TILINGOFFSET, new Vector4(1.0, 1.0, 0.0, 0.0));
		this.setColorByIndex(UnlitMaterial.ALBEDOCOLOR, new Color(1.0, 1.0, 1.0, 1.0));
		this.renderMode = EffectMaterial.RENDERMODE_ADDTIVE;
	}

	/**
	 * @override
	 * @en Clone the material.
	 * @returns A clone of the material.
	 * @zh 克隆材质。
	 * @returns 克隆的材质副本。
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
				throw new Error("unknown renderMode: " + value);
		}
	}
}

