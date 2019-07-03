import { LayaGL } from "../../layagl/LayaGL";
export class Buffer {
    constructor() {
        this._byteLength = 0;
        this._glBuffer = LayaGL.instance.createBuffer();
    }
    get bufferUsage() {
        return this._bufferUsage;
    }
    /**
     * @private
     * 绕过全局状态判断,例如VAO局部状态设置
     */
    _bindForVAO() {
    }
    /**
     * @private
     */
    bind() {
        return false;
    }
    /**
     * @private
     */
    destroy() {
        if (this._glBuffer) {
            LayaGL.instance.deleteBuffer(this._glBuffer);
            this._glBuffer = null;
        }
    }
}
