import { Shader } from "../Shader"
import { ShaderValue } from "../ShaderValue"

export class Shader2X extends Shader {
    _params2dQuick2: any[]|null = null;
    _shaderValueWidth: number = 0;
    _shaderValueHeight: number = 0;

    constructor(vs: string, ps: string, saveName: any = null, nameMap: any = null, bindAttrib: any[]|null = null) {
        super(vs, ps, saveName, nameMap, bindAttrib);
    }

    //TODO:coverage
    /**
     * @override
     */
    protected _disposeResource(): void {
        super._disposeResource();
        this._params2dQuick2 = null;
    }

    //TODO:coverage
    upload2dQuick2(shaderValue: ShaderValue): void {
        this.upload(shaderValue, this._params2dQuick2 || this._make2dQuick2());
    }

    //去掉size的所有的uniform
    _make2dQuick2(): any[] {
        if (!this._params2dQuick2) {
            this._params2dQuick2 = [];

            var params: any[] = this._params, one: any;
            for (var i: number = 0, n: number = params.length; i < n; i++) {
                one = params[i];
                if (one.name !== "size") this._params2dQuick2.push(one);
            }
        }
        return this._params2dQuick2;
    }

    static create(vs: string, ps: string, saveName: any = null, nameMap: any = null, bindAttrib: any[]|null = null): Shader {
        return new Shader2X(vs, ps, saveName, nameMap, bindAttrib);
    }
}


