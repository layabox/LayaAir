import { Vector2 } from "../../maths/Vector2";
import { Navgiation2DUtils } from "./Navgiation2DUtils";
import { NavMesh2DSurface } from "./component/NavMesh2DSurface";
import { NavModifleData } from "../common/data/NavModifleData";
import { TextResource } from "../../resource/TextResource";
import { NavTileData } from "../common/NavTileData";
import { Matrix4x4 } from "../../maths/Matrix4x4";
import { Navigation2DManage, NavObstacles2DType } from "./Navigation2DManage";

const tempVec2 = new Vector2();
export class NavMesh2DObstacles {

    /**@internal */
    private _modifierData: NavModifleData;

    private _position: Vector2 = new Vector2();

    private _rotation: number = 0;

    private _scale: Vector2 = new Vector2(1, 1);

    private _size:Vector2 = new Vector2(); 

    private _worldMatrix:Matrix4x4 = new Matrix4x4();

    private _radius: number = 50;

    /**@internal load*/
    _oriTiles: NavTileData;

    /**@internal */
    private _meshType: NavObstacles2DType = NavObstacles2DType.RECT;

    /**
    * agentType
    */
    set agentType(value: string) {
        this._modifierData.agentType = value;
    }

    get agentType() {
        return this._modifierData.agentType;
    }

    /**
     * area 类型
     */
    set areaFlag(value: string) {
        this._modifierData.areaFlag = value;
    }

    get areaFlag() {
        return this._modifierData.areaFlag;
    }

    /**
     * transfrom
     */

    set position(value: Vector2) {
        value.cloneTo(this._position);
        this._transfromChange();
    }

    get position(): Vector2 {
        return this._position;
    }


    set rotation(value: number) {
        if (value == this._rotation) return;
        this._rotation = value;
        this._transfromChange();
    }

    get rotation(): number {
        return this._rotation;
    }

    set scale(value: Vector2) {
        value.cloneTo(this._scale);
        this._transfromChange();
    }

    get scale(): Vector2 {
        return this._scale;
    }

    /**
     * obstracle resource 
     */
    set datas(value: TextResource) {
        if(this._oriTiles){
            this._oriTiles.destroy();
            this._oriTiles = null;
        }
        if(value != null){
            this._oriTiles = new NavTileData(value);
        }
        this._changeData();
        this._transfromChange();
    }

    get datas(): TextResource {
        if(this._oriTiles) return this._oriTiles._res;
        return null;
    }

    /**阻挡资源类型
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

    set size(value:Vector2){
        value.cloneTo(this._size);
        this._transfromChange();
    }

    get size():Vector2{
        return this._size;
    }

    /** CAPSULE:radius*/
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

    bindSurface(surface: NavMesh2DSurface) {
        this._modifierData._initSurface([surface]);
    }

    
    setWorldMatrix(value:Matrix4x4){
        if(this._worldMatrix.equalsOtherMatrix(value)) return;
        value.cloneTo(this._worldMatrix);
        this._transfromChange();
    }

    destroy() {
        this._modifierData._destory();
    }

    /**@internal */
    _changeData() {
        switch (this._meshType) {
            case NavObstacles2DType.RECT:
                this._modifierData.datas = Navigation2DManage.getObstacleData(NavObstacles2DType.RECT);
                break;
            case NavObstacles2DType.CIRCLE:
                this._modifierData.datas = Navigation2DManage.getObstacleData(NavObstacles2DType.CIRCLE);
                break;
            case NavObstacles2DType.CUSTOMER:
                if(this._oriTiles){
                    this._modifierData.datas = this._oriTiles.getNavData(0);
                }else{
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
        if(this._meshType == NavObstacles2DType.RECT){
            tempVec2.x *= this._size.x;
            tempVec2.y *= this._size.y;
        }else if(this._meshType == NavObstacles2DType.CIRCLE){
            tempVec2.x *= this._radius;
            tempVec2.y *= this._radius;
        }
        Navgiation2DUtils.getTransfromMatrix4x4(this._position, this._rotation, tempVec2, this._modifierData._transfrom);
        Matrix4x4.multiply(this._worldMatrix,this._modifierData._transfrom,this._modifierData._transfrom);
        this._modifierData._transfrom.elements[5] = 0;
        this._modifierData._refeahTransfrom();
    }
}