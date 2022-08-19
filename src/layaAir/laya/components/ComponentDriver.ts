import { LayaEnv } from "../../LayaEnv";
import { Component } from "./Component";

export class ComponentDriver {
    private _onUpdates: Set<Component> = new Set();
    private _onLateUpdates: Set<Component> = new Set();
    private _onPreRenders: Set<Component> = new Set();
    private _onPostRenders: Set<Component> = new Set();

    private _toStarts: Set<Component> = new Set();
    readonly _toDestroys: Set<Component> = new Set();

    callStart() {
        for (let ele of this._toStarts) {
            if (ele._status == 2) {
                ele._status = 3;

                try {
                    ele.onStart();
                }
                catch (err: any) {
                    console.log(err);
                }
            }
        }
        this._toStarts.clear();
    }

    callUpdate() {
        for (let ele of this._onUpdates) {
            if (ele._status == 3) {
                try {
                    ele.onUpdate();
                }
                catch (err: any) {
                    console.log(err);
                }
            }
        }
    }

    callLateUpdate() {
        for (let ele of this._onLateUpdates) {
            if (ele._status == 3) {
                try {
                    ele.onLateUpdate();
                }
                catch (err: any) {
                    console.log(err);
                }
            }
        }
    }

    callPreRender() {
        for (let ele of this._onPreRenders) {
            if (ele._status == 3) {
                try {
                    ele.onPreRender();
                }
                catch (err: any) {
                    console.log(err);
                }
            }
        }
    }

    callPostRender() {
        for (let ele of this._onPostRenders) {
            if (ele._status == 3) {
                try {
                    ele.onPostRender();
                }
                catch (err: any) {
                    console.log(err);
                }
            }
        }
    }

    callDestroy(): void {
        for (let ele of this._toDestroys) {
            try {
                ele._destroy(true);
            }
            catch (err: any) {
                console.log(err);
            }
        }
        this._toDestroys.clear();
    }

    add(comp: Component) {
        if (LayaEnv.isPlaying || comp.runInEditor) {
            if (comp._status == 1) {
                if (comp.onStart) {
                    comp._status = 2;
                    this._toStarts.add(comp);
                }
                else
                    comp._status = 3;
            }

            if (comp.onUpdate)
                this._onUpdates.add(comp);
            if (comp.onLateUpdate)
                this._onLateUpdates.add(comp);
        }
        if (comp.onPreRender)
            this._onPreRenders.add(comp);
        if (comp.onPostRender)
            this._onPostRenders.add(comp);
    }

    remove(comp: Component) {
        if (LayaEnv.isPlaying || comp.runInEditor) {
            if (comp._status == 2) //starting
                comp._status = 1; //cancel start

            if (comp.onUpdate)
                this._onUpdates.delete(comp);
            if (comp.onLateUpdate)
                this._onLateUpdates.delete(comp);
        }
        if (comp.onPreRender)
            this._onPreRenders.delete(comp);
        if (comp.onPostRender)
            this._onPostRenders.delete(comp);
    }

    destroy() {
        //TODO:
    }
}