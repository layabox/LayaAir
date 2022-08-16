import { Scene3D } from "./laya/d3/core/scene/Scene3D";
import { Laya3D } from "./Laya3D";
import { Physics3D } from "./laya/d3/Physics3D";
import { Shader3D } from "./laya/RenderEngine/RenderShader/Shader3D";

/**
 * @internal
 * 使用全局类的时候，避免引用其他模块
 */
export class ILaya3D {
    static Shader3D: typeof Shader3D = null;
    static Scene3D: typeof Scene3D = null;
    static Laya3D: typeof Laya3D = null;
    static Physics3D: typeof Physics3D = null;
}
