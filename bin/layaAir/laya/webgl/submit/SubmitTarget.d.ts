import { ISubmit } from "././ISubmit";
import { SubmitKey } from "././SubmitKey";
import { Context } from "../../resource/Context";
import { RenderTexture2D } from "../../resource/RenderTexture2D";
import { Value2D } from "../shader/d2/value/Value2D";
import { Mesh2D } from "../utils/Mesh2D";
export declare class SubmitTarget implements ISubmit {
    _mesh: Mesh2D;
    _startIdx: number;
    _numEle: number;
    shaderValue: Value2D;
    blendType: number;
    _ref: number;
    _key: SubmitKey;
    srcRT: RenderTexture2D;
    constructor();
    static POOL: any;
    renderSubmit(): number;
    blend(): void;
    getRenderType(): number;
    releaseRender(): void;
    static create(context: Context, mesh: Mesh2D, sv: Value2D, rt: RenderTexture2D): SubmitTarget;
}
