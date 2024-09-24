import { BaseTexture } from "../../../../resource/BaseTexture";
import { RenderContext3D } from "../RenderContext3D";
import { ScreenQuad } from "../ScreenQuad";
import { Command } from "./Command";
import { Shader3D } from "../../../../RenderEngine/RenderShader/Shader3D";
import { RenderElement } from "../RenderElement";
import { ShaderData } from "../../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { LayaGL } from "../../../../layagl/LayaGL";
import { Vector4 } from "../../../../maths/Vector4";
import { RenderTexture } from "../../../../resource/RenderTexture";
import { Laya3DRender } from "../../../RenderObjs/Laya3DRender";
import { Camera } from "../../Camera";
import { Transform3D } from "../../Transform3D";
import { Viewport } from "../../../../maths/Viewport";
import { Stat } from "../../../../utils/Stat";



/**
 * @en Class used for creating instructions to output from a render source to a render target.
 * @zh 类用于创建从渲染源输出到渲染目标的指令。
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
		BlitFrameBufferCMD.shaderdata = LayaGL.renderDeviceFactory.createShaderData(null);
	}

	/**
	 * @en Create a render command set.
	 * @param source The source texture.
	 * @param dest The destination render texture.
	 * @param viewport The viewport for rendering.
	 * @param offsetScale The offset and scale vector. Default is null.
	 * @param shader The shader to use. Default is null.
	 * @param shaderData The shader data to use. Default is null.
	 * @param subShader The sub-shader index. Default is 0.
	 * @returns The created BlitFrameBufferCMD instance.
	 * @zh 创建渲染命令集。
	 * @param source 源纹理。
	 * @param dest 目标渲染纹理。
	 * @param viewport 渲染视口。
	 * @param offsetScale 偏移和缩放向量。默认为 null。
	 * @param shader 要使用的着色器。默认为 null。
	 * @param shaderData 要使用的着色器数据。默认为 null。
	 * @param subShader 子着色器索引。默认为 0。
	 * @returns 创建的 BlitFrameBufferCMD 实例。
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
		this._transform3D = Laya3DRender.Render3DModuleDataFactory.createTransform(null);
		this._renderElement = new RenderElement();
		this._renderElement.setTransform(this._transform3D);
		this._renderElement.setGeometry(ScreenQuad.instance);
		this._renderElement._renderElementOBJ.isRender = true;
		this._texture_size = new Vector4();
	}

	/**
	 * @en The shader data for the command.
	 * @zh 命令的着色器数据。
	 */
	set shaderData(value: ShaderData) {
		this._shaderData = value || BlitFrameBufferCMD.shaderdata;
		this._renderElement._renderElementOBJ.materialShaderData = this._shaderData;
	}

	/**
	 * @en Set the shader, sub-shader, and shader data for the command.
	 * @param shader The shader to set. If null, uses the default screen shader.
	 * @param subShader The sub-shader index. Default is 0.
	 * @param shaderData The shader data to set.
	 * @zh 设置命令的着色器、子着色器和着色器数据。
	 * @param shader 要设置的着色器。如果为 null，则使用默认屏幕着色器。
	 * @param subShader 子着色器索引。默认为 0。
	 * @param shaderData 要设置的着色器数据。
	 */
	setshader(shader: Shader3D, subShader: number, shaderData: ShaderData) {
		this._shader = shader || Command._screenShader;
		this._subShader = subShader || 0;
		this.shaderData = shaderData;
		this._renderElement.renderSubShader = this._shader.getSubShaderAt(this._subShader);
	}

	/**
	 * @inheritDoc
	 * @override
	 * @en Execute the render command.
	 * @zh 执行渲染命令。
	 */
	run(): void {
		if (!this._source || !this._viewPort)
			return;
		var source = this._source;
		var dest = this._dest;
		var shaderData: ShaderData = this._shaderData;
		let context = RenderContext3D._instance;

		var viewport = this._viewPort;
		let vph = RenderContext3D.clientHeight - viewport.y - viewport.height;
		if (LayaGL.renderEngine._screenInvertY) {
			context.changeViewport(viewport.x, viewport.y, viewport.width, viewport.height);
			context.changeScissor(viewport.x, viewport.y, viewport.width, viewport.height);
		}
		else {
			context.changeViewport(viewport.x, vph, viewport.width, viewport.height);
			context.changeScissor(viewport.x, vph, viewport.width, viewport.height);
		}
		shaderData.setTexture(Command.SCREENTEXTURE_ID, source);
		shaderData.setVector(Command.SCREENTEXTUREOFFSETSCALE_ID, this._offsetScale || BlitFrameBufferCMD._defaultOffsetScale);
		source && (shaderData.setVector(Command.MAINTEXTURE_TEXELSIZE_ID, this._texture_size));

		if (dest) {
			shaderData.removeDefine(RenderContext3D.GammaCorrect);
		}
		else {
			shaderData.addDefine(RenderContext3D.GammaCorrect);
		}
		this._renderElement.setGeometry(ScreenQuad.InvertInstance);
		context.destTarget = dest;
		context._contextOBJ.cameraUpdateMask = Camera._updateMark;
		context.drawRenderElement(this._renderElement._renderElementOBJ);

		Stat.blitDrawCall++;
	}

	/**
	 * @inheritDoc
	 * @override
	 * @en Recycle the command instance.
	 * @zh 回收命令实例。
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