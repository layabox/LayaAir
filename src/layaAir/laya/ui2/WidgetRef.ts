import { LayaEnv } from "../../LayaEnv";
import { Event } from "../events/Event";
import { GWidget } from "./GWidget";
import { UIEvent } from "./UIEvent";

export class WidgetRef {
    p: GWidget;

    private _callback: () => void;

    static create(oldVal: WidgetRef, target: GWidget, callback: () => void) {
        if (oldVal)
            oldVal.destroy();
        if (target)
            return new WidgetRef(target, callback);
        else
            return null;
    }

    constructor(val: GWidget, callback: () => void) {
        this.p = val;
        if (!LayaEnv.isPlaying) {
            val.on(UIEvent.InstanceReload, this, this._reload);
            this._callback = callback;
        }
    }

    destroy() {
        if (!LayaEnv.isPlaying)
            this.p.off(UIEvent.InstanceReload, this, this._reload);
    }

    private _reload(newIns: any) {
        this.p = newIns;
        this._callback();
    }
}