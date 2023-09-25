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
export class pxColliderShape implements IColliderShape {
    static _shapePool: Map<number, pxColliderShape> = new Map();
    static _pxShapeID: number = 0;

    static transform = {
        translation: new Vector3(),
        rotation: new Quaternion()
    };

    _offset: Vector3 = new Vector3(0, 0, 0);

    _scale: Vector3 = new Vector3(1, 1, 1);

    _shapeFlags: ShapeFlag = ShapeFlag.SIMULATION_SHAPE;

    /** @internal */
    _pxCollider: pxCollider;

    _pxShape: any;

    _pxGeometry: any;
    /** @internal */
    _pxMaterials: pxPhysicsMaterial[] = new Array(1);

    _id: number;

    //过滤数据  0 group  1 mask  2事件
    filterData: pxFilterData = { word0: Physics3DUtils.PHYSXDEFAULTMASKVALUE, word1: Physics3DUtils.PHYSXDEFAULTMASKVALUE, word2: 0, word3: 0 };//PxFilterData

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

    addToActor(collider: pxCollider) {
        if (this._pxCollider != collider) {
            collider._pxActor.attachShape(this._pxShape);
            this._pxCollider = collider;
        }
    }

    removeFromActor(collider: pxCollider) {
        if (this._pxCollider == collider) {
            collider._pxActor.detachShape(this._pxShape, true);
            this._pxCollider = null;
        }
    }

    setOffset(position: Vector3): void {
        if (!this._pxCollider) return;
        position.cloneTo(this._offset);
        const transform = pxColliderShape.transform;
        this._pxCollider.owner.transform.getWorldLossyScale().cloneTo(this._scale);
        if (this._pxCollider.owner)
            Vector3.multiply(position, this._scale, transform.translation);
        this._pxShape.setLocalPose(transform);
    }

    setIsTrigger(value: boolean): void {
        this._modifyFlag(ShapeFlag.SIMULATION_SHAPE, !value);
        this._modifyFlag(ShapeFlag.TRIGGER_SHAPE, value);
        this._setShapeFlags(this._shapeFlags);
    }

    _setShapeFlags(flags: ShapeFlag) {
        this._shapeFlags = flags;
        this._pxShape.setFlags(new pxPhysicsCreateUtil._physX.PxShapeFlags(this._shapeFlags));
    }

    setSimulationFilterData(colliderGroup: number, colliderMask: number) {
        //这里把查询和碰撞检测设置到一起
        this.filterData.word0 = colliderGroup;
        this.filterData.word1 = colliderMask;
        this.filterData.word2 = partFlag.eCONTACT_DEFAULT;
        this._pxShape.setSimulationFilterData(this.filterData);
        this._pxShape.setQueryFilterData(this.filterData);
    }

    //优化事件返回
    setEventFilterData(filterWorld2Number: number) {
        //contact
        //PxPairFlag::eCONTACT_DEFAULT | PxPairFlag::eNOTIFY_TOUCH_FOUND | PxPairFlag::eNOTIFY_TOUCH_LOST | PxPairFlag::eNOTIFY_TOUCH_PERSISTS|PxPairFlag::eNOTIFY_CONTACT_POINTS)
        //trigger
        //PxPairFlag::eTRIGGER_DEFAULT
        this.filterData.word2 = filterWorld2Number;
        this._pxShape.setSimulationFilterData(this.filterData);
        this._pxShape.setQueryFilterData(this.filterData);
    }


    destroy(): void {
        this._pxShape.release();
        pxColliderShape._shapePool.delete(this._id);
        this._pxMaterials.forEach(element => {
            element.destroy();
        });
    }
}