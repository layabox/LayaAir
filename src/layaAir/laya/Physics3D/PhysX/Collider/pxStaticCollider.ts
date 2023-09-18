import { Quaternion } from "../../../maths/Quaternion";
import { Vector3 } from "../../../maths/Vector3";
import { IStaticCollider } from "../../interface/IStaticCollider";
import { EColliderCapable } from "../../physicsEnum/EColliderCapable";
import { pxPhysicsCreateUtil } from "../pxPhysicsCreateUtil";
import { pxPhysicsManager } from "../pxPhysicsManager";
import { pxCollider } from "./pxCollider";

export class pxStaticCollider extends pxCollider implements IStaticCollider {

    /**@internal */
    static _staticCapableMap: Map<any, any>;

    static getStaticColliderCapable(value: EColliderCapable): boolean {
        return pxStaticCollider._staticCapableMap.get(value);
    }

    static initCapable(): void {
        this._staticCapableMap = new Map();
        this._staticCapableMap.set(EColliderCapable.Collider_AllowTrigger, true);
        this._staticCapableMap.set(EColliderCapable.Collider_CollisionGroup, true);
        this._staticCapableMap.set(EColliderCapable.Collider_Friction, false);
        this._staticCapableMap.set(EColliderCapable.Collider_Restitution, true);
        this._staticCapableMap.set(EColliderCapable.Collider_RollingFriction, false);
        this._staticCapableMap.set(EColliderCapable.Collider_DynamicFriction, true);
        this._staticCapableMap.set(EColliderCapable.Collider_StaticFriction, true);
        this._staticCapableMap.set(EColliderCapable.Collider_BounceCombine, true);
        this._staticCapableMap.set(EColliderCapable.Collider_FrictionCombine, true);
    }


    constructor(manager: pxPhysicsManager) {
        super(manager);
    }



    getCapable(value: number): boolean {
        return pxStaticCollider.getStaticColliderCapable(value);
    }

    protected _initCollider() {
        this._pxActor = pxPhysicsCreateUtil._pxPhysics.createRigidStatic(this._transformTo(new Vector3(), new Quaternion()));
        
    }

    setTrigger(value: boolean): void {
        this._isTrigger = value;
        this._shape && this._shape.setIsTrigger(value);
    }

    protected _initColliderShapeByCollider() {
        super._initColliderShapeByCollider();
        this.setWorldTransform(true);
        this.setTrigger(this._isTrigger);
    }


}