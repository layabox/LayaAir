import { Vector3 } from "../../../maths/Vector3";
import { IHeightFieldShape } from "../../interface/Shape/IHeightFieldShape";
import { pxStatics } from "../pxStatics";
import { pxColliderShape } from "./pxColliderShape";
import { PxMeshGeometryFlag } from "./pxMeshColliderShape";

/**
 * @en Represents a height field shape in the PhysX physics engine.
 * @zh 表示 PhysX 物理引擎中的高度场形状。
 */
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
    private _terrainYScale: number = 1;
    private _heightOffset = new Vector3();

    /**@ignore */
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
        let data = pxStatics.createFloat32Array(this._heightData.length);
        this._heightData.forEach((value, index) => {
            data.buffer[index] = deltaHeight > 0 ? (value - this._minHeight) / deltaHeight : 0;
        })
        return data;
    }

    /**
     * get flag Data
     * @returns 
     */
    private getFlagData() {
        let indexCount: number = this._numRows * this._numCols;
        let data = pxStatics.createUint8Array(indexCount);
        if (this._flag) {
            data.buffer.set(this._flag);
        } else {
            data.buffer.fill(0);
        }
        return data;
    }

    /**
     * create HeightField Geometry
     */
    private _createHeightField() {
        //heightData
        let heightdata = this.getHeightData();
        let flagdata = this.getFlagData();
        this._heightFiled = pxStatics._physX.createHeightField(this._numRows, this._numCols, heightdata.ptr, flagdata.ptr, pxStatics._allocator, pxStatics._tolerancesScale, pxStatics._physics);
        let heightScale = (this._scale.y * (this._maxHeight - this._minHeight || 1)) / 32767;
        let flags = new pxStatics._physX.PxMeshGeometryFlags(PxMeshGeometryFlag.eTIGHT_BOUNDS);
        this._pxGeometry = new pxStatics._physX.PxHeightFieldGeometry(this._heightFiled, flags, heightScale, this._scale.x, this._scale.z);
        this._pxShape && this._pxCollider._pxActor.detachShape(this._pxShape, true);
        this._createShape();
        pxStatics.freeBuffer(heightdata);
        pxStatics.freeBuffer(flagdata);
    }

    /**
     * @en Sets the height field data.
     * @param numRows Number of rows.
     * @param numCols Number of columns.
     * @param heightData Height data array.
     * @param flag Flag data array.
     * @param scale Scale of the height field.
     * @zh 设置高度场数据。
     * @param numRows 行数。
     * @param numCols 列数。
     * @param heightData 高度数据数组。
     * @param flag 标志数据数组。
     * @param scale 高度场的缩放。
     */
    protected _setLocalPose(): void {
        if (!this._pxCollider || !this._pxShape) return;
        const transform = pxColliderShape.transform;
        const ownerScale = this._pxCollider.owner.transform.getWorldLossyScale();
        Vector3.multiply(ownerScale, this._compoundLocalScale, this._scale);
        Vector3.multiply(this._offset, ownerScale, transform.translation);
        this._compoundRotation.cloneTo(transform.rotation);
        // Height normalization moves the terrain origin along its own Y axis.
        // Compose that offset with the child rotation before owner scaling.
        const offset = this._heightOffset;
        offset.setValue(0, this._minHeight * this._terrainYScale * this._compoundLocalScale.y, 0);
        Vector3.transformQuat(offset, this._compoundRotation, offset);
        Vector3.multiply(offset, ownerScale, offset);
        Vector3.add(transform.translation, offset, transform.translation);
        this._pxShape.setLocalPose(transform);
    }

    setHeightFieldData(numRows: number, numCols: number, heightData: Float32Array, flag: Uint8Array, scale: Vector3): void {
        this._numRows = numRows;
        this._numCols = numCols;
        this._heightData = heightData;
        this._flag = flag;
        this._terrainYScale = scale.y;
        scale.cloneTo(this._scale);
        this._createHeightField();
    }

    /**
     * @en Gets the number of rows in the height field.
     * @returns Number of rows.
     * @zh 获取高度场的行数。
     * @returns 行数。
     */
    getNbRows(): number {
        return this._heightFiled.getNbRows();
    }

    /**
     * @en Gets the number of columns in the height field.
     * @returns Number of columns.
     * @zh 获取高度场的列数。
     * @returns 列数。
     */
    getNbColumns(): number {
        return this._heightFiled.getNbColumns();
    }

    /**
     * @en Gets the height at a specific row and column.
     * @param rows Row index.
     * @param cols Column index.
     * @returns Height value.
     * @zh 获取特定行列的高度值。
     * @param rows 行索引。
     * @param cols 列索引。
     * @returns 高度值。
     */
    getHeight(rows: number, cols: number): number {
        return this._heightFiled.getHeight(rows, cols);
    }

}