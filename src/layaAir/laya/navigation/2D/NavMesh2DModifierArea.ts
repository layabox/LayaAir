import { Vector2 } from "../../maths/Vector2";
import { Vector3 } from "../../maths/Vector3";
import { ModifierVolumeData } from "../common/data/ModifierVolumeData";
import { Navgiation2DUtils } from "./Navgiation2DUtils";
import { NavMesh2DSurface } from "./component/NavMesh2DSurface";

const tempVector3 = new Vector3();

/**
 * @en NavMesh2DModifierArea is a 2D component that modifies the navigation mesh in a specific area.
 * @zh NavMesh2DModifierArea 一个在特定的凸多边形2D区域内修改导航网格的组件。
 */
export class NavMesh2DModifierArea {

    private _areaData: ModifierVolumeData;
    private _position: Vector2 = new Vector2();
    private _rotation: number = 0;
    private _scale: Vector2 = new Vector2(1, 1);

    /**
     * @en Agent type for the navigation node
     * @zh 导航节点的代理类型
     */
    get agentType() {
        return this._areaData.agentType;
    }
    set agentType(value: string) {
        this._areaData.agentType = value;
    }


    /**
     * @en The flag for this area.
     * @zh 该区域的标志。
     */
    get areaFlag() {
        return this._areaData.areaFlag;
    }
    set areaFlag(value: string) {
        this._areaData.areaFlag = value;
    }

    private _pointDatas: number[] = [];

    /**
     * @en The point data of the modifier area.
     * @zh 修改凸多边形区域的多边形顶点数据。
    */
    get datas(): number[] {
        return this._pointDatas;
    }
    set datas(value: number[]) {
        this._pointDatas = value;
        this._vector2dTo3d();
    }


    /**
     * @en The center of the modifier Polygen.
     * @zh 凸多边形区域的中心点。
     */
    get position(): Vector2 {
        return this._position;
    }
    set position(value: Vector2) {
        value.cloneTo(this._position);
        this._transfromChange();
    }
    /**
     * @en The rotation of the modifier Polygen.
     * @zh 凸多边形区域的旋转。
     */
    get rotation(): number {
        return this._rotation;
    }
    set rotation(value: number) {
        if (value == this._rotation) return;
        this._rotation = value;
        this._transfromChange();
    }

    /**
     * @en The scale of the modifier Polygen.
     * @zh 凸多边形区域的缩放。
     */
    get scale(): Vector2 {
        return this._scale;
    }
    set scale(value: Vector2) {
        value.cloneTo(this._scale);
        this._transfromChange();
    }


    /**@ignore */
    constructor() {
        this._areaData = new ModifierVolumeData();
    }

    /**
     * @internal
     */
    _bindSurface(surface: NavMesh2DSurface) {
        this._areaData._initSurface([surface]);
    }

    /**
     * @internal
     */
    _destroy() {
        this._areaData._destory();
    }
    private _vector2dTo3d(): void {
        let pointCount = this._pointDatas.length >> 1;
        let index = 0;
        let datas = this._areaData._datas;
        datas.length = pointCount * 3;
        for (var i = 0; i < pointCount; i++) {
            index = i * 2;
            Navgiation2DUtils._setValue3(this._pointDatas[index], this._pointDatas[index + 1], tempVector3);
            index = i * 3;
            datas[index] = tempVector3.x;
            datas[index + 1] = tempVector3.y;
            datas[index + 2] = tempVector3.z;
        }
        this._areaData._refeashData();
    }

    /**@internal */
    _transfromChange() {
        Navgiation2DUtils._getTransfromMatrix4x4(this._position, this._rotation, this._scale, this._areaData._transfrom);
        this._areaData._refeahTransfrom();
    }
}