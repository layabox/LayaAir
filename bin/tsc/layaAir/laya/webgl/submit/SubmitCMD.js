import { SubmitKey } from "./SubmitKey";
export class SubmitCMD {
    constructor() {
        /**@internal */
        this._ref = 1;
        /**@internal */
        this._key = new SubmitKey();
    }
    renderSubmit() {
        this.fun.apply(this._this, this.args);
        return 1;
    }
    getRenderType() {
        return 0;
    }
    releaseRender() {
        if ((--this._ref) < 1) {
            var pool = SubmitCMD.POOL;
            pool[pool._length++] = this;
        }
    }
    static create(args, fun, thisobj) {
        var o = SubmitCMD.POOL._length ? SubmitCMD.POOL[--SubmitCMD.POOL._length] : new SubmitCMD();
        o.fun = fun;
        o.args = args;
        o._this = thisobj;
        o._ref = 1;
        o._key.clear();
        return o;
    }
}
SubmitCMD.POOL = [];
{
    SubmitCMD.POOL._length = 0;
}
