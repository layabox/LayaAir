import { Vector3 } from "../../../maths/Vector3";
import { IHeightFieldShape } from "../../interface/Shape/IHeightFieldShape";
import { pxPhysicsCreateUtil } from "../pxPhysicsCreateUtil";
import { pxColliderShape } from "./pxColliderShape";
import { PxMeshGeometryFlag } from "./pxMeshColliderShape";

export class pxHeightFieldShape extends pxColliderShape implements IHeightFieldShape {
    /**@internal */
    private _numRows: number = 2;
    /**@internal */
    private _numCols: number = 2;
    /**@internal */
    private _heightData: Float32Array;
    /**@internal */
    private _flag: Uint8Array;
    /**@internal */
    private _heightFiled: any;
    /**@internal */
    private _minHeight: number;
    /**@internal */
    private _maxHeight: number;

    constructor() {
        super();
    }

    /**
     * get height data tranform
     * @returns 
     */
    private getHeightData(): any {
        this._minHeight = Number.MAX_VALUE;
        this._maxHeight = -Number.MAX_VALUE;
        this._heightData.forEach((value) => {
            this._maxHeight = Math.max(value, this._maxHeight);
            this._minHeight = Math.min(value, this._minHeight);
        })
        let deltaHeight = this._maxHeight - this._minHeight;
        let height_ptr = pxPhysicsCreateUtil._physX._malloc(this._heightData.byteLength);
        let buffer = new Float32Array(pxPhysicsCreateUtil._physX.HEAPF32.buffer, height_ptr, this._heightData.length);
        this._heightData.forEach((value, index) => {
            buffer[index] = (value - this._minHeight) / deltaHeight;
        })
        return height_ptr;
    }

    /**
     * get flag Data
     * @returns 
     */
    private getFlagData() {
        let indexCount: number = this._numRows * this._numCols;
        let flag_ptr = pxPhysicsCreateUtil._physX._malloc(indexCount);
        let flag_buffer = new Uint8Array(pxPhysicsCreateUtil._physX.HEAPU8.buffer, flag_ptr, indexCount);
        if (this._flag) {
            flag_buffer.set(this._flag);
        } else {
            flag_buffer.fill(0);
        }
        return flag_ptr;
    }

    /**
     * create HeightField Geometry
     */
    private _createHeightField() {
        //heightData
        let height_ptr = this.getHeightData();
        let flag_ptr = this.getFlagData();
        this._heightFiled = pxPhysicsCreateUtil._physX.createHeightField(this._numRows, this._numCols, height_ptr, flag_ptr, pxPhysicsCreateUtil._allocator, pxPhysicsCreateUtil._tolerancesScale, pxPhysicsCreateUtil._pxPhysics);
        let heightScale = (this._scale.y * (this._maxHeight - this._minHeight)) / 32767;
        let flags = new pxPhysicsCreateUtil._physX.PxMeshGeometryFlags(PxMeshGeometryFlag.eTIGHT_BOUNDS);
        this._pxGeometry = new pxPhysicsCreateUtil._physX.PxHeightFieldGeometry(this._heightFiled, flags, heightScale, this._scale.x, this._scale.z);
        this._pxShape && this._pxCollider._pxActor.detachShape(this._pxShape, true);
        this._createShape();
        pxPhysicsCreateUtil._physX._free(height_ptr);
        pxPhysicsCreateUtil._physX._free(flag_ptr);
    }

    /**
     * set height field Data
     * @param numRows 
     * @param numCols 
     * @param heightData 
     * @param flag 
     * @param scale 
     */
    setHeightFieldData(numRows: number, numCols: number, heightData: Float32Array, flag: Uint8Array, scale: Vector3): void {
        this._numRows = numRows;
        this._numCols = numCols;
        this._heightData = heightData;
        this._flag = flag;
        scale.cloneTo(this._scale);
        this._createHeightField();
    }

    /**
     * get rows number
     * @returns 
     */
    getNbRows(): number {
        return this._heightFiled.getNbRows();
    }

    /**
     * get cols number
     * @returns
     */
    getNbColumns(): number {
        return this._heightFiled.getNbColumns();
    }

    /**
     * get height number
     * @param rows 
     * @param cols 
     * @returns 
     */
    getHeight(rows: number, cols: number): number {
        return this._heightFiled.getHeight(rows, cols);
    }

}