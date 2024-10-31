import { Command } from "./Command";
import { CommandBuffer } from "./CommandBuffer";
import { RenderContext3D } from "../RenderContext3D";
import { LayaGL } from "../../../../layagl/LayaGL";
import { ShaderDataType } from "../../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { SetShaderDataCMD } from "./SetShaderDataCMD";

/**
 * @internal
 * @en SetGlobalShaderDataCMD class is used to create a command for setting global shader data.
 * @zh SetGlobalShaderDataCMD 类用于创建设置全局着色器数据的指令。
 */
export class SetGlobalShaderDataCMD extends Command {
	/**
	 * @internal
	 * @en Creates a SetGlobalShaderDataCMD instance.
	 * @param nameID The ID of the shader property name.
	 * @param value The value to set for the shader property.
	 * @param shaderDataType The type of shader data.
	 * @param commandBuffer The command buffer to which this command will be added.
	 * @returns A new SetGlobalShaderDataCMD instance.
	 * @zh 创建一个 SetGlobalShaderDataCMD 实例。
	 * @param nameID 着色器属性名称的ID。
	 * @param value 要为着色器属性设置的值。
	 * @param shaderDataType 着色器数据的类型。
	 * @param commandBuffer 将添加此命令的命令缓冲区。
	 * @returns 一个新的 SetGlobalShaderDataCMD 实例。
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


