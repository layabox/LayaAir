import { RenderTexture } from "../../../resource/RenderTexture";
import { Shader3D } from "../../../shader/Shader3D";
import { ShaderData } from "../../../shader/ShaderData";
import { Camera } from "../../Camera";
import { BlitScreenQuadCMD } from "./BlitScreenQuadCMD";
import { SetRenderTargetCMD } from "./SetRenderTargetCMD";
import { SetShaderDataTextureCMD } from "./SetShaderDataTextureCMD";
import { Command } from "./Command";
import { BaseTexture } from "../../../../resource/BaseTexture";
import { Vector4 } from "../../../math/Vector4";

/**
 * <code>CommandBuffer</code> 类用于创建命令流。
 */
export class CommandBuffer {
	/**@internal */
	_camera: Camera = null;
	/**@internal */
	private _commands: Command[] = [];

	/**
	 * 创建一个 <code>CommandBuffer</code> 实例。
	 */
	constructor() {

	}

	/**
	 *@internal
	 */
	_apply(): void {
		for (var i: number = 0, n: number = this._commands.length; i < n; i++)
			this._commands[i].run();
	}

	/**
	 *@internal
	 */
	setShaderDataTexture(shaderData: ShaderData, nameID: number, source: BaseTexture): void {
		this._commands.push(SetShaderDataTextureCMD.create(shaderData, nameID, source));
	}

	/**
	 * 添加一条通过全屏四边形将源纹理渲染到目标渲染纹理指令。
	 * @param	source 源纹理。
	 * @param	dest  目标纹理。
	 * @param	offsetScale 偏移缩放。
	 * @param	shader 着色器,如果为null使用内部拷贝着色器,不做任何处理。
	 * @param	shaderData 着色器数据,如果为null只接收sourceTexture。
	 * @param	subShader subShader索引,默认值为0。
	 */
	blitScreenQuad(source: BaseTexture, dest: RenderTexture, offsetScale: Vector4 = null, shader: Shader3D = null, shaderData: ShaderData = null, subShader: number = 0): void {
		this._commands.push(BlitScreenQuadCMD.create(source, dest, offsetScale, shader, shaderData, subShader, BlitScreenQuadCMD._SCREENTYPE_QUAD));
	}

	/**
	 * 添加一条通过全屏三角形将源纹理渲染到目标渲染纹理指令。
	 * @param	source 源纹理。
	 * @param	dest  目标纹理。
	 * @param	offsetScale 偏移缩放。
	 * @param	shader 着色器,如果为null使用内部拷贝着色器,不做任何处理。
	 * @param	shaderData 着色器数据,如果为null只接收sourceTexture。
	 * @param	subShader subShader索引,默认值为0。
	 */
	blitScreenTriangle(source: BaseTexture, dest: RenderTexture, offsetScale: Vector4 = null, shader: Shader3D = null, shaderData: ShaderData = null, subShader: number = 0): void {
		this._commands.push(BlitScreenQuadCMD.create(source, dest, offsetScale, shader, shaderData, subShader, BlitScreenQuadCMD._SCREENTYPE_TRIANGLE));
	}

	/**
	 *@internal
	 */
	setRenderTarget(renderTexture: RenderTexture): void {
		this._commands.push(SetRenderTargetCMD.create(renderTexture));
	}

	/**
	 *@internal
	 */
	clear(): void {
		for (var i: number = 0, n: number = this._commands.length; i < n; i++)
			this._commands[i].recover();
		this._commands.length = 0;
	}

}


