import { LayaGL } from "../../../../layagl/LayaGL";
import { Vector4 } from "../../../math/Vector4";
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
	private _clearColor:boolean = false;
	/**@internal */
	private _clearDepth:boolean = false;
	/**@internal */
	private _backgroundColor:Vector4 = new Vector4();
	/**@internal */
	private _depth:number = 1;
	/**
	 * @internal
	 */
	static create(clearColor:boolean,clearDepth:boolean,backgroundColor:Vector4,depth:number = 1,commandBuffer:CommandBuffer): ClearRenderTextureCMD {
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
		var gl: WebGLRenderingContext = LayaGL.instance;
		var flag: number;
		var backgroundColor:Vector4 = this._backgroundColor;
		if(this._clearColor){
			gl.clearColor(backgroundColor.x,backgroundColor.y,backgroundColor.z,backgroundColor.w);
			flag|=gl.COLOR_BUFFER_BIT;
		}
		if(this._clearDepth){
			gl.clearDepth(this._depth);
			flag|=gl.DEPTH_BUFFER_BIT;
		}
		if(this._clearColor||this._clearDepth){
			gl.clear(flag);
		}		
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	recover(): void {
	
	}

}


