import { Event } from "../events/Event";
import { Browser } from "../utils/Browser";
import { ImgUtils } from "../utils/ImgUtils";
import { HttpRequest } from "./HttpRequest";
import { WorkerLoader } from "./WorkerLoader";

/**
 * @en Downloader class responsible for handling various types of resource downloads.
 * @zh Downloader类负责处理各种类型的资源下载。
 */
export class Downloader {
    /**
     * @en Downloads common resources using HTTP request.
     * @param owner The owner of the download request.
     * @param url The URL of the resource to download.
     * @param originalUrl The original URL of the resource.
     * @param contentType The content type of the resource.
     * @param onProgress Callback function for download progress.
     * @param onComplete Callback function when download is complete.
     * @zh 使用HTTP请求下载通用资源。
     * @param owner 下载请求的所有者。
     * @param url 要下载的资源的URL。
     * @param originalUrl 资源的原始URL。
     * @param contentType 资源的内容类型。
     * @param onProgress 下载进度的回调函数。
     * @param onComplete 下载完成时的回调函数。
     */
    common(owner: any, url: string, originalUrl: string, contentType: string, onProgress: (progress: number) => void, onComplete: (data: any, error?: string) => void): void {
        let http = this.getRequestInst();
        http.on(Event.COMPLETE, () => {
            let data = http.data;
            this.returnRequestInst(http);

            onComplete(data);
        });
        http.on(Event.ERROR, null, (error: string) => {
            this.returnRequestInst(http);

            onComplete(null, error);
        });
        if (onProgress)
            http.on(Event.PROGRESS, onProgress);
        http.send(url, null, "get", <any>contentType);
        owner.$ref = http; //保持引用避免gc掉
    }

    /**
     * @en Downloads an image resource.
     * @param owner The owner of the download request.
     * @param url The URL of the image to download.
     * @param originalUrl The original URL of the image.
     * @param onProgress Callback function for download progress.
     * @param onComplete Callback function when download is complete.
     * @zh 下载图像资源。
     * @param owner 下载请求的所有者。
     * @param url 要下载的图像的URL。
     * @param originalUrl 图像的原始URL。
     * @param onProgress 下载进度的回调函数。
     * @param onComplete 下载完成时的回调函数。
     */
    image(owner: any, url: string, originalUrl: string, onProgress: (progress: number) => void, onComplete: (data: any, error?: string) => void): void {
        let image: HTMLImageElement = new Browser.window.Image();
        image.crossOrigin = "";
        image.onload = () => {
            image.onload = null;
            image.onerror = null;
            onComplete(image);
        };
        image.onerror = () => {
            image.onload = null;
            image.onerror = null;
            onComplete(null, "");
        };
        image.src = url;
        owner.$ref = image; //保持引用避免gc掉
    }

    /**
     * @en Downloads an image from a Blob.
     * @param owner The owner of the download request.
     * @param blob The ArrayBuffer containing the image data.
     * @param originalUrl The original URL of the image.
     * @param onProgress Callback function for download progress.
     * @param onComplete Callback function when download is complete.
     * @zh 从Blob下载图像。
     * @param owner 下载请求的所有者。
     * @param blob 包含图像数据的ArrayBuffer。
     * @param originalUrl 图像的原始URL。
     * @param onProgress 下载进度的回调函数。
     * @param onComplete 下载完成时的回调函数。
     */
    imageWithBlob(owner: any, blob: ArrayBuffer, originalUrl: string, onProgress: (progress: number) => void, onComplete: (data: any, error?: string) => void): void {
        let url = ImgUtils.arrayBufferToURL(originalUrl, blob);
        this.image(owner, url, originalUrl, onProgress, onComplete);
    }

    /**
     * @en Downloads an image using a worker.
     * @param owner The owner of the download request.
     * @param url The URL of the image to download.
     * @param originalUrl The original URL of the image.
     * @param onProgress Callback function for download progress.
     * @param onComplete Callback function when download is complete.
     * @zh 使用worker下载图像。
     * @param owner 下载请求的所有者。
     * @param url 要下载的图像的URL。
     * @param originalUrl 图像的原始URL。
     * @param onProgress 下载进度的回调函数。
     * @param onComplete 下载完成时的回调函数。
     */
    imageWithWorker(owner: any, url: string, originalUrl: string, onProgress: (progress: number) => void, onComplete: (data: any, error?: string) => void): void {
        WorkerLoader.enable = true;
        if (WorkerLoader.enable) {
            WorkerLoader.load(url, owner.workerLoaderOptions).then(ret => {
                if (ret)
                    onComplete(ret);
                else
                    onComplete(null, "workerloader failed!");
            });
        }
        else
            this.image(owner, url, originalUrl, onProgress, onComplete);
    }

    /**
     * @en Downloads an audio resource.
     * @param owner The owner of the download request.
     * @param url The URL of the audio to download.
     * @param originalUrl The original URL of the audio.
     * @param onProgress Callback function for download progress.
     * @param onComplete Callback function when download is complete.
     * @zh 下载音频资源。
     * @param owner 下载请求的所有者。
     * @param url 要下载的音频的URL。
     * @param originalUrl 音频的原始URL。
     * @param onProgress 下载进度的回调函数。
     * @param onComplete 下载完成时的回调函数。
     */
    audio(owner: any, url: string, originalUrl: string, onProgress: (progress: number) => void, onComplete: (data: any, error?: string) => void) {
        let audio = (<HTMLAudioElement>Browser.createElement("audio"));
        audio.crossOrigin = "";
        audio.oncanplaythrough = () => {
            audio.oncanplaythrough = null;
            audio.onerror = null;
            onComplete(audio);
        };
        audio.onerror = () => {
            audio.oncanplaythrough = null;
            audio.onerror = null;
            onComplete(null, "");
        };
        audio.src = url;
        owner.$ref = audio; //保持引用避免gc掉
    }

    /**
     * @en Pool of HttpRequest instances.
     * @zh HttpRequest实例池。
     */
    httpRequestPool: Array<HttpRequest> = [];
    protected getRequestInst() {
        if (this.httpRequestPool.length == 0
            || Browser.onVVMiniGame || Browser.onHWMiniGame /*临时修复vivo复用xmlhttprequest的bug*/) {
            return new HttpRequest();
        } else {
            return this.httpRequestPool.pop();
        }
    }

    protected returnRequestInst(inst: HttpRequest) {
        inst.reset();
        if (this.httpRequestPool.length < 10)
            this.httpRequestPool.push(inst);
    }
}

