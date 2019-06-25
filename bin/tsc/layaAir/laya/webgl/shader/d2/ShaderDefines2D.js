import { ShaderDefinesBase } from "../ShaderDefinesBase";
export class ShaderDefines2D extends ShaderDefinesBase {
    constructor() {
        super(ShaderDefines2D.__name2int, ShaderDefines2D.__int2name, ShaderDefines2D.__int2nameMap);
    }
    static __init__() {
        ShaderDefines2D.reg("TEXTURE2D", ShaderDefines2D.TEXTURE2D);
        ShaderDefines2D.reg("PRIMITIVE", ShaderDefines2D.PRIMITIVE);
        ShaderDefines2D.reg("GLOW_FILTER", ShaderDefines2D.FILTERGLOW);
        ShaderDefines2D.reg("BLUR_FILTER", ShaderDefines2D.FILTERBLUR);
        ShaderDefines2D.reg("COLOR_FILTER", ShaderDefines2D.FILTERCOLOR);
        ShaderDefines2D.reg("COLOR_ADD", ShaderDefines2D.COLORADD);
        ShaderDefines2D.reg("WORLDMAT", ShaderDefines2D.WORLDMAT);
        ShaderDefines2D.reg("FILLTEXTURE", ShaderDefines2D.FILLTEXTURE);
        ShaderDefines2D.reg("FSHIGHPRECISION", ShaderDefines2D.SHADERDEFINE_FSHIGHPRECISION);
        ShaderDefines2D.reg('MVP3D', ShaderDefines2D.MVP3D);
    }
    static reg(name, value) {
        this._reg(name, value, ShaderDefines2D.__name2int, ShaderDefines2D.__int2name);
    }
    //TODO:coverage
    static toText(value, int2name, int2nameMap) {
        return this._toText(value, int2name, int2nameMap);
    }
    //TODO:coverage
    static toInt(names) {
        return this._toInt(names, ShaderDefines2D.__name2int);
    }
}
ShaderDefines2D.TEXTURE2D = 0x01;
ShaderDefines2D.PRIMITIVE = 0x04;
ShaderDefines2D.FILTERGLOW = 0x08;
ShaderDefines2D.FILTERBLUR = 0x10;
ShaderDefines2D.FILTERCOLOR = 0x20;
ShaderDefines2D.COLORADD = 0x40;
ShaderDefines2D.WORLDMAT = 0x80;
ShaderDefines2D.FILLTEXTURE = 0x100;
ShaderDefines2D.SKINMESH = 0x200;
ShaderDefines2D.SHADERDEFINE_FSHIGHPRECISION = 0x400;
ShaderDefines2D.MVP3D = 0x800;
ShaderDefines2D.NOOPTMASK = ShaderDefines2D.FILTERGLOW | ShaderDefines2D.FILTERBLUR | ShaderDefines2D.FILTERCOLOR | ShaderDefines2D.FILLTEXTURE; //有这些定义的不要优化。见submittexture
ShaderDefines2D.__name2int = {};
ShaderDefines2D.__int2name = [];
ShaderDefines2D.__int2nameMap = [];
