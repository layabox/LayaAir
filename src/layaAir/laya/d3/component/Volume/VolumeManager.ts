import { SingletonList } from "../../../utils/SingletonList";
import { BaseRender } from "../../core/render/BaseRender";
import { Bounds } from "../../math/Bounds";
import { IVolumeManager } from "./IVolumeManager";
import { ReflectionProbeManager } from "./reflectionProbe/ReflectionProbeManager";
import { Volume, volumeIntersectType } from "./Volume";

/**
 * <code>VolumeManager</code> 类用于管理体积组件
 */
export class VolumeManager implements IVolumeManager {
    static ReflectionProbeVolumeType: number = 1;
    //注册特殊的Volume管理类
    //static regVolumeManager: { [key: number]: any } = {};
    /** @internal 需要跟新反射探针的渲染队列 */
    private _motionObjects: SingletonList<BaseRender> = new SingletonList<BaseRender>();
    /** @internal volume list */
    private _volumeList: SingletonList<Volume> = new SingletonList<Volume>();

    /** @internal */
    _needUpdateAllRender: boolean = false;
    /** 有些Volume需要特殊的管理能力 */
    private _regVolumeManager: { [key: number]: IVolumeManager } = {};

    /**@internal 反射探针管理*/
    _reflectionProbeManager: ReflectionProbeManager;
    constructor() {
        this._reflectionProbeManager = new ReflectionProbeManager();
        this._regVolumeManager[VolumeManager.ReflectionProbeVolumeType] = this._reflectionProbeManager;

    }

    /**
     * get reflection manager
     */
    get reflectionProbeManager(): ReflectionProbeManager {
        return this._reflectionProbeManager;
    }

    /**
     * add volume
     * @param volume 
     */
    add(volume: Volume) {
        let reManager = this._regVolumeManager[volume.type];
        if (reManager) {
            reManager.add(volume);
        } else {
            this._volumeList.add(volume);
            this._needUpdateAllRender = true;
        }
    }

    /**
     * remove volume
     * @param volume 
     */
    remove(volume: Volume) {
        let reManager = this._regVolumeManager[volume.type];
        if (reManager) {
            reManager.remove(volume);
        } else {
            this._volumeList.remove(volume);
            this._needUpdateAllRender = true;
        }
    }

    /**
     * add motion obj to handle list
     * @param renderObj 
     */
    addMotionObject(renderObj: BaseRender) {
        this._motionObjects.add(renderObj);
    }

    removeMotionObject(renderObj:BaseRender){
        this._motionObjects.remove(renderObj);
    }

    /**
     * update one RenderNode Volume info
     * @param baseRender 
     */
    _updateRenderObject(baseRender: BaseRender): void {
        var elements: Volume[] = this._volumeList.elements;

        var renderBounds: Bounds = baseRender.bounds;
        var mainVolume: Volume;
        var maxOverlap: number = 0;
        var overlop;
        for (var i: number = 0, n: number = this._volumeList.length; i < n; i++) {
            //检测周围盒子 优化TODO
            var volume = elements[i];
            if (!mainVolume) {
                overlop = renderBounds.calculateBoundsintersection(volume.bounds);
                if (overlop < maxOverlap) continue;
            } else {
                if (mainVolume.importance > volume.importance) continue;//重要性判断
                overlop = renderBounds.calculateBoundsintersection(volume.bounds);
                if (overlop < maxOverlap && mainVolume.importance == volume.importance) continue;
            }
            mainVolume = volume;
            maxOverlap = overlop;
        }

        baseRender.volume = mainVolume;
    }
    /**
     * @internal
     * handle motion list
     */
    handleMotionlist(): void {
        var elements: BaseRender[] = this._motionObjects.elements;
        for (var i: number = 0, n: number = this._motionObjects.length; i < n; i++) {
            this._updateRenderObject(elements[i]);
        }
        //miner特殊管理TODO 更新所有动态物体
        this.reflectionProbeManager.handleMotionlist(this._motionObjects);

        this.clearMotionObjects();
    }

    /**
     * 重新更新所有Volume的信息
     */
    reCaculateAllRenderObjects(baseRenders: SingletonList<BaseRender>) {
        if (this._needUpdateAllRender) {
            var elements = baseRenders.elements;
            for (var i: number = 0, n: number = baseRenders.length; i < n; i++) {
                this._updateRenderObject(elements[i]);
            }
            this._needUpdateAllRender = false;
        } else {
            this.handleMotionlist();
        }

        //miner特殊管理TODO 更新所有渲染物体
        if (this.reflectionProbeManager._needUpdateAllRender) {
            this.reflectionProbeManager.reCaculateAllRenderObjects(baseRenders);
        } else {
            this.reflectionProbeManager.handleMotionlist(this._motionObjects);
        }

    }

    needreCaculateAllRenderObjects(): boolean {
        return this._needUpdateAllRender || this.reflectionProbeManager._needUpdateAllRender;
    }

    /**
     * @internal
     * 清理变动队列
     */
    clearMotionObjects() {
        this._motionObjects.length = 0;
    }

    /**
     * @internal
     * destroy
     */
    destroy() {

    }
}