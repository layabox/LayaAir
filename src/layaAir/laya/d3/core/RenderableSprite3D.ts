import { Node } from "../../display/Node";
import { Animator } from "../component/Animator";
import { Vector4 } from "../math/Vector4";
import { Shader3D } from "../shader/Shader3D";
import { Sprite3D } from "./Sprite3D";
import { BaseRender } from "./render/BaseRender";
import { Scene3D } from "./scene/Scene3D";
import { ILaya3D } from "../../../ILaya3D";
import { ShaderDefine } from "../shader/ShaderDefine";
import { CommandUniformMap } from "./scene/Scene3DShaderDeclaration";

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
	static LIGHTMAPSCALEOFFSET: number = Shader3D.propertyNameToID("u_LightmapScaleOffset");
	/**着色器变量名，光照贴图。*/
	static LIGHTMAP: number = Shader3D.propertyNameToID("u_LightMap");
	/**着色器变量名，光照贴图方向。*/
	static LIGHTMAP_DIRECTION: number = Shader3D.propertyNameToID("u_LightMapDirection");
	/**拾取颜色。*/
	static PICKCOLOR: number = Shader3D.propertyNameToID("u_PickColor");
	/** 反射贴图 */
	static REFLECTIONTEXTURE: number = Shader3D.propertyNameToID("u_ReflectTexture");
	/** 反射贴图参数 */
	static REFLECTIONCUBE_HDR_PARAMS: number = Shader3D.propertyNameToID("u_ReflectCubeHDRParams");
	/** 反射探针位置 最大最小值*/
	static REFLECTIONCUBE_PROBEPOSITION: number = Shader3D.propertyNameToID("u_SpecCubeProbePosition");
	static REFLECTIONCUBE_PROBEBOXMAX: number = Shader3D.propertyNameToID("u_SpecCubeBoxMax");
	static REFLECTIONCUBE_PROBEBOXMIN: number = Shader3D.propertyNameToID("u_SpecCubeBoxMin");
	pickColor: Vector4;


	/**
	 * @internal
	 */
	static __init__(): void {
		RenderableSprite3D.SHADERDEFINE_RECEIVE_SHADOW = Shader3D.getDefineByName("RECEIVESHADOW");
		RenderableSprite3D.SAHDERDEFINE_LIGHTMAP = Shader3D.getDefineByName("LIGHTMAP");
		RenderableSprite3D.SHADERDEFINE_LIGHTMAP_DIRECTIONAL = Shader3D.getDefineByName("LIGHTMAP_DIRECTIONAL");

		const commandUniform = CommandUniformMap.createGlobalUniformMap("Sprite3D");
		RenderableSprite3D.LIGHTMAPSCALEOFFSET = Shader3D.propertyNameToID("u_LightmapScaleOffset");
		commandUniform.addShaderUniform(RenderableSprite3D.LIGHTMAPSCALEOFFSET, "u_LightmapScaleOffset");
		RenderableSprite3D.LIGHTMAP = Shader3D.propertyNameToID("u_LightMap");
		commandUniform.addShaderUniform(RenderableSprite3D.LIGHTMAP, "u_LightMap");
		RenderableSprite3D.LIGHTMAP_DIRECTION = Shader3D.propertyNameToID("u_LightMapDirection");
		commandUniform.addShaderUniform(RenderableSprite3D.LIGHTMAP_DIRECTION, "u_LightMapDirection");
		RenderableSprite3D.PICKCOLOR = Shader3D.propertyNameToID("u_PickColor");
		commandUniform.addShaderUniform(RenderableSprite3D.PICKCOLOR, "u_PickColor");
		RenderableSprite3D.REFLECTIONTEXTURE = Shader3D.propertyNameToID("u_ReflectTexture");
		commandUniform.addShaderUniform(RenderableSprite3D.REFLECTIONTEXTURE, "REFLECTIONTEXTURE");
		RenderableSprite3D.REFLECTIONCUBE_HDR_PARAMS = Shader3D.propertyNameToID("u_ReflectCubeHDRParams");
		commandUniform.addShaderUniform(RenderableSprite3D.REFLECTIONCUBE_HDR_PARAMS, "u_ReflectCubeHDRParams");
		RenderableSprite3D.REFLECTIONCUBE_PROBEPOSITION = Shader3D.propertyNameToID("u_SpecCubeProbePosition");
		commandUniform.addShaderUniform(RenderableSprite3D.REFLECTIONCUBE_PROBEPOSITION, "u_SpecCubeProbePosition");
		RenderableSprite3D.REFLECTIONCUBE_PROBEBOXMAX = Shader3D.propertyNameToID("u_SpecCubeBoxMax");
		commandUniform.addShaderUniform(RenderableSprite3D.REFLECTIONCUBE_PROBEBOXMAX, "u_SpecCubeBoxMax");
		RenderableSprite3D.REFLECTIONCUBE_PROBEBOXMIN = Shader3D.propertyNameToID("u_SpecCubeBoxMin");
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
		(<Scene3D>this._scene)._removeRenderObject(this._render);

	}

	/** 
	 * @inheritDoc
	 * @override
	 */
	protected _onActive(): void {
		super._onActive();
		(<Scene3D>this._scene)._addRenderObject(this._render);
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	protected _onActiveInScene(): void {
		super._onActiveInScene();

		if (ILaya3D.Laya3D._editerEnvironment) {
			var scene: Scene3D = (<Scene3D>this._scene);
			var pickColor: Vector4 = new Vector4();
			scene._allotPickColorByID(this.id, pickColor);
			scene._pickIdToSprite[this.id] = this;
			this._render._shaderValues.setVector(RenderableSprite3D.PICKCOLOR, pickColor);
		}
	}

	/**
	 * @internal
	 */
	protected _create(): Node {
		return new RenderableSprite3D(this.name);
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
		this._render._setBelongScene(<Scene3D>scene);
	}

	/**
	 * @inheritDoc
	 * @internal
	 * @override
	 */
	_setUnBelongScene(): void {
		if (!this.destroyed) {
			this._render._shaderValues.removeDefine(RenderableSprite3D.SAHDERDEFINE_LIGHTMAP);
			this._render._setUnBelongScene();
			super._setUnBelongScene();
		}
	}

	/**
	 * @inheritDoc
	 * @internal
	 * @override
	 */
	protected _changeHierarchyAnimator(animator: Animator): void {
		if (this._hierarchyAnimator) {
			var renderableSprites: RenderableSprite3D[] = this._hierarchyAnimator._renderableSprites;
			renderableSprites.splice(renderableSprites.indexOf(this), 1);
		}
		if (animator)
			animator._renderableSprites.push(this);

		super._changeHierarchyAnimator(animator);
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	destroy(destroyChild: boolean = true): void {
		super.destroy(destroyChild);
		this._render._destroy();
		this._render = null;
	}
}


