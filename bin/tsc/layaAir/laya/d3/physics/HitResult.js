import { Vector3 } from "../math/Vector3";
/**
 * <code>HitResult</code> 类用于实现射线检测或形状扫描的结果。
 */
export class HitResult {
    /**
     * 创建一个 <code>HitResult</code> 实例。
     */
    constructor() {
        /** 是否成功。 */
        this.succeeded = false;
        /** 发生碰撞的碰撞组件。*/
        this.collider = null;
        /** 碰撞点。*/
        this.point = new Vector3();
        /** 碰撞法线。*/
        this.normal = new Vector3();
        /** 碰撞分数。 */
        this.hitFraction = 0;
    }
}
