import { ICollider } from "../../Physics3D/interface/ICollider";
import { Vector3 } from "../../maths/Vector3";

/**
 * <code>HitResult</code> 类用于实现射线检测或形状扫描的结果。
 */
export class HitResult {
    /** 是否成功。 */
    succeeded: boolean = false;
    /** 发生碰撞的碰撞组件。*/
    collider: ICollider = null;
    /** 碰撞点。*/
    point: Vector3 = new Vector3();
    /** 碰撞法线。*/
    normal: Vector3 = new Vector3();
    /** 碰撞分数。 */
    hitFraction: number = 0;

    /**@internal */
    _inPool: boolean = false;

    /**
     * 创建一个 <code>HitResult</code> 实例。
     */
    constructor() {

    }
}


