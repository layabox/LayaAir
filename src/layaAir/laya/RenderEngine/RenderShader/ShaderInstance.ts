import { Config3D } from "../../../Config3D";
import { CommandEncoder } from "../../layagl/CommandEncoder";
import { LayaGL } from "../../layagl/LayaGL";
import { CullMode } from "../../RenderEngine/RenderEnum/CullMode";
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
	constructor(shaderProcessInfo: ShaderProcessInfo, shaderPass: ShaderCompileDefineBase) {
		shaderProcessInfo.is2D ? this._webGLShaderLanguageProcess2D(shaderProcessInfo.defineString, shaderProcessInfo.attributeMap, shaderProcessInfo.uniformMap, shaderProcessInfo.vs, shaderProcessInfo.ps)
			: this._webGLShaderLanguageProcess3D(shaderProcessInfo.defineString, shaderProcessInfo.attributeMap, shaderProcessInfo.uniformMap, shaderProcessInfo.vs, shaderProcessInfo.ps);
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
	 * @internal
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

		RenderStateContext.setDepthMask(depthWrite);
		if (depthTest === RenderState.DEPTHTEST_OFF)
			RenderStateContext.setDepthTest(false);
		else {
			RenderStateContext.setDepthTest(true);
			var depthTest: any = datas[Shader3D.DEPTH_TEST];
			RenderStateContext.setDepthFunc(depthTest);
		}

		var stencilWrite: any = datas[Shader3D.STENCIL_WRITE];
		//Stencil
		var stencilTest: any = datas[Shader3D.STENCIL_TEST];
		RenderStateContext.setStencilMask(stencilWrite);
		if (stencilWrite) {
			var stencilOp: any = datas[Shader3D.STENCIL_Op];
			RenderStateContext.setstencilOp(stencilOp.x, stencilOp.y, stencilOp.z);
		}
		if (stencilTest == RenderState.STENCILTEST_OFF) {
			RenderStateContext.setStencilTest(false);
		} else {
			var stencilRef: any = datas[Shader3D.STENCIL_Ref];
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

