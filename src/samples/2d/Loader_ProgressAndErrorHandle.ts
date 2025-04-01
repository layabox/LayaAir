/**
description
 在Laya中实现资源加载的进度监听和错误处理
 */
import { Laya } from "Laya";
import { Loader } from "laya/net/Loader";
import { Texture } from "laya/resource/Texture";
import { Handler } from "laya/utils/Handler";

export class Loader_ProgressAndErrorHandle {

    constructor() {

        Laya.init(550, 400).then(() => {
            // loader的加载失败没有onError事件派发，loader失败返回的是null，全局的处理，可以接管Loader.warnFailed方法
            Loader.warnFailed = this.loaderError;
            // 无加载失败重试
            Laya.loader.retryNum = 0;

            var urls: any[] = ["do not exist", "res/fighter/fighter.png", "res/legend/map.jpg"];
            Laya.loader.load(urls, Handler.create(this, this.onAssetLoaded), Handler.create(this, this.onLoading, null, false));

        });

    }

    /**
     * 全局接管loader失败的方法
     * @param url 
     * @param err 
     * @param initiatorUrl 
     */
    loaderError(url: string, err?: any, initiatorUrl?: string) {
        console.error("[自定义接管 Loader Failed] ==>");
        console.error("资源加载失败地址：", url);
        console.error("资源加载失败代码：", err);
        console.error("资源加载失败替代url：", initiatorUrl);
        console.error("[自定义接管 Loader Failed] ===");
    }


    private onAssetLoaded(texture: Texture): void {
        // 使用texture
        console.log("加载结束");
    }

    // 加载进度侦听器
    private onLoading(progress: number): void {
        console.log("加载进度: " + progress);
    }
}

