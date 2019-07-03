import { Context } from "../../resource/Context";
import { SubmitBase } from "./SubmitBase";
/**
 * cache as normal 模式下的生成的canvas的渲染。
 */
export declare class SubmitCanvas extends SubmitBase {
    canv: Context;
    static create(canvas: any, alpha: number, filters: any[]): SubmitCanvas;
    constructor();
    renderSubmit(): number;
    releaseRender(): void;
    getRenderType(): number;
    static POOL: any;
}
