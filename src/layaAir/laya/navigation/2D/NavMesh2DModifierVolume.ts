import { Vector2 } from "../../maths/Vector2";
import { Vector3 } from "../../maths/Vector3";
import { ModifierVolumeData } from "../common/data/ModifierVolumeData";
import { Navgiation2DUtils } from "./Navgiation2DUtils";
import { NavMesh2DSurface } from "./component/NavMesh2DSurface";
import { Matrix4x4 } from "../../maths/Matrix4x4";

const tempVector3 = new Vector3();
export class NavMesh2DModifierVolume {

    /**@internal */
    private _volumeData: ModifierVolumeData;

    private _position: Vector2 = new Vector2();

    private _rotation: number = 0;

    private _scale: Vector2 = new Vector2(1, 1);

    private _worldMatrix:Matrix4x4 = new Matrix4x4();

    /**
    * agentType
    */
    set agentType(value: string) {
        this._volumeData.agentType = value;
    }

    get agentType() {
        return this._volumeData.agentType;
    }

    /**
     * area 类型
     */
    set areaFlag(value: string) {
        this._volumeData.areaFlag = value;
    }

    get areaFlag() {
        return this._volumeData.areaFlag;
    }

    private _pointDatas: number[] = [];

    /**
    * datas
    */
    set datas(value: number[]) {
        this._pointDatas = value;
        this._vector2dTo3d();
    }

    get datas(): number[] {
        return this._pointDatas;
    }

    /**
     * transfrom
     */

    set position(value: Vector2) {
        if(Vector2.equals(this._position,value)) return;
        value.cloneTo(this._position);
        this._transfromChange();
    }

    get position(): Vector2 {
        return this._position;
    }


    set rotation(value: number) {
        if(value == this._rotation) return;
        this._rotation = value;
        this._transfromChange();
    }

    get rotation(): number {
        return this._rotation;
    }

    set scale(value: Vector2) {
        if(Vector2.equals(this._scale,value)) return;
        value.cloneTo(this._scale);
        this._transfromChange();
    }

    get scale(): Vector2 {
        return this._scale;
    }

    constructor() {
        this._volumeData = new ModifierVolumeData();
    }
    
    bindSurface(surface: NavMesh2DSurface) {
        this._volumeData._initSurface([surface]);
    }

    setWorldMatrix(value:Matrix4x4){
        if(this._worldMatrix.equalsOtherMatrix(value)) return;
        value.cloneTo(this._worldMatrix);
        this._transfromChange();
    }

    destroy() {
        this._volumeData._destory();
    }

    /**@internal */
    private _vector2dTo3d(): void {
        let pointCount = this._pointDatas.length >> 1;
        let index = 0;
        let  datas = this._volumeData._datas;
        datas.length = pointCount * 3;
        for (var i = 0; i < pointCount; i++) {
            index = i * 2;
            Navgiation2DUtils.setValue3(this._pointDatas[index], this._pointDatas[index + 1], tempVector3);
            index = i * 3;
            datas[index] = tempVector3.x;
            datas[index + 1] = tempVector3.y;
            datas[index + 2] = tempVector3.z;
        }
        this._volumeData._refeashData();
    }
    
    /**@internal */
    _transfromChange() {
        Navgiation2DUtils.getTransfromMatrix4x4(this._position, this._rotation, this._scale, this._volumeData._transfrom);
        Matrix4x4.multiply(this._worldMatrix,this._volumeData._transfrom,this._volumeData._transfrom);
        this._volumeData._refeahTransfrom();
    }
}