import { Vector2 } from "../../maths/Vector2";
import { Navgiation2DUtils } from "./Navgiation2DUtils";
import { NavMesh2DSurface } from "./component/NavMesh2DSurface";
import { NavModifleData } from "../common/data/NavModifleData";
import { TextResource } from "../../resource/TextResource";
import { NavTileData } from "../common/NavTileData";
import { Navigation2DManage, NavObstacles2DType } from "./Navigation2DManage";

const tempVec2 = new Vector2();
export class NavMesh2DObstacles {

    /**@internal */
    private _modifierData: NavModifleData;

    /**@internal */
    private _position: Vector2 = new Vector2();

    /**@internal */
    private _rotation: number = 0;

    /**@internal */
    private _scale: Vector2 = new Vector2(1, 1);

    /**@internal */
    private _size: Vector2 = new Vector2();

    /**@internal */
    private _radius: number = 50;

    /**@internal load*/
    _oriTiles: NavTileData;

    /**@internal */
    private _meshType: NavObstacles2DType = NavObstacles2DType.RECT;

    /**
     * @en Agent type for the navigation node
     * @zh 导航节点的代理类型
     */
    set agentType(value: string) {
        this._modifierData.agentType = value;
    }

    get agentType() {
        return this._modifierData.agentType;
    }

    /**
     * @en Area type for the navigation node
     * @zh 导航节点的区域类型
     */
    set areaFlag(value: string) {
        this._modifierData.areaFlag = value;
    }

    get areaFlag() {
        return this._modifierData.areaFlag;
    }

    /**
     * @en The center of the modifier Obstacles.
     * @zh 修改阻挡的中心点。
     */
    set position(value: Vector2) {
        value.cloneTo(this._position);
        this._transfromChange();
    }

    get position(): Vector2 {
        return this._position;
    }

    /**
     * @en The rotation of the modifier Obstacles.
     * @zh 修改阻挡的旋转。
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
     * @en The scale of the modifier Obstacles.
     * @zh 修改阻挡的缩放。
     */
    set scale(value: Vector2) {
        value.cloneTo(this._scale);
        this._transfromChange();
    }

    get scale(): Vector2 {
        return this._scale;
    }

    /**
     * @en The data of the modifier Obstacles.
     * @zh 修改阻挡的数据。
     */
    set datas(value: TextResource) {
        if (this._oriTiles) {
            this._oriTiles.destroy();
            this._oriTiles = null;
        }
        if (value != null) {
            this._oriTiles = new NavTileData(value);
        }
        this._changeData();
        this._transfromChange();
    }

    get datas(): TextResource {
        if (this._oriTiles) return this._oriTiles._res;
        return null;
    }

    /**
     * @en The type of the modifier Obstacles.
     * @zh 修改阻挡的类型。
     * 0:BOX 正方体
     * 1:CAPSULE 圆
     * 2:CUSTOMER 自定义Mesh
     */
    set meshType(value: NavObstacles2DType) {
        if (this._meshType == value)
            return;
        this._meshType = value;
        this._changeData();
    }

    get meshType() {
        return this._meshType;
    }

    /**
     * @en The size of the modifier Obstacles.
     * @zh 修改阻挡的大小。
     */
    set size(value: Vector2) {
        value.cloneTo(this._size);
        this._transfromChange();
    }

    get size(): Vector2 {
        return this._size;
    }

    /**
     * @en The radius of the modifier Obstacles.
     * @zh 修改阻挡的半径。
     */
    set radius(value: number) {
        this._radius = value;
        this._transfromChange();
    }

    get radius() {
        return this._radius;
    }

    constructor() {
        this._modifierData = new NavModifleData();
        this._changeData();
        this._transfromChange();
    }

    /**
     * @internal
     */
    _bindSurface(surface: NavMesh2DSurface) {
        this._modifierData._initSurface([surface]);
    }

    /**@internal */
    _destroy() {
        this._modifierData._destory();
    }

    /**@internal */
    _changeData() {
        switch (this._meshType) {
            case NavObstacles2DType.RECT:
                this._modifierData.datas = Navigation2DManage._getObstacleData(NavObstacles2DType.RECT);
                break;
            case NavObstacles2DType.CIRCLE:
                this._modifierData.datas = Navigation2DManage._getObstacleData(NavObstacles2DType.CIRCLE);
                break;
            case NavObstacles2DType.CUSTOMER:
                if (this._oriTiles) {
                    this._modifierData.datas = this._oriTiles.getNavData(0);
                } else {
                    this._modifierData.datas = null;
                }
                break;
            default:
                console.error("NavMesh2DObstacles:meshType error");
                break;
        }
    }


    /**@internal */
    _transfromChange() {
        this.scale.cloneTo(tempVec2);
        if (this._meshType == NavObstacles2DType.RECT) {
            tempVec2.x *= this._size.x;
            tempVec2.y *= this._size.y;
        } else if (this._meshType == NavObstacles2DType.CIRCLE) {
            tempVec2.x *= this._radius;
            tempVec2.y *= this._radius;
        }
        Navgiation2DUtils._getTransfromMatrix4x4(this._position, this._rotation, tempVec2, this._modifierData._transfrom);
        this._modifierData._transfrom.elements[5] = 0;
        this._modifierData._refeahTransfrom();
    }
}