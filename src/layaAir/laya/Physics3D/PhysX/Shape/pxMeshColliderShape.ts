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

export class pxMeshColliderShape extends pxColliderShape implements IMeshColliderShape {
    private _limitvertex = 10;
    private _mesh: Mesh;
    private _convex: boolean;
    private _meshScale: any;
    constructor() {
        super();
        this._convex = false;
        this._meshScale = new pxPhysicsCreateUtil._physX.PxMeshScale(Vector3.ONE, Quaternion.DEFAULT);
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
            data= pxPhysicsCreateUtil.createUint32Array(indexCount);
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
        if (scale.equal(this._scale))
            return;
        scale.cloneTo(this._scale);
        this._meshScale.scale = this._scale;
        if (this._convex)
            this._createConvexMeshGeometry();
        else
            this._createTrianggleMeshGeometry();

    }

    setOffset(position: Vector3): void {
        if (!this._pxCollider) return;
        position.cloneTo(this._offset);
        const transform = pxColliderShape.transform;
        this._setScale(this._pxCollider.owner.transform.getWorldLossyScale());
        if (this._pxCollider.owner)
            Vector3.multiply(position, this._scale, transform.translation);
        this._pxShape.setLocalPose(transform);
    }


    setPhysicsMeshFromMesh(value: Mesh): void {
        this._mesh = value;
        this._convex = false;
        this._createTrianggleMeshGeometry();
    }

    setConvexMesh(value: Mesh): void {
        this._mesh = value;
        this._convex = true;
        this._createConvexMeshGeometry();
    }

    setLimitVertex(limit: number): void {
        this._limitvertex = limit;
        if (this._convex)
            this._createConvexMeshGeometry();
    }



}