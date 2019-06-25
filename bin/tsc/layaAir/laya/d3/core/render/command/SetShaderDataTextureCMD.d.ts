import { Command } from "././Command";
import { ShaderData } from "../../../shader/ShaderData";
import { BaseTexture } from "../../../../resource/BaseTexture";
/**
 * @private
 * <code>SetShaderDataTextureCMD</code> 类用于创建设置渲染目标指令。
 */
export declare class SetShaderDataTextureCMD extends Command {
    /**@private */
    private static _pool;
    /**@private */
    private _shaderData;
    /**@private */
    private _nameID;
    /**@private */
    private _texture;
    /**
     * @private
     */
    static create(shaderData: ShaderData, nameID: number, texture: BaseTexture): SetShaderDataTextureCMD;
    /**
     * @inheritDoc
     */
    run(): void;
    /**
     * @inheritDoc
     */
    recover(): void;
}
