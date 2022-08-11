import { BaseRender } from "../render/BaseRender";
import { ReflectionProbe } from "./ReflectionProbe";
import { ReflectionProbeList } from "./ReflectionProbeList";
import { SingletonList } from "../../../utils/SingletonList";
import { SimpleSingletonList } from "../../../utils/SimpleSingletonList";
import { TextureCube } from "../../resource/TextureCube";
import { Vector4 } from "../../math/Vector4";
import { Vector3 } from "../../math/Vector3";
import { LayaGL } from "../../../layagl/LayaGL";
import { Bounds } from "../../math/Bounds";

/**
 *<code>ReflectionProbeManager</code> 类用于反射探针管理
 */
export class ReflectionProbeManager {

    /** @internal 反射探针队列 */
    private _reflectionProbes: ReflectionProbeList = new ReflectionProbeList();
    /** @internal 环境探针 */
    private _sceneReflectionProbe: ReflectionProbe;
    /** @internal 需要跟新反射探针的渲染队列 */
    private _motionObjects: SingletonList<BaseRender> = new SingletonList<BaseRender>();
    /** @internal */
    _needUpdateAllRender: boolean = false;

    /**
     * 实例化一个反射探针管理类
     */
    constructor() {
        this._sceneReflectionProbe = new ReflectionProbe();
        this._sceneReflectionProbe.bounds =LayaGL.renderOBJCreate.createBounds(new Vector3(0, 0, 0), new Vector3(0, 0, 0));
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
    _updateMotionObjects(baseRender: BaseRender): void {
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
    add(reflectionProbe: ReflectionProbe) {
        this._reflectionProbes.add(reflectionProbe);
        this._needUpdateAllRender = true;
    }
    /**
     * 场景中删除反射探针
     * @internal
     * @param reflectionProbe 
     */
    remove(reflectionProbe: ReflectionProbe) {
        this._reflectionProbes.remove(reflectionProbe);
        this._needUpdateAllRender = true;
    }

    /**
     * 添加运动物体。
     * @internal
     * @param 运动物体。
     */
    addMotionObject(renderObject: BaseRender) {
        this._motionObjects.add(renderObject);
    }

    /**
     * @internal
     * 更新运动物体的反射探针信息
     */
    update(): void {
        var elements: BaseRender[] = this._motionObjects.elements;
        for (var i: number = 0, n: number = this._motionObjects.length; i < n; i++) {
            this._updateMotionObjects(elements[i]);
        }
        this.clearMotionObjects();
    }

    /**
     * @internal
     * 更新传入所有渲染器反射探针
     * @param 渲染器列表
     */
    updateAllRenderObjects(baseRenders: SimpleSingletonList) {
        var elements = baseRenders.elements;
        for (var i: number = 0, n: number = baseRenders.length; i < n; i++) {
            this._updateMotionObjects(elements[i] as BaseRender);
        }
        this._needUpdateAllRender = false;
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
        for (let index = 0; index < this._reflectionProbes.length; index++) {
            let probe = this._reflectionProbes.elements[index];
            probe.destroy();
        }
        this._reflectionProbes.length = 0;
        this._motionObjects.length = 0;
        this._sceneReflectionProbe.destroy();
        this._sceneReflectionProbe = null;
    }
}


