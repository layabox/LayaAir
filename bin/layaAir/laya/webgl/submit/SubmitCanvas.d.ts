import { SubmitBase } from "././SubmitBase";
import { Matrix } from "../../maths/Matrix";
import { Context } from "../../resource/Context";
/**
 * cache as normal 模式下的生成的canvas的渲染。
 */
export declare class SubmitCanvas extends SubmitBase {
    _matrix: Matrix;
    canv: Context;
    _matrix4: any[];
    static create(canvas: any, alpha: number, filters: any[]): SubmitCanvas;
    constructor();
    renderSubmit(): number;
    releaseRender(): void;
    getRenderType(): number;
    static POOL: any;
}
