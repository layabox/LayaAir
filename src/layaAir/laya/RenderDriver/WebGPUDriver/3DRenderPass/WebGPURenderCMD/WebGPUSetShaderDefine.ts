import { SetShaderDefineCMD, RenderCMDType } from "../../../DriverDesign/3DRenderPass/IRendderCMD";
import { ShaderDefine } from "../../../RenderModuleData/Design/ShaderDefine";
import { WebGPUShaderData } from "../../RenderDevice/WebGPUShaderData";
import { WebGPURenderContext3D } from "../WebGPURenderContext3D";

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

    apply(context: WebGPURenderContext3D): void {
        if (this.add)
            this._dest.addDefine(this.define);
        else this._dest.removeDefine(this.define);
    }
}