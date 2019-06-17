import { Command } from "././Command";
/**
 * @private
 * <code>SetShaderDataTextureCMD</code> 类用于创建设置渲染目标指令。
 */
export class SetShaderDataTextureCMD extends Command {
    constructor() {
        super(...arguments);
        /**@private */
        this._shaderData = null;
        /**@private */
        this._nameID = 0;
        /**@private */
        this._texture = null;
    }
    /**
     * @private
     */
    static create(shaderData, nameID, texture) {
        var cmd;
        cmd = SetShaderDataTextureCMD._pool.length > 0 ? SetShaderDataTextureCMD._pool.pop() : new SetShaderDataTextureCMD();
        cmd._shaderData = shaderData;
        cmd._nameID = nameID;
        cmd._texture = texture;
        return cmd;
    }
    /**
     * @inheritDoc
     */
    /*override*/ run() {
        this._shaderData.setTexture(this._nameID, this._texture);
    }
    /**
     * @inheritDoc
     */
    /*override*/ recover() {
        SetShaderDataTextureCMD._pool.push(this);
        this._shaderData = null;
        this._nameID = 0;
        this._texture = null;
    }
}
/**@private */
SetShaderDataTextureCMD._pool = [];
