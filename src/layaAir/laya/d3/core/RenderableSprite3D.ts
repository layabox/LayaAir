import { Node } from "../../display/Node";
import { Sprite3D } from "./Sprite3D";
import { BaseRender } from "./render/BaseRender";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";

import { LayaGL } from "../../layagl/LayaGL";
import { ShaderDefine } from "../../RenderDriver/RenderModuleData/Design/ShaderDefine";
import { ShaderDataType } from "../../RenderDriver/DriverDesign/RenderDevice/ShaderData";


/**
 * @deprecated
 * <code>RenderableSprite3D</code> 类用于可渲染3D精灵的父类，抽象类不允许实例。
 */
export class RenderableSprite3D extends Sprite3D {
	/**精灵级着色器宏定义,接收阴影。*/
	static SHADERDEFINE_RECEIVE_SHADOW: ShaderDefine;
	/**精灵级着色器宏定义,光照贴图。*/
	static SAHDERDEFINE_LIGHTMAP: ShaderDefine;
	/**精灵级着色器宏定义,光照贴图方向。 */
	static SHADERDEFINE_LIGHTMAP_DIRECTIONAL: ShaderDefine;
	/**着色器变量名，光照贴图缩放和偏移。*/
	static LIGHTMAPSCALEOFFSET: number;
	/**着色器变量名，光照贴图。*/
	static LIGHTMAP: number;
	/**着色器变量名，光照贴图方向。*/
	static LIGHTMAP_DIRECTION: number;
	/**拾取颜色。*/
	static PICKCOLOR: number;

	/// Morph target

	static SHADERDEFINE_MORPHTARGET: ShaderDefine;
	static SHADERDEFINE_MORPHTARGET_POSITION: ShaderDefine;
	static SHADERDEFINE_MORPHTARGET_NORMAL: ShaderDefine;
	static SHADERDEFINE_MORPHTARGET_TANGENT: ShaderDefine;

	/** @internal */
	static MorphTex: number;
	/** @internal */
	static MorphParams: number;
	/** @internal */
	static MorphAttriOffset: number;
	/** @internal */
	static MorphActiceTargets: number;
	/** @internal */
	static MorphActiveCount: number;

	//--------------------------------------------------------deprecated------------------------------------------------------------------------
	/**
	 * @deprecated
	 * @internal
	 */
	static AMBIENTSHAR: number;
	/**
	 * @deprecated
	 * @internal
	 */
	static AMBIENTSHAG: number;
	/**
	 * @deprecated
	 * @internal
	 */
	static AMBIENTSHAB: number;
	/**
	 * @deprecated
	 * @internal
	 */
	static AMBIENTSHBR: number;
	/**
	* @deprecated
	* @internal
	*/
	static AMBIENTSHBG: number;
	/**
	* @deprecated
	* @internal
	*/
	static AMBIENTSHBB: number;
	/**
	* @deprecated
	* @internal
	*/
	static AMBIENTSHC: number;
	/**
	 * @deprecated
	 *  反射贴图 
	 */
	static REFLECTIONTEXTURE: number;
	/**
	 * @deprecated
	 *  反射贴图参数 
	 */
	static REFLECTIONCUBE_HDR_PARAMS: number;


	/**
	 * @internal
	 */
	static __init__(): void {
		RenderableSprite3D.SHADERDEFINE_RECEIVE_SHADOW = Shader3D.getDefineByName("RECEIVESHADOW");
		RenderableSprite3D.SAHDERDEFINE_LIGHTMAP = Shader3D.getDefineByName("LIGHTMAP");
		RenderableSprite3D.SHADERDEFINE_LIGHTMAP_DIRECTIONAL = Shader3D.getDefineByName("LIGHTMAP_DIRECTIONAL");

		RenderableSprite3D.LIGHTMAPSCALEOFFSET = Shader3D.propertyNameToID("u_LightmapScaleOffset");
		RenderableSprite3D.LIGHTMAP = Shader3D.propertyNameToID("u_LightMap");
		RenderableSprite3D.LIGHTMAP_DIRECTION = Shader3D.propertyNameToID("u_LightMapDirection");
		RenderableSprite3D.PICKCOLOR = Shader3D.propertyNameToID("u_PickColor");

		const commandUniform = LayaGL.renderDeviceFactory.createGlobalUniformMap("Sprite3D");

		/// morph target

		RenderableSprite3D.SHADERDEFINE_MORPHTARGET = Shader3D.getDefineByName("MORPHTARGETS");
		RenderableSprite3D.SHADERDEFINE_MORPHTARGET_POSITION = Shader3D.getDefineByName("MORPHTARGETS_POSITION");
		RenderableSprite3D.SHADERDEFINE_MORPHTARGET_NORMAL = Shader3D.getDefineByName("MORPHTARGETS_NORMAL");
		RenderableSprite3D.SHADERDEFINE_MORPHTARGET_TANGENT = Shader3D.getDefineByName("MORPHTARGETS_TANGENT");

		RenderableSprite3D.MorphTex = Shader3D.propertyNameToID("u_MorphTargetsTex");
		RenderableSprite3D.MorphParams = Shader3D.propertyNameToID("u_MorphParams");
		RenderableSprite3D.MorphAttriOffset = Shader3D.propertyNameToID("u_MorphAttrOffset");
		RenderableSprite3D.MorphActiceTargets = Shader3D.propertyNameToID("u_MorphActiveTargets");
		RenderableSprite3D.MorphActiveCount = Shader3D.propertyNameToID("u_MorphTargetActiveCount");

		commandUniform.addShaderUniform(RenderableSprite3D.MorphTex, "u_MorphTargetsTex", ShaderDataType.Texture2D);
		commandUniform.addShaderUniform(RenderableSprite3D.MorphParams, "u_MorphParams", ShaderDataType.Vector4);
		commandUniform.addShaderUniform(RenderableSprite3D.MorphAttriOffset, "u_MorphAttrOffset", ShaderDataType.Vector4);
		commandUniform.addShaderUniform(RenderableSprite3D.MorphActiceTargets, "u_MorphActiveTargets", ShaderDataType.Buffer);
		commandUniform.addShaderUniform(RenderableSprite3D.MorphActiveCount, "u_MorphTargetActiveCount", ShaderDataType.Int);

		commandUniform.addShaderUniform(RenderableSprite3D.LIGHTMAPSCALEOFFSET, "u_LightmapScaleOffset", ShaderDataType.Vector4);
		commandUniform.addShaderUniform(RenderableSprite3D.LIGHTMAP, "u_LightMap", ShaderDataType.Texture2D);
		commandUniform.addShaderUniform(RenderableSprite3D.LIGHTMAP_DIRECTION, "u_LightMapDirection", ShaderDataType.Texture2D);
		commandUniform.addShaderUniform(RenderableSprite3D.PICKCOLOR, "u_PickColor", ShaderDataType.Vector3);

		//Legency Reflectexture
		RenderableSprite3D.REFLECTIONTEXTURE = Shader3D.propertyNameToID("u_ReflectTexture");
		RenderableSprite3D.REFLECTIONCUBE_HDR_PARAMS = Shader3D.propertyNameToID("u_ReflectCubeHDRParams");
		commandUniform.addShaderUniform(RenderableSprite3D.REFLECTIONTEXTURE, "u_ReflectTexture", ShaderDataType.TextureCube);
		commandUniform.addShaderUniform(RenderableSprite3D.REFLECTIONCUBE_HDR_PARAMS, "u_ReflectCubeHDRParams", ShaderDataType.Vector4);
		// legacy sh
		RenderableSprite3D.AMBIENTSHAR = Shader3D.propertyNameToID("u_AmbientSHAr");
		commandUniform.addShaderUniform(RenderableSprite3D.AMBIENTSHAR, "u_AmbientSHAr", ShaderDataType.Vector4);
		RenderableSprite3D.AMBIENTSHAG = Shader3D.propertyNameToID("u_AmbientSHAg");
		commandUniform.addShaderUniform(RenderableSprite3D.AMBIENTSHAG, "u_AmbientSHAg", ShaderDataType.Vector4);
		RenderableSprite3D.AMBIENTSHAB = Shader3D.propertyNameToID("u_AmbientSHAb");
		commandUniform.addShaderUniform(RenderableSprite3D.AMBIENTSHAB, "u_AmbientSHAb", ShaderDataType.Vector4);
		RenderableSprite3D.AMBIENTSHBR = Shader3D.propertyNameToID("u_AmbientSHBr");
		commandUniform.addShaderUniform(RenderableSprite3D.AMBIENTSHBR, "u_AmbientSHBr", ShaderDataType.Vector4);
		RenderableSprite3D.AMBIENTSHBG = Shader3D.propertyNameToID("u_AmbientSHBg");
		commandUniform.addShaderUniform(RenderableSprite3D.AMBIENTSHBG, "u_AmbientSHBg", ShaderDataType.Vector4);
		RenderableSprite3D.AMBIENTSHBB = Shader3D.propertyNameToID("u_AmbientSHBb");
		commandUniform.addShaderUniform(RenderableSprite3D.AMBIENTSHBB, "u_AmbientSHBb", ShaderDataType.Vector4);
		RenderableSprite3D.AMBIENTSHC = Shader3D.propertyNameToID("u_AmbientSHC");
		commandUniform.addShaderUniform(RenderableSprite3D.AMBIENTSHC, "u_AmbientSHC", ShaderDataType.Vector4);
	}

	/** @internal */
	_render: BaseRender;

	/**
	 * @deprecated
	 * 创建一个 <code>RenderableSprite3D</code> 实例。
	 */
	constructor(name: string) {
		super(name);
	}

	/** 
	 * @internal
	 * @inheritDoc 
	 */
	protected _onInActive(): void {
		super._onInActive();
	}

	/** 
	 * @internal
	 * @inheritDoc 
	 */
	protected _onActive(): void {
		super._onActive();
	}

	/**
	 * @internal
	 * @inheritDoc 
	 */
	protected _onActiveInScene(): void {
		super._onActiveInScene();
	}

	/**
	 * @internal
	 */
	_addToInitStaticBatchManager(): void {
	}

	/**
	 * @inheritDoc
	 * @internal 
	 */
	_setBelongScene(scene: Node): void {
		super._setBelongScene(scene);
		//this._render._setBelongScene(<Scene3D>scene);
	}

	/**
	 * @inheritDoc
	 * @internal 
	 */
	_setUnBelongScene(): void {
		super._setUnBelongScene();
	}
}


