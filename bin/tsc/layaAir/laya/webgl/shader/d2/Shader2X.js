import { Shader } from "../Shader";
export class Shader2X extends Shader {
    constructor(vs, ps, saveName = null, nameMap = null, bindAttrib = null) {
        super(vs, ps, saveName, nameMap, bindAttrib);
        this._params2dQuick2 = null;
        this._shaderValueWidth = 0;
        this._shaderValueHeight = 0;
    }
    //TODO:coverage
    /*override*/ _disposeResource() {
        super._disposeResource();
        this._params2dQuick2 = null;
    }
    //TODO:coverage
    upload2dQuick2(shaderValue) {
        this.upload(shaderValue, this._params2dQuick2 || this._make2dQuick2());
    }
    //去掉size的所有的uniform
    _make2dQuick2() {
        if (!this._params2dQuick2) {
            this._params2dQuick2 = [];
            var params = this._params, one;
            for (var i = 0, n = params.length; i < n; i++) {
                one = params[i];
                if (one.name !== "size")
                    this._params2dQuick2.push(one);
            }
        }
        return this._params2dQuick2;
    }
    static create(vs, ps, saveName = null, nameMap = null, bindAttrib = null) {
        return new Shader2X(vs, ps, saveName, nameMap, bindAttrib);
    }
}
