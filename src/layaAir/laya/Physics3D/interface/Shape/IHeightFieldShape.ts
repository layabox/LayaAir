import { Vector3 } from "../../../maths/Vector3";
import { IColliderShape } from "./IColliderShape";

export interface IHeightFieldShape extends IColliderShape {

    /**
     * 设置高度数据
     * @param numRows 
     * @param numCols 
     * @param heightData 
     * @param _scale 
     */
    setHeightFieldData(numRows: number, numCols: number, heightData: Float32Array, flag: Uint8Array, scale: Vector3): void;

    /**
     * NBRows
     */
    getNbRows(): number;

    /**
     * NBColumns
     */
    getNbColumns(): number;

    /**
     * height
     * @param rows 
     * @param cols 
     */
    getHeight(rows: number, cols: number): number;
}