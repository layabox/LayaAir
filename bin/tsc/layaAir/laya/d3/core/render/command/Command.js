import { Shader3D } from "../../../../d3/shader/Shader3D";
import { ShaderData } from "../../../../d3/shader/ShaderData";
/**
 * @internal
 * <code>Command</code> 类用于创建指令。
 */
export class Command {
    /**
     * 创建一个 <code>Command</code> 实例。
     */
    constructor() {
        /**@internal */
        this._commandBuffer = null;
    }
    /**
    * @internal
    */
    static __init__() {
        Command._screenShaderData = new ShaderData();
        Command._screenShader = Shader3D.find("BlitScreen");
    }
    /**
     *@internal
     */
    run() {
    }
    /**
     *@internal
     */
    recover() {
        this._commandBuffer = null;
    }
}
/** @internal */
Command.SCREENTEXTURE_NAME = "u_MainTex"; //todo：
/** @internal */
Command.MAINTEXTURE_TEXELSIZE_NAME = "u_MainTex_TexelSize"; //todo：
/** @internal */
Command.SCREENTEXTURE_ID = Shader3D.propertyNameToID(Command.SCREENTEXTURE_NAME); //todo：
/** @internal */
Command.MAINTEXTURE_TEXELSIZE_ID = Shader3D.propertyNameToID(Command.MAINTEXTURE_TEXELSIZE_NAME); //todo：
