import { HideFlags } from "../Const";
import { Node } from "../display/Node";
import { Loader } from "../net/Loader";
import { Prefab } from "../resource/HierarchyResource";
import { GWidget } from "./GWidget";

export class WidgetPool {
    private _items: Record<string, Array<GWidget>>;
    private _count: number = 0;

    private _defaultRes: Prefab;
    private _defaultRuntime: Function;
    private _createOptions: Record<string, any>;

    constructor() {
        this._items = {};
    }

    public clear(): void {
        for (let i in this._items) {
            let arr = this._items[i];
            arr.forEach(obj => obj.destroy());
        }
        this._items = {};
        this._count = 0;
    }

    public get count(): number {
        return this._count;
    }

    public get defaultRes() {
        return this._defaultRes;
    }

    public set defaultRes(value: Prefab) {
        this._defaultRes = value;
        if (value && !value.url)
            value.url = "data:" + idCounter++;
    }

    public get defaultRuntime() {
        return this._defaultRuntime;
    }

    public set defaultRuntime(value: Function) {
        this._defaultRuntime = value;
        if (value)
            this._createOptions = { runtime: value };
        else
            this._createOptions = null;
    }

    public getObject(url?: string): GWidget {
        if (!url) {
            url = this._defaultRes?.url;
            if (!url) {
                console.warn("set defaultRes first!");
                return null;
            }
        }

        let arr = this._items[url];
        if (arr && arr.length > 0) {
            this._count--;
            return arr.shift();
        }

        let ret: GWidget;
        if (url.startsWith("data:"))
            ret = <GWidget>this._defaultRes.create(this._createOptions);
        else
            ret = <GWidget>(<Prefab>Loader.getRes(url)).create(this._createOptions);
        if (ret)
            ret.hideFlags |= HideFlags.HideAndDontSave;
        return ret;
    }

    public returnObject(obj: GWidget): void {
        let url = obj.url;
        if (!url) {
            obj.destroy();
            return;
        }

        let arr = this._items[url];
        if (!arr) {
            arr = [];
            this._items[url] = arr;
        }

        this._count++;
        arr.push(obj);
    }
}

var idCounter = 0;