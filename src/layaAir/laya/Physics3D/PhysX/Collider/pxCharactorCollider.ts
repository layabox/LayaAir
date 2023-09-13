import { PhysicsCombineMode } from "../../../d3/physics/PhysicsColliderComponent";
import { Node } from "../../../display/Node";
import { Quaternion } from "../../../maths/Quaternion";
import { Vector3 } from "../../../maths/Vector3";
import { ICharacterController } from "../../interface/ICharacterController";
import { IColliderShape } from "../../interface/Shape/IColliderShape";
import { pxCapsuleColliderShape } from "../Shape/pxCapsuleColliderShape";
import { pxColliderShape } from "../Shape/pxColliderShape";
import { pxPhysicsCreateUtil } from "../pxPhysicsCreateUtil";
import { pxPhysicsManager } from "../pxPhysicsManager";
import { pxCollider, pxColliderType } from "./pxCollider";
import { pxDynamicCollider } from "./pxDynamicCollider";
export enum ControllerNonWalkableMode {
    ePREVENT_CLIMBING,						//!< Stops character from climbing up non-walkable slopes, but doesn't move it otherwise
    ePREVENT_CLIMBING_AND_FORCE_SLIDING		//!< Stops character from climbing up non-walkable slopes, and forces it to slide down those slopes
};


export class pxCharactorCollider extends pxCollider implements ICharacterController {
    static tempV3: Vector3 = new Vector3();
    _shapeID: number;
    /** @internal */
    _id: number;
    /** @internal */
    _pxController: any;
    /** @internal */
    _pxNullShape: pxCapsuleColliderShape;
    /**@internal */
    _radius: number = 0.5;
    /**@internal */
    _height: number = 2;
    /**@internal */
    _localOffset: Vector3 = new Vector3();
    /**@internal */
    _upDirection: Vector3 = new Vector3(0, 1, 0);
    /**@internal */
    private _stepOffset: number = 0;
    /**@internal */
    private _slopeLimit: number = 0;
    /**@internal */
    private _contactOffset: number = 0;
    /**@internal */
    private _minDistance: number = 0;

    private _nonWalkableMode: ControllerNonWalkableMode = ControllerNonWalkableMode.ePREVENT_CLIMBING;

    private _grivate: Vector3 = new Vector3();

    constructor(manager: pxPhysicsManager) {
        super(manager);
        this._type = pxColliderType.RigidbodyCollider;
    }

    private _getNodeScale() {
        return this.owner ? this.owner.transform.getWorldLossyScale() : Vector3.ONE;
    }

    private _init() {
        //TODO
    }

    getCapable(value: number): boolean {
        //TODO
        return false;
    }

    /**
     * create from physics Engine
     */
    _createController() {
        let desc: any;
        const pxPhysics = pxPhysicsCreateUtil._pxPhysics;
        desc = new pxPhysics._physX.PxCapsuleControllerDesc();
        let scale = this._getNodeScale();
        desc.radius = this._radius * Math.max(scale.x, scale.z);
        desc.height = this._height * scale.y;
        desc.climbingMode = 1; // constraint mode=
        this._pxNullShape = this._pxNullShape ? this._pxNullShape : new pxCapsuleColliderShape();

        desc.setMaterial(this._pxNullShape._pxMaterials[0]);
        this._pxNullShape._pxCollider = this;
        this._pxController = this._physicsManager._pxcontrollerManager.createController(desc);
        pxColliderShape._shapePool.set(this._id, this as any);
        this.setPosition(this.owner.transform.position);
    }

    /**
     * remove from physics Engine
     */
    _releaseController() {
        if (this._pxController) {
            this._pxController.release();
            this._pxController = null;
        }
    }

    move(disp: Vector3): void {
        return this._pxController.move(disp, this._minDistance, 1 / 60);
    }

    jump?(velocity: Vector3): void {
        //Move TODO
    }

    setStepOffset(offset: number) {
        this._stepOffset = offset;
        this._pxController.setStepOffset(this._stepOffset);
    }

    setUpDirection(up: Vector3): void {
        up.cloneTo(this._upDirection);
        this._pxController.setUpDirection(up);
    }

    setSlopeLimit(value: number) {
        this._slopeLimit = value;
        this.setSlopeLimit(Math.cos(this._slopeLimit / 180 * Math.PI));
    }

    setGravity(value: Vector3): void {
        value.cloneTo(this._grivate);
        //TODO
    }

    //update character by Physics engine
    getWorldTransform() {
        const v3 = this._pxController.getPosition();
        pxDynamicCollider._tempTranslation.set(v3.x, v3.y, v3.z);
        this.owner.transform.position = pxDynamicCollider._tempTranslation;
    }


    setSkinWidth(width: number): void {
        this._contactOffset = width;
        this._pxController.setContactOffset(this._contactOffset);
    }

    destroy(): void {
        this._releaseController();
    }

    setPosition(value: Vector3): void {
        // let v3 = this.owner.transform.position;
        // let scale = this._getNodeScale();
        // pxCharactorCollider.tempV3.setValue(this._localOffset.x * scale.x, this._localOffset.y * scale.y, this._localOffset.z * scale.z);
        // Vector3.add(v3, pxCharactorCollider.tempV3, pxCharactorCollider.tempV3);
        this._pxController.setPosition(value);
    }

    setShapelocalOffset(value:Vector3){
        
    }

    setHeight(value: number) {
        this._height = value * 2;
        let scale = this._getNodeScale();
        this._pxController.resize(this._height * scale.y)

    }

    setRadius(value: number) {
        this._radius = value;
        let scale = this._getNodeScale();
        this._pxController.setRadius(this._radius * Math.max(scale.x, scale.z))
    }

    setminDistance(value: number) {
        this._minDistance = value;
    }

    setNonWalkableMode(value: ControllerNonWalkableMode) {
        this._nonWalkableMode = value;
        this._pxController.setNonWalkableMode(this._nonWalkableMode);
    }

    release() {
        if (this._pxController) {
            this._pxController.release();
            this._pxController = null;
        }
    }

}