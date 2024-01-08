import { Shader3D } from "../../../../RenderEngine/RenderShader/Shader3D";
import { ShaderData } from "../../../../RenderEngine/RenderShader/ShaderData";
import { BaseTexture } from "../../../../resource/BaseTexture";
import { Stat } from "../../../../utils/Stat";
import { Viewport } from "../../../math/Viewport";
import { Transform3D } from "../../Transform3D";
import { RenderContext3D } from "../RenderContext3D";
import { RenderElement } from "../RenderElement";
import { ScreenQuad } from "../ScreenQuad";
import { Command } from "./Command";
import { CommandBuffer } from "./CommandBuffer";
import { Camera } from "../../Camera";
import { Vector4 } from "../../../../maths/Vector4";
import { RenderTexture } from "../../../../resource/RenderTexture";
import { Laya3DRender } from "../../../RenderObjs/Laya3DRender";

export class BlitScreenQuadCMD extends Command {
	/**@internal */
	static _SCREENTYPE_QUAD: number = 0;
	/**@internal */
	static _SCREENTYPE_TRIANGLE: number = 1;
	/**@internal */
	private static _pool: any[] = [];
	/** @internal */
	private static _defaultOffsetScale: Vector4 = new Vector4(0, 0, 1, 1);
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
	static create(source: BaseTexture, dest: RenderTexture, offsetScale: Vector4 = null, shader: Shader3D = null, shaderData: ShaderData = null, subShader: number = 0, screenType: number = BlitScreenQuadCMD._SCREENTYPE_QUAD, commandbuffer: CommandBuffer = null): BlitScreenQuadCMD {
		var cmd: BlitScreenQuadCMD;
		cmd = BlitScreenQuadCMD._pool.length > 0 ? BlitScreenQuadCMD._pool.pop() : new BlitScreenQuadCMD();
		cmd._source = source;
		cmd._dest = dest;
		cmd._offsetScale = offsetScale;
		cmd.setshader(shader, subShader, shaderData);
		// cmd._shader = shader;
		// cmd.shaderData = shaderData;
		// cmd._subShader = subShader;
		cmd._commandBuffer = commandbuffer;
		return cmd;
	}

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
	private _renderElement: RenderElement;
	/**@internal */
	private _transform3D: Transform3D;



	constructor() {
		super();
		this._transform3D = Laya3DRender.renderOBJCreate.createTransform(null);
		this._renderElement = new RenderElement();
		this._renderElement.setTransform(this._transform3D);
		this._renderElement.setGeometry(ScreenQuad.instance);
	}

	set shaderData(value: ShaderData) {
		this._shaderData = value || Command._screenShaderData;
		this._renderElement._renderElementOBJ._materialShaderData = this._shaderData;
	}

	setshader(shader: Shader3D, subShader: number, shaderData: ShaderData) {
		this._shader = shader || Command._screenShader;
		this._subShader = subShader || 0;
		this.shaderData = shaderData;
		this._renderElement.renderSubShader = this._shader.getSubShaderAt(this._subShader);
		this._renderElement._subShaderIndex = subShader;
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	run(): void {//TODO:相机的UV
		this._commandBuffer && (this.setContext(this._commandBuffer._context));
		var context = this._context;
		var source;
		if (!this._source) {
			if (!this._commandBuffer._camera._internalRenderTexture)//source null, Bind define FrameBuffer
				throw "camera internalRenderTexture is null,please set camera enableBuiltInRenderTexture";
			source = this._commandBuffer._camera._internalRenderTexture;
		} else
			source = this._source;
		var shaderData: ShaderData = this._shaderData;
		var dest: RenderTexture = this._dest ? this._dest : this._commandBuffer._camera._internalRenderTexture;//set dest
		if (dest) {//set viewport
			context.changeViewport(0, 0, dest.width, dest.height);
			context.changeScissor(0, 0, dest.width, dest.height);
		} else {
			let camera = this._commandBuffer._camera;
			let viewport: Viewport = camera.viewport;
			let vpH = viewport.height;
			let vpY = RenderContext3D.clientHeight - viewport.y - vpH;
			context.changeViewport(viewport.x, vpY, viewport.width, vpH);
			context.changeScissor(viewport.x, vpY, viewport.width, vpH);
		}
		shaderData.setTexture(Command.SCREENTEXTURE_ID, source);
		shaderData.setVector(Command.SCREENTEXTUREOFFSETSCALE_ID, this._offsetScale || BlitScreenQuadCMD._defaultOffsetScale);
		this._sourceTexelSize.setValue(1.0 / source.width, 1.0 / source.height, source.width, source.height);
		shaderData.setVector(Command.MAINTEXTURE_TEXELSIZE_ID, this._sourceTexelSize);
		context.destTarget = dest;
		context._contextOBJ.cameraUpdateMask = Camera._updateMark;
		// ScreenQuad.instance.invertY = dest ? dest._isCameraTarget : false;
		ScreenQuad.instance.invertY = context.invertY;
		//context.drawRenderElement(this._renderElement);
		Stat.blitDrawCall++;
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
		super.recover();
	}

	destroy(): void {
		this._source = null;
		this._dest = null;
		this._offsetScale = null;
		this._shader = null;
		this._shaderData = null;
		this._renderElement.destroy();
	}
}