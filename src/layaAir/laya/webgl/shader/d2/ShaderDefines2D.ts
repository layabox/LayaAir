import { ShaderDefinesBase } from "../ShaderDefinesBase"
export class ShaderDefines2D extends ShaderDefinesBase {
    static TEXTURE2D: number = 0x01;
    static PRIMITIVE: number = 0x04;
    static FILTERGLOW: number = 0x08;
    static FILTERBLUR: number = 0x10;
    static FILTERCOLOR: number = 0x20;
    static COLORADD: number = 0x40;

    static WORLDMAT: number = 0x80;
    static FILLTEXTURE: number = 0x100;
    static SKINMESH: number = 0x200;
    static MVP3D: number = 0x800;

    static NOOPTMASK: number = ShaderDefines2D.FILTERGLOW | ShaderDefines2D.FILTERBLUR | ShaderDefines2D.FILTERCOLOR | ShaderDefines2D.FILLTEXTURE;	//有这些定义的不要优化。见submittexture

    private static __name2int: any = {};
    private static __int2name: any[] = [];
    private static __int2nameMap: any[] = [];

    static __init__(): void {
        ShaderDefines2D.reg("TEXTURE2D", ShaderDefines2D.TEXTURE2D);
        ShaderDefines2D.reg("PRIMITIVE", ShaderDefines2D.PRIMITIVE);

        ShaderDefines2D.reg("GLOW_FILTER", ShaderDefines2D.FILTERGLOW);
        ShaderDefines2D.reg("BLUR_FILTER", ShaderDefines2D.FILTERBLUR);
        ShaderDefines2D.reg("COLOR_FILTER", ShaderDefines2D.FILTERCOLOR);
        ShaderDefines2D.reg("COLOR_ADD", ShaderDefines2D.COLORADD);

        ShaderDefines2D.reg("WORLDMAT", ShaderDefines2D.WORLDMAT);
        ShaderDefines2D.reg("FILLTEXTURE", ShaderDefines2D.FILLTEXTURE);
        ShaderDefines2D.reg('MVP3D', ShaderDefines2D.MVP3D);
    }

    constructor() {
        super(ShaderDefines2D.__name2int, ShaderDefines2D.__int2name, ShaderDefines2D.__int2nameMap);
    }

    static reg(name: string, value: number): void {
        this._reg(name, value, ShaderDefines2D.__name2int, ShaderDefines2D.__int2name);
    }

    //TODO:coverage
    static toText(value: number, int2name: any[], int2nameMap: any): any {
        return this._toText(value, int2name, int2nameMap);
    }

    //TODO:coverage
    static toInt(names: string): number {
        return this._toInt(names, ShaderDefines2D.__name2int);
    }
}


