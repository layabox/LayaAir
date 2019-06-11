import { EventDispatcher } from "../events/EventDispatcher";
/**
 * @private
 * 场景资源加载器
 */
export declare class SceneLoader extends EventDispatcher {
    static LoadableExtensions: any;
    static No3dLoadTypes: any;
    totalCount: number;
    private _completeHandler;
    private _toLoadList;
    private _isLoading;
    private _curUrl;
    constructor();
    reset(): void;
    readonly leftCount: number;
    readonly loadedCount: number;
    load(url: any, is3D?: boolean, ifCheck?: boolean): void;
    private _addToLoadList;
    private _checkNext;
    private loadOne;
    private onOneLoadComplete;
    getProgress(): number;
}
