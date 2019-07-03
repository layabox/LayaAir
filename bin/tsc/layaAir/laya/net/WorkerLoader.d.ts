import { EventDispatcher } from "../events/EventDispatcher";
/**
 * @private
 * Worker Image加载器
 */
export declare class WorkerLoader extends EventDispatcher {
    /**单例*/
    static I: WorkerLoader;
    /**worker.js的路径 */
    static workerPath: string;
    /**@private */
    private static _preLoadFun;
    /**@private */
    private static _enable;
    /**@private */
    private static _tryEnabled;
    /**使用的Worker对象。*/
    worker: Worker;
    /**@private */
    protected _useWorkerLoader: boolean;
    constructor();
    /**
     * 是否支持worker
     * @return 是否支持worker
     */
    static workerSupported(): boolean;
    /**
     * 尝试启用WorkerLoader,只有第一次调用有效
     */
    static enableWorkerLoader(): void;
    /**
     * 是否启用。
     */
    static enable: boolean;
    /**
     * @private
     */
    private workerMessage;
    /**
     * @private
     */
    private imageLoaded;
    /**
     * 加载图片
     * @param	url 图片地址
     */
    loadImage(url: string): void;
    /**
     * @private
     * 加载图片资源。
     * @param	url 资源地址。
     */
    protected _loadImage(url: string): void;
}
