import { RigidBody } from "./RigidBody";
import { Physics } from "./Physics";
/**
 * @internal
 * 使用全局类的时候，避免引用其他模块
 */
export class IPhysics {
    static RigidBody: typeof RigidBody = null;
    static Physics: typeof Physics = null;
}