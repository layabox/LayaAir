import { ISubmit } from "././ISubmit";
import { SubmitKey } from "././SubmitKey";
export declare class SubmitCMD implements ISubmit {
    static POOL: any;
    fun: Function;
    _this: any;
    args: any[];
    _ref: number;
    _key: SubmitKey;
    constructor();
    renderSubmit(): number;
    getRenderType(): number;
    releaseRender(): void;
    static create(args: any[], fun: Function, thisobj: any): SubmitCMD;
}
