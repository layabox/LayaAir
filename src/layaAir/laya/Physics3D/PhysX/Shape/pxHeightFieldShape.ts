import { Vector3 } from "../../../maths/Vector3";
import { IHeightFieldShape } from "../../interface/Shape/IHeightFieldShape";
import { pxPhysicsCreateUtil } from "../pxPhysicsCreateUtil";
import { pxColliderShape } from "./pxColliderShape";
import { PxMeshGeometryFlag } from "./pxMeshColliderShape";

export class pxHeightFieldShape extends pxColliderShape implements IHeightFieldShape {
    private _numRows: number = 2;
    private _numCols: number = 2;
    private _heightData: Uint16Array;
    private _heightFiled: any;

    constructor() {
        super();
    }

    setHeightFieldData(numRows: number, numCols: number, heightData: Uint16Array, scale: Vector3): void {
        this._numRows = numRows;
        this._numCols = numCols;
        this._heightData = heightData;
        scale.cloneTo(this._scale);
        this._createHeightField();
    }

    /**
     * create HeightField Geometry
     */
    private _createHeightField() {
        //heightData
        this._heightFiled = pxPhysicsCreateUtil._physX.createHeightField(this._numRows, this._numCols, this._heightData, pxPhysicsCreateUtil._tolerancesScale, pxPhysicsCreateUtil._allocator, pxPhysicsCreateUtil._physX);
        this._pxGeometry = pxPhysicsCreateUtil._physX.PxHeightFieldGeometry(this._heightFiled, PxMeshGeometryFlag.eTIGHT_BOUNDS, this._scale.y, this._scale.x, this._scale.z);
        this._pxShape && this._pxCollider._pxActor.detachShape(this._pxShape, true);
        this._createShape();

    }

    getNbRows(): number {
        return this._heightFiled.getNbRows();
    }

    getNbColumns(): number {
        return this._heightFiled.getNbColumns();
    }

    getHeight(rows: number, cols: number): number {
        return this._heightFiled.getHeight(rows, cols);
    }

}