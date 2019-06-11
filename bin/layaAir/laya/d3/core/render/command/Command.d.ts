import { Shader3D } from "laya/d3/shader/Shader3D";
import { ShaderData } from "laya/d3/shader/ShaderData";
/**
 * @private
 * <code>Command</code> 类用于创建指令。
 */
export declare class Command {
    /**@private */
    static _screenShaderData: ShaderData;
    /** @private */
    static _screenShader: Shader3D;
    /** @private */
    static SCREENTEXTURE_NAME: string;
    /** @private */
    static MAINTEXTURE_TEXELSIZE_NAME: string;
    /** @private */
    static SCREENTEXTURE_ID: number;
    /** @private */
    static MAINTEXTURE_TEXELSIZE_ID: number;
    /**@private */
    private _commandBuffer;
    /**
    * @private
    */
    static __init__(): void;
    /**
     * 创建一个 <code>Command</code> 实例。
     */
    constructor();
    /**
     *@private
     */
    run(): void;
    /**
     *@private
     */
    recover(): void;
}
