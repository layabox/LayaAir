import { Vector3 } from "../math/Vector3";
/**
 * <code>Physics</code> 类用于简单物理检测。
 */
export class Physics3DUtils {
    /**
     * 创建一个 <code>Physics</code> 实例。
     */
    constructor() {
    }
    /**
     * 是否忽略两个碰撞器的碰撞检测。
     * @param	collider1 碰撞器一。
     * @param	collider2 碰撞器二。
     * @param	ignore 是否忽略。
     */
    static setColliderCollision(collider1, collider2, collsion) {
    }
    /**
     * 获取是否忽略两个碰撞器的碰撞检测。
     * @param	collider1 碰撞器一。
     * @param	collider2 碰撞器二。
     * @return	是否忽略。
     */
    static getIColliderCollision(collider1, collider2) {
        //return collider1._ignoreCollisonMap[collider2.id] ? true : false;
        return false;
    }
}
Physics3DUtils.COLLISIONFILTERGROUP_DEFAULTFILTER = 0x1;
Physics3DUtils.COLLISIONFILTERGROUP_STATICFILTER = 0x2;
Physics3DUtils.COLLISIONFILTERGROUP_KINEMATICFILTER = 0x4;
Physics3DUtils.COLLISIONFILTERGROUP_DEBRISFILTER = 0x8;
Physics3DUtils.COLLISIONFILTERGROUP_SENSORTRIGGER = 0x10;
Physics3DUtils.COLLISIONFILTERGROUP_CHARACTERFILTER = 0x20;
Physics3DUtils.COLLISIONFILTERGROUP_CUSTOMFILTER1 = 0x40;
Physics3DUtils.COLLISIONFILTERGROUP_CUSTOMFILTER2 = 0x80;
Physics3DUtils.COLLISIONFILTERGROUP_CUSTOMFILTER3 = 0x100;
Physics3DUtils.COLLISIONFILTERGROUP_CUSTOMFILTER4 = 0x200;
Physics3DUtils.COLLISIONFILTERGROUP_CUSTOMFILTER5 = 0x400;
Physics3DUtils.COLLISIONFILTERGROUP_CUSTOMFILTER6 = 0x800;
Physics3DUtils.COLLISIONFILTERGROUP_CUSTOMFILTER7 = 0x1000;
Physics3DUtils.COLLISIONFILTERGROUP_CUSTOMFILTER8 = 0x2000;
Physics3DUtils.COLLISIONFILTERGROUP_CUSTOMFILTER9 = 0x4000;
Physics3DUtils.COLLISIONFILTERGROUP_CUSTOMFILTER10 = 0x8000;
Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER = -1;
/**重力值。*/
Physics3DUtils.gravity = new Vector3(0, -9.81, 0);
