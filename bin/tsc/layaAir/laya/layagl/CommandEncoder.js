/**
 * @private
 * CommandEncoder
 */
export class CommandEncoder {
    //TODO:coverage
    constructor(layagl, reserveSize, adjustSize, isSyncToRenderThread) {
        /**@internal */
        this._idata = [];
    }
    //TODO:coverage
    getArrayData() {
        return this._idata;
    }
    //TODO:coverage
    getPtrID() {
        return 0;
    }
    beginEncoding() {
    }
    endEncoding() {
    }
    //TODO:coverage
    clearEncoding() {
        this._idata.length = 0;
    }
    //TODO:coverage
    getCount() {
        return this._idata.length;
    }
    //TODO:coverage
    add_ShaderValue(o) {
        this._idata.push(o);
    }
    //TODO:coverage
    addShaderUniform(one) {
        this.add_ShaderValue(one);
    }
}
