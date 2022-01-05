import { ShaderInstanceBase } from "../../display/ShaderInstanceBase";
import { CommandEncoder } from "../../layagl/CommandEncoder";
import { LayaGL } from "../../layagl/LayaGL";
import { LayaGLRunner } from "../../layagl/LayaGLRunner";
import { Stat } from "../../utils/Stat";
import { WebGLContext } from "../../webgl/WebGLContext";
import { Material } from "../core/material/Material";
import { RenderState } from "../core/material/RenderState";
import { BaseRender } from "../core/render/BaseRender";
import { Scene3D } from "../core/scene/Scene3D";
import { CommandUniformMap } from "../core/scene/Scene3DShaderDeclaration";
import { Shader3D } from "./Shader3D";
import { ShaderData } from "./ShaderData";
import { ShaderPass } from "./ShaderPass";
import { ShaderVariable } from "./ShaderVariable";

/**
 * @internal
 * <code>ShaderInstance</code> 类用于实现ShaderInstance。
 */
export class ShaderInstance extends ShaderInstanceBase {
	/**@internal */
	private _shaderPass: ShaderPass;
	/**@internal */
	_sceneUniformParamsMap: CommandEncoder;
	/**@internal */
	_cameraUniformParamsMap: CommandEncoder;
	/**@internal */
	_spriteUniformParamsMap: CommandEncoder;
	/**@internal */
	_materialUniformParamsMap: CommandEncoder;
	/**@internal */
	private _customUniformParamsMap: any[] = [];
	/**@internal */
	private _stateParamsMap: any[] = [];

	/**@internal */
	_uploadMark: number = -1;
	/**@internal */
	_uploadMaterial: Material;
	/**@internal RenderIDTODO*/
	_uploadRender: BaseRender;
	/** @internal */
	_uploadRenderType: number = -1;
	/**@internal CamneraTOD*/
	_uploadCameraShaderValue: ShaderData;
	/**@internal SceneIDTODO*/
	_uploadScene: Scene3D;

	/**
	 * 创建一个 <code>ShaderInstance</code> 实例。
	 */
	constructor(vs: string, ps: string, attributeMap: any, shaderPass: ShaderPass) {
		
		
		super(vs,ps,attributeMap);
		this._shaderPass = shaderPass;
		this._create();
		this.lock = true;
	}

	/**
	 * @internal TODO3D
	 */
	protected _create(): void {
		super._create();
		this.splitUnifromData();
		//Native版本分别存入funid、webglFunid,location、type、offset, +4是因为第一个存长度了 所以是*4*5+4
		this._sceneUniformParamsMap = (<any>LayaGL.instance).createCommandEncoder();
		this._cameraUniformParamsMap = (<any>LayaGL.instance).createCommandEncoder();
		this._spriteUniformParamsMap = (<any>LayaGL.instance).createCommandEncoder();
		this._materialUniformParamsMap = (<any>LayaGL.instance).createCommandEncoder();
		const sceneParams = CommandUniformMap.createGlobalUniformMap("Scene3D");
		const spriteParms = CommandUniformMap.createGlobalUniformMap("Sprite3D");
		const cameraParams = CommandUniformMap.createGlobalUniformMap("BaseCamera");
		const customParams = CommandUniformMap.createGlobalUniformMap("Custom");
		let i,n;
		let data = this._uniformMap.getArrayData();
		for(i=0,n=this._uniformMap.getCount();i<n;i++){
			let one:ShaderVariable = data[i];
			if(sceneParams.hasPtrID(one.dataOffset)){
				this._sceneUniformParamsMap.addShaderUniform(one);
			}else if(cameraParams.hasPtrID(one.dataOffset)){
				this._cameraUniformParamsMap.addShaderUniform(one);
			}else if(spriteParms.hasPtrID(one.dataOffset)){
				this._spriteUniformParamsMap.addShaderUniform(one);
			}else if(customParams.hasPtrID(one.dataOffset)){
				this._customUniformParamsMap||(this._customUniformParamsMap = []);
				this._customUniformParamsMap[one.dataOffset] = one;
			}else{
				this._materialUniformParamsMap.addShaderUniform(one);
			}
		}
		var stateMap: {[key:string]:number} = this._shaderPass._stateMap;
		for (var s in stateMap)
			this._stateParamsMap[stateMap[s]] = Shader3D.propertyNameToID(s);
	}

	protected splitUnifromData() {
		var sceneParms: any[] = [];
		var cameraParms: any[] = [];
		var spriteParms: any[] = [];
		var materialParms: any[] = [];
		var customParms: any[] = [];
    }


	

	/**
	 * @inheritDoc
	 * @override
	 */
	protected _disposeResource(): void {
		LayaGL.instance.deleteShader(this._vshader);
		LayaGL.instance.deleteShader(this._pshader);
		LayaGL.instance.deleteProgram(this._program);
		this._vshader = this._pshader = this._program = null;
		this._setGPUMemory(0);
		this._curActTexIndex = 0;
	}
	

	//miner RenderState  removeTODO

	/**
	 * @internal
	 */
	 private _getRenderState(shaderDatas: any, stateIndex: number): any {
		var stateID: any = this._stateParamsMap[stateIndex];
		if (stateID == null)
			return null;
		else
			return shaderDatas[stateID];
	}

	/**
	 * @internal
	 */
	uploadRenderStateBlendDepth(shaderDatas: ShaderData): void {
		var gl: WebGLRenderingContext = LayaGL.instance;
		var renderState: RenderState = this._shaderPass.renderState;
		var datas: any = shaderDatas.getData();

		var depthWrite: any = this._getRenderState(datas, Shader3D.RENDER_STATE_DEPTH_WRITE);
		var depthTest: any = this._getRenderState(datas, Shader3D.RENDER_STATE_DEPTH_TEST);
		var blend: any = this._getRenderState(datas, Shader3D.RENDER_STATE_BLEND);
		var stencilRef:any = this._getRenderState(datas,Shader3D.RENDER_STATE_STENCIL_REF);
		var stencilTest:any = this._getRenderState(datas,Shader3D.RENDER_STATE_STENCIL_TEST);
		var stencilWrite:any = this._getRenderState(datas,Shader3D.RENDER_STATE_STENCIL_WRITE);
		var stencilOp:any = this._getRenderState(datas,Shader3D.RENDER_STATE_STENCIL_OP);
		depthWrite == null && (depthWrite = renderState.depthWrite);
		depthTest == null && (depthTest = renderState.depthTest);
		blend == null && (blend = renderState.blend);
		stencilRef == null && (stencilRef = renderState.stencilRef);
		stencilTest ==null && (stencilTest = renderState.stencilTest);
		stencilWrite == null && (stencilTest = renderState.stencilWrite);
		stencilOp ==null && (stencilOp = renderState.stencilOp);

		WebGLContext.setDepthMask(gl, depthWrite);
		if (depthTest === RenderState.DEPTHTEST_OFF)
			WebGLContext.setDepthTest(gl, false);
		else {
			WebGLContext.setDepthTest(gl, true);
			WebGLContext.setDepthFunc(gl, depthTest);
		}
		//blend
		switch (blend) {
			case RenderState.BLEND_DISABLE:
				WebGLContext.setBlend(gl, false);
				break;
			case RenderState.BLEND_ENABLE_ALL:
				var blendEquation: any = this._getRenderState(datas, Shader3D.RENDER_STATE_BLEND_EQUATION);
				var srcBlend: any = this._getRenderState(datas, Shader3D.RENDER_STATE_BLEND_SRC);
				var dstBlend: any = this._getRenderState(datas, Shader3D.RENDER_STATE_BLEND_DST);
				blendEquation == null && (blendEquation = renderState.blendEquation);
				srcBlend == null && (srcBlend = renderState.srcBlend);
				dstBlend == null && (dstBlend = renderState.dstBlend);
				WebGLContext.setBlend(gl, true);
				WebGLContext.setBlendEquation(gl, blendEquation);
				WebGLContext.setBlendFunc(gl, srcBlend, dstBlend);
				break;
			case RenderState.BLEND_ENABLE_SEPERATE:
				var blendEquationRGB: any = this._getRenderState(datas, Shader3D.RENDER_STATE_BLEND_EQUATION_RGB);
				var blendEquationAlpha: any = this._getRenderState(datas, Shader3D.RENDER_STATE_BLEND_EQUATION_ALPHA);
				var srcRGB: any = this._getRenderState(datas, Shader3D.RENDER_STATE_BLEND_SRC_RGB);
				var dstRGB: any = this._getRenderState(datas, Shader3D.RENDER_STATE_BLEND_DST_RGB);
				var srcAlpha: any = this._getRenderState(datas, Shader3D.RENDER_STATE_BLEND_SRC_ALPHA);
				var dstAlpha: any = this._getRenderState(datas, Shader3D.RENDER_STATE_BLEND_DST_ALPHA);
				blendEquationRGB == null && (blendEquationRGB = renderState.blendEquationRGB);
				blendEquationAlpha == null && (blendEquationAlpha = renderState.blendEquationAlpha);
				srcRGB == null && (srcRGB = renderState.srcBlendRGB);
				dstRGB == null && (dstRGB = renderState.dstBlendRGB);
				srcAlpha == null && (srcAlpha = renderState.srcBlendAlpha);
				dstAlpha == null && (dstAlpha = renderState.dstBlendAlpha);
				WebGLContext.setBlend(gl, true);
				WebGLContext.setBlendEquationSeparate(gl, blendEquationRGB, blendEquationAlpha);
				WebGLContext.setBlendFuncSeperate(gl, srcRGB, dstRGB, srcAlpha, dstAlpha);
				break;
		}

		//Stencil
		WebGLContext.setStencilMask(gl, stencilWrite);
		if(stencilTest==RenderState.STENCILTEST_OFF){
			WebGLContext.setStencilTest(gl,false);
		}else{
			WebGLContext.setStencilTest(gl,true);
			WebGLContext.setStencilFunc(gl,stencilTest,stencilRef);
			
		}
		WebGLContext.setstencilOp(gl,stencilOp.x,stencilOp.y,stencilOp.z);
		
		
		
	}

	/**
	 * @internal
	 */
	uploadRenderStateFrontFace(shaderDatas: ShaderData, isTarget: boolean, invertFront: boolean): void {
		var gl: WebGLRenderingContext = LayaGL.instance;
		var renderState: RenderState = this._shaderPass.renderState;
		var datas: any = shaderDatas.getData();

		var cull: any = this._getRenderState(datas, Shader3D.RENDER_STATE_CULL);
		cull == null && (cull = renderState.cull);

		var forntFace: number;
		switch (cull) {
			case RenderState.CULL_NONE:
				WebGLContext.setCullFace(gl, false);
				break;
			case RenderState.CULL_FRONT:
				WebGLContext.setCullFace(gl, true);
				//forntFace = isTarget ? invertFront ? WebGLContext.CCW : WebGLContext.CW : invertFront ? WebGLContext.CW : WebGLContext.CCW;
				if (isTarget) {
					if (invertFront)
						forntFace = gl.CCW;
					else
						forntFace = gl.CW;
				} else {
					if (invertFront)
						forntFace = gl.CW;
					else
						forntFace = gl.CCW;
				}
				WebGLContext.setFrontFace(gl, forntFace);
				break;
			case RenderState.CULL_BACK:
				WebGLContext.setCullFace(gl, true);
				if (isTarget) {
					if (invertFront)
						forntFace = gl.CW;
					else
						forntFace = gl.CCW;
				} else {
					if (invertFront)
						forntFace = gl.CCW;
					else
						forntFace = gl.CW;
				}
				WebGLContext.setFrontFace(gl, forntFace);
				break;
		}
	}

	/**
	 * @internal
	 */
	uploadCustomUniform(index: number, data: any): void {
		Stat.shaderCall += LayaGLRunner.uploadCustomUniform((<any>LayaGL.instance), this._customUniformParamsMap, index, data);
	}

	/**
	 * @internal
	 * [NATIVE]
	 */
	_uniformMatrix2fvForNative(one: any, value: any): number {
		(<any>LayaGL.instance).uniformMatrix2fvEx(one.location, false, value);
		return 1;
	}

	/**
	 * @internal
	 * [NATIVE]
	 */
	_uniformMatrix3fvForNative(one: any, value: any): number {
		(<any>LayaGL.instance).uniformMatrix3fvEx(one.location, false, value);
		return 1;
	}

	/**
	 * @internal
	 * [NATIVE]
	 */
	_uniformMatrix4fvForNative(one: any, m: Float32Array): number {
		(<any>LayaGL.instance).uniformMatrix4fvEx(one.location, false, m);
		return 1;
	}
}

