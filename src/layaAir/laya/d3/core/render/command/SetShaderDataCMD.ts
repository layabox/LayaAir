import { Command } from "./Command";
import { BaseTexture } from "../../../../resource/BaseTexture";
import { Vector2 } from "../../../math/Vector2";
import { Vector3 } from "../../../math/Vector3";
import { Vector4 } from "../../../math/Vector4";
import { Matrix4x4 } from "../../../math/Matrix4x4";
import { CommandBuffer } from "./CommandBuffer";
import { ShaderData, ShaderDataType } from "../../../../RenderEngine/RenderShader/ShaderData";
import { ShaderDefine } from "../../../../RenderEngine/RenderShader/ShaderDefine";
import { Shader3D } from "../../../../RenderEngine/RenderShader/Shader3D";

/**
 * @internal
 * <code>SetShaderDataTextureCMD</code> 类用于创建设置渲染目标指令。
 */
export class SetShaderDataCMD extends Command {
	static ShaderDataType_define:number = -2;
	/**@internal */
	private static _pool: any[] = [];

	/**@internal */
	private _shaderData: ShaderData = null;
	/**@internal */
	private _nameID: number|string = 0;
	/**@internal */
	private _value: number|BaseTexture|boolean|Vector2|Vector3|Vector4|Float32Array|Matrix4x4 = null;
	/**@internal */
	private _dataType:number = -1;

	/**
	 * @internal
	 */
	static create(shaderData: ShaderData, nameID: number|string, value:any,shaderDataType:ShaderDataType|number,commandBuffer:CommandBuffer): SetShaderDataCMD {
		var cmd: SetShaderDataCMD;
		cmd = SetShaderDataCMD._pool.length > 0 ? SetShaderDataCMD._pool.pop() : new SetShaderDataCMD();
		cmd._shaderData = shaderData;
		cmd._nameID = nameID;
		cmd._value = value.clone?value.clone():value;
		cmd._dataType = shaderDataType;
		cmd._commandBuffer = commandBuffer;
		return cmd;
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	run(): void {
		switch(this._dataType){
			case ShaderDataType.Int:
				this._shaderData.setInt(this._nameID as number,this._value as number);
				break;
			case ShaderDataType.Float:
				this._shaderData.setNumber(this._nameID as number,this._value as number);
				break;
			case ShaderDataType.Bool:
				this._shaderData.setBool(this._nameID as number,this._value as boolean);
				break;
			case ShaderDataType.Matrix4x4:
				this._shaderData.setMatrix4x4(this._nameID as number,this._value as Matrix4x4);
				break;
			case ShaderDataType.Texture2D:
				this._shaderData.setTexture(this._nameID as number,this._value as BaseTexture);
				break;
			case ShaderDataType.Vector4:
				this._shaderData.setVector(this._nameID as number,this._value as Vector4);
				break;
			case ShaderDataType.Vector2:
				this._shaderData.setVector2(this._nameID as number,this._value as Vector2);
				break;
			case ShaderDataType.Vector3:
				this._shaderData.setVector3(this._nameID as number,this._value as Vector3);
				break;
			case ShaderDataType.Buffer:
				this._shaderData.setBuffer( this._nameID as number,this._value as Float32Array);
				break;
			// case ShaderDataType.ShaderDefine:
			// 	let defineData :ShaderDefine = Shader3D.getDefineByName(this._nameID as string);
			// 	if(this._value)
			// 	this._shaderData.addDefine(defineData);
			// 	else
			// 	this._shaderData.removeDefine(defineData);
			// 	break;

			default:
				if(this._dataType==SetShaderDataCMD.ShaderDataType_define){
					let defineData :ShaderDefine = Shader3D.getDefineByName(this._nameID as string);
						if(this._value)
						this._shaderData.addDefine(defineData);
						else
						this._shaderData.removeDefine(defineData);
						break;
				}else
					throw "no type shaderValue on this CommendBuffer";
		}
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	recover(): void {
		SetShaderDataCMD._pool.push(this);
		this._shaderData = null;
		this._nameID = 0;
		this._value = null;
		this._dataType = -1;
	}

}


