import { Scene3D } from "./laya/d3/core/scene/Scene3D";
import { Laya3D } from "./Laya3D";

/**
 * @internal
 * 使用全局类的时候，避免引用其他模块
 */
export class ILaya3D {
    static Scene3D: typeof Scene3D = null;
    static Laya3D: typeof Laya3D = null;
}
