import { LayaEnv } from "../../LayaEnv";
import { Event } from "../events/Event";
import { GWidget } from "./GWidget";
import { UIEventType } from "./UIEvent";

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
            val.on(UIEventType.instance_reload, this, this._reload);
            this._callback = callback;
        }
    }

    destroy() {
        if (!LayaEnv.isPlaying)
            this.p.off(UIEventType.instance_reload, this, this._reload);
    }

    private _reload(newIns: any) {
        this.p = newIns;
        this._callback();
    }
}