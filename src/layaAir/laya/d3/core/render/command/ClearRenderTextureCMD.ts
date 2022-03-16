import { LayaGL } from "../../../../layagl/LayaGL";
import { RenderClearFlag } from "../../../../RenderEngine/RenderEnum/RenderClearFlag";
import { Color } from "../../../math/Color";
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
		var backgroundColor: Color = this._backgroundColor;
		if(this._clearDepth&&this._clearColor){
			LayaGL.renderEngine.clearRenderTexture(RenderClearFlag.Color|RenderClearFlag.Depth,backgroundColor,this._depth);
		}else if(this._clearDepth){
			LayaGL.renderEngine.clearRenderTexture(RenderClearFlag.Depth,backgroundColor,this._depth);
		}else if(this._clearColor){
			LayaGL.renderEngine.clearRenderTexture(RenderClearFlag.Color,backgroundColor,this._depth);
		}  
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	recover(): void {

	}

}


