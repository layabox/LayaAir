import { Laya3D } from "../../../../../../Laya3D";
import { IHeightFieldShape } from "../../../../../Physics3D/interface/Shape/IHeightFieldShape";
import { EPhysicsCapable } from "../../../../../Physics3D/physicsEnum/EPhycisCapable";
import { Vector3 } from "../../../../../maths/Vector3";
import { BaseShape } from "./BaseShape";

/**
 * 高度场数据
 */
export interface heightFieldData {
    /** 排*/
    numRows: number;
    /** 列*/
    numCols: number;
    /** 高度数据*/
    heightData: Float32Array;
    /** 镶嵌标志 0和1 分别表示地形三角形朝向左还是朝右*/
    flag: Uint8Array;
    /** 高度Scale*/
    scale: Vector3;
}
/**
 * 此类描述高度场物理碰撞
 */
export class HeightFieldColliderShape extends BaseShape {
    /**@internal */
    _shape: IHeightFieldShape;
    /**@internal */
    _terrainData: heightFieldData;

    /**
     * 实例化一个高度场碰撞体
     * @param heightFieldData 
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
            throw "BoxColliderShape: cant enable BoxColliderShape";
        }
    }
}