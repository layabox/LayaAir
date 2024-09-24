import { Physics3DUtils } from "../../../d3/utils/Physics3DUtils";
import { Quaternion } from "../../../maths/Quaternion";
import { Vector3 } from "../../../maths/Vector3";
import { IColliderShape } from "../../interface/Shape/IColliderShape";
import { pxCollider } from "../Collider/pxCollider";
import { pxPhysicsCreateUtil } from "../pxPhysicsCreateUtil";
import { partFlag } from "../pxPhysicsManager";
import { pxPhysicsMaterial } from "../pxPhysicsMaterial";


/**
 * Flags which affect the behavior of Shapes.
 */
export enum ShapeFlag {
    /** The shape will partake in collision in the physical simulation. */
    SIMULATION_SHAPE = 1 << 0,
    /** The shape will partake in scene queries (ray casts, overlap tests, sweeps, ...). */
    SCENE_QUERY_SHAPE = 1 << 1,
    /** The shape is a trigger which can send reports whenever other shapes enter/leave its volume. */
    TRIGGER_SHAPE = 1 << 2
}
export interface pxFilterData {
    word0?: number,
    word1?: number,
    word2?: number,
    word3?: number,
}
/**
 * @en Represents a collider shape in the PhysX physics engine.
 * @zh 表示 PhysX 物理引擎中的碰撞器形状。
 */
export class pxColliderShape implements IColliderShape {
    static _shapePool: Map<number, pxColliderShape> = new Map();
    static _pxShapeID: number = 0;

    static transform = {
        translation: new Vector3(),
        rotation: new Quaternion()
    };

    _offset: Vector3 = new Vector3(0, 0, 0);

    _scale: Vector3 = new Vector3(1, 1, 1);

    _shapeFlags: ShapeFlag = ShapeFlag.SCENE_QUERY_SHAPE;

    /** @internal */
    _pxCollider: pxCollider;

    _pxShape: any;

    _pxGeometry: any;
    /** @internal */
    _pxMaterials: pxPhysicsMaterial[] = new Array(1);

    _id: number;

    /**
     * @en Filter data for collision and query. [0]: group, [1]: mask, [2]: event
     * @zh 碰撞和查询的过滤数据。[0]: 组, [1]: 掩码, [2]: 事件
     */
    filterData: pxFilterData = { word0: Physics3DUtils.PHYSXDEFAULTMASKVALUE, word1: Physics3DUtils.PHYSXDEFAULTMASKVALUE, word2: 0, word3: 0 };//PxFilterData

    /** @ignore */
    constructor() {

    }
    /**
     * @override
     */
    protected _createShape() {
        this._id = pxColliderShape._pxShapeID++;
        this._pxMaterials[0] = new pxPhysicsMaterial();
        this._pxShape = pxPhysicsCreateUtil._pxPhysics.createShape(
            this._pxGeometry,
            this._pxMaterials[0]._pxMaterial,
            true,
            new pxPhysicsCreateUtil._physX.PxShapeFlags(this._shapeFlags)
        );
        this._pxShape.setUUID(this._id);
        pxColliderShape._shapePool.set(this._id, this);
    }

    private _modifyFlag(flag: ShapeFlag, value: boolean): void {
        this._shapeFlags = value ? this._shapeFlags | flag : this._shapeFlags & ~flag;
    }

    /**
     * @en Adds the shape to a collider.
     * @param collider The collider to add the shape to.
     * @zh 将形状添加到碰撞器。
     * @param collider 要添加形状的碰撞器。
     */
    addToActor(collider: pxCollider) {
        if (this._pxCollider != collider) {
            if (this._pxShape) collider._pxActor.attachShape(this._pxShape);
            this._pxCollider = collider;
            this.setOffset(this._offset);
        }
    }

    /**
     * @en Removes the shape from a collider.
     * @param collider The collider to remove the shape from.
     * @zh 从碰撞器中移除形状。
     * @param collider 要移除形状的碰撞器。
     */
    removeFromActor(collider: pxCollider) {
        if (this._pxCollider == collider) {
            if (this._pxShape) collider._pxActor.detachShape(this._pxShape, true);
            this._pxCollider = null;
        }
    }

    /**
     * @en Sets the offset of the shape.
     * @param position The new offset position.
     * @zh 设置形状的偏移。
     * @param position 新的偏移位置。
     */
    setOffset(position: Vector3): void {
        position.cloneTo(this._offset);
        if (!this._pxCollider) return;
        if (this._pxShape) {
            const transform = pxColliderShape.transform;
            this._pxCollider.owner.transform.getWorldLossyScale().cloneTo(this._scale);
            if (this._pxCollider.owner)
                Vector3.multiply(position, this._scale, transform.translation);
            this._pxShape.setLocalPose(transform);
        }
    }

    /**
     * @en Sets whether the shape is a trigger.
     * @param value True if the shape should be a trigger, false otherwise.
     * @zh 设置形状是否为触发器。
     * @param value 如果形状应为触发器则为 true，否则为 false。
     */
    setIsTrigger(value: boolean): void {
        this._modifyFlag(ShapeFlag.SIMULATION_SHAPE, !value);
        this._modifyFlag(ShapeFlag.TRIGGER_SHAPE, value);
        this._setShapeFlags(this._shapeFlags);
    }

    _setShapeFlags(flags: ShapeFlag) {
        this._shapeFlags = flags;
        if (this._pxShape) this._pxShape.setFlags(new pxPhysicsCreateUtil._physX.PxShapeFlags(this._shapeFlags));
    }

    /**
     * @en Sets the simulation filter data.
     * @param colliderGroup The collider group.
     * @param colliderMask The collider mask.
     * @zh 设置模拟过滤数据。
     * @param colliderGroup 碰撞器组。
     * @param colliderMask 碰撞器掩码。
     */
    setSimulationFilterData(colliderGroup: number, colliderMask: number) {
        //这里把查询和碰撞检测设置到一起
        this.filterData.word0 = colliderGroup;
        this.filterData.word1 = colliderMask;
        this.filterData.word2 = partFlag.eCONTACT_DEFAULT;
        if (this._pxShape) {
            this._pxShape.setSimulationFilterData(this.filterData);
            this._pxShape.setQueryFilterData(this.filterData);
        }
    }

    /**
     * @en Optimizes event return.
     * @param filterWorld2Number The filter data.
     * @zh 优化事件返回。
     * @param filterWorld2Number 过滤数据。
     */
    setEventFilterData(filterWorld2Number: number) {
        //contact
        //PxPairFlag::eCONTACT_DEFAULT | PxPairFlag::eNOTIFY_TOUCH_FOUND | PxPairFlag::eNOTIFY_TOUCH_LOST | PxPairFlag::eNOTIFY_TOUCH_PERSISTS|PxPairFlag::eNOTIFY_CONTACT_POINTS)
        //trigger
        //PxPairFlag::eTRIGGER_DEFAULT
        this.filterData.word2 = filterWorld2Number;
        if (this._pxShape) {
            this._pxShape.setSimulationFilterData(this.filterData);
            this._pxShape.setQueryFilterData(this.filterData);
        }

    }

    
    /**
     * @en Destroys the collider shape and releases resources.
     * @zh 销毁碰撞器形状并释放资源。
     */
    destroy(): void {
        if (this._pxShape) {
            this._pxShape.release();
            this._pxShape = undefined;
        }
        pxColliderShape._shapePool.delete(this._id);
        this._pxMaterials.forEach(element => {
            element.destroy();
        });
        this._pxMaterials.length = 0;
    }
}