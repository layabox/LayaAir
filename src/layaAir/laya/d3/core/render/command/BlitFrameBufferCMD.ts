import { LayaGL } from "../../../../layagl/LayaGL";
import { BaseTexture } from "../../../../resource/BaseTexture";
import { Viewport } from "../../../math/Viewport";
import { RenderContext3D } from "../RenderContext3D";
import { ScreenQuad } from "../ScreenQuad";
import { Command } from "./Command";
import { Shader3D } from "../../../../RenderEngine/RenderShader/Shader3D";
import { ShaderData } from "../../../../RenderEngine/RenderShader/ShaderData";
import { RenderElement } from "../RenderElement";
import { Transform3D } from "../../Transform3D";
import { ShaderDefine } from "../../../../RenderEngine/RenderShader/ShaderDefine";
import { Camera } from "../../Camera";
import { Vector4 } from "../../../../maths/Vector4";
import { RenderTexture } from "../../../../resource/RenderTexture";
import { ShaderPass } from "../../../../RenderEngine/RenderShader/ShaderPass";
import { SubShader } from "../../../../RenderEngine/RenderShader/SubShader";


/**
 * 类用于创建从渲染源输出到渲染目标的指令
 */
export class BlitFrameBufferCMD {
	/**@internal */
	private static _pool: any[] = [];
	/** @internal */
	private static _defaultOffsetScale: Vector4 = new Vector4(0, 0, 1, 1);
	/** @internal */
	static shaderdata: ShaderData;

	/** @internal */
	static __init__(): void {
		BlitFrameBufferCMD.shaderdata = LayaGL.renderOBJCreate.createShaderData(null);
	}

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
		cmd.setshader(shader, subShader, shaderData);
		cmd._source && cmd._texture_size.setValue(source.width, source.height, 1.0 / source.width, 1.0 / source.height);
		//cmd._shader = shader;
		//cmd._shaderData = shaderData;
		//cmd._subShader = subShader;
		cmd._viewPort = viewport;
		return cmd;
	}
	/**@internal source 原始贴图*/
	private _source: BaseTexture = null;
	/**@internal dest 目标 如果为null，将会默认为主画布*/
	private _dest: RenderTexture = null;
	/**@internal 偏移缩放*/
	private _offsetScale: Vector4 = null;
	/**@internal */
	_texture_size: Vector4 = null;
	/**@internal 渲染shader*/
	private _shader: Shader3D = null;
	/**@internal 渲染数据*/
	private _shaderData: ShaderData = null;
	/**@internal subshader的节点*/
	private _subShader: number = 0;
	/**@internal 渲染设置*/
	private _viewPort: Viewport = null;
	// /**@internal */
	// private _sourceTexelSize: Vector4 = new Vector4();
	/**@internal */
	private _renderElement: RenderElement;
	/**@internal */
	private _transform3D: Transform3D;
	constructor() {
		this._transform3D = LayaGL.renderOBJCreate.createTransform(null);
		this._renderElement = new RenderElement();
		this._renderElement.setTransform(this._transform3D);
		this._renderElement.setGeometry(ScreenQuad.instance);
		this._texture_size = new Vector4();
	}

	set shaderData(value: ShaderData) {
		this._shaderData = value || BlitFrameBufferCMD.shaderdata;
		this._renderElement._renderElementOBJ._materialShaderData = this._shaderData;
	}

	setshader(shader: Shader3D, subShader: number, shaderData: ShaderData) {
		this._shader = shader || Command._screenShader;
		this._subShader = subShader || 0;
		this.shaderData = shaderData;
		this._renderElement.renderSubShader = this._shader.getSubShaderAt(this._subShader);
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	run(): void {
		if (!this._source || !this._viewPort)
			return;
		var source = this._source;
		var dest = this._dest;
		var shader: Shader3D = this._shader;
		var shaderData: ShaderData = this._shaderData;
		var viewport = this._viewPort;

		let vph = RenderContext3D.clientHeight - viewport.y - viewport.height;

		// LayaGL.renderEngine.viewport(viewport.x, vph, viewport.width, viewport.height);
		// LayaGL.renderEngine.scissor(viewport.x, vph, viewport.width, viewport.height);
		let context = RenderContext3D._instance;
		context.changeViewport(viewport.x, vph, viewport.width, viewport.height);
		context.changeScissor(viewport.x, vph, viewport.width, viewport.height);

		shaderData.setTexture(Command.SCREENTEXTURE_ID, source);
		shaderData.setVector(Command.SCREENTEXTUREOFFSETSCALE_ID, this._offsetScale || BlitFrameBufferCMD._defaultOffsetScale);
		source && (shaderData.setVector(Command.MAINTEXTURE_TEXELSIZE_ID, this._texture_size));
		//this._sourceTexelSize.setValue(1.0 / source.width, 1.0 / source.height, source.width, source.height);
		(RenderTexture.currentActive) && (RenderTexture.currentActive._end());

		if (dest) {
			dest._start();
			shaderData.removeDefine(RenderContext3D.GammaCorrect);
		}
		else {
			shaderData.addDefine(RenderContext3D.GammaCorrect);
		}
		var subShader: SubShader = shader.getSubShaderAt(this._subShader);
		var passes: ShaderPass[] = subShader._passes;
		ScreenQuad.instance.invertY = false;

		context.destTarget = dest;
		context._contextOBJ.applyContext(Camera._updateMark);
		context.drawRenderElement(this._renderElement);
		//RenderContext3D._instance.invertY ? ScreenQuad.instance.renderInvertUV() : ScreenQuad.instance.render();


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