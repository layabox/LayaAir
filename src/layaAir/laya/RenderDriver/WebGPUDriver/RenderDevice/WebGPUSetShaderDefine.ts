import { RenderCMDType, SetShaderDefineCMD } from "../../DriverDesign/RenderDevice/IRenderCMD";
import { ShaderDefine } from "../../RenderModuleData/Design/ShaderDefine";
import { WebGPUShaderData } from "./WebGPUShaderData";

export class WebGPUSetShaderDefine extends SetShaderDefineCMD {
    type: RenderCMDType;
    protected _define: ShaderDefine;
    protected _dest: WebGPUShaderData;
    protected _add: boolean;

    get define(): ShaderDefine {
        return this._define;
    }

    set define(value: ShaderDefine) {
        this._define = value;
    }

    get dest(): WebGPUShaderData {
        return this._dest;
    }

    set dest(value: WebGPUShaderData) {
        this._dest = value;
    }

    get add(): boolean {
        return this._add;
    }

    set add(value: boolean) {
        this._add = value;
    }

    constructor() {
        super();
        this.type = RenderCMDType.ChangeShaderDefine;
    }

    apply(context: any): void {
        if (this.add)
            this._dest.addDefine(this.define);
        else this._dest.removeDefine(this.define);
    }
}