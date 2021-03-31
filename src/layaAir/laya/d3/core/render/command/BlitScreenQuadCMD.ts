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
import { Camera } from "../../Camera";
import { RenderContext3D } from "../RenderContext3D";
import { ScreenQuad } from "../ScreenQuad";
import { ScreenTriangle } from "../ScreenTriangle";
import { Command } from "./Command";
import { CommandBuffer } from "./CommandBuffer";

/**
 * <code>BlitScreenQuadCMD</code> 类用于创建从一张渲染目标输出到另外一张渲染目标指令。
 */
export class BlitScreenQuadCMD extends Command {
	/**@internal */
	static _SCREENTYPE_QUAD: number = 0;
	/**@internal */
	static _SCREENTYPE_TRIANGLE: number = 1;

	/** @internal */
	private static _compileDefine: DefineDatas = new DefineDatas();
	/**@internal */
	private static _pool: any[] = [];
	/** @internal */
	private static _defaultOffsetScale: Vector4 = new Vector4(0, 0, 1, 1);

	/**@internal */
	private _source: BaseTexture = null;
	/**@internal */
	private _dest: RenderTexture = null;
	/**@internal */
	private _offsetScale: Vector4 = null;
	/**@internal */
	private _shader: Shader3D = null;
	/**@internal */
	private _shaderData: ShaderData = null;
	/**@internal */
	private _subShader: number = 0;
	/**@internal */
	private _sourceTexelSize: Vector4 = new Vector4();
	/**@internal */
	private _screenType: number = 0;
	/**@internal 为了兼容老的Camera里面的一个流程*/
	private _drawDefineCavans:boolean = false;

	/**
	 * 创建命令流
	 * @param source 原始贴图 如果设置为null  将会使用默认的Camera流程中的原RenderTexture
	 * @param dest 目标贴图 如果设置为null，将会使用默认的camera渲染目标
	 * @param offsetScale 偏移缩放
	 * @param shader 渲染shader
	 * @param shaderData 渲染数据
	 * @param subShader subshader的节点
	 * @param screenType 
	 */
	static create(source: BaseTexture, dest: RenderTexture, offsetScale: Vector4 = null, shader: Shader3D = null, shaderData: ShaderData = null, subShader: number = 0, screenType: number = BlitScreenQuadCMD._SCREENTYPE_QUAD,commandbuffer:CommandBuffer = null,definedCanvas:boolean = false): BlitScreenQuadCMD {
		var cmd: BlitScreenQuadCMD;
		cmd = BlitScreenQuadCMD._pool.length > 0 ? BlitScreenQuadCMD._pool.pop() : new BlitScreenQuadCMD();
		cmd._source = source;
		cmd._dest = dest;
		cmd._offsetScale = offsetScale;
		cmd._shader = shader;
		cmd._shaderData = shaderData;
		cmd._subShader = subShader;
		cmd._screenType = screenType;
		cmd._commandBuffer = commandbuffer;
		cmd._drawDefineCavans = definedCanvas;
		return cmd;
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	run(): void {//TODO:相机的UV
		var source;
		//当this.source为null时，会自动绑定摄像机内部渲染目标
		if(!this._source){
			if(!this._commandBuffer._camera._internalRenderTexture)
				throw "camera internalRenderTexture is null,please set camera enableBuiltInRenderTexture";
			source = this._commandBuffer._camera._internalRenderTexture;
		}
		else
			source = this._source;

		var shader: Shader3D = this._shader || Command._screenShader;
		var shaderData: ShaderData = this._shaderData || Command._screenShaderData;
		//当this.dest为null时，会自动绑定摄像机内部的渲染目标，如果this._drawDefineCavans为true，会画入默认cavans
		var dest: RenderTexture =this._dest?this._dest:(this._drawDefineCavans?this._dest:this._commandBuffer._camera._internalRenderTexture);

		if (dest) {
			LayaGL.instance.viewport(0, 0, dest.width, dest.height);
		}
		else {
			let camera: Camera = this._commandBuffer._camera;
			let viewport: Viewport = camera.viewport;
			let vpH = viewport.height;
			let vpY = RenderContext3D.clientHeight - viewport.y - vpH;
			LayaGL.instance.viewport(viewport.x, vpY, viewport.width, vpH);
		}

		//TODO:优化
		shaderData.setTexture(Command.SCREENTEXTURE_ID, source);
		shaderData.setVector(Command.SCREENTEXTUREOFFSETSCALE_ID, this._offsetScale || BlitScreenQuadCMD._defaultOffsetScale);
		this._sourceTexelSize.setValue(1.0 / source.width, 1.0 / source.height, source.width, source.height);
		shaderData.setVector(Command.MAINTEXTURE_TEXELSIZE_ID, this._sourceTexelSize);
		//如果已经有绑定的帧buffer  要解绑
		(RenderTexture.currentActive)&&(RenderTexture.currentActive._end());
		(dest) && (dest._start());
		var subShader: SubShader = shader.getSubShaderAt(this._subShader);
		var passes: ShaderPass[] = subShader._passes;
		for (var i: number = 0, n: number = passes.length; i < n; i++) {
			var comDef: DefineDatas = BlitScreenQuadCMD._compileDefine;
			shaderData._defineDatas.cloneTo(comDef);
			var shaderPass: ShaderInstance = passes[i].withCompile(comDef);//TODO:define处理
			shaderPass.bind();
			shaderPass.uploadUniforms(shaderPass._materialUniformParamsMap, shaderData, true);//TODO:最后一个参数处理
			shaderPass.uploadRenderStateBlendDepth(shaderData);
			shaderPass.uploadRenderStateFrontFace(shaderData, false, null);//TODO: //利用UV翻转,无需设置为true
			switch (this._screenType) {
				case BlitScreenQuadCMD._SCREENTYPE_QUAD:
					RenderContext3D._instance.invertY ? ScreenQuad.instance.renderInvertUV() : ScreenQuad.instance.render();
					break;
				case BlitScreenQuadCMD._SCREENTYPE_TRIANGLE:
					RenderContext3D._instance.invertY ? ScreenTriangle.instance.renderInvertUV() : ScreenTriangle.instance.render();
					break;
				default:
					throw "BlitScreenQuadCMD:unknown screen Type.";
			}
		}
		(dest) && (dest._end());
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	recover(): void {
		BlitScreenQuadCMD._pool.push(this);
		this._source = null;
		this._dest = null;
		this._offsetScale = null;
		this._shader = null;
		this._shaderData = null;
		this._drawDefineCavans = false;
		super.recover();
	}

}


