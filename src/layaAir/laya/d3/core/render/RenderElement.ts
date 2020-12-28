//@ts-nocheck
import { BaseRender } from "./BaseRender"
import { RenderContext3D } from "./RenderContext3D"
import { RenderQueue } from "./RenderQueue"
import { Camera } from "../Camera"
import { GeometryElement } from "../GeometryElement"
import { Transform3D } from "../Transform3D"
import { Material } from "../material/Material"
import { Scene3D } from "../scene/Scene3D"
import { Shader3D } from "../../shader/Shader3D"
import { ShaderData } from "../../shader/ShaderData"
import { ShaderInstance } from "../../shader/ShaderInstance"
import { ShaderPass } from "../../shader/ShaderPass"
import { SubShader } from "../../shader/SubShader"
import { DefineDatas } from "../../shader/DefineDatas"

/**
 * <code>RenderElement</code> 类用于实现渲染元素。
 */
export class RenderElement {
	/** @internal */
	static RENDERTYPE_NORMAL: number = 0;
	/** @internal */
	static RENDERTYPE_STATICBATCH: number = 1;
	/** @internal */
	static RENDERTYPE_INSTANCEBATCH: number = 2;
	/** @internal */
	static RENDERTYPE_VERTEXBATCH: number = 3;

	/** @internal */
	private static _compileDefine: DefineDatas = new DefineDatas();

	/** @internal */
	_transform: Transform3D;
	/** @internal */
	_geometry: GeometryElement;

	/** @internal */
	material: Material;//可能为空
	/** @internal */
	render: BaseRender;
	/** @internal */
	staticBatch: GeometryElement;
	/** @internal */
	renderSubShader: SubShader = null;//TODO：做缓存标记优化

	/** @internal */
	renderType: number = RenderElement.RENDERTYPE_NORMAL;


	/**
	 * 创建一个 <code>RenderElement</code> 实例。
	 */
	constructor() {
	}

	/**
	 * @internal
	 */
	getInvertFront(): boolean {
		return this._transform._isFrontFaceInvert;
	}

	/**
	 * @internal
	 */
	setTransform(transform: Transform3D): void {
		this._transform = transform;
	}

	/**
	 * @internal
	 */
	setGeometry(geometry: GeometryElement): void {
		this._geometry = geometry;
	}

	/**
	 * @internal
	 */
	addToOpaqueRenderQueue(context: RenderContext3D, queue: RenderQueue): void {
		queue.elements.add(this);
	}

	/**
	 * @internal
	 */
	addToTransparentRenderQueue(context: RenderContext3D, queue: RenderQueue): void {
		queue.elements.add(this);
		queue.lastTransparentBatched = false;
		queue.lastTransparentRenderElement = this;
	}

	/**
	 * @internal
	 */
	_update(scene: Scene3D, context: RenderContext3D, customShader: Shader3D, replacementTag: string,subshaderIndex:number = 0): void {
		if (this.material) {//材质可能为空
			var subShader: SubShader = this.material._shader.getSubShaderAt(0);//TODO:
			this.renderSubShader = null;
			if (customShader) {
				if (replacementTag) {
					var oriTag: string = subShader.getFlag(replacementTag);
					if (oriTag) {
						var customSubShaders: SubShader[] = customShader._subShaders;
						for (var k: number = 0, p: number = customSubShaders.length; k < p; k++) {
							var customSubShader: SubShader = customSubShaders[k];
							if (oriTag === customSubShader.getFlag(replacementTag)) {
								this.renderSubShader = customSubShader;
								break;
							}
						}
						if (!this.renderSubShader)
							return;
					} else {
						return;
					}
				} else {
					this.renderSubShader = customShader.getSubShaderAt(subshaderIndex);//TODO:
				}
			} else {
				this.renderSubShader = subShader;
			}

			var renderQueue: RenderQueue = scene._getRenderQueue(this.material.renderQueue);
			if (renderQueue.isTransparent)
				this.addToTransparentRenderQueue(context, renderQueue);
			else
				this.addToOpaqueRenderQueue(context, renderQueue);
		}
	}

	/**
	 * @internal
	 */
	_render(context: RenderContext3D): void {
		var forceInvertFace: boolean = context.invertY;
		var lastStateMaterial: Material, lastStateShaderInstance: ShaderInstance, lastStateRender: BaseRender;
		var updateMark: number = Camera._updateMark;
		var scene: Scene3D = context.scene;
		var cameraShaderValue: ShaderData = context.cameraShaderValue;

		var transform: Transform3D = this._transform;
		var geometry: GeometryElement = this._geometry;
		context.renderElement = this;
		var updateRender: boolean = updateMark !== this.render._updateMark || this.renderType !== this.render._updateRenderType;
		if (updateRender) {//此处处理更新为裁剪和合并后的，可避免浪费
			this.render._renderUpdate(context, transform);
			this.render._renderUpdateWithCamera(context, transform);
			this.render._updateMark = updateMark;
			this.render._updateRenderType = this.renderType;
		}
		else {
			//InstanceBatch should update worldMatrix every renderElement,
			//because the instance matrix buffer is always different.
			if (this.renderType == RenderElement.RENDERTYPE_INSTANCEBATCH) {
				this.render._renderUpdate(context, transform);
				this.render._renderUpdateWithCamera(context, transform);
			}
		}

		var currentPipelineMode: string = context.pipelineMode;//NORE:can covert string to int.

		if (geometry._prepareRender(context)) {
			var passes: ShaderPass[] = this.renderSubShader._passes;
			for (var j: number = 0, m: number = passes.length; j < m; j++) {
				var pass: ShaderPass = passes[j];
				//NOTE:this will cause maybe a shader not render but do prepare before，but the developer can avoide this manual,for example shaderCaster=false.
				if (pass._pipelineMode !== currentPipelineMode)
					continue;

				var comDef: DefineDatas = RenderElement._compileDefine;
				scene._shaderValues._defineDatas.cloneTo(comDef);
				comDef.addDefineDatas(this.render._shaderValues._defineDatas);
				comDef.addDefineDatas(this.material._shaderValues._defineDatas);
				var shaderIns: ShaderInstance = context.shader = pass.withCompile(comDef);
				var switchShader: boolean = shaderIns.bind();//纹理需要切换shader时重新绑定 其他uniform不需要
				var switchUpdateMark: boolean = (updateMark !== shaderIns._uploadMark);

				var uploadScene: boolean = (shaderIns._uploadScene !== scene) || switchUpdateMark;
				if (uploadScene || switchShader) {
					shaderIns.uploadUniforms(shaderIns._sceneUniformParamsMap, scene._shaderValues, uploadScene);
					shaderIns._uploadScene = scene;
				}

				var uploadSprite3D: boolean = (shaderIns._uploadRender !== this.render || shaderIns._uploadRenderType !== this.renderType) || switchUpdateMark;
				if (uploadSprite3D || switchShader) {
					shaderIns.uploadUniforms(shaderIns._spriteUniformParamsMap, this.render._shaderValues, uploadSprite3D);
					shaderIns._uploadRender = this.render;
					shaderIns._uploadRenderType = this.renderType;
				}

				var uploadCamera: boolean = shaderIns._uploadCameraShaderValue !== cameraShaderValue || switchUpdateMark;
				if (uploadCamera || switchShader) {
					shaderIns.uploadUniforms(shaderIns._cameraUniformParamsMap, cameraShaderValue, uploadCamera);
					shaderIns._uploadCameraShaderValue = cameraShaderValue;
				}

				var uploadMaterial: boolean = (shaderIns._uploadMaterial !== this.material) || switchUpdateMark;
				if (uploadMaterial || switchShader) {
					shaderIns.uploadUniforms(shaderIns._materialUniformParamsMap, this.material._shaderValues, uploadMaterial);
					shaderIns._uploadMaterial = this.material;
				}

				var matValues: ShaderData = this.material._shaderValues;
				if (lastStateMaterial !== this.material || lastStateShaderInstance !== shaderIns) {//lastStateMaterial,lastStateShaderInstance存到全局，多摄像机还可优化
					shaderIns.uploadRenderStateBlendDepth(matValues);
					shaderIns.uploadRenderStateFrontFace(matValues, forceInvertFace, this.getInvertFront());
					lastStateMaterial = this.material;
					lastStateShaderInstance = shaderIns;
					lastStateRender = this.render;
				} else {
					if (lastStateRender !== this.render) {//TODO:是否可以用transfrom
						shaderIns.uploadRenderStateFrontFace(matValues, forceInvertFace, this.getInvertFront());
						lastStateRender = this.render;
					}
				}

				geometry._render(context);
				shaderIns._uploadMark = updateMark;
			}
		}
		if (this.renderType !== RenderElement.RENDERTYPE_NORMAL)
			this.render._revertBatchRenderUpdate(context);//还原因合并导致的数据变化
	}

	/**
	 * @internal
	 */
	destroy(): void {
		this._transform = null;
		this._geometry = null;
		this.material = null;
		this.render = null;
	}
}

