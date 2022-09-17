import { SimpleSingletonList } from "../../../utils/SimpleSingletonList";
import { SingletonList } from "../../../utils/SingletonList";
import { BaseRender } from "../../core/render/BaseRender";
import { Bounds } from "../../math/Bounds";
import { ReflectionProbeManager } from "./reflectionProbe/ReflectionProbeManager";
import { Volume, volumeIntersectType } from "./Volume";

/**
 * <code>VolumeManager</code> 类用于管理体积组件
 */
export interface IVolumeManager {
    /**是否需要重新更新 */
    _needUpdateAllRender: boolean;
    add(volume: Volume): void;
    remove(volume: Volume): void;
    _updateRenderObject(baseRender: BaseRender): void;
    handleMotionlist(motionObjects: SingletonList<BaseRender>): void;
    reCaculateAllRenderObjects(baseRenders: SimpleSingletonList<BaseRender>): void;
    destroy(): void;
}