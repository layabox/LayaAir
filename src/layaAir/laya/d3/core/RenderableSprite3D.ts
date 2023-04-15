import { Node } from "../../display/Node";
import { Sprite3D } from "./Sprite3D";
import { BaseRender } from "./render/BaseRender";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
import { ShaderDefine } from "../../RenderEngine/RenderShader/ShaderDefine";
import { LayaGL } from "../../layagl/LayaGL";

/**
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


	/** 反射探针位置 最大、最小值*/
	static REFLECTIONCUBE_PROBEPOSITION: number;
	static REFLECTIONCUBE_PROBEBOXMAX: number;
	static REFLECTIONCUBE_PROBEBOXMIN: number;

	static VOLUMETRICGI_PROBECOUNTS: number;
	static VOLUMETRICGI_PROBESTEPS: number;
	static VOLUMETRICGI_PROBESTARTPOS: number;
	static VOLUMETRICGI_PROBEPARAMS: number;
	static VOLUMETRICGI_IRRADIANCE: number;
	static VOLUMETRICGI_DISTANCE: number;

	/** @internal */
	static IBLTEX: number;
	/** @internal */
	static AMBIENTSH: number;
	/** @internal */
	static AMBIENTCOLOR: number;
	/** @internal */
	static AMBIENTINTENSITY: number;
	/** @internal */
	static REFLECTIONINTENSITY: number;

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
	static MorphActiveWeights: number;
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

		RenderableSprite3D.REFLECTIONCUBE_PROBEPOSITION = Shader3D.propertyNameToID("u_SpecCubeProbePosition");
		RenderableSprite3D.REFLECTIONCUBE_PROBEBOXMAX = Shader3D.propertyNameToID("u_SpecCubeBoxMax");
		RenderableSprite3D.REFLECTIONCUBE_PROBEBOXMIN = Shader3D.propertyNameToID("u_SpecCubeBoxMin");

		// volumestric GI
		RenderableSprite3D.VOLUMETRICGI_PROBECOUNTS = Shader3D.propertyNameToID("u_VolumetricGI.probeCounts");
		RenderableSprite3D.VOLUMETRICGI_PROBESTEPS = Shader3D.propertyNameToID("u_VolumetricGI.probeStep");
		RenderableSprite3D.VOLUMETRICGI_PROBESTARTPOS = Shader3D.propertyNameToID("u_VolumetricGI.probeStartPosition");
		RenderableSprite3D.VOLUMETRICGI_PROBEPARAMS = Shader3D.propertyNameToID("u_VolumetricGI.probeParams");
		RenderableSprite3D.VOLUMETRICGI_IRRADIANCE = Shader3D.propertyNameToID("u_ProbeIrradiance");
		RenderableSprite3D.VOLUMETRICGI_DISTANCE = Shader3D.propertyNameToID("u_ProbeDistance");

		//ambient Color
		RenderableSprite3D.AMBIENTCOLOR = Shader3D.propertyNameToID("u_AmbientColor");
		// sh 
		RenderableSprite3D.AMBIENTSH = Shader3D.propertyNameToID("u_IblSH");
		//GI instance
		RenderableSprite3D.AMBIENTINTENSITY = Shader3D.propertyNameToID("u_AmbientIntensity");
		RenderableSprite3D.REFLECTIONINTENSITY = Shader3D.propertyNameToID("u_ReflectionIntensity");
		RenderableSprite3D.IBLTEX = Shader3D.propertyNameToID("u_IBLTex");

		const commandUniform = LayaGL.renderOBJCreate.createGlobalUniformMap("Sprite3D");

		/// morph target

		RenderableSprite3D.SHADERDEFINE_MORPHTARGET = Shader3D.getDefineByName("MORPHTARGETS");
		RenderableSprite3D.SHADERDEFINE_MORPHTARGET_POSITION = Shader3D.getDefineByName("MORPHTARGETS_POSITION");
		RenderableSprite3D.SHADERDEFINE_MORPHTARGET_NORMAL = Shader3D.getDefineByName("MORPHTARGETS_NORMAL");
		RenderableSprite3D.SHADERDEFINE_MORPHTARGET_TANGENT = Shader3D.getDefineByName("MORPHTARGETS_TANGENT");

		RenderableSprite3D.MorphTex = Shader3D.propertyNameToID("u_MorphTargetsTex");
		RenderableSprite3D.MorphParams = Shader3D.propertyNameToID("u_MorphParams");
		RenderableSprite3D.MorphAttriOffset = Shader3D.propertyNameToID("u_MorphAttrOffset");
		RenderableSprite3D.MorphActiceTargets = Shader3D.propertyNameToID("u_MorphActiveTargets");
		RenderableSprite3D.MorphActiveWeights = Shader3D.propertyNameToID("u_MorphTargetWeights");
		RenderableSprite3D.MorphActiveCount = Shader3D.propertyNameToID("u_MorphTargetActiveCount");

		commandUniform.addShaderUniform(RenderableSprite3D.MorphTex, "u_MorphTargetsTex");
		commandUniform.addShaderUniform(RenderableSprite3D.MorphParams, "u_MorphParams");
		commandUniform.addShaderUniform(RenderableSprite3D.MorphAttriOffset, "u_MorphAttrOffset");
		commandUniform.addShaderUniform(RenderableSprite3D.MorphActiceTargets, "u_MorphActiveTargets");
		commandUniform.addShaderUniform(RenderableSprite3D.MorphActiveWeights, "u_MorphTargetWeights")
		commandUniform.addShaderUniform(RenderableSprite3D.MorphActiveCount, "u_MorphTargetActiveCount");

		commandUniform.addShaderUniform(RenderableSprite3D.LIGHTMAPSCALEOFFSET, "u_LightmapScaleOffset");
		commandUniform.addShaderUniform(RenderableSprite3D.LIGHTMAP, "u_LightMap");
		commandUniform.addShaderUniform(RenderableSprite3D.LIGHTMAP_DIRECTION, "u_LightMapDirection");
		commandUniform.addShaderUniform(RenderableSprite3D.PICKCOLOR, "u_PickColor");

		commandUniform.addShaderUniform(RenderableSprite3D.REFLECTIONCUBE_PROBEPOSITION, "u_SpecCubeProbePosition");
		commandUniform.addShaderUniform(RenderableSprite3D.REFLECTIONCUBE_PROBEBOXMAX, "u_SpecCubeBoxMax");
		commandUniform.addShaderUniform(RenderableSprite3D.REFLECTIONCUBE_PROBEBOXMIN, "u_SpecCubeBoxMin");
		commandUniform.addShaderUniform(RenderableSprite3D.IBLTEX, "u_IBLTex");
		commandUniform.addShaderUniform(RenderableSprite3D.VOLUMETRICGI_PROBECOUNTS, "u_VolumetricGI.probeCounts");
		commandUniform.addShaderUniform(RenderableSprite3D.VOLUMETRICGI_PROBESTEPS, "u_VolumetricGI.probeStep");
		commandUniform.addShaderUniform(RenderableSprite3D.VOLUMETRICGI_PROBESTARTPOS, "u_VolumetricGI.probeStartPosition");
		commandUniform.addShaderUniform(RenderableSprite3D.VOLUMETRICGI_PROBEPARAMS, "u_VolumetricGI.probeParams");
		commandUniform.addShaderUniform(RenderableSprite3D.VOLUMETRICGI_IRRADIANCE, "u_ProbeIrradiance");
		commandUniform.addShaderUniform(RenderableSprite3D.VOLUMETRICGI_DISTANCE, "u_ProbeDistance");
		commandUniform.addShaderUniform(RenderableSprite3D.AMBIENTSH, "u_IblSH");
		commandUniform.addShaderUniform(RenderableSprite3D.AMBIENTCOLOR, "u_AmbientColor");
		commandUniform.addShaderUniform(RenderableSprite3D.AMBIENTINTENSITY, "u_AmbientIntensity");
		commandUniform.addShaderUniform(RenderableSprite3D.REFLECTIONINTENSITY, "u_ReflectionIntensity");

		//Legency Reflectexture
		RenderableSprite3D.REFLECTIONTEXTURE = Shader3D.propertyNameToID("u_ReflectTexture");
		RenderableSprite3D.REFLECTIONCUBE_HDR_PARAMS = Shader3D.propertyNameToID("u_ReflectCubeHDRParams");
		commandUniform.addShaderUniform(RenderableSprite3D.REFLECTIONTEXTURE, "REFLECTIONTEXTURE");
		commandUniform.addShaderUniform(RenderableSprite3D.REFLECTIONCUBE_HDR_PARAMS, "u_ReflectCubeHDRParams");
		// legacy sh
		RenderableSprite3D.AMBIENTSHAR = Shader3D.propertyNameToID("u_AmbientSHAr");
		commandUniform.addShaderUniform(RenderableSprite3D.AMBIENTSHAR, "u_AmbientSHAr");
		RenderableSprite3D.AMBIENTSHAG = Shader3D.propertyNameToID("u_AmbientSHAg");
		commandUniform.addShaderUniform(RenderableSprite3D.AMBIENTSHAG, "u_AmbientSHAg");
		RenderableSprite3D.AMBIENTSHAB = Shader3D.propertyNameToID("u_AmbientSHAb");
		commandUniform.addShaderUniform(RenderableSprite3D.AMBIENTSHAB, "u_AmbientSHAb");
		RenderableSprite3D.AMBIENTSHBR = Shader3D.propertyNameToID("u_AmbientSHBr");
		commandUniform.addShaderUniform(RenderableSprite3D.AMBIENTSHBR, "u_AmbientSHBr");
		RenderableSprite3D.AMBIENTSHBG = Shader3D.propertyNameToID("u_AmbientSHBg");
		commandUniform.addShaderUniform(RenderableSprite3D.AMBIENTSHBG, "u_AmbientSHBg");
		RenderableSprite3D.AMBIENTSHBB = Shader3D.propertyNameToID("u_AmbientSHBb");
		commandUniform.addShaderUniform(RenderableSprite3D.AMBIENTSHBB, "u_AmbientSHBb");
		RenderableSprite3D.AMBIENTSHC = Shader3D.propertyNameToID("u_AmbientSHC");
		commandUniform.addShaderUniform(RenderableSprite3D.AMBIENTSHC, "u_AmbientSHC");
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
	 * @inheritDoc
	 * @override
	 */
	protected _onInActive(): void {
		super._onInActive();
	}

	/** 
	 * @inheritDoc
	 * @override
	 */
	protected _onActive(): void {
		super._onActive();
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	protected _onActiveInScene(): void {
		super._onActiveInScene();
	}

	/**
	 * @internal
	 */
	protected _create(): Node {
		return new Sprite3D(this.name);
	}

	/**
	 * @internal
	 */
	_addToInitStaticBatchManager(): void {
	}

	/**
	 * @inheritDoc
	 * @internal
	 * @override
	 */
	_setBelongScene(scene: Node): void {
		super._setBelongScene(scene);
		//this._render._setBelongScene(<Scene3D>scene);
	}

	/**
	 * @inheritDoc
	 * @internal
	 * @override
	 */
	_setUnBelongScene(): void {
		super._setUnBelongScene();
	}
}


