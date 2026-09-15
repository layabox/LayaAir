import { PhysicsColliderComponent } from "../../../d3/physics/PhysicsColliderComponent";
import { Quaternion } from "../../../maths/Quaternion";
import { Vector3 } from "../../../maths/Vector3";
import { NotImplementedError } from "../../../utils/Error";
import { ICompoundColliderShape } from "../../interface/Shape/ICompoundColliderShape";
import { btStatics } from "../btStatics";
import { btColliderShape } from "./btColliderShape";

/**
 * @en use to create compound collider.
 * @zh 用于创建组合碰撞器。
 */
export class btCompoundColliderShape extends btColliderShape implements ICompoundColliderShape {
    /**@internal */
    private _physicsComponent: PhysicsColliderComponent;
    /**@internal */
    private _btVector3One: any;
    /**@internal */
    private _btTransform: any;
    /**@internal */
    private _btOffset: any;
    /**@internal */
    private _btRotation: any;

    /**@internal */
    private _childColliderShapes: btColliderShape[] = [];

    /**
     * @en create a new instance of btCompoundColliderShape.
     * @zh 创建一个新的组合碰撞形状实例。
     */
    constructor() {
        super();
        let bt = btStatics.bt;
        this._btVector3One = bt.btVector3_create(1, 1, 1);
        this._btTransform = bt.btTransform_create();
        this._btOffset = bt.btVector3_create(0, 0, 0);
        this._btRotation = bt.btQuaternion_create(0, 0, 0, 1);
        this._btShape = bt.btCompoundShape_create();
    }

    clearChildShape(): void {
        throw new NotImplementedError();
    }

    protected _getType(): number {
        return this._type = btColliderShape.SHAPETYPES_COMPOUND;
    }

    addChildShape(shape: btColliderShape): void {
        this.addChildShapeWithTransform(shape, shape.getOffset(), Quaternion.DEFAULT, Vector3.ONE);
    }

    addChildShapeWithTransform(shape: btColliderShape, localPosition: Vector3, localRotation: Quaternion, localScale: Vector3): void {
        const bt: any = btStatics.bt;
        shape.setWorldScale(localScale);
        bt.btTransform_setIdentity(this._btTransform);
        bt.btVector3_setValue(this._btOffset, localPosition.x, localPosition.y, localPosition.z);
        bt.btQuaternion_setValue(this._btRotation, localRotation.x, localRotation.y, localRotation.z, localRotation.w);
        bt.btTransform_setOrigin(this._btTransform, this._btOffset);
        bt.btTransform_setRotation(this._btTransform, this._btRotation);

        const btScale: any = bt.btCollisionShape_getLocalScaling(this._btShape);
        bt.btCollisionShape_setLocalScaling(this._btShape, this._btVector3One);
        let childShape = shape.getPhysicsShape();
        if (childShape) {
            bt.btCompoundShape_addChildShape(this._btShape, this._btTransform, childShape);
            this._childColliderShapes.push(shape);
        }
        bt.btCollisionShape_setLocalScaling(this._btShape, btScale);

    }

    removeChildShape(shape: btColliderShape, index: number): void {
        if (index < 0 || index >= this._childColliderShapes.length || this._childColliderShapes[index] !== shape)
            return;
        const bt = btStatics.bt;
        bt.btCompoundShape_removeChildShapeByIndex(this._btShape, index);
        this._childColliderShapes.splice(index, 1);
    }

    setShapeData(component: PhysicsColliderComponent): void {
        this._physicsComponent = component;
    }

    getChildShapeCount(): number {
        return this._childColliderShapes.length;
    }

    /**
     * @inheritDoc
     * @override
     */
    destroy(): void {
        super.destroy();
        this._childColliderShapes.length = 0;
        this._btRotation = null;
        this._btTransform = null;
        this._btVector3One = null;
        this._btOffset = null;
    }

}
