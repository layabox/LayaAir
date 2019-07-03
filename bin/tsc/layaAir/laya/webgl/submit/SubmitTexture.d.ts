import { SubmitBase } from "./SubmitBase";
import { Context } from "../../resource/Context";
import { Value2D } from "../shader/d2/value/Value2D";
import { Mesh2D } from "../utils/Mesh2D";
export declare class SubmitTexture extends SubmitBase {
    private static _poolSize;
    private static POOL;
    constructor(renderType?: number);
    releaseRender(): void;
    renderSubmit(): number;
    static create(context: Context, mesh: Mesh2D, sv: Value2D): SubmitTexture;
}
