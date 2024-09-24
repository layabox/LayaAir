import { Collision } from "../../d3/physics/Collision";
import { ContactPoint } from "../../d3/physics/ContactPoint";
import { HitResult } from "../../d3/physics/HitResult";
import { Vector3 } from "../../maths/Vector3";
import { pxCollider } from "./Collider/pxCollider";
import { pxColliderShape } from "./Shape/pxColliderShape";

/**
 * @en Implements PhysX collision data content
 * @zh 实现PhysX碰撞数据内容
 */
export class pxCollisionTool {
    /**@internal */
    static _collisionPool: Collision[] = [];
    /**@internal */
    static _hitPool: HitResult[] = [];
    /**@internal */
    static _tempV3: Vector3 = new Vector3();
    /**@internal */
    static _contactPoint: ContactPoint = new ContactPoint();

    /**@ignore */
    constructor() {

    }


    /**
     * @internal
     */
    static getCollision(pxCollsionData: any, isTrigger: boolean): Collision {
        let collisionData = pxCollsionData.get(0);
        if (!collisionData) return null;
        let collsion = pxCollisionTool._collisionPool.length === 0 ? new Collision() : pxCollisionTool._collisionPool.pop();
        collsion._inPool = false;
        if (isTrigger) {
            // trigger
            let otherShape = pxColliderShape._shapePool.get(collisionData.otherShape);
            let triggerShape = pxColliderShape._shapePool.get(collisionData.triggerShape);
            collsion._colliderA = otherShape._pxCollider;
            collsion._colliderB = triggerShape._pxCollider;
            collsion._isTrigger = true;
        } else {
            // collision
            let shape0 = pxColliderShape._shapePool.get(collisionData.pxShape0);
            let shape1 = pxColliderShape._shapePool.get(collisionData.pxShape1);
            // get pxCollider
            collsion._colliderA = shape0._pxCollider;
            collsion._colliderB = shape1._pxCollider;
            for (let i = 0, j = collisionData.contactCount; i < j; i++) {
                let contactInfo = collisionData["contactPoint" + i];
                if (!contactInfo) continue;
                let contact = pxCollisionTool._contactPoint;
                contact._colliderA = collsion._colliderA;
                contact._colliderB = collsion._colliderB;
                // contact.distance = 
                contact.normal = pxCollisionTool._tempV3.setValue(contactInfo.normal.x, contactInfo.normal.y, contactInfo.normal.z);
                contact.positionOnA = contact.positionOnB = pxCollisionTool._tempV3.setValue(contactInfo.position.x, contactInfo.position.y, contactInfo.position.z);
                collsion.contacts.push(contact);
            }
        }
        return collsion;
    }

    /**
     * @en Convert PhysX LayaQuaryResult to HitResult type
     * @param out The HitResult object to store the result
     * @param quaryResult The PhysX query result
     * @returns The converted HitResult
     * @zh 转换PhysX的LayaQuaryResult到HitResult类型
     * @param out 用于存储结果的HitResult对象
     * @param quaryResult PhysX查询结果
     * @returns 转换后的HitResult
     */
    static getRayCastResult(out: HitResult, quaryResult: any): HitResult {
        if (quaryResult.Quary) {
            out.succeeded = quaryResult.Quary;
            let normal = out.normal;
            normal.x = quaryResult.normal.x;
            normal.y = quaryResult.normal.y;
            normal.z = quaryResult.normal.z;
            let hitPos = out.point;
            hitPos.x = quaryResult.position.x;
            hitPos.y = quaryResult.position.y;
            hitPos.z = quaryResult.position.z;
            out.collider = pxCollider._ActorPool.get(quaryResult.ActorUUID);
        }
        return out;
    }

    /**
     * @en Convert all PhysX LayaQuaryResults to HitResult type
     * @param out The array to store the converted HitResults
     * @param quaryResults The PhysX query results
     * @returns The array of converted HitResults
     * @zh 转换所有PhysX的LayaQuaryResult到HitResult类型
     * @param out 用于存储转换后HitResult的数组
     * @param quaryResults PhysX查询结果
     * @returns 转换后的HitResult数组
     */
    static getRayCastResults(out: HitResult[], quaryResults: any): HitResult[] {
        let quarySize: number = quaryResults.size();
        if (quarySize <= 0) return out;
        out.length = 0;
        for (let i = 0; i < quarySize; i++) {
            let result: any = quaryResults.get(i);
            let outItem: HitResult = pxCollisionTool._hitPool.length === 0 ? new HitResult() : pxCollisionTool._hitPool.pop();
            outItem._inPool = false;
            if (result) {
                outItem.succeeded = result.Quary;
                let normal: any = outItem.normal;
                normal.x = result.normal.x;
                normal.y = result.normal.y;
                normal.z = result.normal.z;
                let hitPos: any = outItem.point;
                hitPos.x = result.position.x;
                hitPos.y = result.position.y;
                hitPos.z = result.position.z;
                outItem.collider = pxCollider._ActorPool.get(result.ActorUUID);
                out.push(outItem);
            }
        }
        return out;
    }

    /**
     * @en Recycle Collision object back to the pool
     * @param value The Collision object to be recycled
     * @zh 回收Collision对象到对象池
     * @param value 要回收的Collision对象
     */
    static reCoverCollision(value: Collision) {
        if (!value._inPool) {
            value._inPool = true;
            pxCollisionTool._collisionPool.push(value);
        }
    }

    /**
     * @en Recycle HitResult object back to the pool
     * @param value The HitResult object to be recycled
     * @zh 回收HitResult对象到对象池
     * @param value 要回收的HitResult对象
     */
    static reCoverHitresults(value: HitResult) {
        if (!value._inPool) {
            value._inPool = true;
            pxCollisionTool._hitPool.push(value);
        }
    }
}