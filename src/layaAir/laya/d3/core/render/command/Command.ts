import { IRenderCMD } from "../../../../RenderDriver/DriverDesign/RenderDevice/IRenderCMD";
import { ShaderData } from "../../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { Shader3D } from "../../../../RenderEngine/RenderShader/Shader3D";
import { LayaGL } from "../../../../layagl/LayaGL";
import { RenderContext3D } from "../RenderContext3D";
import { CommandBuffer } from "./CommandBuffer";



/**
 * @en The `Command` class is used to create commands.
 * @zh `Command` 类用于创建指令。
 */
export class Command {
	/**@internal */
	static _screenShaderData: ShaderData;
	/** @internal */
	static _screenShader: Shader3D;

	/** @internal */
	static SCREENTEXTURE_NAME: string = "u_MainTex";
	/** @internal */
	static SCREENTEXTUREOFFSETSCALE_NAME: string = "u_OffsetScale";
	/** @internal */
	static MAINTEXTURE_TEXELSIZE_NAME: string = "u_MainTex_TexelSize";
	/** @internal */
	static SCREENTEXTURE_ID: number;
	/** @internal */
	static SCREENTEXTUREOFFSETSCALE_ID: number;
	/** @internal */
	static MAINTEXTURE_TEXELSIZE_ID: number;

	/**@internal */
	_commandBuffer: CommandBuffer = null;
	/**@internal */
	_context: RenderContext3D;
	/**
	* @internal
	*/
	static __init__(): void {
		Command._screenShaderData = LayaGL.renderDeviceFactory.createShaderData(null);
		Command._screenShader = Shader3D.find("BlitScreen");
		Command.SCREENTEXTURE_ID = Shader3D.propertyNameToID(Command.SCREENTEXTURE_NAME);//todo：
		Command.SCREENTEXTUREOFFSETSCALE_ID = Shader3D.propertyNameToID(Command.SCREENTEXTUREOFFSETSCALE_NAME);//todo：
		Command.MAINTEXTURE_TEXELSIZE_ID = Shader3D.propertyNameToID(Command.MAINTEXTURE_TEXELSIZE_NAME);//todo：
	}
	/**@ignore */
	constructor() {

	}

	/**
	 * @en Organizes rendering commands.
	 * @zh 组织渲染指令。
	 */
	run?(): void;

	/**
	 * @en Recycles the rendering command.
	 * @zh 回收渲染指令。
	 */
	recover(): void {
		this._commandBuffer = null;
	}

	/**
	 * @override
	 * @internal
	 * @returns 
	 */
	getRenderCMD?(): IRenderCMD;

	/**
	 * @internal
	 * @destroy
	 */
	destroy() {
		this._commandBuffer = null;
		this._context = null;
	}

}


