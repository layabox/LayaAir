import { Command } from "./Command";
import { CommandBuffer } from "./CommandBuffer";
import { RenderContext3D } from "../RenderContext3D";
import { LayaGL } from "../../../../layagl/LayaGL";
import { ShaderDataType } from "../../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { SetRenderDataCMD } from "../../../../RenderDriver/DriverDesign/3DRenderPass/IRendderCMD";
import { SetShaderDataCMD } from "./SetShaderDataCMD";

/**
 * @internal
 * <code>SetShaderDataTextureCMD</code> 类用于创建设置渲染目标指令。
 */
export class SetGlobalShaderDataCMD extends Command {
	/**
	 * @internal
	 */
	static create(nameID: number, value: any, shaderDataType: ShaderDataType, commandBuffer: CommandBuffer): SetGlobalShaderDataCMD {

		let context = RenderContext3D._instance;
		let shaderData = context._contextOBJ.globalShaderData;

		if (!shaderData)
			shaderData = context._contextOBJ.globalShaderData = LayaGL.renderDeviceFactory.createShaderData(null);
		var cmd = SetShaderDataCMD.create(shaderData, nameID, value, shaderDataType, commandBuffer);
		return cmd;
	}
}


