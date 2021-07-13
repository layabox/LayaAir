import { Command } from "./Command";
import { Material } from "../../material/Material";
import { BaseRender } from "../BaseRender";
import { CommandBuffer } from "./CommandBuffer";
import { Scene3D } from "../../scene/Scene3D";
import { RenderContext3D } from "../RenderContext3D";
import { ShaderInstance } from "../../../shader/ShaderInstance";
import { Camera } from "../../Camera";
import { ShaderData } from "../../../shader/ShaderData";
import { Transform3D } from "../../Transform3D";
import { GeometryElement } from "../../GeometryElement";
import { ShaderPass } from "../../../shader/ShaderPass";
import { DefineDatas } from "../../../shader/DefineDatas";
import { ILaya3D } from "../../../../../ILaya3D";
import { ILaya } from "../../../../../ILaya";


/**
 * @internal
 * <code>SetShaderDataTextureCMD</code> 类用于创建设置渲染目标指令。
 */
export class DrawRenderCMD extends Command {
	/**@internal */
	private static _pool: any[] = [];
	/**@internal */
	private static _compileDefine:DefineDatas = new DefineDatas();
	/**
	 * @internal
	 */
	static create(render:BaseRender, material:Material, subShaderIndex:number,commandBuffer:CommandBuffer): DrawRenderCMD {
		var cmd: DrawRenderCMD;
		cmd = DrawRenderCMD._pool.length > 0 ? DrawRenderCMD._pool.pop():new DrawRenderCMD();
		cmd._render = render;
		cmd._material = material;
		cmd._subShaderIndex = subShaderIndex;
		cmd._commandBuffer = commandBuffer;
		return cmd;
	}

	/**@internal */
	private _material:Material;
	/**@internal */
	private _render:BaseRender;
	/**@internal */
	private _subShaderIndex:number;

	/**
	 * @internal
	 */
	private _elementRender(renderElement:any,context: RenderContext3D): void {
		var forceInvertFace: boolean = context.invertY;
		var lastStateMaterial: Material, lastStateShaderInstance: ShaderInstance, lastStateRender: BaseRender;
		var updateMark: number = ILaya3D.Camera._updateMark;
		var scene: Scene3D = context.scene;
		this._render._scene = context.scene;
		var cameraShaderValue: ShaderData = context.cameraShaderValue;

		var transform: Transform3D = renderElement._transform;
		var geometry: GeometryElement = renderElement._geometry;
		context.renderElement = renderElement;
		var updateRender: boolean = updateMark !== renderElement.render._updateMark || renderElement.renderType !== renderElement.render._updateRenderType;
		if (updateRender) {//此处处理更新为裁剪和合并后的，可避免浪费
			renderElement.render._renderUpdate(context, transform);
			renderElement.render._renderUpdateWithCamera(context, transform);
			renderElement.render._updateMark = updateMark;
			renderElement.render._updateRenderType = renderElement.renderType;
		}
		else {
			//InstanceBatch should update worldMatrix every renderElement,
			//because the instance matrix buffer is always different.
			if (renderElement.renderType == ILaya3D.RenderElement.RENDERTYPE_INSTANCEBATCH) {
				renderElement.render._renderUpdate(context, transform);
				renderElement.render._renderUpdateWithCamera(context, transform);
			}
		}

		var currentPipelineMode: string = context.pipelineMode;//NORE:can covert string to int.
		if (geometry._prepareRender(context)) {
			var passes: ShaderPass[] = renderElement.renderSubShader._passes;
			for (var j: number = 0, m: number = passes.length; j < m; j++) {
				var pass: ShaderPass = passes[j];
				//NOTE:this will cause maybe a shader not render but do prepare before，but the developer can avoide this manual,for example shaderCaster=false.
				if (pass._pipelineMode !== currentPipelineMode)
					continue;

				var comDef: DefineDatas = DrawRenderCMD._compileDefine;
				scene._shaderValues._defineDatas.cloneTo(comDef);
				comDef.addDefineDatas(renderElement.render._shaderValues._defineDatas);
				comDef.addDefineDatas(this._material._shaderValues._defineDatas);
				var shaderIns: ShaderInstance = context.shader = pass.withCompile(comDef);
				var switchShader: boolean = shaderIns.bind();//纹理需要切换shader时重新绑定 其他uniform不需要
				var switchUpdateMark: boolean = (updateMark !== shaderIns._uploadMark);

				var uploadScene: boolean = (shaderIns._uploadScene !== scene) || switchUpdateMark;
				if (uploadScene || switchShader) {
					shaderIns.uploadUniforms(shaderIns._sceneUniformParamsMap, scene._shaderValues, uploadScene);
					shaderIns._uploadScene = scene;
				}

				var uploadSprite3D: boolean = (shaderIns._uploadRender !== renderElement.render || shaderIns._uploadRenderType !== renderElement.renderType) || switchUpdateMark;
				if (uploadSprite3D || switchShader) {
					shaderIns.uploadUniforms(shaderIns._spriteUniformParamsMap, renderElement.render._shaderValues, uploadSprite3D);
					shaderIns._uploadRender = renderElement.render;
					shaderIns._uploadRenderType = renderElement.renderType;
				}

				var uploadCamera: boolean = shaderIns._uploadCameraShaderValue !== cameraShaderValue || switchUpdateMark;
				if (uploadCamera || switchShader) {
					shaderIns.uploadUniforms(shaderIns._cameraUniformParamsMap, cameraShaderValue, uploadCamera);
					shaderIns._uploadCameraShaderValue = cameraShaderValue;
				}

				var uploadMaterial: boolean = (shaderIns._uploadMaterial !== this._material) || switchUpdateMark;
				if (uploadMaterial || switchShader) {
					shaderIns.uploadUniforms(shaderIns._materialUniformParamsMap, this._material._shaderValues, uploadMaterial);
					shaderIns._uploadMaterial = this._material;
				}

				var matValues: ShaderData = this._material._shaderValues;
				if (lastStateMaterial !== this._material || lastStateShaderInstance !== shaderIns) {//lastStateMaterial,lastStateShaderInstance存到全局，多摄像机还可优化
					shaderIns.uploadRenderStateBlendDepth(matValues);
					shaderIns.uploadRenderStateFrontFace(matValues, forceInvertFace, renderElement.getInvertFront());
					lastStateMaterial = this._material;
					lastStateShaderInstance = shaderIns;
					lastStateRender = renderElement.render;
				} else {
					if (lastStateRender !== renderElement.render) {//TODO:是否可以用transfrom
						shaderIns.uploadRenderStateFrontFace(matValues, forceInvertFace, renderElement.getInvertFront());
						lastStateRender = renderElement.render;
					}
				}

				geometry._render(context);
				shaderIns._uploadMark = updateMark;
			}
		}
		if (renderElement.renderType !== ILaya3D.RenderElement.RENDERTYPE_NORMAL)
			renderElement.render._revertBatchRenderUpdate(context);//还原因合并导致的数据变化
	}



	/**
	 * @inheritDoc
	 * @override
	 */
	run(): void {
		if(!this._material)
			throw "This render command material cannot be empty";
		this.setContext(this._commandBuffer._context);
		var context = this._context;
		var scene:Scene3D = context.scene;
		var renderElements = this._render._renderElements;
		for(var i:number = 0,n = renderElements.length;i<n;i++){
			var renderelement = renderElements[i];
			//renderelement._update(scene,context,this._material._shader,null,this._subShaderIndex);
			this._renderElementUpdate(renderelement);
			this._elementRender(renderelement,context);
		}
	}

	_renderElementUpdate(renderelement:any){
		if (this._material) {//材质可能为空
			renderelement.renderSubShader = this._material._shader.getSubShaderAt(this._subShaderIndex);
		}
	}




	/**
	 * @inheritDoc
	 * @override
	 */
	recover(): void {
		DrawRenderCMD._pool.push(this);
	
	}

}


