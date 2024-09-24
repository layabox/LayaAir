import { SingletonList } from "../../../utils/SingletonList";
import { BaseRender } from "../../core/render/BaseRender";
import { Bounds } from "../../math/Bounds";
import { IVolumeManager } from "./IVolumeManager";
import { ReflectionProbeManager } from "./reflectionProbe/ReflectionProbeManager";
import { Volume } from "./Volume";
import { VolumetricGIManager } from "./VolumetricGI/VolumetricGIManager";


/**
 * @en The `VolumeManager` class is used to manage volume components in a scene.
 * @zh `VolumeManager` 类用于管理场景中的体积组件。
 */
export class VolumeManager implements IVolumeManager {
    /**
     * @en Type identifier for Reflection Probe Volume.
     * @zh 反射探针体积的类型标识符。
     */
    static ReflectionProbeVolumeType: number = 1;

    /**
     * @en Type identifier for Volumetric Global Illumination.
     * @zh 体积全局光照的类型标识符。
     */
    static VolumetricGIType: number = 2;

    //注册特殊的Volume管理类
    //static regVolumeManager: { [key: number]: any } = {};
    /** @internal 需要跟新反射探针的渲染队列 */
    private _motionObjects: SingletonList<BaseRender> = new SingletonList<BaseRender>();
    /** @internal volume list */
    private _volumeList: SingletonList<Volume> = new SingletonList<Volume>();

    /**
     * @internal
     * @en whether all renders need to be updated.
     * @zh 是否需要更新所有渲染。
     */
    _needUpdateAllRender: boolean = false;
    /**
     * @en Dictionary of specialized volume managers for different volume types.
     * @zh 不同体积类型的专门体积管理器字典。
     */
    _regVolumeManager: { [key: number]: IVolumeManager } = {};

    /**
     * @internal
     * @en Reflection probe manager.
     * @zh 反射探针管理器。
     */
    _reflectionProbeManager: ReflectionProbeManager;

    /**
     * @en Volumetric Global Illumination manager.
     * @zh 体积全局光照管理器。
     */
    _volumetricGIManager: VolumetricGIManager;

    constructor() {
        this._reflectionProbeManager = new ReflectionProbeManager();
        this._regVolumeManager[VolumeManager.ReflectionProbeVolumeType] = this._reflectionProbeManager;

        this._volumetricGIManager = new VolumetricGIManager();
        this._regVolumeManager[VolumeManager.VolumetricGIType] = this._volumetricGIManager;

    }

    /**
     * @en The reflection probe manager.
     * @zh 反射探针管理器。
     */
    get reflectionProbeManager(): ReflectionProbeManager {
        return this._reflectionProbeManager;
    }

    /**
     * @en The volumetric global illumination manager.
     * @zh 体积全局光照管理器。
     */
    get volumetricGIManager(): VolumetricGIManager {
        return this._volumetricGIManager;
    }

    /**
     * @en Add a volume component to the manager.
     * @zh 向管理器添加一个体积组件。
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
     * @en Remove a volume component from the manager.
     * @zh 从管理器中移除一个体积组件。
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
     * @en Add a motion object to the handle list.
     * @zh 将运动对象添加到处理列表中。
     */
    addMotionObject(renderObj: BaseRender) {
        this._motionObjects.add(renderObj);
    }

    /**
     * @en Remove a motion object from the handle list.
     * @zh 从处理列表中移除运动对象。
     */
    removeMotionObject(renderObj: BaseRender) {
        this._motionObjects.remove(renderObj);
    }

    /**
     * @en Update one RenderNode Volume info
     * @param baseRender The BaseRender object to update
     * @zh 更新一个RenderNode的Volume信息
     * @param baseRender 要更新的BaseRender对象
     */
    _updateRenderObject(baseRender: BaseRender): void {
        let elements: Volume[] = this._volumeList.elements;

        let renderBounds: Bounds = baseRender.bounds;
        let center = renderBounds.getCenter();
        let mainVolume: Volume;
        for (var i: number = 0, n: number = this._volumeList.length; i < n; i++) {
            let volume = elements[i];
            let bounds = volume.bounds;
            if (Bounds.containPoint(bounds, center)) {
                mainVolume = volume;
                continue;
            }
        }
        baseRender.volume = mainVolume;
    }

    /**
     * @internal
     * @en Handle motion list. 
     * This method updates render objects, processes reflection probes, and handles volumetric GI for objects in motion.
     * @zh 处理运动列表。
     * 此方法更新渲染对象，处理反射探针，并处理运动物体的体积全局光照。
     */
    handleMotionlist(): void {
        var elements: BaseRender[] = this._motionObjects.elements;
        for (var i: number = 0, n: number = this._motionObjects.length; i < n; i++) {
            this._updateRenderObject(elements[i]);
        }

        if (!this.reflectionProbeManager._needUpdateAllRender)
            this.reflectionProbeManager.handleMotionlist(this._motionObjects);
        if (!this.volumetricGIManager._needUpdateAllRender)
            this.volumetricGIManager.handleMotionlist(this._motionObjects);

        this.clearMotionObjects();
    }

    /**
     * @en Recalculate and update all Volume information for render objects
     * @zh 重新计算并更新所有渲染对象的Volume信息
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

        if (this.volumetricGIManager._needUpdateAllRender) {
            this.volumetricGIManager.reCaculateAllRenderObjects(baseRenders);
        }
        else {
            this.volumetricGIManager.handleMotionlist(this._motionObjects);
        }

    }

    /**
     * @en Check if all render objects need to be recalculated
     * @zh 检查是否需要重新计算所有渲染对象
     */
    needreCaculateAllRenderObjects(): boolean {
        return this._needUpdateAllRender || this.reflectionProbeManager._needUpdateAllRender || this.volumetricGIManager._needUpdateAllRender;
    }

    /**
     * @internal
     * @en Clean up the change queue
     * @zh 清理变动队列
     */
    clearMotionObjects() {
        this._motionObjects.length = 0;
        //下面是避免this._motionObjects.elements太长，以及避免引用对象
        if(this._motionObjects.elements.length>100){
            this._motionObjects.elements.length = 100;
        }
        this._motionObjects.elements.fill(null);
    }

    /**
     * @internal
     * @en Destroy the object
     * @zh 销毁对象
     */
    destroy() {

    }
}