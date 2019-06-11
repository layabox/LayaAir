import { Shader3D } from "laya/d3/shader/Shader3D";
import { ShaderData } from "laya/d3/shader/ShaderData";
/**
 * @private
 * <code>Command</code> 类用于创建指令。
 */
export class Command {
    /**
     * 创建一个 <code>Command</code> 实例。
     */
    constructor() {
        /**@private */
        this._commandBuffer = null;
    }
    /**
    * @private
    */
    static __init__() {
        Command._screenShaderData = new ShaderData();
        Command._screenShader = Shader3D.find("BlitScreen");
    }
    /**
     *@private
     */
    run() {
    }
    /**
     *@private
     */
    recover() {
        this._commandBuffer = null;
    }
}
/** @private */
Command.SCREENTEXTURE_NAME = "u_MainTex"; //todo：
/** @private */
Command.MAINTEXTURE_TEXELSIZE_NAME = "u_MainTex_TexelSize"; //todo：
/** @private */
Command.SCREENTEXTURE_ID = Shader3D.propertyNameToID(Command.SCREENTEXTURE_NAME); //todo：
/** @private */
Command.MAINTEXTURE_TEXELSIZE_ID = Shader3D.propertyNameToID(Command.MAINTEXTURE_TEXELSIZE_NAME); //todo：
