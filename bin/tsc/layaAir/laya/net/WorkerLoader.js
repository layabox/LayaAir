import { Loader } from "././Loader";
import { URL } from "././URL";
import { EventDispatcher } from "../events/EventDispatcher";
import { Texture2D } from "../resource/Texture2D";
/**
 * @private
 * Worker Image加载器
 */
export class WorkerLoader extends EventDispatcher {
    constructor() {
        super();
        this.worker = new Worker(WorkerLoader.workerPath);
        this.worker.onmessage = function (evt) {
            //接收worker传过来的数据函数
            this.workerMessage(evt.data);
        };
    }
    /**
     * 尝试使用Work加载Image
     * @return 是否启动成功
     */
    static __init__() {
        if (WorkerLoader._preLoadFun != null)
            return false;
        if (!Worker)
            return false;
        WorkerLoader._preLoadFun = Loader["prototype"]["_loadImage"];
        Loader["prototype"]["_loadImage"] = WorkerLoader["prototype"]["_loadImage"];
        if (!WorkerLoader.I)
            WorkerLoader.I = new WorkerLoader();
        return true;
    }
    /**
     * 是否支持worker
     * @return 是否支持worker
     */
    static workerSupported() {
        return Worker ? true : false;
    }
    /**
     * 尝试启用WorkerLoader,只有第一次调用有效
     */
    static enableWorkerLoader() {
        if (!WorkerLoader._tryEnabled) {
            WorkerLoader.enable = true;
            WorkerLoader._tryEnabled = true;
        }
    }
    /**
     * 是否启用。
     */
    static set enable(value) {
        if (WorkerLoader._enable != value) {
            WorkerLoader._enable = value;
            if (value && WorkerLoader._preLoadFun == null)
                WorkerLoader._enable = WorkerLoader.__init__();
        }
    }
    static get enable() {
        return WorkerLoader._enable;
    }
    /**
     * @private
     */
    workerMessage(data) {
        if (data) {
            switch (data.type) {
                case "Image":
                    this.imageLoaded(data);
                    break;
                case "Disable":
                    WorkerLoader.enable = false;
                    break;
            }
        }
    }
    /**
     * @private
     */
    imageLoaded(data) {
        if (!data.dataType || data.dataType != "imageBitmap") {
            this.event(data.url, null);
            return;
        }
        var imageData = data.imageBitmap; // imageBitmap
        var tex = new Texture2D();
        tex.loadImageSource(imageData);
        console.log("load:", data.url);
        //canvas = tex;
        this.event(data.url, tex);
    }
    /**
     * 加载图片
     * @param	url 图片地址
     */
    loadImage(url) {
        this.worker.postMessage(url);
    }
    /**
     * @private
     * 加载图片资源。
     * @param	url 资源地址。
     */
    _loadImage(url) {
        var _this = this;
        if (!this._useWorkerLoader || !WorkerLoader._enable) {
            WorkerLoader._preLoadFun.call(_this, url);
            return;
        }
        url = URL.formatURL(url);
        function clear() {
            WorkerLoader.I.off(url, _this, onload);
        }
        var onload = function (image) {
            clear();
            if (image) {
                _this["onLoaded"](image);
            }
            else {
                //失败之后使用原版的加载函数加载重试
                WorkerLoader._preLoadFun.call(_this, url);
            }
        };
        WorkerLoader.I.on(url, _this, onload);
        WorkerLoader.I.loadImage(url);
    }
}
/**worker.js的路径 */
WorkerLoader.workerPath = "libs/workerloader.js";
/**@private */
WorkerLoader._enable = false;
/**@private */
WorkerLoader._tryEnabled = false;
