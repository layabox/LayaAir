import { Color } from "../../../maths/Color";
import { Vector4 } from "../../../maths/Vector4";
import { RenderState } from "../../../RenderDriver/RenderModuleData/Design/RenderState";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { BaseTexture } from "../../../resource/BaseTexture";
import { Material, MaterialRenderMode } from "../../../resource/Material";

/**
 * @en The `TrailMaterial` class is used to implement trail materials.
 * @zh `TrailMaterial` 类用于实现拖尾材质。
 */
export class TrailMaterial extends Material {


	/**
	 * @en The default material, do not modify.
	 * @zh 默认材质，禁止修改。
	 */
	static defaultMaterial: TrailMaterial;
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
		TrailMaterial.MAINTEXTURE = Shader3D.propertyNameToID("u_MainTexture");
		TrailMaterial.TINTCOLOR = Shader3D.propertyNameToID("u_MainColor");
		TrailMaterial.TILINGOFFSET = Shader3D.propertyNameToID("u_TilingOffset");
	}

	/**
	 * @en The color of the material.
	 * @zh 材质的颜色。
	 */
	get color(): Color {
		return (<Color>this._shaderValues.getColor(TrailMaterial.TINTCOLOR));
	}

	set color(value: Color) {
		this._shaderValues.setColor(TrailMaterial.TINTCOLOR, value);
	}

	/**
	 * @en The texture of the material.
	 * @zh 材质贴图。
	 */
	get texture(): BaseTexture {
		return this._shaderValues.getTexture(TrailMaterial.MAINTEXTURE);
	}

	set texture(value: BaseTexture) {
		if (value)
			this._shaderValues.addDefine(TrailMaterial.SHADERDEFINE_MAINTEXTURE);
		else
			this._shaderValues.removeDefine(TrailMaterial.SHADERDEFINE_MAINTEXTURE);
		this._shaderValues.setTexture(TrailMaterial.MAINTEXTURE, value);
	}

	/**
	 * @en The tiling and offset of the texture.
	 * @zh 纹理的平铺和偏移。
	 */
	get tilingOffset(): Vector4 {
		return (<Vector4>this._shaderValues.getVector(TrailMaterial.TILINGOFFSET));
	}

	set tilingOffset(value: Vector4) {
		if (value) {
			this._shaderValues.setVector(TrailMaterial.TILINGOFFSET, value);
		}
		else {
			this._shaderValues.getVector(TrailMaterial.TILINGOFFSET).setValue(1.0, 1.0, 0.0, 0.0);
		}
	}

	/**@ignore */
	constructor() {
		super();
		this.setShaderName("Trail");
		this.materialRenderMode = MaterialRenderMode.RENDERMODE_ALPHABLENDED;
	}

	/**
	 * @inheritdoc
	 * @override
	 * @en Clones the material.
	 * @returns A cloned instance of the material.
	 * @zh 克隆材质。
	 * @returns 材质的一个克隆实例。
	 */
	clone(): any {
		var dest: TrailMaterial = new TrailMaterial();
		this.cloneTo(dest);
		return dest;
	}

	//----------------deprecated----------------
	/**
	 * @deprecated
	 * 渲染状态_透明混合。
	 */
	static RENDERMODE_ALPHABLENDED: number = 0;

	/**
	* @deprecated
	* 渲染状态_加色法混合。
	*/
	static RENDERMODE_ADDTIVE: number = 1;

	/**
	 * @deprecated
	 * 渲染模式。现在可以直接使用materialRenderMode
	 */
	set renderMode(value: number) {
		switch (value) {
			case TrailMaterial.RENDERMODE_ADDTIVE:
				this.renderQueue = Material.RENDERQUEUE_TRANSPARENT;
				this.depthWrite = false;
				this.cull = RenderState.CULL_NONE;
				this.blend = RenderState.BLEND_ENABLE_ALL;
				this.blendSrc = RenderState.BLENDPARAM_SRC_ALPHA;
				this.blendDst = RenderState.BLENDPARAM_ONE;
				this.alphaTest = false;
				this._shaderValues.addDefine(TrailMaterial.SHADERDEFINE_ADDTIVEFOG);
				break;
			case TrailMaterial.RENDERMODE_ALPHABLENDED:
				this.renderQueue = Material.RENDERQUEUE_TRANSPARENT;
				this.depthWrite = false;
				this.cull = RenderState.CULL_NONE;
				this.blend = RenderState.BLEND_ENABLE_ALL;
				this.blendSrc = RenderState.BLENDPARAM_SRC_ALPHA;
				this.blendDst = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
				this.alphaTest = false;
				this._shaderValues.removeDefine(TrailMaterial.SHADERDEFINE_ADDTIVEFOG);
				break;
			default:
				throw new Error("ShurikenParticleMaterial : renderMode value error.");
		}
	}
}

