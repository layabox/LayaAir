import { PhysicsCombineMode } from "../../../d3/physics/PhysicsColliderComponent";
import { Physics3DUtils } from "../../../d3/utils/Physics3DUtils";
import { Quaternion } from "../../../maths/Quaternion";
import { Vector3 } from "../../../maths/Vector3";
import { ICompoundColliderShape } from "../../interface/Shape/ICompoundColliderShape";
import { pxCollider } from "../Collider/pxCollider";
import { partFlag } from "../pxStatics";
import { pxColliderShape } from "./pxColliderShape";

interface pxCompoundChild {
    shape: pxColliderShape;
    position: Vector3;
    rotation: Quaternion;
    scale: Vector3;
}

/** PhysX compounds are represented by attaching every child PxShape to the same actor. */
export class pxCompoundColliderShape extends pxColliderShape implements ICompoundColliderShape {

    private _isTrigger: boolean = false;
    private _collisionGroup: number = Physics3DUtils.PHYSXDEFAULTMASKVALUE;
    private _collisionMask: number = Physics3DUtils.PHYSXDEFAULTMASKVALUE;
    private _eventFilterData: number = partFlag.eCONTACT_DEFAULT;
    private _bounciness: number = 0.1;
    private _dynamicFriction: number = 0.1;
    private _staticFriction: number = 0.1;
    private _bounceCombine: PhysicsCombineMode = PhysicsCombineMode.Average;
    private _frictionCombine: PhysicsCombineMode = PhysicsCombineMode.Average;

    private _children: pxCompoundChild[] = [];

    addChildShape(shape: pxColliderShape): void {
        this.addChildShapeWithTransform(shape, shape.getOffset(), Quaternion.DEFAULT, Vector3.ONE);
    }

    addChildShapeWithTransform(shape: pxColliderShape, localPosition: Vector3, localRotation: Quaternion, localScale: Vector3): void {
        const child: pxCompoundChild = {
            shape,
            position: localPosition.clone(),
            rotation: localRotation.clone(),
            scale: localScale.clone()
        };
        this._children.push(child);
        this._applyChildTransform(child);
        this._applyShapeData(shape);
        this._pxCollider && shape.addToActor(this._pxCollider);
    }

    removeChildShape(shape: pxColliderShape, index: number): void {
        if (index < 0 || index >= this._children.length)
            return;
        const child = this._children[index];
        if (child.shape !== shape)
            return;
        this._children.splice(index, 1);
        this._pxCollider && child.shape.removeFromActor(this._pxCollider);
    }

    addToActor(collider: pxCollider): void {
        if (this._pxCollider === collider)
            return;
        if (this._pxCollider)
            this.removeFromActor(this._pxCollider);
        this._pxCollider = collider;
        this._children.forEach(child => {
            this._applyChildTransform(child);
            child.shape.addToActor(collider);
        });
    }

    removeFromActor(collider: pxCollider): void {
        if (this._pxCollider !== collider)
            return;
        this._children.forEach(child => child.shape.removeFromActor(collider));
        this._pxCollider = null;
    }

    setOffset(position: Vector3): void {
        position.cloneTo(this._offset);
        this._children.forEach(child => this._applyChildTransform(child));
    }

    setIsTrigger(value: boolean): void {
        this._isTrigger = value;
        this._children.forEach(child => child.shape.setIsTrigger(value));
    }

    setSimulationFilterData(colliderGroup: number, colliderMask: number): void {
        this._collisionGroup = colliderGroup;
        this._collisionMask = colliderMask;
        this._children.forEach(child => {
            child.shape.setSimulationFilterData(colliderGroup, colliderMask);
            child.shape.setEventFilterData(this._eventFilterData);
        });
    }

    setEventFilterData(filterWorld2Number: number): void {
        this._eventFilterData = filterWorld2Number;
        this._children.forEach(child => child.shape.setEventFilterData(filterWorld2Number));
    }

    setBounciness(value: number): void {
        this._bounciness = value;
        this._children.forEach(child => child.shape.setBounciness(value));
    }

    setDynamicFriction(value: number): void {
        this._dynamicFriction = value;
        this._children.forEach(child => child.shape.setDynamicFriction(value));
    }

    setStaticFriction(value: number): void {
        this._staticFriction = value;
        this._children.forEach(child => child.shape.setStaticFriction(value));
    }

    setFrictionCombine(value: PhysicsCombineMode): void {
        this._frictionCombine = value;
        this._children.forEach(child => child.shape.setFrictionCombine(value));
    }

    setBounceCombine(value: PhysicsCombineMode): void {
        this._bounceCombine = value;
        this._children.forEach(child => child.shape.setBounceCombine(value));
    }

    destroy(): void {
        if (this._destroyed)
            return;
        if (this._pxCollider)
            this.removeFromActor(this._pxCollider);
        this._children.length = 0;
        this._destroyed = true;
    }

    private _applyChildTransform(child: pxCompoundChild): void {
        const position = new Vector3();
        Vector3.add(this._offset, child.position, position);
        child.shape.setCompoundTransform(position, child.rotation, child.scale);
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
}
