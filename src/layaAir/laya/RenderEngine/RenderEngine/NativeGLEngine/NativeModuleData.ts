import { NativeShaderInstance } from "../../../d3/RenderObjs/NativeOBJ/NativeShaderInstance";
import { IShaderInstance, IShaderPassData, ISubshaderData } from "../../RenderInterface/RenderPipelineInterface/IShaderInstance";
import { DefineDatas } from "../../RenderShader/DefineDatas";

export class NativeSubShader implements ISubshaderData {

    private _nativeObj: any;
    constructor() {

    }
    destroy(): void {
        throw new Error("Method not implemented.");
    }
    addShaderPass(pass: IShaderPassData): void {
        throw new Error("Method not implemented.");
    }
}

export class NativeShaderPass implements IShaderPassData {
    pipelineMode: string;
    statefirst: boolean;
    validDefine: DefineDatas = new DefineDatas();

    private _nativeObj: any;
    constructor() {

    }
    destory(): void {
        throw new Error("Method not implemented.");
    }

    setCacheShader(defines: DefineDatas, shaderInstance: IShaderInstance): void {
        throw new Error("Method not implemented.");
    }

    getCacheShader(defines: DefineDatas): NativeShaderInstance {
        return null;
    }
}
