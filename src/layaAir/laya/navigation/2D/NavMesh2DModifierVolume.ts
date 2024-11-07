import { Vector2 } from "../../maths/Vector2";
import { Vector3 } from "../../maths/Vector3";
import { ModifierVolumeData } from "../common/data/ModifierVolumeData";
import { Navgiation2DUtils } from "./Navgiation2DUtils";
import { NavMesh2DSurface } from "./component/NavMesh2DSurface";

const tempVector3 = new Vector3();

/**
 * @en NavMesh2DModifierVolume is a 2D component that modifies the navigation mesh in a specific volume.
 * @zh NavMesh2DModifierVolume 是一个在特定2D体积内修改导航网格的组件。
 */
export class NavMesh2DModifierVolume {

    /**@internal */
    private _volumeData: ModifierVolumeData;

    /**@internal */
    private _position: Vector2 = new Vector2();

    /**@internal */
    private _rotation: number = 0;

    /**@internal */
    private _scale: Vector2 = new Vector2(1, 1);

    /**
     * @en Agent type for the navigation node
     * @zh 导航节点的代理类型
     */
    set agentType(value: string) {
        this._volumeData.agentType = value;
    }

    get agentType() {
        return this._volumeData.agentType;
    }

    /**
     * @en The area flag for this volume.
     * @zh 该体积的区域标志。
     */
    set areaFlag(value: string) {
        this._volumeData.areaFlag = value;
    }

    get areaFlag() {
        return this._volumeData.areaFlag;
    }

    private _pointDatas: number[] = [];

    /**
     * @en The point data of the modifier volume.
     * @zh 修改体积的点数据。
    */
    set datas(value: number[]) {
        this._pointDatas = value;
        this._vector2dTo3d();
    }

    get datas(): number[] {
        return this._pointDatas;
    }

    /**
     * @en The center of the modifier Polygen.
     * @zh 修改凸多边形的中心点。
     */
    set position(value: Vector2) {
        value.cloneTo(this._position);
        this._transfromChange();
    }

    get position(): Vector2 {
        return this._position;
    }


    /**
     * @en The rotation of the modifier Polygen.
     * @zh 修改凸多边形的旋转。
     */
    set rotation(value: number) {
        if (value == this._rotation) return;
        this._rotation = value;
        this._transfromChange();
    }

    get rotation(): number {
        return this._rotation;
    }

    /**
     * @en The scale of the modifier Polygen.
     * @zh 修改凸多边形的缩放。
     */
    set scale(value: Vector2) {
        value.cloneTo(this._scale);
        this._transfromChange();
    }

    get scale(): Vector2 {
        return this._scale;
    }

    constructor() {
        this._volumeData = new ModifierVolumeData();
    }

    /**
     * @internal
     */
    _bindSurface(surface: NavMesh2DSurface) {
        this._volumeData._initSurface([surface]);
    }

    /**
     * @internal
     */
    _destroy() {
        this._volumeData._destory();
    }

    /**@internal */
    private _vector2dTo3d(): void {
        let pointCount = this._pointDatas.length >> 1;
        let index = 0;
        let datas = this._volumeData._datas;
        datas.length = pointCount * 3;
        for (var i = 0; i < pointCount; i++) {
            index = i * 2;
            Navgiation2DUtils._setValue3(this._pointDatas[index], this._pointDatas[index + 1], tempVector3);
            index = i * 3;
            datas[index] = tempVector3.x;
            datas[index + 1] = tempVector3.y;
            datas[index + 2] = tempVector3.z;
        }
        this._volumeData._refeashData();
    }

    /**@internal */
    _transfromChange() {
        Navgiation2DUtils._getTransfromMatrix4x4(this._position, this._rotation, this._scale, this._volumeData._transfrom);
        this._volumeData._refeahTransfrom();
    }
}