import { Shader3D } from "../../../../d3/shader/Shader3D";
import { ShaderData } from "../../../../d3/shader/ShaderData";
import { CommandBuffer } from "./CommandBuffer";

/**
 * <code>Command</code> 类用于创建指令。
 */
export class Command {
	/**@internal */
	static _screenShaderData: ShaderData;
	/** @internal */
	static _screenShader: Shader3D;

	/** @internal */
	static SCREENTEXTURE_NAME: string = "u_MainTex";//todo：
	/** @internal */
	static SCREENTEXTUREOFFSETSCALE_NAME: string = "u_OffsetScale";
	/** @internal */
	static MAINTEXTURE_TEXELSIZE_NAME: string = "u_MainTex_TexelSize";//todo：
	/** @internal */
	static SCREENTEXTURE_ID: number = Shader3D.propertyNameToID(Command.SCREENTEXTURE_NAME);//todo：
	/** @internal */
	static SCREENTEXTUREOFFSETSCALE_ID: number = Shader3D.propertyNameToID(Command.SCREENTEXTUREOFFSETSCALE_NAME);//todo：
	/** @internal */
	static MAINTEXTURE_TEXELSIZE_ID: number = Shader3D.propertyNameToID(Command.MAINTEXTURE_TEXELSIZE_NAME);//todo：

	/**@internal */
	private _commandBuffer: CommandBuffer = null;

	/**
	* @internal
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
	 *
	 */
	run(): void {

	}

	/**
	 *
	 */
	recover(): void {
		this._commandBuffer = null;
	}

}


