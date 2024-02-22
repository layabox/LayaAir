import { Command } from "./Command";
import { RenderTexture } from "../../../../resource/RenderTexture";
import { CommandBuffer } from "./CommandBuffer";
import { Color } from "../../../../maths/Color";
import { Laya3DRender } from "../../../RenderObjs/Laya3DRender";
import { SetRenderTargetCMD } from "../../../../RenderDriver/DriverDesign/3DRenderPass/IRendderCMD";
import { RenderClearFlag } from "../../../../RenderEngine/RenderEnum/RenderClearFlag";

/**
 * @internal
 * <code>SetRTCMD</code> 类用于创建设置渲染目标指令。
 */
export class SetRTCMD extends Command {
	/**@internal */
	private static _pool: any[] = [];

	/**
	 * @internal
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
		if (stencil) {
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
	 * @returns 
	 */
	getRenderCMD(): SetRenderTargetCMD {
		return this._setRenderTargetCMD;
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	recover(): void {
		SetRTCMD._pool.push(this);
		this._renderTexture = null;
	}
}


