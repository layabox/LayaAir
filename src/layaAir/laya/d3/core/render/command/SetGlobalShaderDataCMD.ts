import { Command } from "./Command";
import { BaseTexture } from "../../../../resource/BaseTexture";
import { CommandBuffer } from "./CommandBuffer";
import { RenderContext3D } from "../RenderContext3D";
import { Color } from "../../../../maths/Color";
import { Matrix4x4 } from "../../../../maths/Matrix4x4";
import { Vector2 } from "../../../../maths/Vector2";
import { Vector3 } from "../../../../maths/Vector3";
import { Vector4 } from "../../../../maths/Vector4";
import { LayaGL } from "../../../../layagl/LayaGL";
import { ShaderDataItem, ShaderDataType } from "../../../../RenderDriver/RenderModuleData/Design/ShaderData";

/**
 * @internal
 * <code>SetShaderDataTextureCMD</code> 类用于创建设置渲染目标指令。
 */
export class SetGlobalShaderDataCMD extends Command {
	/**@internal */
	private static _pool: any[] = [];
	/**@internal */
	private _nameID: number = 0;
	/**@internal */
	private _value: ShaderDataItem = null;
	/**@internal */
	private _dataType:number = -1;

	/**
	 * @internal
	 */
	static create(nameID: number, value:any,shaderDataType:ShaderDataType,commandBuffer:CommandBuffer): SetGlobalShaderDataCMD {
		var cmd: SetGlobalShaderDataCMD;
		cmd = SetGlobalShaderDataCMD._pool.length > 0 ? SetGlobalShaderDataCMD._pool.pop() : new SetGlobalShaderDataCMD();
		cmd._nameID = nameID;
		cmd._value = value;
		cmd._dataType = shaderDataType;
		cmd._commandBuffer = commandBuffer;
		return cmd;
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	run(): void {
		//var shaderData:ShaderData = (this._commandBuffer._camera.scene as Scene3D)._shaderValues;
		let context = RenderContext3D._instance;
		let shaderData = context._contextOBJ.globalShaderData;
		if(!shaderData)
		shaderData = context._contextOBJ.globalShaderData = LayaGL.unitRenderModuleDataFactory.createShaderData(null);
		switch(this._dataType){
			case ShaderDataType.Int:
				shaderData.setInt(this._nameID,this._value as number);
				break;
			case ShaderDataType.Float:
				shaderData.setNumber(this._nameID,this._value as number);
				break;
			case ShaderDataType.Bool:
				shaderData.setBool(this._nameID,this._value as boolean);
				break;
			case ShaderDataType.Matrix4x4:
				shaderData.setMatrix4x4(this._nameID,this._value as Matrix4x4);
				break;
			case ShaderDataType.Texture2D:
				shaderData.setTexture(this._nameID,this._value as BaseTexture);
				break;
			case ShaderDataType.Vector4:
				shaderData.setVector(this._nameID,this._value as Vector4);
				break;
			case ShaderDataType.Vector2:
				shaderData.setVector2(this._nameID,this._value as Vector2);
				break;
			case ShaderDataType.Vector3:
				shaderData.setVector3(this._nameID,this._value as Vector3);
				break;
			case ShaderDataType.Buffer:
				shaderData.setBuffer(this._nameID,this._value as Float32Array);
				break;
			case ShaderDataType.Color:
				shaderData.setColor(this._nameID,this._value as Color);
				break;
			default:
				throw "no type shaderValue on this CommendBuffer";
		}
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	recover(): void {
		SetGlobalShaderDataCMD._pool.push(this);
		this._nameID = 0;
		this._value = null;
		this._dataType = -1;
	}

}


