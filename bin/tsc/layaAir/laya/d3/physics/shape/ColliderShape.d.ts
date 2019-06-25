import { IClone } from "../../core/IClone";
import { Matrix4x4 } from "../../math/Matrix4x4";
import { Quaternion } from "../../math/Quaternion";
import { Vector3 } from "../../math/Vector3";
import { PhysicsComponent } from "../PhysicsComponent";
import { CompoundColliderShape } from "././CompoundColliderShape";
/**
 * <code>ColliderShape</code> 类用于创建形状碰撞器的父类，该类为抽象类。
 */
export declare class ColliderShape implements IClone {
    /** @private */
    static SHAPEORIENTATION_UPX: number;
    /** @private */
    static SHAPEORIENTATION_UPY: number;
    /** @private */
    static SHAPEORIENTATION_UPZ: number;
    /** @private */
    static SHAPETYPES_BOX: number;
    /** @private */
    static SHAPETYPES_SPHERE: number;
    /** @private */
    static SHAPETYPES_CYLINDER: number;
    /** @private */
    static SHAPETYPES_CAPSULE: number;
    /** @private */
    static SHAPETYPES_CONVEXHULL: number;
    /** @private */
    static SHAPETYPES_COMPOUND: number;
    /** @private */
    static SHAPETYPES_STATICPLANE: number;
    /** @private */
    static SHAPETYPES_CONE: number;
    /** @private */
    static _tempVector30: Vector3;
    /** @private */
    protected static _nativeScale: any;
    /**@private */
    protected static _nativeVector30: any;
    /**@private */
    protected static _nativQuaternion0: any;
    /**@private */
    protected static _nativeTransform0: any;
    /**
     * @private
     */
    static __init__(): void;
    /**
     * @private
     */
    static _createAffineTransformation(trans: Vector3, rot: Quaternion, outE: Float32Array): void;
    /**@private */
    protected _scale: Vector3;
    /**@private */
    _nativeShape: any;
    /**@private */
    _type: number;
    /**@private */
    _centerMatrix: Matrix4x4;
    /**@private */
    _attatched: boolean;
    /**@private */
    _indexInCompound: number;
    /**@private */
    _compoundParent: CompoundColliderShape;
    /**@private */
    _attatchedCollisionObject: PhysicsComponent;
    /**@private */
    _referenceCount: number;
    /**@private */
    private _localOffset;
    /**@private */
    private _localRotation;
    needsCustomCollisionCallback: boolean;
    /**
     * 获取碰撞类型。
     * @return 碰撞类型。
     */
    readonly type: number;
    /**
     * 获取Shape的本地偏移。
     * @return Shape的本地偏移。
     */
    /**
    * 设置Shape的本地偏移。
    * @param Shape的本地偏移。
    */
    localOffset: Vector3;
    /**
     * 获取Shape的本地旋转。
     * @return Shape的本地旋转。
     */
    /**
    * 设置Shape的本地旋转。
    * @param Shape的本地旋转。
    */
    localRotation: Quaternion;
    /**
     * 创建一个新的 <code>ColliderShape</code> 实例。
     */
    constructor();
    /**
     * @private
     */
    _setScale(value: Vector3): void;
    /**
     * @private
     */
    _addReference(): void;
    /**
     * @private
     */
    _removeReference(): void;
    /**
     * 更新本地偏移,如果修改LocalOffset或LocalRotation需要调用。
     */
    updateLocalTransformations(): void;
    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(destObject: any): void;
    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone(): any;
    /**
     * @private
     */
    destroy(): void;
}
