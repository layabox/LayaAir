import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { Mesh } from "../../../d3/resource/models/Mesh";
import { Quaternion } from "../../../maths/Quaternion";
import { Vector3 } from "../../../maths/Vector3";
import { IMeshColliderShape } from "../../interface/Shape/IMeshColliderShape";
import { pxPhysicsCreateUtil } from "../pxPhysicsCreateUtil";
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

export class pxBoxColliderShape extends pxColliderShape implements IMeshColliderShape {
    private _limitvertex = 10;
    private _mesh: Mesh;
    private _convex: boolean;
    private _meshScale: any;
    constructor() {
        super();
        this._meshScale = pxPhysicsCreateUtil._physX.PxMeshScale(Vector3.ONE, Quaternion.DEFAULT);
    }

    private _getMeshPosition(): Array<Vector3> {
        let posArray = new Array<Vector3>();
        this._mesh.getPositions(posArray);
        return posArray;
    }

    private _getIndices() {
        let indexArray;
        if (this._mesh.indexFormat == IndexFormat.UInt16) {
            indexArray = this._mesh.getIndices();
        }
        return indexArray;
    }

    private _getMeshScale() {
        this._meshScale.scale = this._pxCollider.owner.transform.getWorldLossyScale();
    }

    private _createConvexMeshGeometry() {
        if (this._mesh._convexMesh) {
            //PxConvexMesh *createConvexMeshFromBuffer(PxVec3* vertices, PxU32 vertCount, PxPhysics &physics,PxU32 VetexLimit,PxTolerancesScale &scale,int ConvexFlags) 
            let vecArray = this._getMeshPosition();
            //trans VecArray
            this._mesh._convexMesh = pxPhysicsCreateUtil._physX.createConvexMeshFromBuffer(vecArray, vecArray.length, pxPhysicsCreateUtil._physX, this._limitvertex, pxPhysicsCreateUtil._tolerancesScale, PxConvexFlag.eCOMPUTE_CONVEX);
        }
        this._getMeshScale();
        this._pxGeometry = pxPhysicsCreateUtil._physX.PxConvexMeshGeometry(this._mesh._convexMesh, this._meshScale, PxConvexMeshGeometryFlag.eTIGHT_BOUNDS);
        this._pxShape && this._pxCollider._pxActor.detachShape(this._pxShape, true);
        this._createShape();
    }

    private _createTrianggleMeshGeometry() {
        if (this._mesh._triangleMesh) {
            // PxTriangleMesh *createTriMesh(PxVec3* vertices,
            //     PxU32 vertCount,
            //     int indices,
            //     PxU32 indexCount,
            //     bool isU16,
            //     PxTolerancesScale &scale,
            //     PxPhysics &physics) 
            let vecArray = this._getMeshPosition();
            let indices = this._getIndices();
            //TODO trans VecArray
            //TODO trans indices
            this._mesh._triangleMesh = pxPhysicsCreateUtil._physX.createTriMesh(vecArray, vecArray.length, indices, indices.length, (indices instanceof Uint16Array) ? true : false, pxPhysicsCreateUtil._tolerancesScale, pxPhysicsCreateUtil._pxPhysics);
        }
        this._getMeshScale();
        this._pxGeometry = pxPhysicsCreateUtil._physX.PxTriangleMeshGeometry(this._mesh._triangleMesh, this._meshScale, PxMeshGeometryFlag.eTIGHT_BOUNDS);
        this._pxShape && this._pxCollider._pxActor.detachShape(this._pxShape, true);
        this._createShape();
    }


    setPhysicsMeshFromMesh(value: Mesh): void {
        this._mesh = value;
        this._createTrianggleMeshGeometry();
    }

    setConvexMesh(value: Mesh): void {
        this._mesh = value;
        this._createConvexMeshGeometry();
    }

    setLimitVertex(limit: number): void {
        this._limitvertex = limit;
        if (this._convex)
            this._createConvexMeshGeometry();
    }

}