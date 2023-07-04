import { Config3D } from "../../../Config3D";
import { CommandEncoder } from "../../layagl/CommandEncoder";
import { LayaGL } from "../../layagl/LayaGL";
import { CullMode } from "../../RenderEngine/RenderEnum/CullMode";
import { RenderStateType } from "../../RenderEngine/RenderEnum/RenderStateType";
import { IRenderShaderInstance } from "../../RenderEngine/RenderInterface/IRenderShaderInstance";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
import { ShaderData, ShaderDataType } from "../../RenderEngine/RenderShader/ShaderData";
import { ShaderPass } from "../../RenderEngine/RenderShader/ShaderPass";
import { ShaderVariable } from "../../RenderEngine/RenderShader/ShaderVariable";
import { SubShader, UniformMapType } from "../../RenderEngine/RenderShader/SubShader";
import { RenderStateCommand } from "../../RenderEngine/RenderStateCommand";
import { RenderStateContext } from "../../RenderEngine/RenderStateContext";
import { ShaderCompileDefineBase, ShaderProcessInfo } from "../../webgl/utils/ShaderCompileDefineBase";
import { ShaderNode } from "../../webgl/utils/ShaderNode";
import { WebGLEngine } from "../RenderEngine/WebGLEngine/WebGLEngine";
import { RenderParams } from "../RenderEnum/RenderParams";
import { GLSLCodeGenerator } from "./GLSLCodeGenerator";
import { RenderState } from "./RenderState";

/**
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
	constructor(shaderProcessInfo: ShaderProcessInfo, shaderPass: ShaderCompileDefineBase) {
		this._cullStateCMD = LayaGL.renderOBJCreate.createRenderStateComand();
		shaderProcessInfo.is2D ? this._webGLShaderLanguageProcess2D(shaderProcessInfo.defineString, shaderProcessInfo.attributeMap, shaderProcessInfo.uniformMap, shaderProcessInfo.vs, shaderProcessInfo.ps)
			: this._webGLShaderLanguageProcess3D(shaderProcessInfo.defineString, shaderProcessInfo.attributeMap, shaderProcessInfo.uniformMap, shaderProcessInfo.vs, shaderProcessInfo.ps);
		if (this._renderShaderInstance._complete) {
			this._shaderPass = shaderPass;
			this._create();
		}
	}

	get complete(): boolean {
		return this._renderShaderInstance._complete;
	}

	protected _webGLShaderLanguageProcess3D(defineString: string[],
		attributeMap: { [name: string]: [number, ShaderDataType] },
		uniformMap: UniformMapType, VS: ShaderNode, FS: ShaderNode) {

		var clusterSlices = Config3D.lightClusterCount;
		var defMap: any = {};

		var vertexHead: string;
		var fragmentHead: string;
		var defineStr: string = "";

		// 拼接 shader attribute
		let useUniformBlock = Config3D._uniformBlock;
		let attributeglsl = GLSLCodeGenerator.glslAttributeString(attributeMap);
		let uniformglsl = GLSLCodeGenerator.glslUniformString(uniformMap, useUniformBlock);

		if ((LayaGL.renderEngine as WebGLEngine).isWebGL2) {
			defineString.push("GRAPHICS_API_GLES3");
			vertexHead =
				`#version 300 es
#if defined(GL_FRAGMENT_PRECISION_HIGH)
    precision highp float;
    precision highp int;
    precision highp sampler2DArray;
#else
    precision mediump float;
    precision mediump int;
    precision mediump sampler2DArray;
#endif
layout(std140, column_major) uniform;
#define attribute in
#define varying out
#define textureCube texture
#define texture2D texture
${attributeglsl}
${uniformglsl}
`;

			fragmentHead =
				`#version 300 es
#if defined(GL_FRAGMENT_PRECISION_HIGH)
    precision highp float;
    precision highp int;
    precision highp sampler2DArray;
#else
    precision mediump float;
    precision mediump int;
    precision mediump sampler2DArray;
#endif
layout(std140, column_major) uniform;
#define varying in
out highp vec4 pc_fragColor;
#define gl_FragColor pc_fragColor
#define gl_FragDepthEXT gl_FragDepth
#define texture2D texture
#define textureCube texture
#define texture2DProj textureProj
#define texture2DLodEXT textureLod
#define texture2DProjLodEXT textureProjLod
#define textureCubeLodEXT textureLod
#define texture2DGradEXT textureGrad
#define texture2DProjGradEXT textureProjGrad
#define textureCubeGradEXT textureGrad
${uniformglsl}`;
		}
		else {
			vertexHead =
				`#if defined(GL_FRAGMENT_PRECISION_HIGH)
    precision highp float;
    precision highp int;
#else
    precision mediump float;
    precision mediump int;
#endif
${attributeglsl}
${uniformglsl}`;
			fragmentHead =
				`#ifdef GL_EXT_shader_texture_lod
    #extension GL_EXT_shader_texture_lod : enable
#endif

#ifdef GL_OES_standard_derivatives
	#extension GL_OES_standard_derivatives : enable 
#endif

#if defined(GL_FRAGMENT_PRECISION_HIGH)
    precision highp float;
    precision highp int;
#else
    precision mediump float;
    precision mediump int;
#endif

#if !defined(GL_EXT_shader_texture_lod)
    #define texture1DLodEXT texture1D
    #define texture2DLodEXT texture2D
    #define texture2DProjLodEXT texture2DProj
    #define texture3DLodEXT texture3D
    #define textureCubeLodEXT textureCube
#endif
${uniformglsl}`;
		}

		// todo 
		defineStr += "#define MAX_LIGHT_COUNT " + Config3D.maxLightCount + "\n";
		defineStr += "#define MAX_LIGHT_COUNT_PER_CLUSTER " + Config3D._maxAreaLightCountPerClusterAverage + "\n";
		defineStr += "#define CLUSTER_X_COUNT " + clusterSlices.x + "\n";
		defineStr += "#define CLUSTER_Y_COUNT " + clusterSlices.y + "\n";
		defineStr += "#define CLUSTER_Z_COUNT " + clusterSlices.z + "\n";
		defineStr += "#define MORPH_MAX_COUNT " + Config3D.maxMorphTargetCount + "\n";
		defineStr += "#define SHADER_CAPAILITY_LEVEL " + LayaGL.renderEngine.getParams(RenderParams.SHADER_CAPAILITY_LEVEL) + "\n";



		for (var i: number = 0, n: number = defineString.length; i < n; i++) {
			var def: string = defineString[i];
			defineStr += "#define " + def + "\n";
			defMap[def] = true;
		}

		var vs: any[] = VS.toscript(defMap, []);
		var vsVersion: string = '';
		if (vs[0].indexOf('#version') == 0) {
			vsVersion = vs[0] + '\n';
			vs.shift();
		}

		var ps: any[] = FS.toscript(defMap, []);
		var psVersion: string = '';
		if (ps[0].indexOf('#version') == 0) {
			psVersion = ps[0] + '\n';
			ps.shift();
		};
		let dstVS = vsVersion + vertexHead + defineStr + vs.join('\n');
		let detFS = psVersion + fragmentHead + defineStr + ps.join('\n');
		this._renderShaderInstance = LayaGL.renderEngine.createShaderInstance(dstVS, detFS, attributeMap);
	}

	protected _webGLShaderLanguageProcess2D(defineString: string[],
		attributeMap: { [name: string]: [number, ShaderDataType] },
		uniformMap: UniformMapType, VS: ShaderNode, FS: ShaderNode) {
		var defMap: any = {};

		var vertexHead: string;
		var fragmentHead: string;
		var defineStr: string = "";

		if ((LayaGL.renderEngine as WebGLEngine).isWebGL2) {
			vertexHead =
				`#version 300 es\n
                #define attribute in
                #define varying out
                #define textureCube texture
                #define texture2D texture\n`;
			fragmentHead =
				`#version 300 es\n
                #define varying in
                out highp vec4 pc_fragColor;
                #define gl_FragColor pc_fragColor
                #define gl_FragDepthEXT gl_FragDepth
                #define texture2D texture
                #define textureCube texture
                #define texture2DProj textureProj
                #define texture2DLodEXT textureLod
                #define texture2DProjLodEXT textureProjLod
                #define textureCubeLodEXT textureLod
                #define texture2DGradEXT textureGrad
                #define texture2DProjGradEXT textureProjGrad
                #define textureCubeGradEXT textureGrad\n`;
		}
		else {
			vertexHead = ""
			fragmentHead =
				`#ifdef GL_EXT_shader_texture_lod
                    #extension GL_EXT_shader_texture_lod : enable
                #endif
                #if !defined(GL_EXT_shader_texture_lod)
                    #define texture1DLodEXT texture1D
                    #define texture2DLodEXT texture2D
                    #define texture2DProjLodEXT texture2DProj
                    #define texture3DLodEXT texture3D
                    #define textureCubeLodEXT textureCube
                #endif\n`;
		}


		for (var i: number = 0, n: number = defineString.length; i < n; i++) {
			var def: string = defineString[i];
			defineStr += "#define " + def + "\n";
			defMap[def] = true;
		}

		var vs: any[] = VS.toscript(defMap, []);
		var vsVersion: string = '';
		if (vs[0].indexOf('#version') == 0) {
			vsVersion = vs[0] + '\n';
			vs.shift();
		}

		var ps: any[] = FS.toscript(defMap, []);
		var psVersion: string = '';
		if (ps[0].indexOf('#version') == 0) {
			psVersion = ps[0] + '\n';
			ps.shift();
		}

		let dstVS = vsVersion + vertexHead + defineStr + vs.join('\n');
		let detFS = psVersion + fragmentHead + defineStr + ps.join('\n');
		this._renderShaderInstance = LayaGL.renderEngine.createShaderInstance(dstVS, detFS, attributeMap);
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
		//const spriteParms = LayaGL.renderOBJCreate.createGlobalUniformMap("Sprite3D");//分开，根据不同的Render
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
			} else if (this.hasSpritePtrID(one.dataOffset)) {
				this._spriteUniformParamsMap.addShaderUniform(one);
			} else if (customParams.hasPtrID(one.dataOffset)) {
				this._customUniformParamsMap || (this._customUniformParamsMap = []);
				this._customUniformParamsMap[one.dataOffset] = one;
			} else {
				this._materialUniformParamsMap.addShaderUniform(one);
			}
		}
	}

	private hasSpritePtrID(dataOffset: number): boolean {
		const spriteParms = LayaGL.renderOBJCreate.createGlobalUniformMap("Sprite3D");//分开，根据不同的Render
		let commap = this._shaderPass.nodeCommonMap;
		if (!commap) {
			return false;
		} else {
			for (let i = 0, n = commap.length; i < n; i++) {
				if (LayaGL.renderOBJCreate.createGlobalUniformMap(commap[i]).hasPtrID(dataOffset))
					return true;
			}
			return false;
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
			cull = renderState.cull ?? cull;
		}

		cull = cull ?? RenderState.Default.cull;

		var forntFace: number = CullMode.Back;
		switch (cull) {
			case RenderState.CULL_NONE:
				this._cullStateCMD.addCMD(RenderStateType.CullFace, false);
				if (isTarget != invertFront)
					forntFace = CullMode.Front;//gl.CCW
				else
					forntFace = CullMode.Back;
				this._cullStateCMD.addCMD(RenderStateType.FrontFace, forntFace);
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

