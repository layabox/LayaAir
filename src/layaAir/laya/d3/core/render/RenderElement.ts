import { BaseRender } from "./BaseRender"
import { RenderContext3D } from "./RenderContext3D"
import { Camera } from "../Camera"
import { GeometryElement } from "../GeometryElement"
import { Transform3D } from "../Transform3D"
import { Material } from "../material/Material"
import { SubShader } from "../../shader/SubShader"
import { ILaya3D } from "../../../../ILaya3D"
import { IRenderElement } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderElement"
import { IRenderQueue } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderQueue"
import { BaseRenderQueue } from "./BaseRenderQueue"
import { Scene3D } from "../scene/Scene3D"
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D"
import { RenderElementOBJ } from "./newRender/RenderElementOBJ"
import { ShaderPass } from "../../shader/ShaderPass"
import { DefineDatas } from "../../../RenderEngine/RenderShader/DefineDatas"
import { ShaderInstance } from "../../shader/ShaderInstance"

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

	/**
	 * 可提交底层的渲染节点
	 */
	protected _renderElementOBJ:IRenderElement;
	/** @internal */
	_geometry: GeometryElement;
	/** @internal */
	protected _material: Material;//可能为空
	/** @internal */
	protected _baseRender: BaseRender;

	protected _subShader:SubShader;

	/** @internal */
	set transform(value:Transform3D){
		this._renderElementOBJ._transform = value;
	}

	/**@internal */
	get transform():Transform3D{
		return this._renderElementOBJ._transform;
	}

	/**@internal */
	set material(value:Material){
		this._material = value;
		this._renderElementOBJ._materialShaderData = value.shaderData;
	}

	/**@internal */
	get material():Material{
		return this._material;
	}

	/**@internal */
	set renderSubShader(value:SubShader){
		this._subShader = value;
	}

	/**@internal */
	get renderSubShader():SubShader{
		return this._subShader;
	}
	/**@internal */
	set render(value:BaseRender){
		this._baseRender = value;
		this._renderElementOBJ._renderShaderData = value._shaderValues;
	}

	get render():BaseRender{
		return this._baseRender;
	}

	/** @internal */
	staticBatch: GeometryElement;
	/** @internal */
	renderType: number = RenderElement.RENDERTYPE_NORMAL;
	/**
	 * 创建一个 <code>RenderElement</code> 实例。
	 */
	constructor() {
		this._renderElementOBJ = new RenderElementOBJ();
	}

	/**
	 * @internal
	 */
	getInvertFront(): boolean {
		return this.transform._isFrontFaceInvert;
	}

	/**
	 * @internal
	 */
	setTransform(transform: Transform3D): void {
		this.transform = transform;
	}

	/**
	 * @internal
	 */
	setGeometry(geometry: GeometryElement): void {
		this._geometry = geometry;
		this._renderElementOBJ._geometry = geometry._geometryElementOBj;
	}

	// /**
	//  * @internal
	//  */
	// addToOpaqueRenderQueue(context: RenderContext3D, queue: RenderQueue): void {
	// 	queue.elements.add(this);
	// }

	// /**
	//  * @internal
	//  */
	// addToTransparentRenderQueue(context: RenderContext3D, queue: RenderQueue): void {
	// 	queue.elements.add(this);
	// }

	compileShader(renderQeue:IRenderQueue){
		var passes: ShaderPass[] = this._subShader._passes;
		this._renderElementOBJ._clearShaderInstance();
		for (var j: number = 0, m: number = passes.length; j < m; j++) {
			var pass: ShaderPass = passes[j];
			//NOTE:this will cause maybe a shader not render but do prepare before，but the developer can avoide this manual,for example shaderCaster=false.
			if (pass._pipelineMode !== renderQeue.pipelineMode)
				continue;

			var comDef: DefineDatas = RenderElement._compileDefine;
			renderQeue.sceneShaderData._defineDatas.cloneTo(comDef);
			comDef.addDefineDatas(this.render._shaderValues._defineDatas);
			comDef.addDefineDatas(this.material._shaderValues._defineDatas);
			var shaderIns: ShaderInstance = pass.withCompile(comDef);
			this._renderElementOBJ._addShaderInstance(shaderIns);
		}
	}

	/**
	 * @internal
	 */
	_update(scene:Scene3D, context: RenderContext3D, customShader: Shader3D, replacementTag: string, subshaderIndex: number = 0): void {
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

			var renderQueue: BaseRenderQueue = scene._getRenderQueue(this.material.renderQueue);
			if (renderQueue._isTransparent)
				renderQueue.addRenderElement(this);
			else
				renderQueue.addRenderElement(this);
		}
	}

	_renderUpdatePre(context: RenderContext3D,renderqueue:IRenderQueue) {

		var sceneMark: number = ILaya3D.Scene3D._updateMark;
		var transform: Transform3D = this.transform;
		context.renderElement = this;
		//model local
		var sceneDataRender: boolean = sceneMark !== this.render._sceneUpdateMark || this.renderType !== this.render._updateRenderType;
		if (sceneDataRender&&this.renderType != RenderElement.RENDERTYPE_INSTANCEBATCH ) {
			this.render._renderUpdate(context, transform);
			this.render._sceneUpdateMark = sceneMark;
		}
		//camera
		var updateMark: number = Camera._updateMark;
		var updateRender: boolean = updateMark !== this.render._updateMark || this.renderType !== this.render._updateRenderType;
		if (updateRender) {//此处处理更新为裁剪和合并后的，可避免浪费
			this.render._renderUpdateWithCamera(context, transform);
			this.render._updateMark = updateMark;
			this.render._updateRenderType = this.renderType;
		}

		const subUbo = this.render._subUniformBufferData;
		if (subUbo) {
			subUbo._needUpdate && BaseRender._transLargeUbO.updateSubData(subUbo);
		}
		//context.shader = this._renderElementOBJ._subShader;
		this._renderElementOBJ._isRender = this._geometry._prepareRender(context);
		this._geometry._updateRenderParams(context);
		this.compileShader(renderqueue);
	}

	/**
	 * @internal
	 */
	_render(renderqueue:IRenderQueue): void {
		this._renderElementOBJ._render(renderqueue);
		// var forceInvertFace: boolean = context.invertY;
		// var lastStateMaterial: Material, lastStateShaderInstance: ShaderInstance, lastStateRender: BaseRender;
		// var updateMark: number = Camera._updateMark;

		// var scene = context.scene;
		// var cameraShaderValue: ShaderData = context.cameraShaderValue;


		// var geometry: GeometryElement = this._geometry;
		// context.renderElement = this;
		// // if(this.renderType == RenderElement.RENDERTYPE_INSTANCEBATCH||this.renderType == RenderElement.RENDERTYPE_STATICBATCH){
		// // 	var transform: Transform3D = this._transform;
		// // 	this.render._renderUpdate(context, transform);
		// // }
		// // if(this.renderType == RenderElement.RENDERTYPE_STATICBATCH){
		// // 	this.render._renderUpdateWithCamera(context,transform);//多SubMesh会共用同一个BaseRender，因此会印象统一BaseRender的数据
		// // }
		// var currentPipelineMode: string = context.pipelineMode;//NORE:can covert string to int.

		// if (geometry._prepareRender(context)) {
		// 	var passes: ShaderPass[] = this.renderSubShader._passes;
		// 	for (var j: number = 0, m: number = passes.length; j < m; j++) {
		// 		var pass: ShaderPass = passes[j];
		// 		//NOTE:this will cause maybe a shader not render but do prepare before，but the developer can avoide this manual,for example shaderCaster=false.
		// 		if (pass._pipelineMode !== currentPipelineMode)
		// 			continue;

		// 		var comDef: DefineDatas = RenderElement._compileDefine;
		// 		scene._shaderValues._defineDatas.cloneTo(comDef);
		// 		comDef.addDefineDatas(this.render._shaderValues._defineDatas);
		// 		comDef.addDefineDatas(this.material._shaderValues._defineDatas);
		// 		var shaderIns: ShaderInstance = context.shader = pass.withCompile(comDef);
		// 		var switchShader: boolean = shaderIns.bind();//纹理需要切换shader时重新绑定 其他uniform不需要
		// 		var switchUpdateMark: boolean = (updateMark !== shaderIns._uploadMark);

		// 		var uploadScene: boolean = (shaderIns._uploadScene !== scene) || switchUpdateMark;
		// 		if (uploadScene || switchShader) {
		// 			shaderIns.uploadUniforms(shaderIns._sceneUniformParamsMap, scene._shaderValues, uploadScene);
		// 			shaderIns._uploadScene = scene;
		// 		}

		// 		var uploadSprite3D: boolean = (shaderIns._uploadRender !== this.render || shaderIns._uploadRenderType !== this.renderType) || switchUpdateMark;
		// 		if (uploadSprite3D || switchShader) {
		// 			shaderIns.uploadUniforms(shaderIns._spriteUniformParamsMap, this.render._shaderValues, uploadSprite3D);
		// 			this.render._subUniformBufferData && (BaseRender._transLargeUbO.updateBindRange(this.render._subUniformBufferData));
		// 			shaderIns._uploadRender = this.render;
		// 			shaderIns._uploadRenderType = this.renderType;
		// 		}

		// 		var uploadCamera: boolean = shaderIns._uploadCameraShaderValue !== cameraShaderValue || switchUpdateMark;
		// 		if (uploadCamera || switchShader) {
		// 			shaderIns.uploadUniforms(shaderIns._cameraUniformParamsMap, cameraShaderValue, uploadCamera);
		// 			shaderIns._uploadCameraShaderValue = cameraShaderValue;
		// 		}

		// 		var uploadMaterial: boolean = (shaderIns._uploadMaterial !== this.material) || switchUpdateMark;
		// 		if (uploadMaterial || switchShader) {
		// 			shaderIns.uploadUniforms(shaderIns._materialUniformParamsMap, this.material._shaderValues, uploadMaterial);
		// 			shaderIns._uploadMaterial = this.material;
		// 		}

		// 		var matValues: ShaderData = this.material._shaderValues;
		// 		if (lastStateMaterial !== this.material || lastStateShaderInstance !== shaderIns) {//lastStateMaterial,lastStateShaderInstance存到全局，多摄像机还可优化
		// 			shaderIns.uploadRenderStateBlendDepth(matValues);
		// 			shaderIns.uploadRenderStateFrontFace(matValues, forceInvertFace, this.getInvertFront());
		// 			lastStateMaterial = this.material;
		// 			lastStateShaderInstance = shaderIns;
		// 			lastStateRender = this.render;
		// 		} else {
		// 			if (lastStateRender !== this.render) {//TODO:是否可以用transfrom
		// 				shaderIns.uploadRenderStateFrontFace(matValues, forceInvertFace, this.getInvertFront());
		// 				lastStateRender = this.render;
		// 			}
		// 		}

		// 		geometry._updateRenderParams(context);
		// 		geometry._render(context);
		// 		shaderIns._uploadMark = updateMark;
		// 	}
		// }
		// if (this.renderType !== RenderElement.RENDERTYPE_NORMAL)
		// 	this.render._revertBatchRenderUpdate(context);//还原因合并导致的数据变化
	}

	/**
	 * @internal
	 */
	destroy(): void {
		this._renderElementOBJ._destroy();
		this._renderElementOBJ = null;
		this.material = null;
		this.render = null;
	}
}

