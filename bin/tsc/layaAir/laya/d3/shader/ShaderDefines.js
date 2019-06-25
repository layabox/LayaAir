/**
     * @private
     */
export class ShaderDefines {
    /**
     * @private
     */
    constructor(superDefines = null) {
        /**@private */
        this._counter = 0;
        /**@private [只读]*/
        this.defines = {};
        if (superDefines) {
            this._counter = superDefines._counter;
            for (var k in superDefines.defines)
                this.defines[k] = superDefines.defines[k];
        }
    }
    /**
     * @private
     */
    registerDefine(name) {
        var value = Math.pow(2, this._counter++); //TODO:超界处理
        this.defines[value] = name;
        return value;
    }
}
