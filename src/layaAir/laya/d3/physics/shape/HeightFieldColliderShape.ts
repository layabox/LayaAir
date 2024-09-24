import { Laya3D } from "../../../../Laya3D";
import { IHeightFieldShape } from "../../../Physics3D/interface/Shape/IHeightFieldShape";
import { EPhysicsCapable } from "../../../Physics3D/physicsEnum/EPhycisCapable";
import { Vector3 } from "../../../maths/Vector3";
import { Physics3DColliderShape } from "./Physics3DColliderShape";


/**
 * @en Interface for height field data.
 * @zh 高度场数据接口。
 */
export interface heightFieldData {
    /**
     * @en The number of rows in the height field.
     * @zh 高度场中的行数。
     */
    numRows: number;
    /**
     * @en The number of columns in the height field.
     * @zh 高度场中的列数。
     */
    numCols: number;
    /**
     * @en The height data of the field.
     * @zh 高度场的高度数据。
     */
    heightData: Float32Array;
    /**
     * @en The tessellation flags for the height field, where 0 and 1 indicate whether the terrain triangle faces left or right.
     * @zh 镶嵌标志，0 和 1 分别表示地形三角形朝向左还是朝右。
     */
    flag: Uint8Array;
    /**
     * @en The scale of the height field.
     * @zh 高度场的缩放。
     */
    scale: Vector3;
}

/**
 * @en Class describing the physics collision of a height field.
 * @zh 描述高度场物理碰撞的类。
 */
export class HeightFieldColliderShape extends Physics3DColliderShape {
    /**@internal */
    _shape: IHeightFieldShape;
    /**@internal */
    _terrainData: heightFieldData;

    /**
     * @ignore
     * @en Constructor method, initialize height field data.
     * @param heightFieldData Height field data.
     * @zh 构造方法, 初始化高度场数据。
     * @param heightFieldData 高度场数据。
     */
    constructor(heightFieldData: heightFieldData) {
        super();
        this._terrainData = heightFieldData;
        this._shape.setHeightFieldData(this._terrainData.numRows, this._terrainData.numCols, this._terrainData.heightData, this._terrainData.flag, this._terrainData.scale);
    }

    /**
     * @internal
     */
    protected _createShape() {
        if (Laya3D.PhysicsCreateUtil.getPhysicsCapable(EPhysicsCapable.physics_heightFieldColliderShape))
            this._shape = Laya3D.PhysicsCreateUtil.createHeightFieldShape();
        else {
            console.error("HeightFieldColliderShape: cant enable HeightFieldColliderShape");
        }
    }
}