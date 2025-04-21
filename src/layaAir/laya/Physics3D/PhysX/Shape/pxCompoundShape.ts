import { PhysicsCollider } from "../../../d3/physics/PhysicsCollider";
import { PhysicsColliderComponent } from "../../../d3/physics/PhysicsColliderComponent";
import { Rigidbody3D } from "../../../d3/physics/Rigidbody3D";
import { Physics3DUtils } from "../../../d3/utils/Physics3DUtils";
import { ICompoundColliderShape } from "../../interface/Shape/ICompoundColliderShape";
import { pxPhysicsCreateUtil } from "../pxPhysicsCreateUtil";
import { pxColliderShape } from "./pxColliderShape";

export class pxCompoundShape extends pxColliderShape implements ICompoundColliderShape {

    private _physicsComponent: PhysicsColliderComponent;
    pxShapes: pxColliderShape[] = [];

    constructor() {
        super();
        this._pxGeometry = new pxPhysicsCreateUtil._physX.PxBoxGeometry(
            0.1,
            0.1,
            0.1
        );
        this._createShape();
    }

    addChildShape(shape: pxColliderShape): void {
        this.pxShapes.push(shape);
        let trigger: boolean = false;
        if (this._physicsComponent instanceof Rigidbody3D) {
            trigger = (this._physicsComponent as Rigidbody3D).trigger;
        }
        if (this._physicsComponent instanceof PhysicsCollider) {
            trigger = (this._physicsComponent as PhysicsCollider).isTrigger;
        }
        shape.setIsTrigger(trigger);
        shape.setSimulationFilterData((this._physicsComponent && this._physicsComponent.collisionGroup != Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER) ? this._physicsComponent.collisionGroup : Physics3DUtils.PHYSXDEFAULTMASKVALUE, (this._physicsComponent && this._physicsComponent.canCollideWith != Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER) ? this._physicsComponent.canCollideWith : Physics3DUtils.PHYSXDEFAULTMASKVALUE);
        this._pxCollider && this._pxCollider.setColliderShape(shape);
    }
    removeChildShape(shape: pxColliderShape, index: number): void {
        this.pxShapes.splice(index, 1);
        this._pxCollider && shape.removeFromActor(this._pxCollider);
    }

    setShapeData(component: PhysicsColliderComponent): void {
        this._physicsComponent = component;
    }

    refreshShapes(): void {
        this.pxShapes.forEach(shape => {
            let trigger: boolean = false;
            if (this._physicsComponent instanceof Rigidbody3D) {
                trigger = (this._physicsComponent as Rigidbody3D).trigger;
            }
            if (this._physicsComponent instanceof PhysicsCollider) {
                trigger = (this._physicsComponent as PhysicsCollider).isTrigger;
            }
            shape.setIsTrigger(trigger);
            shape.setSimulationFilterData((this._physicsComponent && this._physicsComponent.collisionGroup != Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER) ? this._physicsComponent.collisionGroup : Physics3DUtils.PHYSXDEFAULTMASKVALUE, (this._physicsComponent && this._physicsComponent.canCollideWith != Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER) ? this._physicsComponent.canCollideWith : Physics3DUtils.PHYSXDEFAULTMASKVALUE);
            this._pxCollider && shape.addToActor(this._pxCollider);
        });
    }
}