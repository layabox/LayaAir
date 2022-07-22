import { Node } from "../../display/Node";
import { Vector4 } from "../math/Vector4";
import { Sprite3D } from "./Sprite3D";
import { BaseRender } from "./render/BaseRender";
import { CommandUniformMap } from "./scene/Scene3DShaderDeclaration";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
import { ShaderDefine } from "../../RenderEngine/RenderShader/ShaderDefine";

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
	/** 反射贴图 */
	static REFLECTIONTEXTURE: number;
	/** 反射贴图参数 */
	static REFLECTIONCUBE_HDR_PARAMS: number;
	/** 反射探针位置 最大最小值*/
	static REFLECTIONCUBE_PROBEPOSITION: number;
	static REFLECTIONCUBE_PROBEBOXMAX: number;
	static REFLECTIONCUBE_PROBEBOXMIN: number;

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
		RenderableSprite3D.REFLECTIONTEXTURE = Shader3D.propertyNameToID("u_ReflectTexture");
		RenderableSprite3D.REFLECTIONCUBE_HDR_PARAMS = Shader3D.propertyNameToID("u_ReflectCubeHDRParams");
		RenderableSprite3D.REFLECTIONCUBE_PROBEPOSITION = Shader3D.propertyNameToID("u_SpecCubeProbePosition");
		RenderableSprite3D.REFLECTIONCUBE_PROBEBOXMAX = Shader3D.propertyNameToID("u_SpecCubeBoxMax");
		RenderableSprite3D.REFLECTIONCUBE_PROBEBOXMIN = Shader3D.propertyNameToID("u_SpecCubeBoxMin");

		const commandUniform = CommandUniformMap.createGlobalUniformMap("Sprite3D");
		commandUniform.addShaderUniform(RenderableSprite3D.LIGHTMAPSCALEOFFSET, "u_LightmapScaleOffset");
		commandUniform.addShaderUniform(RenderableSprite3D.LIGHTMAP, "u_LightMap");
		commandUniform.addShaderUniform(RenderableSprite3D.LIGHTMAP_DIRECTION, "u_LightMapDirection");
		commandUniform.addShaderUniform(RenderableSprite3D.PICKCOLOR, "u_PickColor");
		commandUniform.addShaderUniform(RenderableSprite3D.REFLECTIONTEXTURE, "REFLECTIONTEXTURE");
		commandUniform.addShaderUniform(RenderableSprite3D.REFLECTIONCUBE_HDR_PARAMS, "u_ReflectCubeHDRParams");
		commandUniform.addShaderUniform(RenderableSprite3D.REFLECTIONCUBE_PROBEPOSITION, "u_SpecCubeProbePosition");
		commandUniform.addShaderUniform(RenderableSprite3D.REFLECTIONCUBE_PROBEBOXMAX, "u_SpecCubeBoxMax");
		commandUniform.addShaderUniform(RenderableSprite3D.REFLECTIONCUBE_PROBEBOXMIN, "u_SpecCubeBoxMin");
	}

	/** @internal */
	_render: BaseRender;

	/**
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


