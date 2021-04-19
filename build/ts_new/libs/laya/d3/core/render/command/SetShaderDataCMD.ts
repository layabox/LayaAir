import { Command } from "./Command";
import { ShaderData } from "../../../shader/ShaderData"
import { BaseTexture } from "../../../../resource/BaseTexture";
import { Vector2 } from "../../../math/Vector2";
import { Vector3 } from "../../../math/Vector3";
import { Vector4 } from "../../../math/Vector4";
import { Quaternion } from "../../../math/Quaternion";
import { Matrix4x4 } from "../../../math/Matrix4x4";
import { CommandBuffer } from "./CommandBuffer";
export enum ShaderDataType{
	/**整数 */
	Int,
	/**布尔 */
	Bool,
	/**浮点数 */
	Number,
	/**2维数结构 */
	Vector2,
	/**3维数结构 */
	Vector3,
	/**4维数结构 */
	Vector4,
	/**四元数 */
	Quaternion,
	/**矩阵 */
	Matrix4x4,
	/**数组 */
	Buffer,
	/**图片 */
	Texture
}

/**
 * @internal
 * <code>SetShaderDataTextureCMD</code> 类用于创建设置渲染目标指令。
 */
export class SetShaderDataCMD extends Command {
	/**@internal */
	private static _pool: any[] = [];

	/**@internal */
	private _shaderData: ShaderData = null;
	/**@internal */
	private _nameID: number = 0;
	/**@internal */
	private _value: number|BaseTexture|boolean|Vector2|Vector3|Vector4|Float32Array|Quaternion|Matrix4x4 = null;
	/**@internal */
	private _dataType:number = -1;

	/**
	 * @internal
	 */
	static create(shaderData: ShaderData, nameID: number, value:any,shaderDataType:ShaderDataType,commandBuffer:CommandBuffer): SetShaderDataCMD {
		var cmd: SetShaderDataCMD;
		cmd = SetShaderDataCMD._pool.length > 0 ? SetShaderDataCMD._pool.pop() : new SetShaderDataCMD();
		cmd._shaderData = shaderData;
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
		switch(this._dataType){
			case ShaderDataType.Int:
				this._shaderData.setInt(this._nameID,this._value as number);
				break;
			case ShaderDataType.Number:
				this._shaderData.setNumber(this._nameID,this._value as number);
				break;
			case ShaderDataType.Bool:
				this._shaderData.setBool(this._nameID,this._value as boolean);
				break;
			case ShaderDataType.Matrix4x4:
				this._shaderData.setMatrix4x4(this._nameID,this._value as Matrix4x4);
				break;
			case ShaderDataType.Quaternion:
				this._shaderData.setQuaternion(this._nameID,this._value as Quaternion);
				break;
			case ShaderDataType.Texture:
				this._shaderData.setTexture(this._nameID,this._value as BaseTexture);
				break;
			case ShaderDataType.Vector4:
				this._shaderData.setVector(this._nameID,this._value as Vector4);
				break;
			case ShaderDataType.Vector2:
				this._shaderData.setVector2(this._nameID,this._value as Vector2);
				break;
			case ShaderDataType.Vector3:
				this._shaderData.setVector3(this._nameID,this._value as Vector3);
				break;
			case ShaderDataType.Buffer:
				this._shaderData.setBuffer(this._nameID,this._value as Float32Array);
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
		SetShaderDataCMD._pool.push(this);
		this._shaderData = null;
		this._nameID = 0;
		this._value = null;
		this._dataType = -1;
	}

}


