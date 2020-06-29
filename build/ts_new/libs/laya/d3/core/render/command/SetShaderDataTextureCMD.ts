import { Command } from "./Command";
import { ShaderData } from "../../../shader/ShaderData"
import { BaseTexture } from "../../../../resource/BaseTexture";


/**
 * @internal
 * <code>SetShaderDataTextureCMD</code> 类用于创建设置渲染目标指令。
 */
export class SetShaderDataTextureCMD extends Command {
	/**@internal */
	private static _pool: any[] = [];

	/**@internal */
	private _shaderData: ShaderData = null;
	/**@internal */
	private _nameID: number = 0;
	/**@internal */
	private _texture: BaseTexture = null;

	/**
	 * @internal
	 */
	static create(shaderData: ShaderData, nameID: number, texture: BaseTexture): SetShaderDataTextureCMD {
		var cmd: SetShaderDataTextureCMD;
		cmd = SetShaderDataTextureCMD._pool.length > 0 ? SetShaderDataTextureCMD._pool.pop() : new SetShaderDataTextureCMD();
		cmd._shaderData = shaderData;
		cmd._nameID = nameID;
		cmd._texture = texture;
		return cmd;
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	run(): void {
		this._shaderData.setTexture(this._nameID, this._texture);
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	recover(): void {
		SetShaderDataTextureCMD._pool.push(this);
		this._shaderData = null;
		this._nameID = 0;
		this._texture = null;
	}

}


