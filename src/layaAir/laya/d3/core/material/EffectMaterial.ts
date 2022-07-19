import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { ShaderDefine } from "../../../RenderEngine/RenderShader/ShaderDefine";
import { BaseTexture } from "../../../resource/BaseTexture";
import { Color } from "../../math/Color";
import { Vector4 } from "../../math/Vector4";
import { Material } from "./Material";
import { RenderState } from "./RenderState";

/**
 * <code>EffectMaterial</code> 类用于实现Mesh特效材质。
 */
export class EffectMaterial extends Material {
	/** 默认材质，禁止修改*/
	static defaultMaterial: EffectMaterial;
	/**@internal */
	static SHADERDEFINE_MAINTEXTURE: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_ADDTIVEFOG: ShaderDefine;
	/**@internal */
	static MAINTEXTURE: number;
	/**@internal */
	static TINTCOLOR: number;
	/**@internal */
	static TILINGOFFSET: number;

	/**
	 * @internal
	 */
	static __initDefine__(): void {
		EffectMaterial.SHADERDEFINE_MAINTEXTURE = Shader3D.getDefineByName("MAINTEXTURE");
		EffectMaterial.SHADERDEFINE_ADDTIVEFOG = Shader3D.getDefineByName("ADDTIVEFOG");
		EffectMaterial.MAINTEXTURE= Shader3D.propertyNameToID("u_AlbedoTexture");
		EffectMaterial.TINTCOLOR= Shader3D.propertyNameToID("u_AlbedoColor");
		EffectMaterial.TILINGOFFSET= Shader3D.propertyNameToID("u_TilingOffset");

	}

	

	/**
	 * 获取颜色。
	 */
	get color(): Color {
		return (<Color>this._shaderValues.getColor(EffectMaterial.TINTCOLOR));
	}

	set color(value: Color) {
		this._shaderValues.setColor(EffectMaterial.TINTCOLOR, value);
	}

	/**
	 * 贴图。
	 */
	get texture(): BaseTexture {
		return this._shaderValues.getTexture(EffectMaterial.MAINTEXTURE);
	}

	set texture(value: BaseTexture) {
		if (value)
			this._shaderValues.addDefine(EffectMaterial.SHADERDEFINE_MAINTEXTURE);
		else
			this._shaderValues.removeDefine(EffectMaterial.SHADERDEFINE_MAINTEXTURE);
		this._shaderValues.setTexture(EffectMaterial.MAINTEXTURE, value);
	}

	/**
	 * 纹理平铺和偏移。
	 */
	get tilingOffset(): Vector4 {
		return (<Vector4>this._shaderValues.getVector(EffectMaterial.TILINGOFFSET));
	}

	set tilingOffset(value: Vector4) {
		if (value) {
			this._shaderValues.setVector(EffectMaterial.TILINGOFFSET, value);
		}
		else {
			this._shaderValues.getVector(EffectMaterial.TILINGOFFSET).setValue(1.0, 1.0, 0.0, 0.0);
		}
	}


	/**
	 * 创建一个 <code>EffectMaterial</code> 实例。
	 */
	constructor() {
		super();
		this.setShaderName("Effect");
		this._shaderValues.setVector(EffectMaterial.TILINGOFFSET, new Vector4(1.0, 1.0, 0.0, 0.0));
		this._shaderValues.setVector(EffectMaterial.TINTCOLOR, new Vector4(1.0, 1.0, 1.0, 1.0));
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
				this._shaderValues.addDefine(EffectMaterial.SHADERDEFINE_ADDTIVEFOG);
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
				this._shaderValues.removeDefine(EffectMaterial.SHADERDEFINE_ADDTIVEFOG);
				break;
			default:
				throw new Error("MeshEffectMaterial : renderMode value error.");
		}
	}
}

