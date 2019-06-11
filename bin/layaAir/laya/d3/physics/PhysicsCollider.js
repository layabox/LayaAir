import { Transform3D } from "../core/Transform3D";
import { Physics3DUtils } from "../utils/Physics3DUtils";
import { PhysicsComponent } from "./PhysicsComponent";
import { PhysicsTriggerComponent } from "./PhysicsTriggerComponent";
import { Physics } from "./Physics";
/**
 * <code>PhysicsCollider</code> 类用于创建物理碰撞器。
 */
export class PhysicsCollider extends PhysicsTriggerComponent {
    /**
     * 创建一个 <code>PhysicsCollider</code> 实例。
     * @param collisionGroup 所属碰撞组。
     * @param canCollideWith 可产生碰撞的碰撞组。
     */
    constructor(collisionGroup = Physics3DUtils.COLLISIONFILTERGROUP_DEFAULTFILTER, canCollideWith = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER) {
        /*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
        super(collisionGroup, canCollideWith);
    }
    /**
     * @inheritDoc
     */
    /*override*/ _addToSimulation() {
        this._simulation._addPhysicsCollider(this, this._collisionGroup, this._canCollideWith);
    }
    /**
     * @inheritDoc
     */
    /*override*/ _removeFromSimulation() {
        this._simulation._removePhysicsCollider(this);
    }
    /**
     * @inheritDoc
     */
    /*override*/ _onTransformChanged(flag) {
        flag &= Transform3D.TRANSFORM_WORLDPOSITION | Transform3D.TRANSFORM_WORLDQUATERNION | Transform3D.TRANSFORM_WORLDSCALE; //过滤有用TRANSFORM标记
        if (flag) {
            this._transformFlag |= flag;
            if (this._isValid() && this._inPhysicUpdateListIndex === -1) //_isValid()表示可使用
                this._simulation._physicsUpdateList.add(this);
        }
    }
    /**
     * @inheritDoc
     */
    /*override*/ _parse(data) {
        (data.friction != null) && (this.friction = data.friction);
        (data.rollingFriction != null) && (this.rollingFriction = data.rollingFriction);
        (data.restitution != null) && (this.restitution = data.restitution);
        (data.isTrigger != null) && (this.isTrigger = data.isTrigger);
        super._parse(data);
        this._parseShape(data.shapes);
    }
    /**
     * @inheritDoc
     */
    /*override*/ _onAdded() {
        var physics3D = Physics._physics3D;
        var btColObj = new physics3D.btCollisionObject();
        btColObj.setUserIndex(this.id);
        btColObj.forceActivationState(PhysicsComponent.ACTIVATIONSTATE_DISABLE_SIMULATION); //prevent simulation
        var flags = btColObj.getCollisionFlags();
        if (this.owner.isStatic) { //TODO:
            if ((flags & PhysicsComponent.COLLISIONFLAGS_KINEMATIC_OBJECT) > 0)
                flags = flags ^ PhysicsComponent.COLLISIONFLAGS_KINEMATIC_OBJECT;
            flags = flags | PhysicsComponent.COLLISIONFLAGS_STATIC_OBJECT;
        }
        else {
            if ((flags & PhysicsComponent.COLLISIONFLAGS_STATIC_OBJECT) > 0)
                flags = flags ^ PhysicsComponent.COLLISIONFLAGS_STATIC_OBJECT;
            flags = flags | PhysicsComponent.COLLISIONFLAGS_KINEMATIC_OBJECT;
        }
        btColObj.setCollisionFlags(flags);
        this._nativeColliderObject = btColObj;
        super._onAdded();
    }
}
