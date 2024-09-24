import { Vector3 } from "../../../maths/Vector3";
import { IColliderShape } from "./IColliderShape";

/**
 * @en Interface for height field shape.
 * @zh 高度场的接口。
 */
export interface IHeightFieldShape extends IColliderShape {

    /**
     * @en Set height field data.
     * @param numRows Number of rows in the height field
     * @param numCols Number of columns in the height field
     * @param heightData Array of height values
     * @param flag Array of flags for each cell
     * @param scale Scale of the height field
     * @zh 设置高度数据。
     * @param numRows 高度场的行数
     * @param numCols 高度场的列数
     * @param heightData 高度值数组
     * @param flag 每个单元格的标志数组
     * @param scale 高度场的缩放
     */
    setHeightFieldData(numRows: number, numCols: number, heightData: Float32Array, flag: Uint8Array, scale: Vector3): void;

    /**
     * @en Get the number of rows in the height field.
     * @zh 获取高度场的行数。
     */
    getNbRows(): number;

    /**
     * @en Get the number of columns in the height field.
     * @zh 获取高度场的列数。
     */
    getNbColumns(): number;

    /**
     * @en Get the height at a specific row and column.
     * @param rows Row index
     * @param cols Column index
     * @returns The height at the specified position
     * @zh 获取指定行列位置的高度。
     * @param rows 行索引
     * @param cols 列索引
     * @returns 指定位置的高度
     */
    getHeight(rows: number, cols: number): number;
}