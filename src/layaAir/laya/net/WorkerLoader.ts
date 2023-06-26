import { EventDispatcher } from "../events/EventDispatcher"

/**
 * @private
 * Worker Image加载器
 */
export class WorkerLoader extends EventDispatcher {

    /**单例*/
    static I: WorkerLoader;
    /**worker.js的路径 */
    static workerPath: string = "libs/workerloader.js";

    /**@private */
    private static _enable: boolean = false;

    /**使用的Worker对象。*/
    worker: Worker;
    /**@private */
    protected _useWorkerLoader: boolean;

    constructor() {
        super();
        this.worker = new Worker(WorkerLoader.workerPath);
        this.worker.onmessage = (evt: any) => {
            //接收worker传过来的数据函数
            this.workerMessage(evt.data);
        }
    }

    /**
     * @internal
     * 尝试使用Work加载Image
     * @return 是否启动成功
     */
    static __init__() {
        if (WorkerLoader.I) return;
        if (!Worker) return;

        WorkerLoader.I = new WorkerLoader();
    }

    /**
     * 是否支持worker
     * @return 是否支持worker
     */
    static workerSupported(): boolean {
        return Worker ? true : false;
    }

    /**
     * 尝试启用WorkerLoader,只有第一次调用有效
     */
    static enableWorkerLoader(): void {
        WorkerLoader.enable = true;
    }

    /**
     * 是否启用。
     */
    static set enable(value: boolean) {
        if (WorkerLoader._enable != value) {
            WorkerLoader._enable = value;
            if (value) {
                if (WorkerLoader.I == null)
                    WorkerLoader.__init__();
                if (WorkerLoader.I.worker == null)
                    WorkerLoader._enable = false;
            }
        }
    }

    static get enable(): boolean {
        return WorkerLoader._enable;
    }

    /**
     * @private
     */
    private workerMessage(data: any): void {
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
    private imageLoaded(data: any): void {
        if (!data.dataType || data.dataType != "imageBitmap") {
            this.event(data.url, null);
            return;
        }

        var imageData: ImageBitmap = data.imageBitmap;
        //console.log("load:", data.url);
        this.event(data.url, imageData);
    }
}

