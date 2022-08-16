import { LayaEnv } from "../../LayaEnv";
import { SingletonList } from "../utils/SingletonList";
import { Component } from "./Component";

export class ComponentDriver {
    private _onUpdates: SingletonList<Component> = new SingletonList();
    private _onLateUpdates: SingletonList<Component> = new SingletonList();
    private _onPreRenders: SingletonList<Component> = new SingletonList();
    private _onPostRenders: SingletonList<Component> = new SingletonList();

    _toStarts: Component[] = [];
    _toDestroys: Component[] = [];

    callStart() {
        this._toStarts.forEach(ele => ele._enableState && !ele._destroyed && ele.onStart());
        this._toStarts.length = 0;
    }

    callUpdate() {
        const arr = this._onUpdates.elements;
        for (let i = 0, n = this._onUpdates.length; i < n; i++) {
            const ele = arr[i];
            ele._enableState && !ele._destroyed && ele.onUpdate();
        }
    }

    callLateUpdate() {
        const arr = this._onLateUpdates.elements;
        for (let i = 0, n = this._onLateUpdates.length; i < n; i++) {
            const ele = arr[i];
            ele._enableState && !ele._destroyed && ele.onLateUpdate();
        }
    }

    callPreRender() {
        const arr = this._onPreRenders.elements;
        for (let i = 0, n = this._onPreRenders.length; i < n; i++) {
            const ele = arr[i];
            ele._enableState && !ele._destroyed && ele.onPreRender();
        }
    }

    callPostRender() {
        const arr = this._onPostRenders.elements;
        for (let i = 0, n = this._onPostRenders.length; i < n; i++) {
            const ele = arr[i];
            ele._enableState && !ele._destroyed && ele.onPostRender();
        }
    }

    callDestroy(): void {
        this._toDestroys.forEach(element => element._destroy(true));
        this._toDestroys.length = 0;
    }

    add(comp: Component) {
        if (LayaEnv.isPlaying || comp.runInEditor) {
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
        if (comp.onUpdate)
            this._onUpdates.remove(comp);
        if (comp.onLateUpdate)
            this._onLateUpdates.remove(comp);
        if (comp.onPreRender)
            this._onPreRenders.remove(comp);
        if (comp.onPostRender)
            this._onPostRenders.remove(comp);
    }


    destroy() {
        //TODO:
    }
}