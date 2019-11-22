import { BaseTexture } from "../../../resource/BaseTexture";
import { VertexMesh } from "../../graphics/Vertex/VertexMesh";
import { Vector4 } from "../../math/Vector4";
import { TextureCube } from "../../resource/TextureCube";
import PBRPS from "../../shader/files/PBR.fs";
import PBRVS from "../../shader/files/PBR.vs";
import { Shader3D } from "../../shader/Shader3D";
import { ShaderDefine } from "../../shader/ShaderDefine";
import { SubShader } from "../../shader/SubShader";
import { Scene3DShaderDeclaration } from "../scene/Scene3DShaderDeclaration";
import { Material } from "./Material";
import { RenderState } from "./RenderState";

/**
 * <code>PBRStandardMaterial</code> 类用于实现PBR材质。
 */
export class PBRStandardMaterial extends Material {
	/**光滑度数据源_金属度贴图的Alpha通道。*/
	static SmoothnessSource_MetallicGlossTexture_Alpha: number = 0;
	/**光滑度数据源_反射率贴图的Alpha通道。*/
	static SmoothnessSource_AlbedoTexture_Alpha: number = 1;

	/**渲染状态_不透明。*/
	static RENDERMODE_OPAQUE: number = 0;
	/**渲染状态_透明测试。*/
	static RENDERMODE_CUTOUT: number = 1;
	/**渲染状态_透明混合_游戏中经常使用的透明。*/
	static RENDERMODE_FADE: number = 2;
	/**渲染状态_透明混合_物理上看似合理的透明。*/
	static RENDERMODE_TRANSPARENT: number = 3;

	/** @internal */
	static SHADERDEFINE_ALBEDOTEXTURE: ShaderDefine;
	/** @internal */
	static SHADERDEFINE_NORMALTEXTURE: ShaderDefine;
	/** @internal */
	static SHADERDEFINE_SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA: ShaderDefine;
	/** @internal */
	static SHADERDEFINE_METALLICGLOSSTEXTURE: ShaderDefine;
	/** @internal */
	static SHADERDEFINE_OCCLUSIONTEXTURE: ShaderDefine;
	/** @internal */
	static SHADERDEFINE_PARALLAXTEXTURE: ShaderDefine;
	/** @internal */
	static SHADERDEFINE_EMISSION: ShaderDefine;
	/** @internal */
	static SHADERDEFINE_EMISSIONTEXTURE: ShaderDefine;
	/** @internal */
	static SHADERDEFINE_REFLECTMAP: ShaderDefine;
	/** @internal */
	static SHADERDEFINE_TILINGOFFSET: ShaderDefine;
	/** @internal */
	static SHADERDEFINE_ALPHAPREMULTIPLY: ShaderDefine;
	/** @internal */
	static SHADERDEFINE_INDIRECTLIGHT: ShaderDefine;
	/** @internal */
	static SHADERDEFINE_REFLECTIONS_OFF: ShaderDefine;

	/** @internal */
	static ALBEDOTEXTURE: number = Shader3D.propertyNameToID("u_AlbedoTexture");
	/** @internal */
	static ALBEDOCOLOR: number = Shader3D.propertyNameToID("u_AlbedoColor");
	/** @internal */
	static TILINGOFFSET: number = Shader3D.propertyNameToID("u_TilingOffset");
	/** @internal */
	static NORMALTEXTURE: number = Shader3D.propertyNameToID("u_NormalTexture");
	/** @internal */
	static NORMALSCALE: number = Shader3D.propertyNameToID("u_normalScale");
	/** @internal */
	static METALLICGLOSSTEXTURE: number = Shader3D.propertyNameToID("u_MetallicGlossTexture");
	/** @internal */
	static METALLIC: number = Shader3D.propertyNameToID("u_metallic");
	/** @internal */
	static SMOOTHNESS: number = Shader3D.propertyNameToID("u_smoothness");
	/** @internal */
	static SMOOTHNESSSCALE: number = Shader3D.propertyNameToID("u_smoothnessScale");
	/** @internal */
	static OCCLUSIONTEXTURE: number = Shader3D.propertyNameToID("u_OcclusionTexture");
	/** @internal */
	static OCCLUSIONSTRENGTH: number = Shader3D.propertyNameToID("u_occlusionStrength");
	/** @internal */
	static PARALLAXTEXTURE: number = Shader3D.propertyNameToID("u_ParallaxTexture");
	/** @internal */
	static PARALLAX: number = Shader3D.propertyNameToID("u_Parallax");
	/** @internal */
	static EMISSIONTEXTURE: number = Shader3D.propertyNameToID("u_EmissionTexture");
	/** @internal */
	static EMISSIONCOLOR: number = Shader3D.propertyNameToID("u_EmissionColor");

	/** @internal */
	static SMOOTHNESSSOURCE: number = -1;//TODO:
	/** @internal */
	static ENABLEEMISSION: number = -1;//TODO:
	/** @internal */
	static ENABLEREFLECT: number = -1;//TODO:

	/** @internal */
	static CULL: number = Shader3D.propertyNameToID("s_Cull");
	/** @internal */
	static BLEND: number = Shader3D.propertyNameToID("s_Blend");
	/** @internal */
	static BLEND_SRC: number = Shader3D.propertyNameToID("s_BlendSrc");
	/** @internal */
	static BLEND_DST: number = Shader3D.propertyNameToID("s_BlendDst");
	/** @internal */
	static DEPTH_TEST: number = Shader3D.propertyNameToID("s_DepthTest");
	/** @internal */
	static DEPTH_WRITE: number = Shader3D.propertyNameToID("s_DepthWrite");

	/** 默认材质，禁止修改*/
	static defaultMaterial: PBRStandardMaterial;

	/**
	 * @private
	 */
	static __initDefine__(): void {
		PBRStandardMaterial.SHADERDEFINE_ALBEDOTEXTURE = Shader3D.getDefineByName("ALBEDOTEXTURE");
		PBRStandardMaterial.SHADERDEFINE_METALLICGLOSSTEXTURE = Shader3D.getDefineByName("METALLICGLOSSTEXTURE");
		PBRStandardMaterial.SHADERDEFINE_SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA = Shader3D.getDefineByName("SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA");
		PBRStandardMaterial.SHADERDEFINE_NORMALTEXTURE = Shader3D.getDefineByName("NORMALTEXTURE");
		PBRStandardMaterial.SHADERDEFINE_PARALLAXTEXTURE = Shader3D.getDefineByName("PARALLAXTEXTURE");
		PBRStandardMaterial.SHADERDEFINE_OCCLUSIONTEXTURE = Shader3D.getDefineByName("OCCLUSIONTEXTURE");
		PBRStandardMaterial.SHADERDEFINE_EMISSION = Shader3D.getDefineByName("EMISSION");
		PBRStandardMaterial.SHADERDEFINE_EMISSIONTEXTURE = Shader3D.getDefineByName("EMISSIONTEXTURE");
		PBRStandardMaterial.SHADERDEFINE_REFLECTMAP = Shader3D.getDefineByName("REFLECTMAP");
		PBRStandardMaterial.SHADERDEFINE_TILINGOFFSET = Shader3D.getDefineByName("TILINGOFFSET");
		PBRStandardMaterial.SHADERDEFINE_ALPHAPREMULTIPLY = Shader3D.getDefineByName("ALPHAPREMULTIPLY");
		PBRStandardMaterial.SHADERDEFINE_INDIRECTLIGHT = Shader3D.getDefineByName("INDIRECTLIGHT");
		PBRStandardMaterial.SHADERDEFINE_REFLECTIONS_OFF = Shader3D.getDefineByName("REFLECTIONS_OFF");
	}

	/**
	 * @private
	 */
	static __init__(): void {
		PBRStandardMaterial.__initDefine__();
		var attributeMap: any = {
			'a_Position': VertexMesh.MESH_POSITION0,
			'a_Normal': VertexMesh.MESH_NORMAL0,
			'a_Tangent0': VertexMesh.MESH_TANGENT0,
			'a_Texcoord0': VertexMesh.MESH_TEXTURECOORDINATE0,
			'a_BoneWeights': VertexMesh.MESH_BLENDWEIGHT0,
			'a_BoneIndices': VertexMesh.MESH_BLENDINDICES0,
			'a_MvpMatrix': VertexMesh.MESH_MVPMATRIX_ROW0,
			'a_WorldMat': VertexMesh.MESH_WORLDMATRIX_ROW0
		};
		var uniformMap: any = {
			'u_Bones': Shader3D.PERIOD_CUSTOM,
			'u_MvpMatrix': Shader3D.PERIOD_SPRITE,
			'u_WorldMat': Shader3D.PERIOD_SPRITE,

			'u_CameraPos': Shader3D.PERIOD_CAMERA,
			'u_View': Shader3D.PERIOD_CAMERA,
			'u_ProjectionParams': Shader3D.PERIOD_CAMERA,
			'u_Viewport': Shader3D.PERIOD_CAMERA,

			'u_AlphaTestValue': Shader3D.PERIOD_MATERIAL,
			'u_AlbedoColor': Shader3D.PERIOD_MATERIAL,
			'u_EmissionColor': Shader3D.PERIOD_MATERIAL,
			'u_AlbedoTexture': Shader3D.PERIOD_MATERIAL,
			'u_NormalTexture': Shader3D.PERIOD_MATERIAL,
			'u_ParallaxTexture': Shader3D.PERIOD_MATERIAL,
			'u_MetallicGlossTexture': Shader3D.PERIOD_MATERIAL,
			'u_OcclusionTexture': Shader3D.PERIOD_MATERIAL,
			'u_EmissionTexture': Shader3D.PERIOD_MATERIAL,
			'u_metallic': Shader3D.PERIOD_MATERIAL,
			'u_smoothness': Shader3D.PERIOD_MATERIAL,
			'u_smoothnessScale': Shader3D.PERIOD_MATERIAL,
			'u_occlusionStrength': Shader3D.PERIOD_MATERIAL,
			'u_normalScale': Shader3D.PERIOD_MATERIAL,
			'u_parallax': Shader3D.PERIOD_MATERIAL,
			'u_TilingOffset': Shader3D.PERIOD_MATERIAL,


			'u_ReflectTexture': Shader3D.PERIOD_SCENE,
			'u_ReflectIntensity': Shader3D.PERIOD_SCENE,
			'u_AmbientColor': Shader3D.PERIOD_SCENE,
			'u_shadowMap1': Shader3D.PERIOD_SCENE,
			'u_shadowMap2': Shader3D.PERIOD_SCENE,
			'u_shadowMap3': Shader3D.PERIOD_SCENE,
			'u_shadowPSSMDistance': Shader3D.PERIOD_SCENE,
			'u_lightShadowVP': Shader3D.PERIOD_SCENE,
			'u_shadowPCFoffset': Shader3D.PERIOD_SCENE,
			'u_FogStart': Shader3D.PERIOD_SCENE,
			'u_FogRange': Shader3D.PERIOD_SCENE,
			'u_FogColor': Shader3D.PERIOD_SCENE,
			'u_DirationLightCount': Shader3D.PERIOD_SCENE,
			'u_LightBuffer': Shader3D.PERIOD_SCENE,
			'u_LightClusterBuffer': Shader3D.PERIOD_SCENE,

			//PBRGI
			'u_AmbientSHAr': Shader3D.PERIOD_SCENE,
			'u_AmbientSHAg': Shader3D.PERIOD_SCENE,
			'u_AmbientSHAb': Shader3D.PERIOD_SCENE,
			'u_AmbientSHBr': Shader3D.PERIOD_SCENE,
			'u_AmbientSHBg': Shader3D.PERIOD_SCENE,
			'u_AmbientSHBb': Shader3D.PERIOD_SCENE,
			'u_AmbientSHC': Shader3D.PERIOD_SCENE,
			'u_ReflectionProbe': Shader3D.PERIOD_SCENE,

			//legacy lighting
			'u_DirectionLight.direction': Shader3D.PERIOD_SCENE,
			'u_DirectionLight.color': Shader3D.PERIOD_SCENE,
			'u_PointLight.position': Shader3D.PERIOD_SCENE,
			'u_PointLight.range': Shader3D.PERIOD_SCENE,
			'u_PointLight.color': Shader3D.PERIOD_SCENE,
			'u_SpotLight.position': Shader3D.PERIOD_SCENE,
			'u_SpotLight.direction': Shader3D.PERIOD_SCENE,
			'u_SpotLight.range': Shader3D.PERIOD_SCENE,
			'u_SpotLight.spot': Shader3D.PERIOD_SCENE,
			'u_SpotLight.color': Shader3D.PERIOD_SCENE
		};
		var stateMap = {
			's_Cull': Shader3D.RENDER_STATE_CULL,
			's_Blend': Shader3D.RENDER_STATE_BLEND,
			's_BlendSrc': Shader3D.RENDER_STATE_BLEND_SRC,
			's_BlendDst': Shader3D.RENDER_STATE_BLEND_DST,
			's_DepthTest': Shader3D.RENDER_STATE_DEPTH_TEST,
			's_DepthWrite': Shader3D.RENDER_STATE_DEPTH_WRITE
		}
		var shader: Shader3D = Shader3D.add("PBR");
		var subShader: SubShader = new SubShader(attributeMap, uniformMap);
		shader.addSubShader(subShader);
		subShader.addShaderPass(PBRVS, PBRPS, stateMap);
	}

	/** @internal */
	private _albedoColor: Vector4;
	/** @internal */
	private _emissionColor: Vector4;

	diffuseDefined(): void {
		this._shaderValues.addDefine(PBRStandardMaterial.SHADERDEFINE_INDIRECTLIGHT);
	}

	/**
	 * 漫反射颜色。
	 */
	get albedoColor(): Vector4 {
		return this._albedoColor;
	}

	set albedoColor(value: Vector4) {
		this._albedoColor = value;
		this._shaderValues.setVector(PBRStandardMaterial.ALBEDOCOLOR, value);
	}

	/**
	 * 漫反射贴图。
	 */
	get albedoTexture(): BaseTexture {
		return this._shaderValues.getTexture(PBRStandardMaterial.ALBEDOTEXTURE);
	}

	set albedoTexture(value: BaseTexture) {
		if (value) {
			this._shaderValues.addDefine(PBRStandardMaterial.SHADERDEFINE_ALBEDOTEXTURE);
		} else {
			this._shaderValues.removeDefine(PBRStandardMaterial.SHADERDEFINE_ALBEDOTEXTURE);
		}
		this._shaderValues.setTexture(PBRStandardMaterial.ALBEDOTEXTURE, value);
	}

	/**
	 * 法线贴图。
	 */
	get normalTexture(): BaseTexture {
		return this._shaderValues.getTexture(PBRStandardMaterial.NORMALTEXTURE);
	}

	set normalTexture(value: BaseTexture) {
		if (value) {
			this._shaderValues.addDefine(PBRStandardMaterial.SHADERDEFINE_NORMALTEXTURE);
		} else {
			this._shaderValues.removeDefine(PBRStandardMaterial.SHADERDEFINE_NORMALTEXTURE);
		}
		this._shaderValues.setTexture(PBRStandardMaterial.NORMALTEXTURE, value);
	}


	/**
	 * 法线贴图缩放系数。
	 */
	get normalTextureScale(): number {
		return this._shaderValues.getNumber(PBRStandardMaterial.NORMALSCALE);
	}

	set normalTextureScale(value: number) {
		this._shaderValues.setNumber(PBRStandardMaterial.NORMALSCALE, value);
	}

	/**
	 * 视差贴图。
	 */
	get parallaxTexture(): BaseTexture {
		return this._shaderValues.getTexture(PBRStandardMaterial.PARALLAXTEXTURE);
	}

	set parallaxTexture(value: BaseTexture) {
		if (value) {
			this._shaderValues.addDefine(PBRStandardMaterial.SHADERDEFINE_PARALLAXTEXTURE);
		} else {
			this._shaderValues.removeDefine(PBRStandardMaterial.SHADERDEFINE_PARALLAXTEXTURE);
		}
		this._shaderValues.setTexture(PBRStandardMaterial.PARALLAXTEXTURE, value);
	}

	/**
	 * 视差贴图缩放系数。
	 */
	get parallaxTextureScale(): number {
		return this._shaderValues.getNumber(PBRStandardMaterial.PARALLAX);
	}

	set parallaxTextureScale(value: number) {
		this._shaderValues.setNumber(PBRStandardMaterial.PARALLAX, Math.max(0.005, Math.min(0.08, value)));
	}

	/**
	 * 遮挡贴图。
	 */
	get occlusionTexture(): BaseTexture {
		return this._shaderValues.getTexture(PBRStandardMaterial.OCCLUSIONTEXTURE);
	}

	set occlusionTexture(value: BaseTexture) {
		if (value) {
			this._shaderValues.addDefine(PBRStandardMaterial.SHADERDEFINE_OCCLUSIONTEXTURE);
		} else {
			this._shaderValues.removeDefine(PBRStandardMaterial.SHADERDEFINE_OCCLUSIONTEXTURE);
		}
		this._shaderValues.setTexture(PBRStandardMaterial.OCCLUSIONTEXTURE, value);
	}

	/**
	 * 遮挡贴图强度,范围为0到1。
	 */
	get occlusionTextureStrength(): number {
		return this._shaderValues.getNumber(PBRStandardMaterial.OCCLUSIONSTRENGTH);
	}

	set occlusionTextureStrength(value: number) {
		this._shaderValues.setNumber(PBRStandardMaterial.OCCLUSIONSTRENGTH, Math.max(0.0, Math.min(1.0, value)));
	}

	/**
	 * 金属光滑度贴图。
	 */
	get metallicGlossTexture(): BaseTexture {
		return this._shaderValues.getTexture(PBRStandardMaterial.METALLICGLOSSTEXTURE);
	}

	set metallicGlossTexture(value: BaseTexture) {
		if (value) {
			this._shaderValues.addDefine(PBRStandardMaterial.SHADERDEFINE_METALLICGLOSSTEXTURE);
		} else {
			this._shaderValues.removeDefine(PBRStandardMaterial.SHADERDEFINE_METALLICGLOSSTEXTURE);
		}
		this._shaderValues.setTexture(PBRStandardMaterial.METALLICGLOSSTEXTURE, value);
	}

	/**
	 * 获取金属度,范围为0到1。
	 */
	get metallic(): number {
		return this._shaderValues.getNumber(PBRStandardMaterial.METALLIC);
	}

	set metallic(value: number) {
		this._shaderValues.setNumber(PBRStandardMaterial.METALLIC, Math.max(0.0, Math.min(1.0, value)));
	}

	/**
	 * 光滑度,范围为0到1。
	 */
	get smoothness(): number {
		return this._shaderValues.getNumber(PBRStandardMaterial.SMOOTHNESS);
	}

	set smoothness(value: number) {
		this._shaderValues.setNumber(PBRStandardMaterial.SMOOTHNESS, Math.max(0.0, Math.min(1.0, value)));
	}

	/**
	 * 光滑度缩放系数,范围为0到1。
	 */
	get smoothnessTextureScale(): number {
		return this._shaderValues.getNumber(PBRStandardMaterial.SMOOTHNESSSCALE);
	}

	set smoothnessTextureScale(value: number) {
		this._shaderValues.setNumber(PBRStandardMaterial.SMOOTHNESSSCALE, Math.max(0.0, Math.min(1.0, value)));
	}

	/**
	 * 光滑度数据源,0或1。
	 */
	get smoothnessSource(): number {
		return this._shaderValues.getInt(PBRStandardMaterial.SMOOTHNESSSOURCE);
	}

	set smoothnessSource(value: number) {
		if (value) {
			this._shaderValues.addDefine(PBRStandardMaterial.SHADERDEFINE_SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA);
			this._shaderValues.setInt(PBRStandardMaterial.SMOOTHNESSSOURCE, 1);
		} else {
			this._shaderValues.removeDefine(PBRStandardMaterial.SHADERDEFINE_SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA);
			this._shaderValues.setInt(PBRStandardMaterial.SMOOTHNESSSOURCE, 0);
		}
	}

	/**
	 * 是否激活放射属性。
	 */
	get enableEmission(): boolean {
		return this._shaderValues.getBool(PBRStandardMaterial.ENABLEEMISSION);
	}

	set enableEmission(value: boolean) {
		if (value) {
			this._shaderValues.addDefine(PBRStandardMaterial.SHADERDEFINE_EMISSION);
		} else {
			this._shaderValues.removeDefine(PBRStandardMaterial.SHADERDEFINE_EMISSION);
		}
		this._shaderValues.setBool(PBRStandardMaterial.ENABLEEMISSION, value);
	}

	/**
	 * 放射颜色。
	 */
	get emissionColor(): Vector4 {
		return (<Vector4>this._shaderValues.getVector(PBRStandardMaterial.EMISSIONCOLOR));
	}

	set emissionColor(value: Vector4) {
		this._shaderValues.setVector(PBRStandardMaterial.EMISSIONCOLOR, value);
	}

	/**
	 * 放射贴图。
	 */
	get emissionTexture(): BaseTexture {
		return this._shaderValues.getTexture(PBRStandardMaterial.EMISSIONTEXTURE);
	}

	set emissionTexture(value: BaseTexture) {
		if (value) {
			this._shaderValues.addDefine(PBRStandardMaterial.SHADERDEFINE_EMISSIONTEXTURE);
		} else {
			this._shaderValues.removeDefine(PBRStandardMaterial.SHADERDEFINE_EMISSIONTEXTURE);
		}
		this._shaderValues.setTexture(PBRStandardMaterial.EMISSIONTEXTURE, value);
	}

	/**
	 * 是否开启反射。
	 */
	get enableReflection(): boolean {
		return this._shaderValues.getBool(PBRStandardMaterial.ENABLEREFLECT);
	}

	set enableReflection(value: boolean) {
		this._shaderValues.setBool(PBRStandardMaterial.ENABLEREFLECT, true);
		if (value) {
			this._shaderValues.addDefine(PBRStandardMaterial.SHADERDEFINE_REFLECTIONS_OFF);
		} else {
			this._shaderValues.removeDefine(PBRStandardMaterial.SHADERDEFINE_REFLECTIONS_OFF);
		}
	}

	/**
	 * 纹理平铺和偏移。
	 */
	get tilingOffset(): Vector4 {
		return (<Vector4>this._shaderValues.getVector(PBRStandardMaterial.TILINGOFFSET));
	}

	set tilingOffset(value: Vector4) {
		if (value) {
			if (value.x != 1 || value.y != 1 || value.z != 0 || value.w != 0) {
				this._shaderValues.addDefine(PBRStandardMaterial.SHADERDEFINE_TILINGOFFSET);
			} else {
				this._shaderValues.removeDefine(PBRStandardMaterial.SHADERDEFINE_TILINGOFFSET);
			}
		} else {
			this._shaderValues.removeDefine(PBRStandardMaterial.SHADERDEFINE_TILINGOFFSET);
		}
		this._shaderValues.setVector(PBRStandardMaterial.TILINGOFFSET, value);
	}

	/**
	 * 渲染模式。
	 */
	set renderMode(value: number) {
		switch (value) {
			case PBRStandardMaterial.RENDERMODE_OPAQUE:
				this.alphaTest = false;
				this.renderQueue = Material.RENDERQUEUE_OPAQUE;
				this.depthWrite = true;
				this.cull = RenderState.CULL_BACK;
				this.blend = RenderState.BLEND_DISABLE;
				this.depthTest = RenderState.DEPTHTEST_LESS;
				this._shaderValues.removeDefine(PBRStandardMaterial.SHADERDEFINE_ALPHAPREMULTIPLY);
				break;
			case PBRStandardMaterial.RENDERMODE_CUTOUT:
				this.renderQueue = Material.RENDERQUEUE_ALPHATEST;
				this.alphaTest = true;
				this.depthWrite = true;
				this.cull = RenderState.CULL_BACK;
				this.blend = RenderState.BLEND_DISABLE;
				this.depthTest = RenderState.DEPTHTEST_LESS;
				this._shaderValues.removeDefine(PBRStandardMaterial.SHADERDEFINE_ALPHAPREMULTIPLY);
				break;
			case PBRStandardMaterial.RENDERMODE_FADE:
				this.renderQueue = Material.RENDERQUEUE_TRANSPARENT;
				this.alphaTest = false;
				this.depthWrite = false;
				this.cull = RenderState.CULL_BACK;
				this.blend = RenderState.BLEND_ENABLE_ALL;
				this.blendSrc = RenderState.BLENDPARAM_SRC_ALPHA;
				this.blendDst = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
				this.depthTest = RenderState.DEPTHTEST_LESS;
				this._shaderValues.removeDefine(PBRStandardMaterial.SHADERDEFINE_ALPHAPREMULTIPLY);
				break;
			case PBRStandardMaterial.RENDERMODE_TRANSPARENT:
				this.renderQueue = Material.RENDERQUEUE_TRANSPARENT;
				this.alphaTest = false;
				this.depthWrite = false;
				this.cull = RenderState.CULL_BACK;
				this.blend = RenderState.BLEND_ENABLE_ALL;
				this.blendSrc = RenderState.BLENDPARAM_ONE;
				this.blendDst = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
				this.depthTest = RenderState.DEPTHTEST_LESS;
				this._shaderValues.addDefine(PBRStandardMaterial.SHADERDEFINE_ALPHAPREMULTIPLY);
				break;
			default:
				throw new Error("PBRSpecularMaterial : renderMode value error.");
		}
	}

	/**
	 * 是否写入深度。
	 */
	get depthWrite(): boolean {
		return this._shaderValues.getBool(PBRStandardMaterial.DEPTH_WRITE);
	}

	set depthWrite(value: boolean) {
		this._shaderValues.setBool(PBRStandardMaterial.DEPTH_WRITE, value);
	}

	/**
	 * 剔除方式。
	 */
	get cull(): number {
		return this._shaderValues.getInt(PBRStandardMaterial.CULL);
	}

	set cull(value: number) {
		this._shaderValues.setInt(PBRStandardMaterial.CULL, value);
	}

	/**
	 * 混合方式。
	 */
	get blend(): number {
		return this._shaderValues.getInt(PBRStandardMaterial.BLEND);
	}

	set blend(value: number) {
		this._shaderValues.setInt(PBRStandardMaterial.BLEND, value);
	}

	/**
	 * 混合源。
	 */
	get blendSrc(): number {
		return this._shaderValues.getInt(PBRStandardMaterial.BLEND_SRC);
	}

	set blendSrc(value: number) {
		this._shaderValues.setInt(PBRStandardMaterial.BLEND_SRC, value);
	}

	/**
	 * 混合目标。
	 */
	get blendDst(): number {
		return this._shaderValues.getInt(PBRStandardMaterial.BLEND_DST);
	}

	set blendDst(value: number) {
		this._shaderValues.setInt(PBRStandardMaterial.BLEND_DST, value);
	}

	/**
	 * 深度测试方式。
	 */
	get depthTest(): number {
		return this._shaderValues.getInt(PBRStandardMaterial.DEPTH_TEST);
	}


	set depthTest(value: number) {
		this._shaderValues.setInt(PBRStandardMaterial.DEPTH_TEST, value);
	}
	/**
	 * 创建一个 <code>PBRStandardMaterial02</code> 实例。
	 */
	constructor() {
		super();
		this.setShaderName("PBR");
		this._albedoColor = new Vector4(1.0, 1.0, 1.0, 1.0);
		this._shaderValues.setVector(PBRStandardMaterial.ALBEDOCOLOR, new Vector4(1.0, 1.0, 1.0, 1.0));
		this._emissionColor = new Vector4(0.0, 0.0, 0.0, 0.0);
		this._shaderValues.setVector(PBRStandardMaterial.EMISSIONCOLOR, new Vector4(0.0, 0.0, 0.0, 0.0));
		this._shaderValues.setNumber(PBRStandardMaterial.METALLIC, 0.0);
		this._shaderValues.setNumber(PBRStandardMaterial.SMOOTHNESS, 0.5);
		this._shaderValues.setNumber(PBRStandardMaterial.SMOOTHNESSSCALE, 1.0);
		this._shaderValues.setNumber(PBRStandardMaterial.SMOOTHNESSSOURCE, 0);
		this._shaderValues.setNumber(PBRStandardMaterial.OCCLUSIONSTRENGTH, 1.0);
		this._shaderValues.setNumber(PBRStandardMaterial.NORMALSCALE, 1.0);
		this._shaderValues.setNumber(PBRStandardMaterial.PARALLAX, 0.001);
		this._shaderValues.setBool(PBRStandardMaterial.ENABLEEMISSION, false);
		this._shaderValues.setBool(PBRStandardMaterial.ENABLEREFLECT, true);
		this._shaderValues.setNumber(Material.ALPHATESTVALUE, 0.5);
		this._disablePublicDefineDatas.remove(Scene3DShaderDeclaration.SHADERDEFINE_REFLECTMAP);
		this.renderMode = PBRStandardMaterial.RENDERMODE_OPAQUE;
	}

	/**
	 * 克隆。
	 * @return	 克隆副本。
	 * @override
	 */
	clone(): any {
		var dest: PBRStandardMaterial = new PBRStandardMaterial();
		this.cloneTo(dest);
		return dest;
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	cloneTo(destObject: any): void {
		super.cloneTo(destObject);
		var destMaterial: PBRStandardMaterial = (<PBRStandardMaterial>destObject);
		this._albedoColor.cloneTo(destMaterial._albedoColor);
		this._emissionColor.cloneTo(destMaterial._emissionColor);
	}
}


