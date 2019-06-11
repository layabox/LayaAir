import { BaseTexture } from "laya/resource/BaseTexture";
import { RenderTexture } from "../../../resource/RenderTexture";
import { Shader3D } from "../../../shader/Shader3D";
import { ShaderData } from "../../../shader/ShaderData";
import { Command } from "././Command";
/**
 * @private
 * <code>BlitCMD</code> 类用于创建从一张渲染目标输出到另外一张渲染目标指令。
 */
export declare class BlitScreenQuadCMD extends Command {
    /**@private */
    static _SCREENTYPE_QUAD: number;
    /**@private */
    static _SCREENTYPE_TRIANGLE: number;
    /**@private */
    private static _pool;
    /**@private */
    private _source;
    /**@private */
    private _dest;
    /**@private */
    private _shader;
    /**@private */
    private _shaderData;
    /**@private */
    private _subShader;
    /**@private */
    private _sourceTexelSize;
    /**@private */
    private _screenType;
    /**
     * @private
     */
    static create(source: BaseTexture, dest: RenderTexture, shader?: Shader3D, shaderData?: ShaderData, subShader?: number, screenType?: number): BlitScreenQuadCMD;
    /**
     * @inheritDoc
     */
    run(): void;
    /**
     * @inheritDoc
     */
    recover(): void;
}
