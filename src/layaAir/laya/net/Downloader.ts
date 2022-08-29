import { Event } from "../events/Event";
import { Browser } from "../utils/Browser";
import { ImgUtils } from "../utils/ImgUtils";
import { HttpRequest } from "./HttpRequest";
import { WorkerLoader } from "./WorkerLoader";

export class Downloader {
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

    imageWithBlob(owner: any, blob: ArrayBuffer, originalUrl: string, onProgress: (progress: number) => void, onComplete: (data: any, error?: string) => void): void {
        let url = ImgUtils.arrayBufferToURL(originalUrl, blob);
        this.image(owner, url, originalUrl, onProgress, onComplete);
    }

    imageWithWorker(owner: any, url: string, originalUrl: string, onProgress: (progress: number) => void, onComplete: (data: any, error?: string) => void): void {
        WorkerLoader.enableWorkerLoader();
        if (WorkerLoader.enable) {
            let workerLoader = WorkerLoader.I;
            workerLoader.once(url, null, (imageData: any) => {
                if (imageData)
                    onComplete(imageData);
                else
                    onComplete(null, "workerloader failed!");
            });
            workerLoader.worker.postMessage(url);
        }
        else
            this.image(owner, url, originalUrl, onProgress, onComplete);
    }

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

