import { Loader } from "./Loader";
import { ILaya } from "./../../ILaya";
import { AtlasInfoManager } from "./AtlasInfoManager";
import { LoaderManager } from "./LoaderManager";
import { Prefab } from "../components/Prefab";
import { Event } from "../events/Event";
import { EventDispatcher } from "../events/EventDispatcher";
import { Handler } from "../utils/Handler";
import { Utils } from "../utils/Utils";
/**
 * @private
 * 场景资源加载器
 */
export class SceneLoader extends EventDispatcher {
    constructor() {
        super();
        this._completeHandler = new Handler(this, this.onOneLoadComplete);
        this.reset();
    }
    reset() {
        this._toLoadList = [];
        this._isLoading = false;
        this.totalCount = 0;
    }
    get leftCount() {
        if (this._isLoading)
            return this._toLoadList.length + 1;
        return this._toLoadList.length;
    }
    get loadedCount() {
        return this.totalCount - this.leftCount;
    }
    load(url, is3D = false, ifCheck = true) {
        if (url instanceof Array) {
            var i, len;
            len = url.length;
            for (i = 0; i < len; i++) {
                this._addToLoadList(url[i], is3D);
            }
        }
        else {
            this._addToLoadList(url, is3D);
        }
        if (ifCheck)
            this._checkNext();
    }
    _addToLoadList(url, is3D = false) {
        if (this._toLoadList.indexOf(url) >= 0)
            return;
        if (Loader.getRes(url))
            return;
        if (is3D) {
            this._toLoadList.push({ url: url });
        }
        else
            this._toLoadList.push(url);
        this.totalCount++;
    }
    _checkNext() {
        if (!this._isLoading) {
            if (this._toLoadList.length == 0) {
                this.event(Event.COMPLETE);
                return;
            }
            var tItem;
            tItem = this._toLoadList.pop();
            if (typeof (tItem) == 'string') {
                this.loadOne(tItem);
            }
            else {
                this.loadOne(tItem.url, true);
            }
        }
    }
    loadOne(url, is3D = false) {
        this._curUrl = url;
        var type = Utils.getFileExtension(this._curUrl);
        if (is3D) {
            ILaya.loader.create(url, this._completeHandler);
        }
        else if (SceneLoader.LoadableExtensions[type]) {
            ILaya.loader.load(url, this._completeHandler, null, SceneLoader.LoadableExtensions[type]);
        }
        else if (url != AtlasInfoManager.getFileLoadPath(url) || SceneLoader.No3dLoadTypes[type] || !LoaderManager.createMap[type]) {
            ILaya.loader.load(url, this._completeHandler);
        }
        else {
            ILaya.loader.create(url, this._completeHandler);
        }
    }
    onOneLoadComplete() {
        this._isLoading = false;
        if (!Loader.getRes(this._curUrl)) {
            console.log("Fail to load:", this._curUrl);
        }
        var type = Utils.getFileExtension(this._curUrl);
        if (SceneLoader.LoadableExtensions[type]) {
            var dataO;
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
    getProgress() {
        return this.loadedCount / this.totalCount;
    }
}
SceneLoader.LoadableExtensions = { "scene": Loader.JSON, "scene3d": Loader.JSON, "ani": Loader.JSON, "ui": Loader.JSON, "prefab": Loader.PREFAB };
SceneLoader.No3dLoadTypes = { "png": true, "jpg": true, "txt": true };
