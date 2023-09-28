import { PhysicsCombineMode } from "../../../d3/physics/PhysicsColliderComponent";
import { Node } from "../../../display/Node";
import { Quaternion } from "../../../maths/Quaternion";
import { Vector3 } from "../../../maths/Vector3";
import { ICharacterController } from "../../interface/ICharacterController";
import { IColliderShape } from "../../interface/Shape/IColliderShape";
import { ECharacterCapable } from "../../physicsEnum/ECharacterCapable";
import { pxCapsuleColliderShape } from "../Shape/pxCapsuleColliderShape";
import { ShapeFlag, pxColliderShape } from "../Shape/pxColliderShape";
import { pxPhysicsCreateUtil } from "../pxPhysicsCreateUtil";
import { pxPhysicsManager } from "../pxPhysicsManager";
import { pxCollider, pxColliderType } from "./pxCollider";
import { pxDynamicCollider } from "./pxDynamicCollider";
export enum ControllerNonWalkableMode {
    ePREVENT_CLIMBING,						//!< Stops character from climbing up non-walkable slopes, but doesn't move it otherwise
    ePREVENT_CLIMBING_AND_FORCE_SLIDING		//!< Stops character from climbing up non-walkable slopes, and forces it to slide down those slopes
};

export enum ECharacterCollisionFlag {
    eCOLLISION_SIDES = 1 << 0,	//!< Character is colliding to the sides.
    eCOLLISION_UP = 1 << 1,	//!< Character has collision above.
    eCOLLISION_DOWN = 1 << 2	//!< Character has collision below.
}
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

    private _nonWalkableMode: ControllerNonWalkableMode = ControllerNonWalkableMode.ePREVENT_CLIMBING_AND_FORCE_SLIDING;

    private _gravity: Vector3 = new Vector3(0, -9.81, 0);

    private _characterCollisionFlags: number = 0;

    /**@internal */
    static _characterCapableMap: Map<any, any>;

    constructor(manager: pxPhysicsManager) {
        super(manager);
        this._type = pxColliderType.CharactorCollider;
    }

    private _getNodeScale() {
        return this.owner ? this.owner.transform.getWorldLossyScale() : Vector3.ONE;
    }

    protected _initCollider(): void {
        this._pxActor = pxPhysicsCreateUtil._pxPhysics.createRigidDynamic(this._transformTo(new Vector3(), new Quaternion()));
    }

    getCapable(value: number): boolean {
        return pxCharactorCollider.getCharacterCapable(value);
    }

    static getCharacterCapable(value: ECharacterCapable): boolean {
        return pxCharactorCollider._characterCapableMap.get(value);
    }

    static initCapable(): void {
        this._characterCapableMap = new Map();
        // this._characterCapableMap.set(ECharacterCapable.Charcater_AllowSleep, false);
        this._characterCapableMap.set(ECharacterCapable.Charcater_Gravity, true);
        this._characterCapableMap.set(ECharacterCapable.Charcater_CollisionGroup, true);
        // this._characterCapableMap.set(ECharacterCapable.Charcater_Friction, true);
        // this._characterCapableMap.set(ECharacterCapable.Charcater_Restitution, true);
        // this._characterCapableMap.set(ECharacterCapable.Charcater_RollingFriction, true);
        // this._characterCapableMap.set(ECharacterCapable.Charcater_AllowTrigger, false);
        this._characterCapableMap.set(ECharacterCapable.Charcater_WorldPosition, true);
        this._characterCapableMap.set(ECharacterCapable.Charcater_Move, true);
        this._characterCapableMap.set(ECharacterCapable.Charcater_Jump, true);
        this._characterCapableMap.set(ECharacterCapable.Charcater_StepOffset, true);
        this._characterCapableMap.set(ECharacterCapable.Character_UpDirection, true);
        this._characterCapableMap.set(ECharacterCapable.Character_FallSpeed, true);
        this._characterCapableMap.set(ECharacterCapable.Character_SlopeLimit, true);
        // this._characterCapableMap.set(ECharacterCapable.Character_PushForce, true);
        this._characterCapableMap.set(ECharacterCapable.Character_Radius, true);
        this._characterCapableMap.set(ECharacterCapable.Character_Height, true);
        this._characterCapableMap.set(ECharacterCapable.Character_offset, true);
        this._characterCapableMap.set(ECharacterCapable.Character_Skin, true);
        this._characterCapableMap.set(ECharacterCapable.Character_minDistance, true);
    }

    /**
     * create from physics Engine
     */
    _createController() {
        let desc: any;
        const pxPhysics = pxPhysicsCreateUtil._physX;
        desc = new pxPhysics.PxCapsuleControllerDesc();
        this._characterCollisionFlags = new pxPhysics.PxControllerCollisionFlags(ECharacterCollisionFlag.eCOLLISION_DOWN);
        let scale = this._getNodeScale();
        desc.radius = this._radius * Math.max(scale.x, scale.z);
        desc.height = this._height * scale.y;
        desc.climbingMode = 1; // constraint mode=
        this._pxNullShape = this._pxNullShape ? this._pxNullShape : new pxCapsuleColliderShape();
        desc.setMaterial(this._pxNullShape._pxMaterials[0]._pxMaterial);
        this._pxNullShape._pxCollider = this;
        this._pxController = this._physicsManager._pxcontrollerManager.createController(desc);
        pxColliderShape._shapePool.set(this._id, this as any);
        this.setPosition(this.owner.transform.position);
        this.setNonWalkableMode(this._nonWalkableMode);
        this._setCharacterCollisonFlag(ECharacterCollisionFlag.eCOLLISION_SIDES);
    }

    /**
     * 设置角色控制器的碰撞类型
     * @param value 
     */
    _setCharacterCollisonFlag(value: ECharacterCollisionFlag) {
        this._pxController && this._pxController.isSetControllerCollisionFlag(this._characterCollisionFlags, value);
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
        return this._pxController && this._pxController.move(disp, this._minDistance, 1 / 60);
    }

    jump?(velocity: Vector3): void {
        return this._pxController && this._pxController.move(velocity, this._minDistance, 1 / 60);
    }

    setStepOffset(offset: number) {
        this._stepOffset = offset;
        this._pxController && this._pxController.setStepOffset(this._stepOffset);
    }

    setUpDirection(up: Vector3): void {
        up.cloneTo(this._upDirection);
        this._pxController && this._pxController.setUpDirection(up);
    }

    setSlopeLimit(value: number) {
        this._slopeLimit = value;
        this._pxController && this._pxController.setSlopeLimit(Math.cos(this._slopeLimit));
    }

    setGravity(value: Vector3): void {
        value.cloneTo(this._gravity);
    }

    //update character by Physics engine
    getWorldTransform() {
        const v3 = this._pxController.getPosition();
        pxDynamicCollider._tempTranslation.set(v3.x, v3.y, v3.z);
        this.owner.transform.position = pxDynamicCollider._tempTranslation;
    }


    setSkinWidth(width: number): void {
        this._contactOffset = width;
        this._pxController && this._pxController.setContactOffset(this._contactOffset);
    }

    destroy(): void {
        this._releaseController();
    }

    setPosition(value: Vector3): void {
        // let v3 = this.owner.transform.position;
        // let scale = this._getNodeScale();
        // pxCharactorCollider.tempV3.setValue(this._localOffset.x * scale.x, this._localOffset.y * scale.y, this._localOffset.z * scale.z);
        // Vector3.add(v3, pxCharactorCollider.tempV3, pxCharactorCollider.tempV3);
        this._pxController && this._pxController.setPosition(value);
    }

    setShapelocalOffset(value: Vector3) {
        this._localOffset = value;
    }

    setHeight(value: number) {
        this._height = value;
        let scale = this._getNodeScale();
        this._pxController && this._pxController.resize(this._height * scale.y)
    }

    setRadius(value: number) {
        this._radius = value;
        let scale = this._getNodeScale();
        this._pxController && this._pxController.setRadius(this._radius * Math.max(scale.x, scale.z))
    }

    setminDistance(value: number) {
        this._minDistance = value;
    }

    setNonWalkableMode(value: ControllerNonWalkableMode) {
        this._nonWalkableMode = value;
        this._pxController && this._pxController.setNonWalkableMode(this._nonWalkableMode);
    }

    release() {
        if (this._pxController) {
            this._pxController.release();
            this._pxController = null;
        }
    }

}