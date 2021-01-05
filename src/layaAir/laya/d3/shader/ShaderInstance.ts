import { CommandEncoder } from "../../layagl/CommandEncoder";
import { LayaGL } from "../../layagl/LayaGL";
import { LayaGLRunner } from "../../layagl/LayaGLRunner";
import { Render } from "../../renders/Render";
import { BaseTexture } from "../../resource/BaseTexture";
import { Resource } from "../../resource/Resource";
import { Stat } from "../../utils/Stat";
import { WebGLContext } from "../../webgl/WebGLContext";
import { Material } from "../core/material/Material";
import { RenderState } from "../core/material/RenderState";
import { BaseRender } from "../core/render/BaseRender";
import { Scene3D } from "../core/scene/Scene3D";
import { Matrix4x4 } from "../math/Matrix4x4";
import { Vector2 } from "../math/Vector2";
import { Vector3 } from "../math/Vector3";
import { Vector4 } from "../math/Vector4";
import { Shader3D } from "./Shader3D";
import { ShaderData } from "./ShaderData";
import { ShaderPass } from "./ShaderPass";
import { ShaderVariable } from "./ShaderVariable";

/**
 * @internal
 * <code>ShaderInstance</code> 类用于实现ShaderInstance。
 */
export class ShaderInstance extends Resource {
	/**@internal */
	private _attributeMap: {[key:string]:number};
	/**@internal */
	private _uniformMap: {[key:string]:number};
	/**@internal miner 动态添加的uniformMap*/
	private _globaluniformMap:{[key:string]:number};
	/**@internal */
	private _shaderPass: ShaderPass;

	/**@internal */
	private _vs: string
	/**@internal */
	private _ps: string;
	/**@internal */
	private _curActTexIndex: number;

	/**@internal */
	private _vshader: any;
	/**@internal */
	private _pshader: any
	/**@internal */
	private _program: any;

	/**@internal */
	_sceneUniformParamsMap: CommandEncoder;
	/**@internal */
	_cameraUniformParamsMap: CommandEncoder;
	/**@internal */
	_spriteUniformParamsMap: CommandEncoder;
	/**@internal */
	_materialUniformParamsMap: CommandEncoder;
	/**@internal */
	private _customUniformParamsMap: any[];
	/**@internal */
	private _stateParamsMap: any[] = [];

	/**@internal */
	_uploadMark: number = -1;
	/**@internal */
	_uploadMaterial: Material;
	/**@internal */
	_uploadRender: BaseRender;
	/** @internal */
	_uploadRenderType: number = -1;
	/**@internal */
	_uploadCameraShaderValue: ShaderData;
	/**@internal */
	_uploadScene: Scene3D;

	/**
	 * 创建一个 <code>ShaderInstance</code> 实例。
	 */
	constructor(vs: string, ps: string, attributeMap: any, uniformMap: any, shaderPass: ShaderPass) {

		super();
		this._vs = vs;
		this._ps = ps;
		this._attributeMap = attributeMap;
		this._uniformMap = uniformMap;
		this._shaderPass = shaderPass;
		this._globaluniformMap = {};
		this._create();
		this.lock = true;
	}

	/**
	 *@internal
	 */
	private _create(): void {
		var gl: WebGLRenderingContext = LayaGL.instance;
		this._program = gl.createProgram();
		this._vshader = this._createShader(gl, this._vs, gl.VERTEX_SHADER);
		this._pshader = this._createShader(gl, this._ps, gl.FRAGMENT_SHADER);
		gl.attachShader(this._program, this._vshader);
		gl.attachShader(this._program, this._pshader);

		for (var k in this._attributeMap)//根据声明调整location,便于VAO使用
			gl.bindAttribLocation(this._program, this._attributeMap[k], k);

		gl.linkProgram(this._program);
		if (!Render.isConchApp && Shader3D.debugMode && !gl.getProgramParameter(this._program, gl.LINK_STATUS))
			throw gl.getProgramInfoLog(this._program);

		var sceneParms: any[] = [];
		var cameraParms: any[] = [];
		var spriteParms: any[] = [];
		var materialParms: any[] = [];
		var customParms: any[] = [];
		this._customUniformParamsMap = [];

		var nUniformNum: number = gl.getProgramParameter(this._program, gl.ACTIVE_UNIFORMS);
		WebGLContext.useProgram(gl, this._program);
		this._curActTexIndex = 0;
		var one: ShaderVariable, i: number, n: number;
		for (i = 0; i < nUniformNum; i++) {
			var uniformData: any = gl.getActiveUniform(this._program, i);
			var uniName: string = uniformData.name;
			one = new ShaderVariable();
			one.location = gl.getUniformLocation(this._program, uniName);

			if (uniName.indexOf('[0]') > 0) {
				one.name = uniName = uniName.substr(0, uniName.length - 3);
				one.isArray = true;
			} else {
				one.name = uniName;
				one.isArray = false;
			}
			one.type = uniformData.type;
			this._addShaderUnifiormFun(one);
			var uniformPeriod: number = this._uniformMap[uniName];
			if (uniformPeriod != null) {
				one.dataOffset = Shader3D.propertyNameToID(uniName);
				switch (uniformPeriod) {
					case Shader3D.PERIOD_CUSTOM:
						customParms.push(one);
						break;
					case Shader3D.PERIOD_MATERIAL:
						materialParms.push(one);
						break;
					case Shader3D.PERIOD_SPRITE:
						spriteParms.push(one);
						break;
					case Shader3D.PERIOD_CAMERA:
						cameraParms.push(one);
						break;
					case Shader3D.PERIOD_SCENE:
						sceneParms.push(one);
						break;
					default:
						throw new Error("Shader3D: period is unkonw.");
				}
			}
			else{
				//没有涉及到的uniform加入sceneParms,全局传入
				one.dataOffset = Shader3D.propertyNameToID(uniName);
				this._globaluniformMap[uniName] = Shader3D.PERIOD_SCENE;
				sceneParms.push(one);
			}
		}

		//Native版本分别存入funid、webglFunid,location、type、offset, +4是因为第一个存长度了 所以是*4*5+4
		this._sceneUniformParamsMap = (<any>LayaGL.instance).createCommandEncoder(sceneParms.length * 4 * 5 + 4, 64, true);
		for (i = 0, n = sceneParms.length; i < n; i++)
			this._sceneUniformParamsMap.addShaderUniform(sceneParms[i]);

		this._cameraUniformParamsMap = (<any>LayaGL.instance).createCommandEncoder(cameraParms.length * 4 * 5 + 4, 64, true);
		for (i = 0, n = cameraParms.length; i < n; i++)
			this._cameraUniformParamsMap.addShaderUniform(cameraParms[i]);

		this._spriteUniformParamsMap = (<any>LayaGL.instance).createCommandEncoder(spriteParms.length * 4 * 5 + 4, 64, true);
		for (i = 0, n = spriteParms.length; i < n; i++)
			this._spriteUniformParamsMap.addShaderUniform(spriteParms[i]);

		this._materialUniformParamsMap = (<any>LayaGL.instance).createCommandEncoder(materialParms.length * 4 * 5 + 4, 64, true);
		for (i = 0, n = materialParms.length; i < n; i++)
			this._materialUniformParamsMap.addShaderUniform(materialParms[i]);

		this._customUniformParamsMap.length = customParms.length;
		for (i = 0, n = customParms.length; i < n; i++) {
			var custom: ShaderVariable = customParms[i];
			this._customUniformParamsMap[custom.dataOffset] = custom;
		}
		var stateMap: {[key:string]:number} = this._shaderPass._stateMap;
		for (var s in stateMap)
			this._stateParamsMap[stateMap[s]] = Shader3D.propertyNameToID(s);
	}

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

	/**
	 * @internal
	 */
	_addShaderUnifiormFun(one: ShaderVariable): void {
		var gl: WebGLRenderingContext = LayaGL.instance;
		one.caller = this;
		var isArray: boolean = one.isArray;
		switch (one.type) {
			case gl.BOOL:
				one.fun = this._uniform1i;
				one.uploadedValue = new Array(1);
				break;
			case gl.INT:
				one.fun = isArray ? this._uniform1iv : this._uniform1i;//TODO:优化
				one.uploadedValue = new Array(1);
				break;
			case gl.FLOAT:
				one.fun = isArray ? this._uniform1fv : this._uniform1f;
				one.uploadedValue = new Array(1);
				break;
			case gl.FLOAT_VEC2:
				one.fun = isArray ? this._uniform_vec2v : this._uniform_vec2;
				one.uploadedValue = new Array(2);
				break;
			case gl.FLOAT_VEC3:
				one.fun = isArray ? this._uniform_vec3v : this._uniform_vec3;
				one.uploadedValue = new Array(3);
				break;
			case gl.FLOAT_VEC4:
				one.fun = isArray ? this._uniform_vec4v : this._uniform_vec4;
				one.uploadedValue = new Array(4);
				break;
			case gl.FLOAT_MAT2:
				one.fun = this._uniformMatrix2fv;
				break;
			case gl.FLOAT_MAT3:
				one.fun = this._uniformMatrix3fv;
				break;
			case gl.FLOAT_MAT4:
				one.fun = isArray ? this._uniformMatrix4fv : this._uniformMatrix4f;
				break;
			case gl.SAMPLER_2D:
			case (<WebGL2RenderingContext>gl).SAMPLER_2D_SHADOW:
				gl.uniform1i(one.location, this._curActTexIndex);
				one.textureID = WebGLContext._glTextureIDs[this._curActTexIndex++];
				one.fun = this._uniform_sampler2D;
				break;
			case 0x8b5f://sampler3D
				gl.uniform1i(one.location, this._curActTexIndex);
				one.textureID = WebGLContext._glTextureIDs[this._curActTexIndex++];
				one.fun = this._uniform_sampler3D;
				break;
			case gl.SAMPLER_CUBE:
				gl.uniform1i(one.location, this._curActTexIndex);
				one.textureID = WebGLContext._glTextureIDs[this._curActTexIndex++];
				one.fun = this._uniform_samplerCube;
				break;
			default:
				throw new Error("compile shader err!");
				break;
		}
	}

	/**
	 * @internal
	 */
	private _createShader(gl: WebGLRenderingContext, str: string, type: any): any {
		var shader: any = gl.createShader(type);
		gl.shaderSource(shader, str);
		gl.compileShader(shader);
		if (Shader3D.debugMode && !gl.getShaderParameter(shader, gl.COMPILE_STATUS))
			throw gl.getShaderInfoLog(shader);

		return shader;
	}

	/**
	 * @internal
	 */
	_uniform1f(one: any, value: any): number {
		var uploadedValue: any[] = one.uploadedValue;
		if (uploadedValue[0] !== value) {
			LayaGL.instance.uniform1f(one.location, uploadedValue[0] = value);
			return 1;
		}
		return 0;
	}

	/**
	 * @internal
	 */
	_uniform1fv(one: any, value: any): number {
		if (value.length < 4) {
			var uploadedValue: any[] = one.uploadedValue;
			if (uploadedValue[0] !== value[0] || uploadedValue[1] !== value[1] || uploadedValue[2] !== value[2] || uploadedValue[3] !== value[3]) {
				LayaGL.instance.uniform1fv(one.location, value);
				uploadedValue[0] = value[0];
				uploadedValue[1] = value[1];
				uploadedValue[2] = value[2];
				uploadedValue[3] = value[3];
				return 1;
			}
			return 0;
		} else {
			LayaGL.instance.uniform1fv(one.location, value);
			return 1;
		}
	}

	/**
	 * @internal
	 */
	_uniform_vec2(one: any, v: Vector2): number {
		var uploadedValue: any[] = one.uploadedValue;
		if (uploadedValue[0] !== v.x || uploadedValue[1] !== v.y) {
			LayaGL.instance.uniform2f(one.location, uploadedValue[0] = v.x, uploadedValue[1] = v.y);
			return 1;
		}
		return 0;
	}

	/**
	 * @internal
	 */
	_uniform_vec2v(one: any, value: Float32Array): number {
		if (value.length < 2) {
			var uploadedValue: any[] = one.uploadedValue;
			if (uploadedValue[0] !== value[0] || uploadedValue[1] !== value[1] || uploadedValue[2] !== value[2] || uploadedValue[3] !== value[3]) {
				LayaGL.instance.uniform2fv(one.location, value);
				uploadedValue[0] = value[0];
				uploadedValue[1] = value[1];
				uploadedValue[2] = value[2];
				uploadedValue[3] = value[3];
				return 1;
			}
			return 0;
		} else {
			LayaGL.instance.uniform2fv(one.location, value);
			return 1;
		}
	}

	/**
	 * @internal
	 */
	_uniform_vec3(one: any, v: Vector3): number {
		var uploadedValue: any[] = one.uploadedValue;
		if (uploadedValue[0] !== v.x || uploadedValue[1] !== v.y || uploadedValue[2] !== v.z) {
			LayaGL.instance.uniform3f(one.location, uploadedValue[0] = v.x, uploadedValue[1] = v.y, uploadedValue[2] = v.z);
			return 1;
		}
		return 0;
	}

	/**
	 * @internal
	 */
	_uniform_vec3v(one: any, v: Float32Array): number {
		LayaGL.instance.uniform3fv(one.location, v);
		return 1;
	}

	/**
	 * @internal
	 */
	_uniform_vec4(one: any, v: Vector4): number {
		var uploadedValue: any[] = one.uploadedValue;
		if (uploadedValue[0] !== v.x || uploadedValue[1] !== v.y || uploadedValue[2] !== v.z || uploadedValue[3] !== v.w) {
			LayaGL.instance.uniform4f(one.location, uploadedValue[0] = v.x, uploadedValue[1] = v.y, uploadedValue[2] = v.z, uploadedValue[3] = v.w);
			return 1;
		}
		return 0;
	}

	/**
	 * @internal
	 */
	_uniform_vec4v(one: any, v: Float32Array): number {
		LayaGL.instance.uniform4fv(one.location, v);
		return 1;
	}

	/**
	 * @internal
	 */
	_uniformMatrix2fv(one: any, value: any): number {
		LayaGL.instance.uniformMatrix2fv(one.location, false, value);
		return 1;
	}

	/**
	 * @internal
	 */
	_uniformMatrix3fv(one: any, value: any): number {
		LayaGL.instance.uniformMatrix3fv(one.location, false, value);
		return 1;
	}

	/**
	 * @internal
	 */
	_uniformMatrix4f(one: any, m: Matrix4x4): number {
		var value: Float32Array = m.elements;
		LayaGL.instance.uniformMatrix4fv(one.location, false, value);
		return 1;
	}

	/**
	 * @internal
	 */
	_uniformMatrix4fv(one: any, m: Float32Array): number {
		LayaGL.instance.uniformMatrix4fv(one.location, false, m);
		return 1;
	}

	/**
	 * @internal
	 */
	_uniform1i(one: any, value: any): number {
		var uploadedValue: any[] = one.uploadedValue;
		if (uploadedValue[0] !== value) {
			LayaGL.instance.uniform1i(one.location, uploadedValue[0] = value);
			return 1;
		}
		return 0;
	}

	/**
	 * @internal
	 */
	_uniform1iv(one: any, value: any): number {
		LayaGL.instance.uniform1iv(one.location, value);
		return 1;
	}

	/**
	 * @internal
	 */
	_uniform_ivec2(one: any, value: any): number {
		var uploadedValue: any[] = one.uploadedValue;
		if (uploadedValue[0] !== value[0] || uploadedValue[1] !== value[1]) {
			LayaGL.instance.uniform2i(one.location, uploadedValue[0] = value[0], uploadedValue[1] = value[1]);
			return 1;
		}
		return 0;
	}

	/**
	 * @internal
	 */
	_uniform_ivec2v(one: any, value: any): number {
		LayaGL.instance.uniform2iv(one.location, value);
		return 1;
	}

	/**
	 * @internal
	 */
	_uniform_vec3i(one: any, value: any): number {
		var uploadedValue: any[] = one.uploadedValue;
		if (uploadedValue[0] !== value[0] || uploadedValue[1] !== value[1] || uploadedValue[2] !== value[2]) {
			LayaGL.instance.uniform3i(one.location, uploadedValue[0] = value[0], uploadedValue[1] = value[1], uploadedValue[2] = value[2]);
			return 1;
		}
		return 0;
	}

	/**
	 * @internal
	 */
	_uniform_vec3vi(one: any, value: any): number {
		LayaGL.instance.uniform3iv(one.location, value);
		return 1;
	}

	/**
	 * @internal
	 */
	_uniform_vec4i(one: any, value: any): number {
		var uploadedValue: any[] = one.uploadedValue;
		if (uploadedValue[0] !== value[0] || uploadedValue[1] !== value[1] || uploadedValue[2] !== value[2] || uploadedValue[3] !== value[3]) {
			LayaGL.instance.uniform4i(one.location, uploadedValue[0] = value[0], uploadedValue[1] = value[1], uploadedValue[2] = value[2], uploadedValue[3] = value[3]);
			return 1;
		}
		return 0;
	}

	/**
	 * @internal
	 */
	_uniform_vec4vi(one: any, value: any): number {
		LayaGL.instance.uniform4iv(one.location, value);
		return 1;
	}

	/**
	 * @internal
	 */
	_uniform_sampler2D(one: any, texture: BaseTexture): number {//TODO:TEXTURTE ARRAY
		var value: any = texture._getSource() || texture.defaulteTexture._getSource();
		var gl: WebGLRenderingContext = LayaGL.instance;
		WebGLContext.activeTexture(gl, one.textureID);
		WebGLContext.bindTexture(gl, gl.TEXTURE_2D, value);
		return 0;
	}

	_uniform_sampler3D(one: any, texture: BaseTexture): number {//TODO:TEXTURTE ARRAY
		var value: any = texture._getSource() || texture.defaulteTexture._getSource();
		var gl: WebGLRenderingContext = LayaGL.instance;
		WebGLContext.activeTexture(gl, one.textureID);
		WebGLContext.bindTexture(gl, WebGL2RenderingContext.TEXTURE_3D, value);
		return 0;
	}

	/**
	 * @internal
	 */
	_uniform_samplerCube(one: any, texture: BaseTexture): number {//TODO:TEXTURTECUBE ARRAY
		var value: any = texture._getSource() || texture.defaulteTexture._getSource();
		var gl: WebGLRenderingContext = LayaGL.instance;
		WebGLContext.activeTexture(gl, one.textureID);
		WebGLContext.bindTexture(gl, gl.TEXTURE_CUBE_MAP, value);
		return 0;
	}

	/**
	 * @internal
	 */
	bind(): boolean {
		return WebGLContext.useProgram(LayaGL.instance, this._program);
	}

	/**
	 * @internal
	 */
	uploadUniforms(shaderUniform: CommandEncoder, shaderDatas: ShaderData, uploadUnTexture: boolean): void {
		Stat.shaderCall += LayaGLRunner.uploadShaderUniforms((<any>LayaGL.instance), shaderUniform, shaderDatas, uploadUnTexture);
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
		depthWrite == null && (depthWrite = renderState.depthWrite);
		depthTest == null && (depthTest = renderState.depthTest);
		blend == null && (blend = renderState.blend);

		WebGLContext.setDepthMask(gl, depthWrite);
		if (depthTest === RenderState.DEPTHTEST_OFF)
			WebGLContext.setDepthTest(gl, false);
		else {
			WebGLContext.setDepthTest(gl, true);
			WebGLContext.setDepthFunc(gl, depthTest);
		}

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

