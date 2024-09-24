import { FastSinglelist } from "../../../utils/SingletonList";
import { BaseRender } from "../../core/render/BaseRender";
import { Volume } from "./Volume";

/**
 * @en The `VolumeManager` class is used to manage volume components.
 * @zh `VolumeManager` 类用于管理体积组件。
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
    handleMotionlist(motionObjects: FastSinglelist<BaseRender>): void;
    /* @internal*/
    reCaculateAllRenderObjects(baseRenders: FastSinglelist<BaseRender>): void;
    /* @internal*/
    destroy(): void;
}