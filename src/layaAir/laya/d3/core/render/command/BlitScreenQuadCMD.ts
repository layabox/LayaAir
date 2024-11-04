import { Shader3D } from "../../../../RenderEngine/RenderShader/Shader3D";
import { BaseTexture } from "../../../../resource/BaseTexture";
import { Stat } from "../../../../utils/Stat";
import { RenderContext3D } from "../RenderContext3D";
import { RenderElement } from "../RenderElement";
import { ScreenQuad } from "../ScreenQuad";
import { Command } from "./Command";
import { CommandBuffer } from "./CommandBuffer";
import { Vector4 } from "../../../../maths/Vector4";
import { RenderTexture } from "../../../../resource/RenderTexture";
import { Laya3DRender } from "../../../RenderObjs/Laya3DRender";
import { ShaderData } from "../../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { Transform3D } from "../../Transform3D";
import { BlitQuadCMDData } from "../../../../RenderDriver/DriverDesign/3DRenderPass/IRender3DCMD";
import { Viewport } from "../../../../maths/Viewport";

/**
 * @en The BlitScreenQuadCMD class is used to create render the source texture to the destination render texture by using the full screen quad command.
 * @zh BlitScreenQuadCMD 类用于创建通过全屏四边形将源纹理渲染到目标渲染纹理的指令
 */
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
	 * @en Create command stream
	 * @param source  The source texture. If set to null, it will use the default RenderTexture from the Camera process.
	 * @param dest  The destination texture. If set to null, it will use the default rendering target of the camera.
	 * @param offsetScale  Offset scaling.
	 * @param shader  The shader to use for rendering. 
	 * @param shaderData  The shader data for rendering. 
	 * @param subShader  The subShader index. Default is 0.
	 * @param screenType  The screen type for rendering.
	 * @param commandbuffer  The command buffer to use.
	 * @zh 创建命令流
	 * @param source 原始贴图 如果设置为null  将会使用默认的Camera流程中的原RenderTexture
	 * @param dest 目标贴图 如果设置为null，将会使用默认的camera渲染目标
	 * @param offsetScale 偏移缩放
	 * @param shader 用于渲染的着色器。。
	 * @param shaderData 用于渲染的着色器数据。
	 * @param subShader subshader的节点
	 * @param screenType 渲染的屏幕类型
	 * @param commandbuffer 命令缓冲
	 */
	static create(source: BaseTexture, dest: RenderTexture, offsetScale: Vector4 = null, shader: Shader3D = null, shaderData: ShaderData = null, subShader: number = 0, screenType: number = BlitScreenQuadCMD._SCREENTYPE_QUAD, commandbuffer: CommandBuffer = null): BlitScreenQuadCMD {
		var cmd: BlitScreenQuadCMD;
		cmd = BlitScreenQuadCMD._pool.length > 0 ? BlitScreenQuadCMD._pool.pop() : new BlitScreenQuadCMD();
		cmd._source = source;
		cmd.dest = dest;
		cmd.offsetScale = offsetScale || BlitScreenQuadCMD._defaultOffsetScale;
		cmd.setshader(shader, subShader, shaderData);
		cmd._commandBuffer = commandbuffer;
		return cmd;
	}

	/**@internal */
	private _source: BaseTexture = null;
	/**@internal */
	private _dest: RenderTexture = null;
	/**@internal */
	private _offsetScale: Vector4 = new Vector4();
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
	/**@internal */
	_blitQuadCMDData: BlitQuadCMDData;

	constructor() {
		super();
		this._blitQuadCMDData = Laya3DRender.Render3DPassFactory.createBlitQuadCMDData();
		this._transform3D = Laya3DRender.Render3DModuleDataFactory.createTransform(null);
		this._renderElement = new RenderElement();
		this._renderElement.setTransform(this._transform3D);
		this._renderElement.setGeometry(ScreenQuad.instance);
		this._blitQuadCMDData.element = this._renderElement._renderElementOBJ;
		this._blitQuadCMDData.element.isRender = true;
	}

	/**
	 * @en The offset and scale for rendering.
	 * @zh 渲染的偏移和缩放。
	 */
	get offsetScale(): Vector4 {
		return this._offsetScale;
	}

	set offsetScale(value: Vector4) {
		value.cloneTo(this._offsetScale);
		this._blitQuadCMDData.offsetScale = value;
	}

	/**
	 * @en The destination render texture.
	 * @zh 目标渲染纹理。
	 */
	get dest(): RenderTexture {
		return this._dest;
	}

	set dest(value: RenderTexture) {
		this._dest = value;
		this._blitQuadCMDData.dest = value ? value._renderTarget : null;
	}

	/**
	 * @en The shader data for rendering.
	 * @zh 渲染的着色器数据。
	 */
	set shaderData(value: ShaderData) {
		this._shaderData = value || Command._screenShaderData;
		this._renderElement._renderElementOBJ.materialShaderData = this._shaderData;
	}

	/**
	 * @override
	 * @internal
	 * @returns 
	 */
	getRenderCMD(): BlitQuadCMDData {
		return this._blitQuadCMDData;
	}

	/**
	 * @internal
	 * @param shader 
	 * @param subShader 
	 * @param shaderData 
	 */
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
	 * @en Execute the command.
	 * @zh 执行命令。
	 */
	run(): void {//TODO:相机的UV
		var source;
		if (!this._source) {
			if (!this._commandBuffer._camera._internalRenderTexture)//source null, Bind define FrameBuffer
				throw "camera internalRenderTexture is null,please set camera enableBuiltInRenderTexture";
			source = this._commandBuffer._camera._internalRenderTexture;
		} else
			source = this._source;
		this._blitQuadCMDData.source = source._texture;
		var dest: RenderTexture = this._dest ? this._dest : this._commandBuffer._camera._internalRenderTexture;//set dest
		if (dest != this._dest) this._blitQuadCMDData.dest = dest._renderTarget;
		if (dest) {//set viewport
			Viewport._tempViewport.set(0, 0, dest.width, dest.height);
			Vector4.tempVec4.setValue(0, 0, dest.width, dest.height);
			this._blitQuadCMDData.viewport = Viewport._tempViewport;
			this._blitQuadCMDData.scissor = Vector4.tempVec4;
		}
		else {
			let camera = this._commandBuffer._camera;
			let viewport: Viewport = camera.viewport;
			let vpH = viewport.height;
			let vpY = RenderContext3D.clientHeight - viewport.y - vpH;
			Viewport._tempViewport.set(viewport.x, vpY, viewport.width, vpH);
			Vector4.tempVec4.setValue(viewport.x, vpY, viewport.width, vpH);
			this._blitQuadCMDData.viewport = Viewport._tempViewport;
			this._blitQuadCMDData.scissor = Vector4.tempVec4;
		}

		let invertY = dest ? true : false;
		this._renderElement.setGeometry(invertY ? ScreenQuad.InvertInstance : ScreenQuad.instance);

		Stat.blitDrawCall++;
	}

	/**
	 * @inheritDoc
	 * @override
	 * @en Recover the command for reuse.
	 * @zh 回收命令以重复使用。
	 */
	recover(): void {
		BlitScreenQuadCMD._pool.push(this);
		this._source = null;
		this._dest = null;
		BlitScreenQuadCMD._defaultOffsetScale.cloneTo(this._offsetScale);
		this._shader = null;
		this._shaderData = null;
		super.recover();
	}

	/**
	 * @en Destroy the command and release resources.
	 * @zh 销毁命令并释放资源。
	 */
	destroy(): void {
		this._source = null;
		this.dest = null;
		this._offsetScale = null;
		this._shader = null;
		this._shaderData = null;
		this._renderElement.destroy();
	}
}