import { RenderTexture } from "../../../resource/RenderTexture";
import { Shader3D } from "../../../shader/Shader3D";
import { ShaderData } from "../../../shader/ShaderData";
import { Camera } from "../../Camera";
import { BlitScreenQuadCMD } from "./BlitScreenQuadCMD";
import { SetRenderTargetCMD } from "./SetRenderTargetCMD";
import { SetShaderDataTextureCMD } from "./SetShaderDataTextureCMD";
import { Command } from "./Command";
import { BaseTexture } from "../../../../resource/BaseTexture";
import { Vector4 } from "../../../math/Vector4";
import { Mesh } from "../../../resource/models/Mesh";
import { Matrix4x4 } from "../../../math/Matrix4x4";
import { Material } from "../../material/Material";
import { SetShaderDataCMD, ShaderDataCMDType } from "./SetShaderDataCMD";
import { Vector3 } from "../../../math/Vector3";
import { Vector2 } from "../../../math/Vector2";

/**
 * <code>CommandBuffer</code> 类用于创建命令流。
 */
export class CommandBuffer {
	/**@internal */
	_camera: Camera = null;
	/**@internal */
	private _commands: Command[] = [];

	/**
	 * 创建一个 <code>CommandBuffer</code> 实例。
	 */
	constructor() {

	}

	/**
	 * 调用所有渲染指令
	 *@internal
	 */
	_apply(): void {
		for (var i: number = 0, n: number = this._commands.length; i < n; i++)
			this._commands[i].run();
	}

	/**
	 * 设置shader图片数据
	 * @param shaderData 
	 * @param nameID 
	 * @param source 
	 */
	setShaderDataTexture(shaderData: ShaderData, nameID: number, source: BaseTexture): void {
		this._commands.push(SetShaderDataTextureCMD.create(shaderData, nameID, source));
	}

	/**
	 * 设置shader Vector4数据
	 * @param shaderData 
	 * @param nameID 
	 * @param value 
	 */
	setShaderDataVector(shaderData:ShaderData,nameID,value:Vector4):void{
		this._commands.push(SetShaderDataCMD.create(shaderData,nameID,value,ShaderDataCMDType.Vector));
	}

	/**
	 * 设置shader Vector3数据
	 * @param shaderData 
	 * @param nameID 
	 * @param value 
	 */
	setShaderDataVector3(shaderData:ShaderData,nameID,value:Vector3):void{
		this._commands.push(SetShaderDataCMD.create(shaderData,nameID,value,ShaderDataCMDType.Vector3));
	}

	/**
	 * 设置shader Vector2数据
	 * @param shaderData 
	 * @param nameID 
	 * @param value 
	 */
	setShaderDataVector2(shaderData:ShaderData,nameID,value:Vector2):void{
		this._commands.push(SetShaderDataCMD.create(shaderData,nameID,value,ShaderDataCMDType.Vector2));
	}

	/**
	 * 设置shader Number属性
	 * @param shaderData 
	 * @param nameID 
	 * @param value 
	 */
	setShaderDataNumber(shaderData:ShaderData,nameID,value:number):void{
		this._commands.push(SetShaderDataCMD.create(shaderData,nameID,value,ShaderDataCMDType.Number));
	}

	/**
	 * 设置shader Int属性
	 * @param shaderData 
	 * @param nameID 
	 * @param value 
	 */
	setShaderDataInt(shaderData:ShaderData,nameID,value:number):void{
		this._commands.push(SetShaderDataCMD.create(shaderData,nameID,value,ShaderDataCMDType.Int));
	}

	/**
	 * 设置shader Matrix属性
	 * @param shaderData 
	 * @param nameID 
	 * @param value 
	 */
	setShaderDataMatrix(shaderData:ShaderData,nameID,value:Matrix4x4):void{
		this._commands.push(SetShaderDataCMD.create(shaderData,nameID,value,ShaderDataCMDType.Matrix4x4));
	}

	/**
	 * 添加一条通过全屏四边形将源纹理渲染到目标渲染纹理指令。
	 * @param	source 源纹理。
	 * @param	dest  目标纹理。
	 * @param	offsetScale 偏移缩放。
	 * @param	shader 着色器,如果为null使用内部拷贝着色器,不做任何处理。
	 * @param	shaderData 着色器数据,如果为null只接收sourceTexture。
	 * @param	subShader subShader索引,默认值为0。
	 */
	blitScreenQuad(source: BaseTexture, dest: RenderTexture, offsetScale: Vector4 = null, shader: Shader3D = null, shaderData: ShaderData = null, subShader: number = 0): void {
		this._commands.push(BlitScreenQuadCMD.create(source, dest, offsetScale, shader, shaderData, subShader, BlitScreenQuadCMD._SCREENTYPE_QUAD));
	}

	/**
	 * 添加一条通过全屏三角形将源纹理渲染到目标渲染纹理指令。
	 * @param	source 源纹理。
	 * @param	dest  目标纹理。
	 * @param	offsetScale 偏移缩放。
	 * @param	shader 着色器,如果为null使用内部拷贝着色器,不做任何处理。
	 * @param	shaderData 着色器数据,如果为null只接收sourceTexture。
	 * @param	subShader subShader索引,默认值为0。
	 */
	blitScreenTriangle(source: BaseTexture, dest: RenderTexture, offsetScale: Vector4 = null, shader: Shader3D = null, shaderData: ShaderData = null, subShader: number = 0): void {
		this._commands.push(BlitScreenQuadCMD.create(source, dest, offsetScale, shader, shaderData, subShader, BlitScreenQuadCMD._SCREENTYPE_TRIANGLE));
	}

	/**
	 * 设置指令渲染目标
	 *@internal
	 */
	setRenderTarget(renderTexture: RenderTexture): void {
		this._commands.push(SetRenderTargetCMD.create(renderTexture));
	}

	/**
	 * miner TODO:
	 * @param mesh 
	 * @param matrix 
	 * @param material 
	 * @param submeshIndex 
	 * @param shaderPass 
	 */
	drawMesh(mesh:Mesh,matrix:Matrix4x4, material:Material ,submeshIndex:number,shaderPass:number){
		
	}

	/**
	 *@internal
	 */
	clear(): void {
		for (var i: number = 0, n: number = this._commands.length; i < n; i++)
			this._commands[i].recover();
		this._commands.length = 0;
	}

}


