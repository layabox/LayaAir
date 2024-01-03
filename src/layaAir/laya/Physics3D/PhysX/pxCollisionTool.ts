import { Collision } from "../../d3/physics/Collision";
import { ContactPoint } from "../../d3/physics/ContactPoint";
import { HitResult } from "../../d3/physics/HitResult";
import { Vector3 } from "../../maths/Vector3";
import { pxCollider } from "./Collider/pxCollider";
import { pxColliderShape } from "./Shape/pxColliderShape";

/**
 * 实现PhysX碰撞数据内容
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
     * 转换physX的LayaQuaryResult到HitResult类型
     * @param out
     * @param quaryResult 
     * @returns 
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
     * 转换所有physX的LayaQuaryResult到HitResult类型
     * @param out 
     * @param quaryResults
     * @returns 
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
     * 回收Collision到pool
     * @param value 
     */
    static reCoverCollision(value: Collision) {
        if (!value._inPool) {
            value._inPool = true;
            pxCollisionTool._collisionPool.push(value);
        }
    }

    /**
     * 回收HitResult到pool
     * @param value 
     */
    static reCoverHitresults(value: HitResult) {
        if (!value._inPool) {
            value._inPool = true;
            pxCollisionTool._hitPool.push(value);
        }
    }
}