import { Command } from "././Command";
import { RenderTexture } from "../../../resource/RenderTexture";
/**
 * @private
 * <code>SetRenderTargetCMD</code> 类用于创建设置渲染目标指令。
 */
export declare class SetRenderTargetCMD extends Command {
    /**@private */
    private static _pool;
    /**@private */
    private _renderTexture;
    /**
     * @private
     */
    static create(renderTexture: RenderTexture): SetRenderTargetCMD;
    /**
     * @inheritDoc
     */
    run(): void;
    /**
     * @inheritDoc
     */
    recover(): void;
}
