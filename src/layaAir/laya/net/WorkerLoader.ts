import { EventDispatcher } from "../events/EventDispatcher"

/**
 * Worker Image加载器
 */
export class WorkerLoader {

    /**worker.js的路径 */
    static workerPath: string = "libs/laya.workerloader.js";

    private static _worker: Worker;
    private static _dispatcher: EventDispatcher;
    private static _enable: boolean = false;

    /**
     * 是否支持worker
     * @return 是否支持worker
     */
    static workerSupported(): boolean {
        return Worker ? true : false;
    }

    /**
     * 是否启用。
     */
    static set enable(value: boolean) {
        if (WorkerLoader._enable != value) {
            if (value) {
                if (!Worker)
                    return;

                if (!WorkerLoader._worker) {
                    WorkerLoader._worker = new Worker(WorkerLoader.workerPath);
                    WorkerLoader._worker.onmessage = WorkerLoader.workerMessage;
                    WorkerLoader._dispatcher = new EventDispatcher();
                }
            }
            WorkerLoader._enable = value;
        }
    }

    static get enable(): boolean {
        return WorkerLoader._enable;
    }

    static load(url: string, options: any): Promise<any> {
        return new Promise(resolve => {
            WorkerLoader._worker.postMessage({ url, options });
            WorkerLoader._dispatcher.once(url, resolve);
        });
    }

    private static workerMessage(evt: any): void {
        let data = evt.data;
        if (data) {
            switch (data.type) {
                case "Image":
                    WorkerLoader._dispatcher.event(data.url, data.imageBitmap);
                    break;
                case "Disable":
                    WorkerLoader.enable = false;
                    break;
            }
        }
    }
}

