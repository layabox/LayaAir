import { ISubmit } from "./ISubmit";
export declare class SubmitCMD implements ISubmit {
    static POOL: any;
    fun: Function;
    args: any[];
    constructor();
    renderSubmit(): number;
    getRenderType(): number;
    releaseRender(): void;
    static create(args: any[], fun: Function, thisobj: any): SubmitCMD;
}
