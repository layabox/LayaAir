import { BaseRender } from "./BaseRender";
import { RenderContext3D } from "./RenderContext3D";
import { RenderQueue } from "./RenderQueue";
import { BaseCamera } from "../BaseCamera"
import { Camera } from "../Camera"
import { GeometryElement } from "../GeometryElement"
import { Transform3D } from "../Transform3D"
import { BaseMaterial } from "../material/BaseMaterial"
import { Scene3D } from "../scene/Scene3D"
import { Shader3D } from "../../shader/Shader3D"
import { ShaderData } from "../../shader/ShaderData"
import { ShaderInstance } from "../../shader/ShaderInstance"
import { ShaderPass } from "../../shader/ShaderPass"
import { SubShader } from "../../shader/SubShader"

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
	_transform: Transform3D;
	/** @internal */
	_geometry: GeometryElement;

	/** @internal */
	material: BaseMaterial;//可能为空
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
		queue.elements.push(this);
	}

	/**
	 * @internal
	 */
	addToTransparentRenderQueue(context: RenderContext3D, queue: RenderQueue): void {
		queue.elements.push(this);
		queue.lastTransparentBatched = false;
		queue.lastTransparentRenderElement = this;
	}

	/**
	 * @internal
	 */
	_update(scene: Scene3D, context: RenderContext3D, customShader: Shader3D, replacementTag: string): void {
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
					this.renderSubShader = customShader.getSubShaderAt(0);//TODO:
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
	_render(context: RenderContext3D, isTarget: boolean): void {
		var lastStateMaterial: BaseMaterial, lastStateShaderInstance: ShaderInstance, lastStateRender: BaseRender;
		var updateMark: number = Camera._updateMark;
		var scene: Scene3D = context.scene;
		var camera: BaseCamera = context.camera;

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

		if (geometry._prepareRender(context)) {
			var passes: ShaderPass[] = this.renderSubShader._passes;
			for (var j: number = 0, m: number = passes.length; j < m; j++) {
				var shaderPass: ShaderInstance = context.shader = passes[j].withCompile((scene._shaderValues._defineDatas.value) & (~this.material._disablePublicDefineDatas.value), this.render._shaderValues._defineDatas.value, this.material._shaderValues._defineDatas.value);
				var switchShader: boolean = shaderPass.bind();//纹理需要切换shader时重新绑定 其他uniform不需要
				var switchUpdateMark: boolean = (updateMark !== shaderPass._uploadMark);

				var uploadScene: boolean = (shaderPass._uploadScene !== scene) || switchUpdateMark;
				if (uploadScene || switchShader) {
					shaderPass.uploadUniforms(shaderPass._sceneUniformParamsMap, scene._shaderValues, uploadScene);
					shaderPass._uploadScene = scene;
				}

				var uploadSprite3D: boolean = (shaderPass._uploadRender !== this.render || shaderPass._uploadRenderType !== this.renderType) || switchUpdateMark;
				if (uploadSprite3D || switchShader) {
					shaderPass.uploadUniforms(shaderPass._spriteUniformParamsMap, this.render._shaderValues, uploadSprite3D);
					shaderPass._uploadRender = this.render;
					shaderPass._uploadRenderType = this.renderType;
				}

				var uploadCamera: boolean = shaderPass._uploadCamera !== camera || switchUpdateMark;
				if (uploadCamera || switchShader) {
					shaderPass.uploadUniforms(shaderPass._cameraUniformParamsMap, camera._shaderValues, uploadCamera);
					shaderPass._uploadCamera = camera;
				}

				var uploadMaterial: boolean = (shaderPass._uploadMaterial !== this.material) || switchUpdateMark;
				if (uploadMaterial || switchShader) {
					shaderPass.uploadUniforms(shaderPass._materialUniformParamsMap, this.material._shaderValues, uploadMaterial);
					shaderPass._uploadMaterial = this.material;
				}

				var matValues: ShaderData = this.material._shaderValues;
				if (lastStateMaterial !== this.material || lastStateShaderInstance !== shaderPass) {//lastStateMaterial,lastStateShaderInstance存到全局，多摄像机还可优化
					shaderPass.uploadRenderStateBlendDepth(matValues);
					shaderPass.uploadRenderStateFrontFace(matValues, isTarget, this.getInvertFront());
					lastStateMaterial = this.material;
					lastStateShaderInstance = shaderPass;
					lastStateRender = this.render;
				} else {
					if (lastStateRender !== this.render) {//TODO:是否可以用transfrom
						shaderPass.uploadRenderStateFrontFace(matValues, isTarget, this.getInvertFront());
						lastStateRender = this.render;
					}
				}

				geometry._render(context);
				shaderPass._uploadMark = updateMark;
			}
		}
		if (updateRender && this.renderType !== RenderElement.RENDERTYPE_NORMAL)
			this.render._revertBatchRenderUpdate(context);//还原因合并导致的数据变化
		Camera._updateMark++;
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

