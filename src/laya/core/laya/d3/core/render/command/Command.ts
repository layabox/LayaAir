import { Shader3D } from "laya/d3/shader/Shader3D";
import { ShaderData } from "laya/d3/shader/ShaderData";
import { CommandBuffer } from "././CommandBuffer";

/**
 * @private
 * <code>Command</code> 类用于创建指令。
 */
export class Command {
	/**@private */
	static _screenShaderData: ShaderData;
	/** @private */
	static _screenShader: Shader3D;

	/** @private */
	static SCREENTEXTURE_NAME: string = "u_MainTex";//todo：
	/** @private */
	static MAINTEXTURE_TEXELSIZE_NAME: string = "u_MainTex_TexelSize";//todo：
	/** @private */
	static SCREENTEXTURE_ID: number = Shader3D.propertyNameToID(Command.SCREENTEXTURE_NAME);//todo：
	/** @private */
	static MAINTEXTURE_TEXELSIZE_ID: number = Shader3D.propertyNameToID(Command.MAINTEXTURE_TEXELSIZE_NAME);//todo：

	/**@private */
	private _commandBuffer: CommandBuffer = null;

	/**
	* @private
	*/
	static __init__(): void {
		Command._screenShaderData = new ShaderData();
		Command._screenShader = Shader3D.find("BlitScreen");
	}

	/**
	 * 创建一个 <code>Command</code> 实例。
	 */
	constructor() {

	}

	/**
	 *@private
	 */
	run(): void {

	}

	/**
	 *@private
	 */
	recover(): void {
		this._commandBuffer = null;
	}

}


