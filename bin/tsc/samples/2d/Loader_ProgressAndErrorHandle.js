import { Laya } from "Laya";
import { Event } from "laya/events/Event";
import { Loader } from "laya/net/Loader";
import { Handler } from "laya/utils/Handler";
export class Loader_ProgressAndErrorHandle {
    constructor() {
        Laya.init(550, 400);
        // 无加载失败重试
        Laya.loader.retryNum = 0;
        var urls = ["do not exist", "res/fighter/fighter.png", "res/legend/map.jpg"];
        Laya.loader.load(urls, Handler.create(this, this.onAssetLoaded), Handler.create(this, this.onLoading, null, false), Loader.TEXT);
        // 侦听加载失败
        Laya.loader.on(Event.ERROR, this, this.onError);
    }
    onAssetLoaded(texture) {
        // 使用texture
        console.log("加载结束");
    }
    // 加载进度侦听器
    onLoading(progress) {
        console.log("加载进度: " + progress);
    }
    onError(err) {
        console.log("加载失败: " + err);
    }
}
