import { CommandEncoder } from "../../layagl/CommandEncoder";
import { LayaGL } from "../../layagl/LayaGL";
import { CullMode } from "../../RenderEngine/RenderEnum/CullMode";
import { IRenderShaderInstance } from "../../RenderEngine/RenderInterface/IRenderShaderInstance";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
import { ShaderData, ShaderDataType } from "../../RenderEngine/RenderShader/ShaderData";
import { ShaderPass } from "../../RenderEngine/RenderShader/ShaderPass";
import { ShaderVariable } from "../../RenderEngine/RenderShader/ShaderVariable";
import { RenderStateContext } from "../../RenderEngine/RenderStateContext";
import { Stat } from "../../utils/Stat";
import { ShaderCompileDefineBase } from "../../webgl/utils/ShaderCompileDefineBase";
import { RenderState } from "./RenderState";

/**
 * <code>ShaderInstance</code> 类用于实现ShaderInstance。
 */
export class ShaderInstance {
	/**@internal */
	private _shaderPass: ShaderCompileDefineBase | ShaderPass;
	/**@internal */
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

	/**
	 * 创建一个 <code>ShaderInstance</code> 实例。
	 */
	constructor(vs: string, ps: string, attributeMap: { [name: string]: [number, ShaderDataType] }, shaderPass: ShaderCompileDefineBase) {
		this._renderShaderInstance = LayaGL.renderEngine.createShaderInstance(vs, ps, attributeMap);
		if (this._renderShaderInstance._complete) {
			this._shaderPass = shaderPass;
			this._create();
		}
	}

	/**
	 * get complete
	 */
	get complete(): boolean {
		return this._renderShaderInstance._complete;
	}


	/**
	 * @internal
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

	/**
	 * apply shader programe
	 * @returns 
	 */
	bind() {
		return this._renderShaderInstance.bind();
	}

	/**
	 * upload uniform data
	 * @param shaderUniform 
	 * @param shaderDatas 
	 * @param uploadUnTexture 
	 */
	uploadUniforms(shaderUniform: CommandEncoder, shaderDatas: ShaderData, uploadUnTexture: boolean) {
		Stat.uploadUniform += LayaGL.renderEngine.uploadUniforms(this._renderShaderInstance, shaderUniform, shaderDatas, uploadUnTexture);
	}

	/**
	 * set blend depth stencil RenderState
	 * @param shaderDatas 
	 */
	uploadRenderStateBlendDepth(shaderDatas: ShaderData): void {
		if ((<ShaderPass>this._shaderPass).statefirst)
			this.uploadRenderStateBlendDepthByShader(shaderDatas);
		else
			this.uploadRenderStateBlendDepthByMaterial(shaderDatas);
	}

	/**
	 * set blend depth stencil RenderState frome Shader
	 * @param shaderDatas 
	 */
	uploadRenderStateBlendDepthByShader(shaderDatas: ShaderData) {
		var datas: any = shaderDatas.getData();
		var renderState: RenderState = (<ShaderPass>this._shaderPass).renderState;
		var depthWrite: any = (renderState.depthWrite ?? datas[Shader3D.DEPTH_WRITE]) ?? RenderState.Default.depthWrite;
		RenderStateContext.setDepthMask(depthWrite);
		if (depthTest === RenderState.DEPTHTEST_OFF)
			RenderStateContext.setDepthTest(false);
		else {
			RenderStateContext.setDepthTest(true);
			var depthTest: any = (renderState.depthTest ?? datas[Shader3D.DEPTH_TEST]) ?? RenderState.Default.depthTest;
			RenderStateContext.setDepthFunc(depthTest);
		}
		//Stencil
		var stencilWrite: any = (renderState.stencilWrite ?? datas[Shader3D.STENCIL_WRITE]) ?? RenderState.Default.stencilWrite;
		var stencilTest: any = (renderState.stencilTest ?? datas[Shader3D.STENCIL_TEST]) ?? RenderState.Default.stencilTest;
		RenderStateContext.setStencilMask(stencilWrite);
		if (stencilWrite) {
			var stencilOp: any = (renderState.stencilOp ?? datas[Shader3D.STENCIL_Op]) ?? RenderState.Default.stencilOp;
			RenderStateContext.setstencilOp(stencilOp.x, stencilOp.y, stencilOp.z);
		}
		if (stencilTest == RenderState.STENCILTEST_OFF) {
			RenderStateContext.setStencilTest(false);
		} else {
			var stencilRef: any = (renderState.stencilRef ?? datas[Shader3D.STENCIL_Ref]) ?? RenderState.Default.stencilRef;
			RenderStateContext.setStencilTest(true);
			RenderStateContext.setStencilFunc(stencilTest, stencilRef);
		}
		//blend
		var blend: any = (renderState.blend ?? datas[Shader3D.BLEND]) ?? RenderState.Default.blend;
		switch (blend) {
			case RenderState.BLEND_DISABLE:
				RenderStateContext.setBlend(false);
				break;
			case RenderState.BLEND_ENABLE_ALL:
				var blendEquation: any = (renderState.blendEquation ?? datas[Shader3D.BLEND_EQUATION]) ?? RenderState.Default.blendEquation;
				var srcBlend: any = (renderState.srcBlend ?? datas[Shader3D.BLEND_SRC]) ?? RenderState.Default.srcBlend;
				var dstBlend: any = (renderState.dstBlend ?? datas[Shader3D.BLEND_DST]) ?? RenderState.Default.dstBlend;
				RenderStateContext.setBlend(true);
				RenderStateContext.setBlendEquation(blendEquation);
				RenderStateContext.setBlendFunc(srcBlend, dstBlend);
				break;
			case RenderState.BLEND_ENABLE_SEPERATE:
				var blendEquationRGB: any = (renderState.blendEquationRGB ?? datas[Shader3D.BLEND_EQUATION_RGB]) ?? RenderState.Default.blendEquationRGB;
				var blendEquationAlpha: any = (renderState.blendEquationAlpha ?? datas[Shader3D.BLEND_EQUATION_ALPHA]) ?? RenderState.Default.blendEquationAlpha;
				var srcRGB: any = (renderState.srcBlendRGB ?? datas[Shader3D.BLEND_SRC_RGB]) ?? RenderState.Default.srcBlendRGB;
				var dstRGB: any = (renderState.dstBlendRGB ?? datas[Shader3D.BLEND_DST_RGB]) ?? RenderState.Default.dstBlendRGB;
				var srcAlpha: any = (renderState.srcBlendAlpha ?? datas[Shader3D.BLEND_SRC_ALPHA]) ?? RenderState.Default.srcBlendAlpha;
				var dstAlpha: any = (renderState.dstBlendAlpha ?? datas[Shader3D.BLEND_DST_ALPHA]) ?? RenderState.Default.dstBlendAlpha;
				RenderStateContext.setBlend(true);
				RenderStateContext.setBlendEquationSeparate(blendEquationRGB, blendEquationAlpha);
				RenderStateContext.setBlendFuncSeperate(srcRGB, dstRGB, srcAlpha, dstAlpha);
				break;
		}
	}

	/**
	 * set blend depth stencil RenderState frome Material
	 * @param shaderDatas 
	 */
	uploadRenderStateBlendDepthByMaterial(shaderDatas: ShaderData) {
		var datas: any = shaderDatas.getData();

		var depthWrite: any = datas[Shader3D.DEPTH_WRITE];
		depthWrite = depthWrite ?? false;
		RenderStateContext.setDepthMask(depthWrite);
		var depthTest: any = datas[Shader3D.DEPTH_TEST];
		depthTest = depthTest ?? RenderState.Default.depthTest;
		if (depthTest === RenderState.DEPTHTEST_OFF)
			RenderStateContext.setDepthTest(false);
		else {
			RenderStateContext.setDepthTest(true);
			RenderStateContext.setDepthFunc(depthTest);
		}

		var stencilWrite: any = datas[Shader3D.STENCIL_WRITE];
		stencilWrite = stencilWrite ?? false;
		//Stencil
		var stencilTest: any = datas[Shader3D.STENCIL_TEST];
		stencilTest = stencilTest ?? RenderState.Default.stencilTest;
		RenderStateContext.setStencilMask(stencilWrite);
		if (stencilWrite) {
			var stencilOp: any = datas[Shader3D.STENCIL_Op];
			stencilOp = stencilTest ?? RenderState.Default.stencilOp;
			RenderStateContext.setstencilOp(stencilOp.x, stencilOp.y, stencilOp.z);
		}
		if (stencilTest == RenderState.STENCILTEST_OFF) {
			RenderStateContext.setStencilTest(false);
		} else {
			var stencilRef: any = datas[Shader3D.STENCIL_Ref];
			stencilRef = stencilRef ?? RenderState.Default.stencilRef;
			RenderStateContext.setStencilTest(true);
			RenderStateContext.setStencilFunc(stencilTest, stencilRef);
		}
		//blend
		var blend: any = datas[Shader3D.BLEND];
		switch (blend) {
			case RenderState.BLEND_DISABLE:
				RenderStateContext.setBlend(false);
				break;
			case RenderState.BLEND_ENABLE_ALL:
				var blendEquation: any = datas[Shader3D.BLEND_EQUATION] //Shader3D.RENDER_STATE_BLEND_EQUATION);
				var srcBlend: any = datas[Shader3D.BLEND_SRC] //Shader3D.RENDER_STATE_BLEND_SRC);
				var dstBlend: any = datas[Shader3D.BLEND_DST] //Shader3D.RENDER_STATE_BLEND_DST);
				blendEquation = blendEquation ?? RenderState.Default.blendEquation;
				srcBlend = srcBlend ?? RenderState.Default.srcBlend;
				dstBlend = dstBlend ?? RenderState.Default.dstBlend;
				RenderStateContext.setBlend(true);
				RenderStateContext.setBlendEquation(blendEquation);
				RenderStateContext.setBlendFunc(srcBlend, dstBlend);
				break;
			case RenderState.BLEND_ENABLE_SEPERATE:
				var blendEquationRGB: any = datas[Shader3D.BLEND_EQUATION_RGB];
				var blendEquationAlpha: any = datas[Shader3D.BLEND_EQUATION_ALPHA];
				var srcRGB: any = datas[Shader3D.BLEND_SRC_RGB];
				var dstRGB: any = datas[Shader3D.BLEND_DST_RGB];
				var srcAlpha: any = datas[Shader3D.BLEND_SRC_ALPHA];
				var dstAlpha: any = datas[Shader3D.BLEND_DST_ALPHA];
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
	}


	/**
	 * @internal
	 */
	uploadRenderStateFrontFace(shaderDatas: ShaderData, isTarget: boolean, invertFront: boolean): void {
		var renderState: RenderState = (<ShaderPass>this._shaderPass).renderState;
		var datas: any = shaderDatas.getData();
		var cull: any = datas[Shader3D.CULL];
		if ((<ShaderPass>this._shaderPass).statefirst) {
			cull = renderState.cull ?? cull;
		}
		cull = cull ?? RenderState.Default.cull;
		var forntFace: number;
		switch (cull) {
			case RenderState.CULL_NONE:
				RenderStateContext.setCullFace(false);
				if (isTarget != invertFront)
					forntFace = CullMode.Front;//gl.CCW
				else
					forntFace = CullMode.Back;
				RenderStateContext.setFrontFace(forntFace);
				break;
			case RenderState.CULL_FRONT:
				RenderStateContext.setCullFace(true);
				if (isTarget == invertFront)
					forntFace = CullMode.Front;//gl.CCW
				else
					forntFace = CullMode.Back;
				RenderStateContext.setFrontFace(forntFace);
				break;
			case RenderState.CULL_BACK:
				RenderStateContext.setCullFace(true);
				if (isTarget != invertFront)
					forntFace = CullMode.Front;//gl.CCW
				else
					forntFace = CullMode.Back;
				RenderStateContext.setFrontFace(forntFace);
				break;
		}
	}

	/**
	 * @internal
	 */
	uploadCustomUniform(index: number, data: any): void {
		LayaGL.renderEngine.uploadCustomUniforms(this._renderShaderInstance, this._customUniformParamsMap, index, data);
	}
}

