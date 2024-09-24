import { SingletonList } from "../../../../utils/SingletonList";
import { BaseRender } from "../../../core/render/BaseRender";
import { Bounds } from "../../../math/Bounds";
import { IVolumeManager } from "../IVolumeManager";
import { Volume } from "../Volume";
import { ReflectionProbe } from "./ReflectionProbe";

/**
 * @en The `ReflectionProbeManager` class is used for managing reflection probes.
 * @zh `ReflectionProbeManager` 类用于管理反射探针。
 */
export class ReflectionProbeManager implements IVolumeManager {

    /** @internal 反射探针队列 */
    private _reflectionProbes: SingletonList<ReflectionProbe> = new SingletonList<ReflectionProbe>();
    /** @internal 环境探针 */
    private _sceneReflectionProbe: ReflectionProbe;
    /** @internal */
    _needUpdateAllRender: boolean = false;

    /**
     * @en The constructor of the `ReflectionProbeManager` class.
     * @zh `ReflectionProbeManager` 类构造函数。
     */
    constructor() {
        this._sceneReflectionProbe = new ReflectionProbe();
        this._sceneReflectionProbe.boxProjection = false;
        this._sceneReflectionProbe._isScene = true;
    }

    /**
     * @en The scene reflection probe
     * @zh 场景反射探针
     */
    get sceneReflectionProbe(): ReflectionProbe {
        return this._sceneReflectionProbe;
    }

    set sceneReflectionProbe(value: ReflectionProbe) {
        this._sceneReflectionProbe = value;
        this._needUpdateAllRender = true;//update Reflection
    }


    /**
     * @en Update the reflection probe for the base render.
     * @param baseRender The base render object to update.
     * @zh 更新基础渲染对象的反射探针。
     * @param baseRender 要更新的基础渲染对象。
     */
    _updateRenderObject(baseRender: BaseRender): void {
        if (this._reflectionProbes.length == 0) {
            baseRender.probReflection = this._sceneReflectionProbe;
            return;
        }
        var elements: ReflectionProbe[] = this._reflectionProbes.elements;
        var maxOverlap: number = 0;
        var mainProbe: ReflectionProbe;
        var renderBounds: Bounds = baseRender.bounds;
        var overlop;
        for (var i: number = 0, n: number = this._reflectionProbes.length; i < n; i++) {
            var renflectProbe = elements[i];
            if (!mainProbe) {
                overlop = renderBounds.calculateBoundsintersection(renflectProbe.bounds);
                if (overlop < maxOverlap) continue;
            } else {
                if (mainProbe.importance > renflectProbe.importance) continue;//重要性判断
                overlop = renderBounds.calculateBoundsintersection(renflectProbe.bounds);
                if (overlop < maxOverlap && mainProbe.importance == renflectProbe.importance) continue;
            }
            mainProbe = renflectProbe;
            maxOverlap = overlop;
        }
        if (!mainProbe && this._sceneReflectionProbe)//如果没有相交 传场景反射球
            mainProbe = this._sceneReflectionProbe;
        baseRender.probReflection = mainProbe;
    }

    /**
     * @internal
     * @en Add a reflection probe to the scene.
     * @param volume The reflection probe to add.
     * @zh 在场景中添加反射探针。
     * @param volume 要添加的反射探针。
     */
    add(volume: ReflectionProbe) {
        this._reflectionProbes.add(volume);
        this._needUpdateAllRender = true;
    }

    /**
     * @internal
     * @en Remove a reflection probe from the scene.
     * @param volume The reflection probe to remove.
     * @zh 从场景中删除反射探针。
     * @param volume 要删除的反射探针。
     */
    remove(volume: ReflectionProbe) {
        this._reflectionProbes.remove(volume);
        this._needUpdateAllRender = true;
    }

    /**
     * @internal
     * @en Update reflection probe information for moving objects.
     * @param motionObjects List of moving render objects.
     * @zh 更新运动物体的反射探针信息。
     * @param motionObjects 运动渲染对象列表。
     */
    handleMotionlist(motionObjects: SingletonList<BaseRender>): void {
        var elements: BaseRender[] = motionObjects.elements;
        let render: BaseRender;
        for (var i: number = 0, n: number = motionObjects.length; i < n; i++) {
            render = elements[i];
            if (render._surportReflectionProbe && render.reflectionMode == 1) {
                this._updateRenderObject(elements[i]);
            }
        }
        //this.clearMotionObjects();
    }

    /**
     * @internal
     * @en Recalculate reflection probes for all provided renderers.
     * @param baseRenders List of base renderers to update.
     * @zh 重新计算所有提供的渲染器的反射探针。
     * @param baseRenders 要更新的基础渲染器列表。
     */
    reCaculateAllRenderObjects(baseRenders: SingletonList<BaseRender>) {
        var elements = baseRenders.elements;
        let render: BaseRender;
        for (var i: number = 0, n: number = baseRenders.length; i < n; i++) {
            render = elements[i];
            if (render._surportReflectionProbe && render.reflectionMode == 1) {
                this._updateRenderObject(render);
            }
            this._needUpdateAllRender = false;
        }
    }

    /**
     * @internal
     * @en Destroy the ReflectionProbeManager and all associated resources.
     * @zh 销毁 ReflectionProbeManager 及其关联的所有资源。
     */
    destroy() {
        for (let index = 0; index < this._reflectionProbes.length; index++) {
            let probe = this._reflectionProbes.elements[index];
            probe.destroy();
        }
        this._reflectionProbes.length = 0;
        this._sceneReflectionProbe.destroy();
        this._sceneReflectionProbe = null;
    }
}


