import { ISubmit } from "./ISubmit";
import { SubmitKey } from "./SubmitKey";
export class SubmitCMD implements ISubmit {
    static POOL: SubmitCMD[] = []; fun: Function;
    /**@internal */
    _this: any;
    args: any[];
    /**@internal */
    _ref: number = 1;
    /**@internal */
    _key: SubmitKey = new SubmitKey();

    constructor() {
    }

    renderSubmit(): number {
        this.fun.apply(this._this, this.args);
        return 1;
    }

    getRenderType(): number {
        return 0;
    }

    releaseRender(): void {
        if ((--this._ref) < 1) {
            var pool: any = SubmitCMD.POOL;
            pool[pool._length++] = this;
        }
    }

    static create(args: any[], fun: Function, thisobj: any): SubmitCMD {
        var o: SubmitCMD = (SubmitCMD.POOL as any)._length ? SubmitCMD.POOL[--(SubmitCMD.POOL as any)._length] : new SubmitCMD();
        o.fun = fun;
        o.args = args;
        o._this = thisobj;
        o._ref = 1;
        o._key.clear();
        return o;
    }
}
{ (SubmitCMD.POOL as any)._length = 0 }


