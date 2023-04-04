import { SingletonList } from "../../../utils/SingletonList";
import { BaseRender } from "../../core/render/BaseRender";
import { Volume } from "./Volume";

/**
 * <code>VolumeManager</code> 类用于管理体积组件
 */
export interface IVolumeManager {
    /**是否需要重新更新 */
    /** @internal */
    _needUpdateAllRender: boolean;
    /* @internal*/
    add(volume: Volume): void;
    /* @internal*/
    remove(volume: Volume): void;
    /* @internal*/
    _updateRenderObject(baseRender: BaseRender): void;
    /* @internal*/
    handleMotionlist(motionObjects: SingletonList<BaseRender>): void;
    /* @internal*/
    reCaculateAllRenderObjects(baseRenders: SingletonList<BaseRender>): void;
    /* @internal*/
    destroy(): void;
}