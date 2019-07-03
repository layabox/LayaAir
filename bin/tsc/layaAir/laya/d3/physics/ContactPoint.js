import { Vector3 } from "../math/Vector3";
/**
 * <code>ContactPoint</code> 类用于创建物理碰撞信息。
 */
export class ContactPoint {
    /**
     * 创建一个 <code>ContactPoint</code> 实例。
     */
    constructor() {
        /**@internal */
        this._idCounter = 0;
        /**碰撞器A。*/
        this.colliderA = null;
        /**碰撞器B。*/
        this.colliderB = null;
        /**距离。*/
        this.distance = 0;
        /**法线。*/
        this.normal = new Vector3();
        /**碰撞器A的碰撞点。*/
        this.positionOnA = new Vector3();
        /**碰撞器B的碰撞点。*/
        this.positionOnB = new Vector3();
        /*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
        this._id = ++this._idCounter;
    }
}
