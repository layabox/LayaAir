import { Command } from "./Command";
import { CommandBuffer } from "./CommandBuffer";
import { ShaderData, ShaderDataItem, ShaderDataType } from "../../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { SetRenderDataCMD, SetShaderDefineCMD } from "../../../../RenderDriver/DriverDesign/3DRenderPass/IRendderCMD";
import { ShaderDefine } from "../../../../RenderDriver/RenderModuleData/Design/ShaderDefine";
import { Laya3DRender } from "../../../RenderObjs/Laya3DRender";

/**
 * @internal
 * <code>SetShaderDataTextureCMD</code> 类用于创建设置渲染目标指令。
 */
export class SetShaderDataCMD extends Command {
	static ShaderDataType_define: number = -2;
	/**@internal */
	private static _pool: SetShaderDataCMD[] = [];

	/**@internal */
	_setRenderDataCMD: SetRenderDataCMD;

	/**
	 * @internal
	 */
	static create(shaderData: ShaderData, nameID: number, value: ShaderDataItem, shaderDataType: ShaderDataType, commandBuffer: CommandBuffer): SetShaderDataCMD {
		var cmd: SetShaderDataCMD;
		cmd = SetShaderDataCMD._pool.length > 0 ? SetShaderDataCMD._pool.pop() : new SetShaderDataCMD();
		cmd._setRenderDataCMD.dest = shaderData;
		cmd._setRenderDataCMD.propertyID = nameID;
		cmd._setRenderDataCMD.dataType = shaderDataType;
		cmd._setRenderDataCMD.value = value;
		cmd._commandBuffer = commandBuffer;
		return cmd;
	}

	constructor() {
		super();
		this._setRenderDataCMD = Laya3DRender.Render3DPassFactory.createSetRenderDataCMD();
	}

	/**
	 * @override
	 * @internal
	 * @returns 
	 */
	getRenderCMD(): SetRenderDataCMD {
		return this._setRenderDataCMD;
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	recover(): void {
		SetShaderDataCMD._pool.push(this);
	}
}

export class SetDefineCMD extends Command {
	/**@internal */
	private static _pool: any[] = [];

	/**@internal */
	_setRenderDefineCMD: SetShaderDefineCMD;

	/**
	 * @internal
	 */
	static create(shaderData: ShaderData, define: ShaderDefine, addDefine: boolean, commandBuffer: CommandBuffer): SetDefineCMD {
		var cmd: SetDefineCMD;
		cmd = SetDefineCMD._pool.length > 0 ? SetDefineCMD._pool.pop() : new SetDefineCMD();
		cmd._setRenderDefineCMD.dest = shaderData;
		cmd._setRenderDefineCMD.add = addDefine;
		cmd._setRenderDefineCMD.define = define;
		cmd._commandBuffer = commandBuffer;
		return cmd;
	}

	constructor() {
		super();
		this._setRenderDefineCMD = Laya3DRender.Render3DPassFactory.createSetShaderDefineCMD();
	}

	/**
	 * @override
	 * @internal
	 * @returns 
	 */
	getRenderCMD(): SetShaderDefineCMD {
		return this._setRenderDefineCMD;
	}
	/**
	 * @inheritDoc
	 * @override
	 */
	recover(): void {
		SetDefineCMD._pool.push(this);
	}
}


