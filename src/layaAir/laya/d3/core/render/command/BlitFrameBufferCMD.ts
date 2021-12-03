import { LayaGL } from "../../../../layagl/LayaGL";
import { BaseTexture } from "../../../../resource/BaseTexture";
import { Vector4 } from "../../../math/Vector4";
import { Viewport } from "../../../math/Viewport";
import { RenderTexture } from "../../../resource/RenderTexture";
import { DefineDatas } from "../../../shader/DefineDatas";
import { Shader3D } from "../../../shader/Shader3D";
import { ShaderData } from "../../../shader/ShaderData";
import { ShaderInstance } from "../../../shader/ShaderInstance";
import { ShaderPass } from "../../../shader/ShaderPass";
import { SubShader } from "../../../shader/SubShader";
import { RenderContext3D } from "../RenderContext3D";
import { ScreenQuad } from "../ScreenQuad";
import { Command } from "./Command";


/**
 * 类用于创建从渲染源输出到渲染目标的指令
 */
export class BlitFrameBufferCMD {

	/** @internal */
	private static _compileDefine: DefineDatas = new DefineDatas();
	/**@internal */
	private static _pool: any[] = [];
	/** @internal */
	private static _defaultOffsetScale: Vector4 = new Vector4(0, 0, 1, 1);

	/**
   * 渲染命令集
   * @param source 
   * @param dest 
   * @param viewport 
   * @param offsetScale 
   * @param shader 
   * @param shaderData 
   * @param subShader 
   */
	static create(source: BaseTexture, dest: RenderTexture, viewport: Viewport, offsetScale: Vector4 = null, shader: Shader3D = null, shaderData: ShaderData = null, subShader: number = 0) {
		var cmd: BlitFrameBufferCMD;
		cmd = BlitFrameBufferCMD._pool.length > 0 ? BlitFrameBufferCMD._pool.pop() : new BlitFrameBufferCMD();
		cmd._source = source;
		cmd._dest = dest;
		cmd._offsetScale = offsetScale;
		cmd._shader = shader;
		cmd._shaderData = shaderData;
		cmd._subShader = subShader;
		cmd._viewPort = viewport;
		return cmd;
	}
	/**@internal source 原始贴图*/
	private _source: BaseTexture = null;
	/**@internal dest 目标 如果为null，将会默认为主画布*/
	private _dest: RenderTexture = null;
	/**@internal 偏移缩放*/
	private _offsetScale: Vector4 = null;
	/**@internal 渲染shader*/
	private _shader: Shader3D = null;
	/**@internal 渲染数据*/
	private _shaderData: ShaderData = null;
	/**@internal subshader的节点*/
	private _subShader: number = 0;
	/**@internal 渲染设置*/
	private _viewPort: Viewport = null;
	/**@internal */
	private _sourceTexelSize: Vector4 = new Vector4();

	/**
	 * @inheritDoc
	 * @override
	 */
	run(): void {
		if (!this._source || !this._viewPort)
			return;
		var source = this._source;
		var dest = this._dest;
		var shader: Shader3D = this._shader || Command._screenShader;
		var shaderData: ShaderData = this._shaderData || Command._screenShaderData;
		var viewport = this._viewPort;

		let vph = RenderContext3D.clientHeight - viewport.y - viewport.height;
		LayaGL.instance.viewport(viewport.x, vph, viewport.width, viewport.height);
		LayaGL.instance.scissor(viewport.x, vph, viewport.width, viewport.height);




		shaderData.setTexture(Command.SCREENTEXTURE_ID, source);
		shaderData.setVector(Command.SCREENTEXTUREOFFSETSCALE_ID, this._offsetScale || BlitFrameBufferCMD._defaultOffsetScale);
		this._sourceTexelSize.setValue(1.0 / source.width, 1.0 / source.height, source.width, source.height);
		(RenderTexture.currentActive) && (RenderTexture.currentActive._end());
		(dest) && (dest._start());



		var subShader: SubShader = shader.getSubShaderAt(this._subShader);
		var passes: ShaderPass[] = subShader._passes;
		for (var i: number = 0, n: number = passes.length; i < n; i++) {
			var comDef: DefineDatas = BlitFrameBufferCMD._compileDefine;
			shaderData._defineDatas.cloneTo(comDef);
			var shaderPass: ShaderInstance = passes[i].withCompile(comDef);//TODO:define处理
			shaderPass.bind();
			shaderPass.uploadUniforms(shaderPass._materialUniformParamsMap, shaderData, true);//TODO:最后一个参数处理
			shaderPass.uploadRenderStateBlendDepth(shaderData);
			shaderPass.uploadRenderStateFrontFace(shaderData, false, null);//TODO: //利用UV翻转,无需设置为true
			RenderContext3D._instance.invertY ? ScreenQuad.instance.renderInvertUV() : ScreenQuad.instance.render();
		}
		(dest) && (dest._end());
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	recover(): void {
		BlitFrameBufferCMD._pool.push(this);
		this._source = null;
		this._dest = null;
		this._offsetScale = null;
		this._shader = null;
		this._shaderData = null;
		this._viewPort = null;
	}
}