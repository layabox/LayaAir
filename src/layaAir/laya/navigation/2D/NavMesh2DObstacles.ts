import { Vector2 } from "../../maths/Vector2";
import { Navgiation2DUtils } from "./Navgiation2DUtils";
import { NavMesh2DSurface } from "./component/NavMesh2DSurface";
import { NavModifleData } from "../common/data/NavModifleData";
import { TextResource } from "../../resource/TextResource";
import { NavTileData } from "../common/NavTileData";
import { Navigation2DManage, NavObstacles2DType } from "./Navigation2DManage";

const tempVec2 = new Vector2();
export class NavMesh2DObstacles {

    private _modifierData: NavModifleData;
    private _position: Vector2 = new Vector2();
    private _rotation: number = 0;
    private _scale: Vector2 = new Vector2(1, 1);
    private _size: Vector2 = new Vector2();
    private _radius: number = 50;
    private _meshType: NavObstacles2DType = NavObstacles2DType.RECT;

    /**@internal load*/
    _oriTiles: NavTileData;
    /**
     * @en Agent type for the navigation node
     * @zh 导航节点的代理类型
     */
    get agentType() {
        return this._modifierData.agentType;
    }
    set agentType(value: string) {
        this._modifierData.agentType = value;
    }

    /**
     * @en Area type for the navigation node
     * @zh 导航节点的区域类型
     */
    get areaFlag() {
        return this._modifierData.areaFlag;
    }
    set areaFlag(value: string) {
        this._modifierData.areaFlag = value;
    }

    /**
     * @en The center of the modifier Obstacles.
     * @zh 障碍的中心点。
     */
    get position(): Vector2 {
        return this._position;
    }
    set position(value: Vector2) {
        value.cloneTo(this._position);
        this._transfromChange();
    }

    /**
     * @en The rotation of the modifier Obstacles.
     * @zh 障碍的旋转。
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
     * @en The scale of the modifier Obstacles.
     * @zh 障碍的缩放。
     */
    get scale(): Vector2 {
        return this._scale;
    }

    set scale(value: Vector2) {
        value.cloneTo(this._scale);
        this._transfromChange();
    }

    /**
     * @en The data of the modifier Obstacles.
     * @zh 障碍的数据。
     */
    get datas(): TextResource {
        if (this._oriTiles) return this._oriTiles._res;
        return null;
    }
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

    /**
     * @en The type of the modifier Obstacles.
     * - NavObstacles2DType.RECT : rectangle Mesh
     * - NavObstacles2DType.CIRCLE : circle Mesh
     * - NavObstacles2DType.CUSTOMER : Custom Mesh
     * @zh 修改障碍的类型。
     * - NavObstacles2DType.RECT : 矩形网格
     * - NavObstacles2DType.CIRCLE : 圆形网格
     * - NavObstacles2DType.CUSTOMER : 自定义网格
     */
    get meshType() {
        return this._meshType;
    }
    set meshType(value: NavObstacles2DType) {
        if (this._meshType == value)
            return;
        this._meshType = value;
        this._changeData();
    }

    /**
     * @en The size of the modifier Obstacles.
     * @zh 障碍的大小。
     */
    get size(): Vector2 {
        return this._size;
    }
    set size(value: Vector2) {
        value.cloneTo(this._size);
        this._transfromChange();
    }


    /**
     * @en The radius of the modifier Obstacles.
     * @zh 障碍的半径。
     */
    get radius() {
        return this._radius;
    }
    set radius(value: number) {
        this._radius = value;
        this._transfromChange();
    }

    /**@ignore */
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