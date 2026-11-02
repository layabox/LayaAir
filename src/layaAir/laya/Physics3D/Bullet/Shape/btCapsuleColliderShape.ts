import { Vector3 } from "../../../maths/Vector3";
import { ICapsuleColliderShape } from "../../interface/Shape/ICapsuleColliderShape";
import { btStatics } from "../btStatics";
import { btColliderShape } from "./btColliderShape";
/**
 * @en The `btCapsuleColliderShape` class is used to create and manage capsule-shaped colliders.
 * @zh 类 `btCapsuleColliderShape` 用于创建和管理胶囊形状的碰撞体。
 */
export class btCapsuleColliderShape extends btColliderShape implements ICapsuleColliderShape {
    private static _tempVector30: Vector3 = new Vector3();
    /**@internal */
    private _radius: number = 0.25;
    /**@internal */
    private _length: number = 1;
    /**@internal */
    private _orientation: number = btColliderShape.SHAPEORIENTATION_UPY;
    private _characterResizing = false;
    private _dimensionSign = new Vector3(1, 1, 1);
    constructor() {
        super();
        this._worldScale.setValue(1, 1, 1);
    }

    /** @internal Only character capsules need stable native identity during resizing. */
    _enableCharacterResizing(): void {
        if (this._characterResizing)
            return;
        this._characterResizing = true;
        const previousShape = this._btShape;
        this._btShape = null;
        this._createShape();
        if (previousShape)
            btStatics.bt.btCollisionShape_destroy(previousShape);
    }

    protected _createShape() {
        let bt = btStatics.bt;
        const previousShape = this._characterResizing ? null : this._btShape;
        const radius = this._characterResizing ? 0.5 : this._radius;
        const cylinderHeight = this._characterResizing ? 1 : this._length - this._radius * 2;
        // Ordinary capsules retain their original native dimensions and scaling.
        if (!this._characterResizing || !this._btShape) {
            this._dimensionSign.setValue(1, 1, 1);
            switch (this._orientation) {
                case btColliderShape.SHAPEORIENTATION_UPX:
                    this._btShape = bt.btCapsuleShapeX_create(radius, cylinderHeight);
                    break;
                case btColliderShape.SHAPEORIENTATION_UPY:
                    this._btShape = bt.btCapsuleShape_create(radius, cylinderHeight);
                    break;
                case btColliderShape.SHAPEORIENTATION_UPZ:
                    this._btShape = bt.btCapsuleShapeZ_create(radius, cylinderHeight);
                    break;
                default:
                    throw "CapsuleColliderShape:unknown orientation.";
            }
        }
        const collider = this._btCollider;
        const simulate = collider && collider._isSimulate;
        if (simulate)
            collider._physicsManager.removeCollider(collider);
        if (this._characterResizing)
            this._applyDimensions();
        else
            bt.btCollisionShape_setLocalScaling(this._btShape, this._btScale);
        if (collider) {
            collider.setColliderShape(this);
            if (simulate && collider.componentEnable)
                collider._physicsManager.addCollider(collider, false);
        }
        if (previousShape)
            bt.btCollisionShape_destroy(previousShape);
    }

    private _applyDimensions(): void {
        // Bullet divides by the previous local scale when resizing. Keep degenerate
        // capsules nonzero so shrinking to a sphere and expanding again stays finite.
        const radiusScale = this._radius === 0 ? 1e-6 : this._radius * 2;
        const cylinderHeight = this._length - this._radius * 2;
        const heightScale = cylinderHeight === 0 ? 1e-6 : cylinderHeight;
        const scale = this._worldScale;
        const sx = scale.x, sy = scale.y, sz = scale.z;
        const bt = btStatics.bt;
        const x = sx * (this._orientation === btColliderShape.SHAPEORIENTATION_UPX ? heightScale : radiusScale);
        const y = sy * (this._orientation === btColliderShape.SHAPEORIENTATION_UPY ? heightScale : radiusScale);
        const z = sz * (this._orientation === btColliderShape.SHAPEORIENTATION_UPZ ? heightScale : radiusScale);
        // Bullet stores abs(localScaling), but applies signed scaling to capsule
        // dimensions. Account for the previous signs so repeated edits do not flip them.
        bt.btVector3_setValue(this._btScale, x * this._dimensionSign.x, y * this._dimensionSign.y, z * this._dimensionSign.z);
        bt.btCollisionShape_setLocalScaling(this._btShape, this._btScale);
        this._dimensionSign.setValue(x < 0 ? -1 : 1, y < 0 ? -1 : 1, z < 0 ? -1 : 1);
    }

    /** @internal Native scaling also encodes capsule dimensions. Offsets use world scale only. */
    _getOffsetScale(out: Vector3): void {
        if (this._characterResizing)
            out.setValue(Math.abs(this._worldScale.x), Math.abs(this._worldScale.y), Math.abs(this._worldScale.z));
        else
            super._getOffsetScale(out);
    }

    protected _getType(): number {
        return this._type = btColliderShape.SHAPETYPES_CAPSULE;
    }

    /**
     * @en Sets the radius of the capsule.
     * @param radius The radius of the capsule.
     * @zh 设置胶囊体的半径。
     * @param radius 胶囊体的半径。
     */
    setRadius(radius: number): void {
        if (this._btShape && this._radius == radius)
            return;
        this._radius = radius;
        this._createShape();
    }

    /**
     * @en Sets the height of the capsule.
     * @param height The height of the capsule.
     * @zh 设置胶囊体的高度。
     * @param height 胶囊体的高度。
     */
    setHeight(height: number): void {
        if (this._btShape && this._length == height)
            return;
        this._length = height;
        this._createShape();
    }

    /**
     * @en Sets the up axis of the capsule.
     * @param upAxis The up axis of the capsule.
     * @zh 设置胶囊体的朝向轴。
     * @param upAxis 胶囊体的朝向轴。
     */
    setUpAxis(upAxis: number): void {
        if (this._btShape && this._orientation == upAxis)
            return;
        const previousShape = this._btShape;
        this._btShape = null;
        this._orientation = upAxis;
        this._createShape();
        if (previousShape)
            btStatics.bt.btCollisionShape_destroy(previousShape);
    }

    /**
     * @en Sets the world scale of the capsule collider shape.
     * @param scale The scale of the capsule collider shape.
     * @zh 设置胶囊碰撞器形状的世界缩放。
     * @param scale 缩放比例。
     */
    setWorldScale(scale: Vector3): void {
        var fixScale: Vector3 = btCapsuleColliderShape._tempVector30;
        switch (this._orientation) {
            case btColliderShape.SHAPEORIENTATION_UPX:
                fixScale.x = scale.x;
                fixScale.y = fixScale.z = Math.max(scale.y, scale.z);
                break;
            case btColliderShape.SHAPEORIENTATION_UPY:
                fixScale.y = scale.y;
                fixScale.x = fixScale.z = Math.max(scale.x, scale.z);
                break;
            case btColliderShape.SHAPEORIENTATION_UPZ:
                fixScale.z = scale.z;
                fixScale.x = fixScale.y = Math.max(scale.x, scale.y);
                break;
            default:
                throw "CapsuleColliderShape:unknown orientation.";
        }
        if (this._characterResizing) {
            fixScale.cloneTo(this._worldScale);
            this._applyDimensions();
        } else {
            super.setWorldScale(fixScale);
        }
    }

    /**
     * @en Destroys the capsule collider shape and releases resources.
     * @zh 销毁胶囊碰撞器形状并释放资源。
     */
    destroy(): void {
        super.destroy();
        this._radius = null;
        this._length = null;
        this._orientation = null;
    }

}