import { Command } from "./Command";
import { ShaderData } from "../../../shader/ShaderData"
import { BaseTexture } from "../../../../resource/BaseTexture";


/**
 * @internal
 * <code>SetShaderDataTextureCMD</code> 类用于创建设置渲染目标指令。
 */
export class DrawRenderCMD extends Command {
	/**@internal */
	private static _pool: any[] = [];

	/**
	 * @internal
	 */
	static create(shaderData: ShaderData, nameID: number, texture: BaseTexture): DrawRenderCMD {
		var cmd: DrawRenderCMD;
		return cmd;
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	run(): void {
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	recover(): void {
		DrawRenderCMD._pool.push(this);
	
	}

}


