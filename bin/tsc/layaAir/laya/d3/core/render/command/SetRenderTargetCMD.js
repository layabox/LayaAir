import { Command } from "././Command";
/**
 * @private
 * <code>SetRenderTargetCMD</code> 类用于创建设置渲染目标指令。
 */
export class SetRenderTargetCMD extends Command {
    constructor() {
        super(...arguments);
        /**@private */
        this._renderTexture = null;
    }
    /**
     * @private
     */
    static create(renderTexture) {
        var cmd;
        cmd = SetRenderTargetCMD._pool.length > 0 ? SetRenderTargetCMD._pool.pop() : new SetRenderTargetCMD();
        cmd._renderTexture = renderTexture;
        return cmd;
    }
    /**
     * @inheritDoc
     */
    /*override*/ run() {
        this._renderTexture._start();
    }
    /**
     * @inheritDoc
     */
    /*override*/ recover() {
        SetRenderTargetCMD._pool.push(this);
        this._renderTexture = null;
    }
}
/**@private */
SetRenderTargetCMD._pool = [];
