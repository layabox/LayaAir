export class ShaderDefines {
    /**
     *
     */
    constructor(superDefines = null) {
        /**@internal */
        this._counter = 0;
        /**@internal [只读]*/
        this.defines = {};
        if (superDefines) {
            this._counter = superDefines._counter;
            for (var k in superDefines.defines)
                this.defines[k] = superDefines.defines[k];
        }
    }
    registerDefine(name) {
        var value = Math.pow(2, this._counter++); //TODO:超界处理
        this.defines[value] = name;
        return value;
    }
}
