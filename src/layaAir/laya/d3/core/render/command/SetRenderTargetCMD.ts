import { Command } from "./Command";
import { RenderTexture } from "../../../resource/RenderTexture"

/**
 * @internal
 * <code>SetRenderTargetCMD</code> 类用于创建设置渲染目标指令。
 */
export class SetRenderTargetCMD extends Command {
	/**@internal */
	private static _pool: any[] = [];

	/**@internal */
	private _renderTexture: RenderTexture = null;

	/**
	 * @internal
	 */
	static create(renderTexture: RenderTexture): SetRenderTargetCMD {
		var cmd: SetRenderTargetCMD;
		cmd = SetRenderTargetCMD._pool.length > 0 ? SetRenderTargetCMD._pool.pop() : new SetRenderTargetCMD();
		cmd._renderTexture = renderTexture;
		return cmd;
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	run(): void {
		this._renderTexture._start();
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	recover(): void {
		SetRenderTargetCMD._pool.push(this);
		this._renderTexture = null;
	}

}


