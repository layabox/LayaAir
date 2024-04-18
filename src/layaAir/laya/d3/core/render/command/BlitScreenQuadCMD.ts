import { Shader3D } from "../../../../RenderEngine/RenderShader/Shader3D";
import { BaseTexture } from "../../../../resource/BaseTexture";
import { Stat } from "../../../../utils/Stat";
import { Viewport } from "../../../math/Viewport";
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
import { BlitQuadCMDData } from "../../../../RenderDriver/DriverDesign/3DRenderPass/IRendderCMD";

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

	get offsetScale(): Vector4 {
		return this._offsetScale;
	}

	set offsetScale(value: Vector4) {
		value.cloneTo(this._offsetScale);
		this._blitQuadCMDData.offsetScale = value;
	}

	get dest(): RenderTexture {
		return this._dest;
	}

	set dest(value: RenderTexture) {
		this._dest = value;
		this._blitQuadCMDData.dest = value ? value._renderTarget : null;
	}

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

	destroy(): void {
		this._source = null;
		this.dest = null;
		this._offsetScale = null;
		this._shader = null;
		this._shaderData = null;
		this._renderElement.destroy();
	}
}