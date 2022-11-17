import { CommandEncoder } from "../../layagl/CommandEncoder";
import { LayaGL } from "../../layagl/LayaGL";
import { CullMode } from "../../RenderEngine/RenderEnum/CullMode";
import { RenderStateType } from "../../RenderEngine/RenderEnum/RenderStateType";
import { IRenderShaderInstance } from "../../RenderEngine/RenderInterface/IRenderShaderInstance";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
import { ShaderData, ShaderDataType } from "../../RenderEngine/RenderShader/ShaderData";
import { ShaderVariable } from "../../RenderEngine/RenderShader/ShaderVariable";
import { RenderStateCommand } from "../../RenderEngine/RenderStateCommand";
import { RenderStateContext } from "../../RenderEngine/RenderStateContext";
import { ShaderCompileDefineBase } from "../../webgl/utils/ShaderCompileDefineBase";
import { RenderState } from "../core/material/RenderState";
import { ShaderPass } from "./ShaderPass";
import { SubShader } from "./SubShader";

/**
 * @internal
 * <code>ShaderInstance</code> 类用于实现ShaderInstance。
 */
export class ShaderInstance {
	/**@internal */
	private _shaderPass: ShaderCompileDefineBase | ShaderPass;

	private _renderShaderInstance: IRenderShaderInstance;

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
	_uploadMark: number = -1;
	/**@internal */
	_uploadMaterial: ShaderData;
	/**@internal RenderIDTODO*/
	_uploadRender: any;
	/** @internal */
	_uploadRenderType: number = -1;
	/**@internal CamneraTOD*/
	_uploadCameraShaderValue: ShaderData;
	/**@internal SceneIDTODO*/
	_uploadScene: any;

	_cullStateCMD: RenderStateCommand;

	/**
	 * 创建一个 <code>ShaderInstance</code> 实例。
	 */
	constructor(vs: string, ps: string, attributeMap: { [name: string]: [number, ShaderDataType] }, shaderPass: ShaderCompileDefineBase) {
		this._cullStateCMD = LayaGL.renderOBJCreate.createRenderStateComand();
		this._renderShaderInstance = LayaGL.renderEngine.createShaderInstance(vs, ps, attributeMap);
		if (this._renderShaderInstance._complete) {
			this._shaderPass = shaderPass;
			this._create();
		}


	}

	get complete(): boolean {
		return this._renderShaderInstance._complete;
	}


	/**
	 * @internal TODO3D
	 */
	protected _create(): void {
		this._sceneUniformParamsMap = new CommandEncoder();
		this._cameraUniformParamsMap = new CommandEncoder();
		this._spriteUniformParamsMap = new CommandEncoder();
		this._materialUniformParamsMap = new CommandEncoder();
		const sceneParams = LayaGL.renderOBJCreate.createGlobalUniformMap("Scene3D");
		const spriteParms = LayaGL.renderOBJCreate.createGlobalUniformMap("Sprite3D");
		const cameraParams = LayaGL.renderOBJCreate.createGlobalUniformMap("BaseCamera");
		const customParams = LayaGL.renderOBJCreate.createGlobalUniformMap("Custom");
		let i, n;
		let data: ShaderVariable[] = this._renderShaderInstance.getUniformMap();
		for (i = 0, n = data.length; i < n; i++) {
			let one: ShaderVariable = data[i];
			if (sceneParams.hasPtrID(one.dataOffset)) {
				this._sceneUniformParamsMap.addShaderUniform(one);
			} else if (cameraParams.hasPtrID(one.dataOffset)) {
				this._cameraUniformParamsMap.addShaderUniform(one);
			} else if (spriteParms.hasPtrID(one.dataOffset)) {
				this._spriteUniformParamsMap.addShaderUniform(one);
			} else if (customParams.hasPtrID(one.dataOffset)) {
				this._customUniformParamsMap || (this._customUniformParamsMap = []);
				this._customUniformParamsMap[one.dataOffset] = one;
			} else {
				this._materialUniformParamsMap.addShaderUniform(one);
			}
		}
	}





	/**
	 * @inheritDoc
	 * @override
	 */
	protected _disposeResource(): void {
		this._renderShaderInstance.destroy();
		this._sceneUniformParamsMap = null;
		this._cameraUniformParamsMap = null;
		this._spriteUniformParamsMap = null;
		this._materialUniformParamsMap = null
		this._customUniformParamsMap = null;

		this._uploadMaterial = null;
		this._uploadRender = null;
		this._uploadCameraShaderValue = null;
		this._uploadScene = null;
	}


	//miner RenderState  removeTODO

	/**
	 * @internal
	 */
	private _getRenderState(shaderDatas: any, stateIndex: number): any {
		var stateID: any = SubShader.StateParamsMap[stateIndex];
		return shaderDatas[stateID];
	}

	bind() {
		return this._renderShaderInstance.bind();
	}

	uploadUniforms(shaderUniform: CommandEncoder, shaderDatas: ShaderData, uploadUnTexture: boolean) {
		LayaGL.renderEngine.uploadUniforms(this._renderShaderInstance, shaderUniform, shaderDatas, uploadUnTexture);
	}

	/**
	 * @internal
	 */
	uploadRenderStateBlendDepth(shaderDatas: ShaderData): void {
		var renderState: RenderState = (<ShaderPass>this._shaderPass).renderState;
		var datas: any = shaderDatas.getData();

		var depthWrite: any = this._getRenderState(datas, Shader3D.RENDER_STATE_DEPTH_WRITE);
		var depthTest: any = this._getRenderState(datas, Shader3D.RENDER_STATE_DEPTH_TEST);
		var blend: any = this._getRenderState(datas, Shader3D.RENDER_STATE_BLEND);
		var stencilRef: any = this._getRenderState(datas, Shader3D.RENDER_STATE_STENCIL_REF);
		var stencilTest: any = this._getRenderState(datas, Shader3D.RENDER_STATE_STENCIL_TEST);
		var stencilWrite: any = this._getRenderState(datas, Shader3D.RENDER_STATE_STENCIL_WRITE);
		var stencilOp: any = this._getRenderState(datas, Shader3D.RENDER_STATE_STENCIL_OP);
		if ((<ShaderPass>this._shaderPass).statefirst) {
			renderState.depthWrite != null ? depthWrite = renderState.depthWrite : 0;
			renderState.depthTest != null ? depthTest = renderState.depthTest : 0;
			renderState.blend != null ? blend = renderState.blend : 0;
			renderState.stencilRef != null ? stencilRef = renderState.stencilRef : 0;
			renderState.stencilTest != null ? stencilTest = renderState.stencilTest : 0;
			renderState.stencilWrite != null ? stencilWrite = renderState.stencilWrite : 0;
			renderState.stencilOp != null ? stencilOp = renderState.stencilOp : 0;
		}
		else {
			depthWrite = depthWrite ?? renderState.depthWrite;
			depthTest = depthTest ?? renderState.depthTest;
			blend = blend ?? renderState.blend;
			stencilRef = stencilRef ?? renderState.stencilRef;
			stencilTest = stencilTest ?? renderState.stencilTest;
			stencilWrite = stencilWrite ?? renderState.stencilWrite;
			stencilOp = stencilOp ?? renderState.stencilOp;
		}

		depthWrite = depthWrite ?? RenderState.Default.depthWrite;
		depthTest = depthTest ?? RenderState.Default.depthTest;
		blend = blend ?? RenderState.Default.blend;
		stencilRef = stencilRef ?? RenderState.Default.stencilRef;
		stencilTest = stencilTest ?? RenderState.Default.stencilTest;
		stencilWrite = stencilWrite ?? RenderState.Default.stencilWrite;
		stencilOp = stencilOp ?? RenderState.Default.stencilOp;

		RenderStateContext.setDepthMask(depthWrite);
		if (depthTest === RenderState.DEPTHTEST_OFF)
			RenderStateContext.setDepthTest(false);
		else {
			RenderStateContext.setDepthTest(true);
			RenderStateContext.setDepthFunc(depthTest);
		}
		//blend
		switch (blend) {
			case RenderState.BLEND_DISABLE:
				RenderStateContext.setBlend(false);
				break;
			case RenderState.BLEND_ENABLE_ALL:
				var blendEquation: any = this._getRenderState(datas, Shader3D.RENDER_STATE_BLEND_EQUATION);
				var srcBlend: any = this._getRenderState(datas, Shader3D.RENDER_STATE_BLEND_SRC);
				var dstBlend: any = this._getRenderState(datas, Shader3D.RENDER_STATE_BLEND_DST);
				if ((<ShaderPass>this._shaderPass).statefirst) {
					renderState.blendEquation != null ? blendEquation = renderState.blendEquation : 0;
					renderState.srcBlend != null ? srcBlend = renderState.srcBlend : 0;
					renderState.dstBlend != null ? dstBlend = renderState.dstBlend : 0;
				}
				else {
					blendEquation = blendEquation ?? renderState.blendEquation;
					srcBlend = srcBlend ?? renderState.srcBlend;
					dstBlend = dstBlend ?? renderState.dstBlend;
				}
				blendEquation = blendEquation ?? RenderState.Default.blendEquation;
				srcBlend = srcBlend ?? RenderState.Default.srcBlend;
				dstBlend = dstBlend ?? RenderState.Default.dstBlend;

				RenderStateContext.setBlend(true);
				RenderStateContext.setBlendEquation(blendEquation);
				RenderStateContext.setBlendFunc(srcBlend, dstBlend);
				break;
			case RenderState.BLEND_ENABLE_SEPERATE:

				var blendEquationRGB: any = this._getRenderState(datas, Shader3D.RENDER_STATE_BLEND_EQUATION_RGB);
				var blendEquationAlpha: any = this._getRenderState(datas, Shader3D.RENDER_STATE_BLEND_EQUATION_ALPHA);
				var srcRGB: any = this._getRenderState(datas, Shader3D.RENDER_STATE_BLEND_SRC_RGB);
				var dstRGB: any = this._getRenderState(datas, Shader3D.RENDER_STATE_BLEND_DST_RGB);
				var srcAlpha: any = this._getRenderState(datas, Shader3D.RENDER_STATE_BLEND_SRC_ALPHA);
				var dstAlpha: any = this._getRenderState(datas, Shader3D.RENDER_STATE_BLEND_DST_ALPHA);
				if ((<ShaderPass>this._shaderPass).statefirst) {
					renderState.blendEquationRGB != null ? blendEquationRGB = renderState.blendEquationRGB : 0;
					renderState.blendEquationAlpha != null ? blendEquationAlpha = renderState.blendEquationAlpha : 0;
					renderState.srcBlendRGB != null ? srcRGB = renderState.srcBlendRGB : 0;
					renderState.dstBlendRGB != null ? dstRGB = renderState.dstBlendRGB : 0;
					renderState.srcBlendAlpha != null ? srcAlpha = renderState.srcBlendAlpha : 0;
					renderState.dstBlendAlpha != null ? dstAlpha = renderState.dstBlendAlpha : 0;
				}
				else {
					blendEquationRGB = blendEquationRGB ?? renderState.blendEquationRGB;
					blendEquationAlpha = blendEquationAlpha ?? renderState.blendEquationAlpha;
					srcRGB = srcRGB ?? renderState.srcBlendRGB;
					dstRGB = dstRGB ?? renderState.dstBlendRGB;
					srcAlpha = srcAlpha ?? renderState.srcBlendAlpha;
					dstAlpha = dstAlpha ?? renderState.dstBlendAlpha;
				}

				blendEquationRGB = blendEquationRGB ?? RenderState.Default.blendEquationRGB;
				blendEquationAlpha = blendEquationAlpha ?? RenderState.Default.blendEquationAlpha;
				srcRGB = srcRGB ?? RenderState.Default.srcBlendRGB;
				dstRGB = dstRGB ?? RenderState.Default.dstBlendRGB;
				srcAlpha = srcAlpha ?? RenderState.Default.srcBlendAlpha;
				dstAlpha = dstAlpha ?? RenderState.Default.dstBlendAlpha;

				RenderStateContext.setBlend(true);
				RenderStateContext.setBlendEquationSeparate(blendEquationRGB, blendEquationAlpha);
				RenderStateContext.setBlendFuncSeperate(srcRGB, dstRGB, srcAlpha, dstAlpha);
				break;
		}

		//Stencil
		RenderStateContext.setStencilMask(stencilWrite);
		if (stencilTest == RenderState.STENCILTEST_OFF) {
			RenderStateContext.setStencilTest(false);
		} else {
			RenderStateContext.setStencilTest(true);
			RenderStateContext.setStencilFunc(stencilTest, stencilRef);

		}
		RenderStateContext.setstencilOp(stencilOp.x, stencilOp.y, stencilOp.z);



	}

	/**
	 * @internal
	 */
	uploadRenderStateFrontFace(shaderDatas: ShaderData, isTarget: boolean, invertFront: boolean): void {
		this._cullStateCMD.clear();
		var renderState: RenderState = (<ShaderPass>this._shaderPass).renderState;
		var datas: any = shaderDatas.getData();
		var cull: any = this._getRenderState(datas, Shader3D.RENDER_STATE_CULL);
		if ((<ShaderPass>this._shaderPass).statefirst) {
			renderState.cull ? cull = renderState.cull : 0;
		}
		else {
			cull = cull ?? RenderState.Default.blend;
		}

		cull = cull ?? RenderState.Default.blend;

		var forntFace: number;
		switch (cull) {
			case RenderState.CULL_NONE:
				this._cullStateCMD.addCMD(RenderStateType.CullFace, false);
				break;
			case RenderState.CULL_FRONT:
				this._cullStateCMD.addCMD(RenderStateType.CullFace, true);
				if (isTarget == invertFront)
					forntFace = CullMode.Front;//gl.CCW
				else
					forntFace = CullMode.Back;
				this._cullStateCMD.addCMD(RenderStateType.FrontFace, forntFace);
				break;
			case RenderState.CULL_BACK:
				this._cullStateCMD.addCMD(RenderStateType.CullFace, true);
				if (isTarget != invertFront)
					forntFace = CullMode.Front;//gl.CCW
				else
					forntFace = CullMode.Back;
				this._cullStateCMD.addCMD(RenderStateType.FrontFace, forntFace);

				break;
		}
		this._cullStateCMD.applyCMD();
	}

	/**
	 * @internal
	 */
	uploadCustomUniform(index: number, data: any): void {
		LayaGL.renderEngine.uploadCustomUniforms(this._renderShaderInstance, this._customUniformParamsMap, index, data);
	}
}

