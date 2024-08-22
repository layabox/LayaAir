import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { Mesh } from "../../../d3/resource/models/Mesh";
import { Quaternion } from "../../../maths/Quaternion";
import { Vector3 } from "../../../maths/Vector3";
import { IMeshColliderShape } from "../../interface/Shape/IMeshColliderShape";
import { pxPhysicsCreateUtil } from "../pxPhysicsCreateUtil";
import { pxPhysicsMaterial } from "../pxPhysicsMaterial";
import { pxColliderShape } from "./pxColliderShape";

export enum PxConvexFlag {
    e16_BIT_INDICES = (1 << 0),
    eCOMPUTE_CONVEX = (1 << 1),
    eCHECK_ZERO_AREA_TRIANGLES = (1 << 2),
    eQUANTIZE_INPUT = (1 << 3),
    eDISABLE_MESH_VALIDATION = (1 << 4),
    ePLANE_SHIFTING = (1 << 5),
    eFAST_INERTIA_COMPUTATION = (1 << 6),
    eGPU_COMPATIBLE = (1 << 7),
    eSHIFT_VERTICES = (1 << 8)
};

export enum PxConvexMeshGeometryFlag {
    eTIGHT_BOUNDS = (1 << 0)	//!< Use tighter (but more expensive to compute) bounds around the convex geometry.
};

export enum PxMeshGeometryFlag {
    eTIGHT_BOUNDS = (1 << 0),	//!< Use tighter (but more expensive to compute) bounds around the triangle mesh geometry.
    eDOUBLE_SIDED = (1 << 1)	//!< Meshes with this flag set are treated as double-sided.
    //!< This flag is currently only used for raycasts and sweeps (it is ignored for overlap queries).
    //!< For detailed specifications of this flag for meshes and heightfields please refer to the Geometry Query section of the user guide.
};

/**
 * @en Represents a mesh collider shape in the physics engine.
 * @zh 表示物理引擎中的网格碰撞器形状。
 */
export class pxMeshColliderShape extends pxColliderShape implements IMeshColliderShape {
    private _limitvertex = 10;
    private _mesh: Mesh;
    private _convex: boolean;
    private _meshScale: any;
    /**
     * @en Creates a new instance of pxMeshColliderShape.
     * @zh 创建一个新的 pxMeshColliderShape 实例。
     */
    constructor() {
        super();
        this._convex = false;
        this._meshScale = new pxPhysicsCreateUtil._physX.PxMeshScale(Vector3.ONE, Quaternion.DEFAULT);
        this._id = pxColliderShape._pxShapeID++;
        this._pxMaterials[0] = new pxPhysicsMaterial();
    }

    private _getMeshPosition(): any {
        let posArray = new Array<Vector3>();
        this._mesh.getPositions(posArray);
        let vecpointer = new pxPhysicsCreateUtil._physX.PxVec3Vector();
        posArray.forEach((vec: Vector3, index: number) => {
            vecpointer.push_back(vec);
        })
        return vecpointer;
    }

    private _getIndices() {
        let indexCount = this._mesh.indexCount;
        let indices = this._mesh.getIndices();
        let traCount = indexCount / 3;
        let data = null
        if (indices instanceof Uint32Array) {
            data = pxPhysicsCreateUtil.createUint32Array(indexCount);
        } else {
            data = pxPhysicsCreateUtil.createUint16Array(indexCount);
        }
        for (var i = 0; i < traCount; i++) {
            let index = i * 3;
            data.buffer[index] = indices[index];
            data.buffer[index + 1] = indices[index + 2];
            data.buffer[index + 2] = indices[index + 1];
        }
        return data;
    }


    private _createConvexMeshGeometry() {
        if (!this._mesh) return;
        if (!this._mesh._convexMesh) {
            let vecpointer = this._getMeshPosition();
            this._mesh._convexMesh = pxPhysicsCreateUtil._physX.createConvexMeshFromBuffer(vecpointer, pxPhysicsCreateUtil._pxPhysics, this._limitvertex, pxPhysicsCreateUtil._tolerancesScale, PxConvexFlag.eCOMPUTE_CONVEX);
            vecpointer.delete();
        }
        let flags = new pxPhysicsCreateUtil._physX.PxConvexMeshGeometryFlags(PxConvexMeshGeometryFlag.eTIGHT_BOUNDS);
        this._pxGeometry = new pxPhysicsCreateUtil._physX.PxConvexMeshGeometry(this._mesh._convexMesh, this._meshScale, flags);
        if (this._pxShape && this._pxCollider)
            this._pxCollider._pxActor.detachShape(this._pxShape, true);
        else if (this._pxShape) {
            this._pxShape.release();
        }

        this._createShape();
    }

    private _createTrianggleMeshGeometry() {
        if (!this._mesh) return;
        if (!this._mesh._triangleMesh) {
            //trans VecArray
            let vecpointer = this._getMeshPosition();
            //trans indices
            let indicesData = this._getIndices();

            this._mesh._triangleMesh = pxPhysicsCreateUtil._physX.createTriMesh(vecpointer, indicesData.ptr, this._mesh.indexCount, this._mesh.indexFormat == IndexFormat.UInt32 ? false : true, pxPhysicsCreateUtil._tolerancesScale, pxPhysicsCreateUtil._pxPhysics);
            vecpointer.delete();
            pxPhysicsCreateUtil.freeBuffer(indicesData);
        }
        let flags = new pxPhysicsCreateUtil._physX.PxMeshGeometryFlags(PxMeshGeometryFlag.eTIGHT_BOUNDS);
        this._pxGeometry = new pxPhysicsCreateUtil._physX.PxTriangleMeshGeometry(this._mesh._triangleMesh, this._meshScale, flags);
        if (this._pxShape && this._pxCollider)
            this._pxCollider._pxActor.detachShape(this._pxShape, true);
        else if (this._pxShape) {
            this._pxShape.release();
        }
        this._createShape();
    }

    /**
     * @override
     */
    protected _createShape() {
        if (this._id == null) {
            this._id = pxColliderShape._pxShapeID++;
        }
        if (!this._pxMaterials[0]) {
            this._pxMaterials[0] = new pxPhysicsMaterial();
        }
        this._pxShape = pxPhysicsCreateUtil._pxPhysics.createShape(
            this._pxGeometry,
            this._pxMaterials[0]._pxMaterial,
            true,
            new pxPhysicsCreateUtil._physX.PxShapeFlags(this._shapeFlags)
        );
        this._pxShape.setUUID(this._id);
        pxColliderShape._shapePool.set(this._id, this);
        this._reConfigShape();
    }

    private _reConfigShape() {
        if (this._pxCollider) {
            this.setSimulationFilterData(this._pxCollider._collisionGroup, this._pxCollider._canCollisionWith);
            this.setOffset(this._offset);
            this._pxCollider._pxActor.attachShape(this._pxShape);
        }
    }


    private _setScale(scale: Vector3) {
        if (this._pxShape && scale.equal(this._scale))
            return;
        scale.cloneTo(this._scale);
        this._meshScale.scale = this._scale;
        if (this._convex)
            this._createConvexMeshGeometry();
        else
            this._createTrianggleMeshGeometry();

    }

    /**
     * @en Sets the offset of the collider shape.
     * @param position The new offset position.
     * @zh 设置碰撞器形状的偏移。
     * @param position 新的偏移位置。
     */
    setOffset(position: Vector3): void {
        if (!this._pxCollider) return;
        position.cloneTo(this._offset);
        this._setScale(this._pxCollider.owner.transform.getWorldLossyScale());
        if (this._pxShape) {
            const transform = pxColliderShape.transform;
            if (this._pxCollider.owner)
                Vector3.multiply(position, this._scale, transform.translation);
            this._pxShape.setLocalPose(transform);
        }
    }


    /**
     * @en Sets the physics mesh from a given mesh.
     * @param value The mesh to use for physics.
     * @zh 从给定的网格设置物理网格。
     * @param value 用于物理的网格。
     */
    setPhysicsMeshFromMesh(value: Mesh): void {
        this._mesh = value;
        this._convex = false;
        this._createTrianggleMeshGeometry();
    }

    /**
     * @en Sets the convex mesh for the collider.
     * @param value The convex mesh to use.
     * @zh 设置碰撞器的凸面网格。
     * @param value 要使用的凸面网格。
     */
    setConvexMesh(value: Mesh): void {
        this._mesh = value;
        this._convex = true;
        this._createConvexMeshGeometry();
    }

    /**
     * @en Sets the vertex limit for convex mesh generation.
     * @param limit The maximum number of vertices.
     * @zh 设置凸面网格生成的顶点限制。
     * @param limit 最大顶点数。
     */
    setLimitVertex(limit: number): void {
        this._limitvertex = limit;
        if (this._convex)
            this._createConvexMeshGeometry();
    }



}