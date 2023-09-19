import { Laya3D } from "../../../../../../Laya3D";
import { IHeightFieldShape } from "../../../../../Physics3D/interface/Shape/IHeightFieldShape";
import { EPhysicsCapable } from "../../../../../Physics3D/physicsEnum/EPhycisCapable";
import { Vector3 } from "../../../../../maths/Vector3";
import { BaseShape } from "./BaseShape";

export interface heightFieldData {
    numRows: number;
    numCols: number;
    heightData: Uint16Array;
    scale: Vector3;
}

export class HeightFieldColliderShape extends BaseShape {
    /**@internal */
    _shape: IHeightFieldShape;
    /**@internal */
    _terrainData: heightFieldData;

    constructor(heightFieldData: heightFieldData) {
        super();
        this._terrainData = heightFieldData;
        this._shape.setHeightFieldData(this._terrainData.numRows,this._terrainData.numCols,this._terrainData.heightData,this._terrainData.scale);
    }

    protected _createShape() {
        if (Laya3D.PhysicsCreateUtil.getPhysicsCapable(EPhysicsCapable.physics_heightFieldColliderShape))
            this._shape = Laya3D.PhysicsCreateUtil.createHeightFieldShape();
        else {
            throw "BoxColliderShape: cant enable BoxColliderShape";
        }
    }
}