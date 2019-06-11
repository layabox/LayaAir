import { SubmitBase } from "././SubmitBase";
import { Context } from "../../resource/Context";
import { Value2D } from "../shader/d2/value/Value2D";
import { Mesh2D } from "../utils/Mesh2D";
export declare class Submit extends SubmitBase {
    protected static _poolSize: number;
    protected static POOL: any[];
    constructor(renderType?: number);
    renderSubmit(): number;
    releaseRender(): void;
    static create(context: Context, mesh: Mesh2D, sv: Value2D): Submit;
    /**
     * 创建一个矢量submit
     * @param	ctx
     * @param	mesh
     * @param	numEle		对应drawElement的第二个参数:count
     * @param	offset		drawElement的时候的ib的偏移。
     * @param	sv			Value2D
     * @return
     */
    static createShape(ctx: Context, mesh: Mesh2D, numEle: number, sv: Value2D): Submit;
}
