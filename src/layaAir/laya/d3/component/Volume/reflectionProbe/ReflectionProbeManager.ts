import { SimpleSingletonList } from "../../../../utils/SimpleSingletonList";
import { SingletonList } from "../../../../utils/SingletonList";
import { BaseRender } from "../../../core/render/BaseRender";
import { Bounds } from "../../../math/Bounds";
import { Vector3 } from "../../../math/Vector3";
import { Vector4 } from "../../../math/Vector4";
import { TextureCube } from "../../../resource/TextureCube";
import { IVolumeManager } from "../IVolumeManager";
import { Volume } from "../Volume";
import { ReflectionProbe } from "./ReflectionProbe";

/**
 *<code>ReflectionProbeManager</code> 类用于反射探针管理
 */
export class ReflectionProbeManager implements IVolumeManager {

    /** @internal 反射探针队列 */
    private _reflectionProbes: SingletonList<ReflectionProbe> = new SingletonList<ReflectionProbe>();
    /** @internal 环境探针 */
    private _sceneReflectionProbe: ReflectionProbe;
    /** @internal */
    _needUpdateAllRender: boolean = false;

    /**
     * 实例化一个反射探针管理类
     */
    constructor() {
        this._sceneReflectionProbe = new ReflectionProbe();
        this._sceneReflectionProbe.bounds = new Bounds(new Vector3(0, 0, 0), new Vector3(0, 0, 0));
        this._sceneReflectionProbe.boxProjection = false;
        this._sceneReflectionProbe._isScene = true;
    }

    /**
     * Scene Reflection
     */
    set sceneReflectionProbe(value: TextureCube) {
        this._sceneReflectionProbe.reflectionTexture = value;
        this._needUpdateAllRender = true;//update Reflection
    }

    /**
     * Scene Reflection HDR
     */
    set sceneReflectionCubeHDRParam(value: Vector4) {
        this._sceneReflectionProbe.reflectionHDRParams = value;
        this._needUpdateAllRender = true;//update reflection
    }

    /**
     * 更新baseRender的反射探针
     * @param baseRender 
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
     * 场景中添加反射探针
     * @internal
     * @param reflectionProbe 
     */
    add(volume: Volume) {
        this._reflectionProbes.add(volume as any);
        this._needUpdateAllRender = true;
    }
    /**
     * 场景中删除反射探针
     * @internal
     * @param reflectionProbe 
     */
    remove(volume: Volume) {
        this._reflectionProbes.remove(volume as any);
        this._needUpdateAllRender = true;
    }

    /**
     * @internal
     * 更新运动物体的反射探针信息
     */
    handleMotionlist(motionObjects: SingletonList<BaseRender>): void {
        var elements: BaseRender[] = motionObjects.elements;
        let render: BaseRender;
        for (var i: number = 0, n: number = motionObjects.length; i < n; i++) {
            render = elements[i];
            if (render._surportReflectionProbe && render._reflectionMode == 1) {
                this._updateRenderObject(elements[i]);
            }
        }
        //this.clearMotionObjects();
    }

    /**
     * @internal
     * 更新传入所有渲染器反射探针
     * @param 渲染器列表
     */
    reCaculateAllRenderObjects(baseRenders: SimpleSingletonList<BaseRender>) {
        var elements = baseRenders.elements;
        let render: BaseRender;
        for (var i: number = 0, n: number = baseRenders.length; i < n; i++) {
            render = elements[i];
            if (render._surportReflectionProbe && render._reflectionMode == 1) {
                this._updateRenderObject(render);
            }
            this._needUpdateAllRender = false;
        }
    }


    /**
     * @internal
     * destroy
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


