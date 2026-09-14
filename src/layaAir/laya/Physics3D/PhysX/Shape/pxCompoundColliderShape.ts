import { PhysicsCollider } from "../../../d3/physics/PhysicsCollider";
import { PhysicsColliderComponent, PhysicsCombineMode } from "../../../d3/physics/PhysicsColliderComponent";
import { Rigidbody3D } from "../../../d3/physics/Rigidbody3D";
import { Physics3DUtils } from "../../../d3/utils/Physics3DUtils";
import { Quaternion } from "../../../maths/Quaternion";
import { Vector3 } from "../../../maths/Vector3";
import { ICompoundColliderShape } from "../../interface/Shape/ICompoundColliderShape";
import { pxCollider } from "../Collider/pxCollider";
import { partFlag } from "../pxStatics";
import { pxColliderShape } from "./pxColliderShape";

/** PhysX compounds are represented by attaching every child PxShape to the same actor. */
export class pxCompoundColliderShape extends pxColliderShape implements ICompoundColliderShape {

    private _physicsComponent: PhysicsColliderComponent;
    private _isTrigger: boolean = false;
    private _collisionGroup: number = Physics3DUtils.PHYSXDEFAULTMASKVALUE;
    private _collisionMask: number = Physics3DUtils.PHYSXDEFAULTMASKVALUE;
    private _eventFilterData: number = partFlag.eCONTACT_DEFAULT;
    private _bounciness: number = 0.1;
    private _dynamicFriction: number = 0.1;
    private _staticFriction: number = 0.1;
    private _bounceCombine: PhysicsCombineMode = PhysicsCombineMode.Average;
    private _frictionCombine: PhysicsCombineMode = PhysicsCombineMode.Average;

    pxShapes: pxColliderShape[] = [];

    addChildShape(shape: pxColliderShape, localRotation?: Quaternion): void {
        this.pxShapes.push(shape);
        shape.setRotation(localRotation || new Quaternion());
        this._applyShapeData(shape);
        this._pxCollider && shape.addToActor(this._pxCollider);
    }

    removeChildShape(shape: pxColliderShape, index: number): void {
        if (index < 0 || index >= this.pxShapes.length)
            return;
        const childShape = this.pxShapes[index];
        this.pxShapes.splice(index, 1);
        this._pxCollider && childShape.removeFromActor(this._pxCollider);
    }

    setShapeData(component: PhysicsColliderComponent): void {
        this._physicsComponent = component;
        if (component) {
            this._isTrigger = component instanceof Rigidbody3D ? component.trigger :
                component instanceof PhysicsCollider ? component.isTrigger : false;
            this._collisionGroup = this._normalizeFilter(component.collisionGroup);
            this._collisionMask = this._normalizeFilter(component.canCollideWith);
        }
        this.pxShapes.forEach(shape => this._applyShapeData(shape));
    }

    addToActor(collider: pxCollider): void {
        if (this._pxCollider === collider)
            return;
        if (this._pxCollider)
            this.removeFromActor(this._pxCollider);
        this._pxCollider = collider;
        this.pxShapes.forEach(shape => shape.addToActor(collider));
    }

    removeFromActor(collider: pxCollider): void {
        if (this._pxCollider !== collider)
            return;
        this.pxShapes.forEach(shape => shape.removeFromActor(collider));
        this._pxCollider = null;
    }

    setOffset(position: Vector3): void {
        position.cloneTo(this._offset);
        this.pxShapes.forEach(shape => shape.setOffset(shape.getOffset()));
    }

    setIsTrigger(value: boolean): void {
        this._isTrigger = value;
        this.pxShapes.forEach(shape => shape.setIsTrigger(value));
    }

    setSimulationFilterData(colliderGroup: number, colliderMask: number): void {
        this._collisionGroup = colliderGroup;
        this._collisionMask = colliderMask;
        this.pxShapes.forEach(shape => {
            shape.setSimulationFilterData(colliderGroup, colliderMask);
            shape.setEventFilterData(this._eventFilterData);
        });
    }

    setEventFilterData(filterWorld2Number: number): void {
        this._eventFilterData = filterWorld2Number;
        this.pxShapes.forEach(shape => shape.setEventFilterData(filterWorld2Number));
    }

    setBounciness(value: number): void {
        this._bounciness = value;
        this.pxShapes.forEach(shape => shape.setBounciness(value));
    }

    setDynamicFriction(value: number): void {
        this._dynamicFriction = value;
        this.pxShapes.forEach(shape => shape.setDynamicFriction(value));
    }

    setStaticFriction(value: number): void {
        this._staticFriction = value;
        this.pxShapes.forEach(shape => shape.setStaticFriction(value));
    }

    setFrictionCombine(value: PhysicsCombineMode): void {
        this._frictionCombine = value;
        this.pxShapes.forEach(shape => shape.setFrictionCombine(value));
    }

    setBounceCombine(value: PhysicsCombineMode): void {
        this._bounceCombine = value;
        this.pxShapes.forEach(shape => shape.setBounceCombine(value));
    }

    destroy(): void {
        if (this._destroyed)
            return;
        if (this._pxCollider)
            this.removeFromActor(this._pxCollider);
        this.pxShapes.length = 0;
        this._physicsComponent = null;
        this._destroyed = true;
    }

    private _applyShapeData(shape: pxColliderShape): void {
        shape.setIsTrigger(this._isTrigger);
        shape.setSimulationFilterData(this._collisionGroup, this._collisionMask);
        shape.setEventFilterData(this._eventFilterData);
        shape.setBounciness(this._bounciness);
        shape.setDynamicFriction(this._dynamicFriction);
        shape.setStaticFriction(this._staticFriction);
        shape.setFrictionCombine(this._frictionCombine);
        shape.setBounceCombine(this._bounceCombine);
    }

    private _normalizeFilter(value: number): number {
        return value === Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER ?
            Physics3DUtils.PHYSXDEFAULTMASKVALUE : value;
    }
}
