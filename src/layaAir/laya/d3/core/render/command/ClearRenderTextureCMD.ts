import { LayaGL } from "../../../../layagl/LayaGL";
import { Color } from "../../../../maths/Color";
import { RenderClearFlag } from "../../../../RenderEngine/RenderEnum/RenderClearFlag";
import { Command } from "./Command";
import { CommandBuffer } from "./CommandBuffer";


/**
 * @internal
 * <code>SetShaderDataTextureCMD</code> 类用于创建设置渲染目标指令。
 */
export class ClearRenderTextureCMD extends Command {
	/**@internal */
	private static _pool: any[] = [];
	/**@internal */
	private _clearColor: boolean = false;
	/**@internal */
	private _clearDepth: boolean = false;
	/**@internal */
	private _backgroundColor: Color = new Color();
	/**@internal */
	private _linearbackgroundColor: Color = new Color();
	/**@internal */
	private _depth: number = 1;
	/**
	 * @internal
	 */
	static create(clearColor: boolean, clearDepth: boolean, backgroundColor: Color, depth: number = 1, commandBuffer: CommandBuffer): ClearRenderTextureCMD {
		var cmd: ClearRenderTextureCMD;
		cmd = ClearRenderTextureCMD._pool.length > 0 ? ClearRenderTextureCMD._pool.pop() : new ClearRenderTextureCMD();
		cmd._clearColor = clearColor;
		cmd._clearDepth = clearDepth;
		backgroundColor.cloneTo(cmd._backgroundColor);
		backgroundColor.toLinear(cmd._linearbackgroundColor);
		cmd._depth = depth;
		cmd._commandBuffer = commandBuffer;
		return cmd;
	}


	/**
	 * @inheritDoc
	 * @override
	 */
	run(): void {
		var flag: number;
		// var backgroundColor: Color = this._backgroundColor;
		let linearBgColor = this._linearbackgroundColor;
		if (this._clearDepth && this._clearColor) {
			LayaGL.renderEngine.clearRenderTexture(RenderClearFlag.Color | RenderClearFlag.Depth, linearBgColor, this._depth);
		} else if (this._clearDepth) {
			LayaGL.renderEngine.clearRenderTexture(RenderClearFlag.Depth, linearBgColor, this._depth);
		} else if (this._clearColor) {
			LayaGL.renderEngine.clearRenderTexture(RenderClearFlag.Color, linearBgColor, this._depth);
		}
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	recover(): void {

	}

}


