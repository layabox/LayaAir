import { PlayerConfig } from "../../Config";

/**
 * @en Image loader that uses a Web Worker for asynchronous loading.
 * @zh 使用Web Worker进行异步加载的图像加载器。
 */
export class WorkerLoader {

    /**
     * @en Path to the worker.js file
     * @zh worker.js的路径
     */
    static workerPath: string = "libs/laya.workerloader.js";

    private static _worker: Worker;
    private static _enable: boolean = false;
    private static _queue: Record<string, Array<Function>> = {};

    /**
     * @en Check if worker is supported
     * @returns Whether worker is supported
     * @zh 检查是否支持worker
     * @returns 是否支持worker
     */
    static workerSupported(): boolean {
        return Worker ? true : false;
    }

    /**
     * @en Whether to enable the worker loader.
     * @zh 是否启用worker加载器。
     */
    static get enable(): boolean {
        return WorkerLoader._enable;
    }

    static set enable(value: boolean) {
        if (WorkerLoader._enable != value) {
            if (value) {
                if (!Worker)
                    return;

                if (!WorkerLoader._worker) {
                    WorkerLoader._worker = new Worker(PlayerConfig.workerLoaderLib || WorkerLoader.workerPath);
                    WorkerLoader._worker.onmessage = WorkerLoader.workerMessage;
                }
            }
            WorkerLoader._enable = value;
        }
    }

    /**
     * @en Loads an image asynchronously using the worker.
     * @param url The URL of the image to load.
     * @param options Additional options for loading.
     * @return A promise that resolves with the loaded image.
     * @zh 使用worker异步加载图像。
     * @param url 要加载的图像URL。
     * @param options 加载的附加选项。
     * @return 返回解析后的加载图像。
     */
    static load(url: string, options?: ImageBitmapOptions): Promise<any> {
        let callbacks = WorkerLoader._queue[url];
        if (callbacks) {
            return new Promise((resolve, reject) => {
                callbacks.push(resolve, reject);
            });
        }
        else {
            WorkerLoader._queue[url] = callbacks = [];
            return new Promise((resolve, reject) => {
                callbacks.push(resolve, reject);
                WorkerLoader._worker.postMessage({ url, options });
            });
        }
    }

    /**
     * @en Handles messages received from the worker.
     * @param evt Event data from the worker.
     * @zh 处理从worker接收到的消息。
     * @param evt worker传递的事件数据。
     */
    private static workerMessage(evt: any): void {
        let data = evt.data;
        if (data) {
            switch (data.type) {
                case "Image":
                    let callbacks = WorkerLoader._queue[data.url];
                    if (callbacks) {
                        delete WorkerLoader._queue[data.url];
                        let param = data.imageBitmap ? data.imageBitmap : data.msg;
                        for (let i = data.imageBitmap ? 0 : 1; i < callbacks.length; i += 2) {
                            callbacks[i](param);
                        }
                    }
                    break;
            }
        }
    }
}

