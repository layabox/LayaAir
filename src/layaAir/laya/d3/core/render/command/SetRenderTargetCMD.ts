import { Command } from "./Command";
import { RenderTexture } from "../../../../resource/RenderTexture";
import { CommandBuffer } from "./CommandBuffer";
import { Color } from "../../../../maths/Color";
import { Laya3DRender } from "../../../RenderObjs/Laya3DRender";
import { SetRenderTargetCMD } from "../../../../RenderDriver/DriverDesign/3DRenderPass/IRendderCMD";
import { RenderClearFlag } from "../../../../RenderEngine/RenderEnum/RenderClearFlag";

/**
 * @internal
 * @en SetRTCMD used to create a command to set the render target.
 * @zh SetRTCMD 类用于创建设置渲染目标指令。
 */
export class SetRTCMD extends Command {
	/**@internal */
	private static _pool: any[] = [];

	/**
	 * @internal
	 * @en Creates a SetRTCMD instance.
	 * @param renderTexture The render texture to set.
	 * @param clearColor Whether to clear the color buffer.
	 * @param clearDepth Whether to clear the depth buffer.
	 * @param clearStencil Whether to clear the stencil buffer.
	 * @param backgroundColor The background color to clear with.
	 * @param depth The depth value to clear with. Default is 1.
	 * @param stencil The stencil value to clear with. Default is 0.
	 * @param commandBuffer The command buffer to which this command will be added.
	 * @zh 创建一个 SetRTCMD 实例。
	 * @param renderTexture 要设置的渲染纹理。
	 * @param clearColor 是否清除颜色缓冲区。
	 * @param clearDepth 是否清除深度缓冲区。
	 * @param clearStencil 是否清除模板缓冲区。
	 * @param backgroundColor 用于清除的背景颜色。
	 * @param depth 用于清除的深度值。默认为1。
	 * @param stencil 用于清除的模板值。默认为0。
	 * @param commandBuffer 将添加此命令的命令缓冲区。
	 */
	static create(renderTexture: RenderTexture, clearColor: boolean, clearDepth: boolean, clearStencil: boolean, backgroundColor: Color, depth: number = 1, stencil: number = 0, commandBuffer: CommandBuffer): SetRTCMD {
		var cmd: SetRTCMD;
		cmd = SetRTCMD._pool.length > 0 ? SetRTCMD._pool.pop() : new SetRTCMD();
		cmd.renderTexture = renderTexture;
		let clearflag = 0;
		if (clearColor) {
			clearflag |= RenderClearFlag.Color;
			cmd._setRenderTargetCMD.clearColorValue = backgroundColor;
		}
		if (clearDepth) {
			clearflag |= RenderClearFlag.Depth;
			cmd._setRenderTargetCMD.clearDepthValue = depth;
		}
		if (clearStencil) {
			clearflag |= RenderClearFlag.Stencil;
			cmd._setRenderTargetCMD.clearStencilValue = stencil;
		}
		cmd._setRenderTargetCMD.clearFlag = clearflag;
		return cmd;
	}

	/**@internal */
	private _renderTexture: RenderTexture = null;

	/**@internal */
	_setRenderTargetCMD: SetRenderTargetCMD;

	/**
	 * @en The render texture.
	 * @zh 渲染纹理。
	 */
	public get renderTexture(): RenderTexture {
		return this._renderTexture;
	}
	public set renderTexture(value: RenderTexture) {
		this._renderTexture = value;
		this._setRenderTargetCMD.rt = value._renderTarget;
	}

	constructor() {
		super();
		this._setRenderTargetCMD = Laya3DRender.Render3DPassFactory.createSetRenderTargetCMD();
	}

	/**
	 * @override
	 * @internal
	 * @en Retrieves the render command.
	 * @zh 获取渲染命令。
	 */
	getRenderCMD(): SetRenderTargetCMD {
		return this._setRenderTargetCMD;
	}

	/**
	 * @inheritDoc
	 * @override
	 * @en Recycles the command object for later use.
	 * @zh 回收命令以便复用。
	 */
	recover(): void {
		SetRTCMD._pool.push(this);
		this._renderTexture = null;
	}
}


