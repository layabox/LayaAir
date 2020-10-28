import { Loader } from "./Loader";
import { ILaya } from "./../../ILaya";
import { AtlasInfoManager } from "./AtlasInfoManager";
import { LoaderManager } from "./LoaderManager";
import { Prefab } from "../components/Prefab"
import { Event } from "../events/Event"

import { EventDispatcher } from "../events/EventDispatcher"
import { Handler } from "../utils/Handler"
import { Utils } from "../utils/Utils"
/**
 * @private
 * 场景资源加载器
 */
export class SceneLoader extends EventDispatcher {
    static LoadableExtensions: any = { "scene": Loader.JSON, "scene3d": Loader.JSON, "ani": Loader.JSON, "ui": Loader.JSON, "prefab": Loader.PREFAB };
    static No3dLoadTypes: any = { "png": true, "jpg": true, "txt": true };
    totalCount: number;
    private _completeHandler: Handler;
    private _toLoadList: any[];
    private _isLoading: boolean;
    private _curUrl: string;

    constructor() {
        super();
        this._completeHandler = new Handler(this, this.onOneLoadComplete);
        this.reset();
    }

    reset(): void {
        this._toLoadList = [];
        this._isLoading = false;
        this.totalCount = 0;
    }

    get leftCount(): number {
        if (this._isLoading) return this._toLoadList.length + 1;
        return this._toLoadList.length;
    }

    get loadedCount(): number {
        return this.totalCount - this.leftCount;
    }

    load(url: any, is3D: boolean = false, ifCheck: boolean = true): void {
        if (url instanceof Array) {
            var i: number, len: number;
            len = url.length;
            for (i = 0; i < len; i++) {
                this._addToLoadList(url[i], is3D);
            }
        } else {
            this._addToLoadList(url, is3D);
        }
        if (ifCheck)
            this._checkNext();
    }

    private _addToLoadList(url: string, is3D: boolean = false): void {
        if (this._toLoadList.indexOf(url) >= 0) return;
        if (Loader.getRes(url)) return;
        if (is3D) {
            this._toLoadList.push({ url: url });
        } else
            this._toLoadList.push(url);
        this.totalCount++;
    }

    private _checkNext(): void {
        if (!this._isLoading) {
            if (this._toLoadList.length == 0) {
                this.event(Event.COMPLETE);
                return;
            }
            var tItem: any;
            tItem = this._toLoadList.pop();
            if (typeof (tItem) == 'string') {
                this.loadOne(tItem);
            } else {
                this.loadOne(tItem.url, true);
            }
        }
    }

    private loadOne(url: any, is3D: boolean = false): void {
        this._curUrl = url;
        var type: string = Utils.getFileExtension(this._curUrl);
        if (is3D) {
            ILaya.loader.create(url, this._completeHandler);
        } else
            if (SceneLoader.LoadableExtensions[type]) {
                ILaya.loader.load(url, this._completeHandler, null, SceneLoader.LoadableExtensions[type]);
            } else if (url != AtlasInfoManager.getFileLoadPath(url) || SceneLoader.No3dLoadTypes[type] || !LoaderManager.createMap[type]) {
                ILaya.loader.load(url, this._completeHandler);
            } else {
                ILaya.loader.create(url, this._completeHandler);
            }
    }

    private onOneLoadComplete(): void {
        this._isLoading = false;
        if (!Loader.getRes(this._curUrl)) {
            console.log("Fail to load:", this._curUrl);
        }
        var type: string = Utils.getFileExtension(this._curUrl);
        if (SceneLoader.LoadableExtensions[type]) {
            var dataO: any;
            dataO = Loader.getRes(this._curUrl);
            if (dataO && (dataO instanceof Prefab)) {
                dataO = dataO.json;
            }
            if (dataO) {
                if (dataO.loadList) {
                    this.load(dataO.loadList, false, false);
                }
                if (dataO.loadList3D) {
                    this.load(dataO.loadList3D, true, false);
                }
            }
        }
        if (type == "sk") {
            this.load(this._curUrl.replace(".sk", ".png"), false, false);
        }
        this.event(Event.PROGRESS, this.getProgress());
        this._checkNext();
    }

    getProgress(): number {
        return this.loadedCount / this.totalCount;
    }
}


