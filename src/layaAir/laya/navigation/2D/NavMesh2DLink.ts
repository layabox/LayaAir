import { Sprite } from "../../display/Sprite";
import { Matrix4x4 } from "../../maths/Matrix4x4";
import { Vector2 } from "../../maths/Vector2";
import { Vector3 } from "../../maths/Vector3";
import { NavMeshLinkData } from "../common/data/NavMeshLinkData";
import { NavMesh2DSurface } from "./component/NavMesh2DSurface";
import { Navgiation2DUtils } from "./Navgiation2DUtils";

const tempVec3 = new Vector3();

/**
 * <code>NavMesh2DLink</code> 网格外链接。
 */
export class NavMesh2DLink {

    private _data: NavMeshLinkData;
    private _agentType: string;
    private _start: Vector2 = new Vector2();
    private _end: Vector2 = new Vector2();
    /**
     * 宽度
     */
    set width(value: number) {
        this._data._updateWidth(value);
    }

    get width(): number {
        return this._data._width;
    }


    /**
     * 地形标记
     */
    set areaFlag(value: string) {
        this._data.areaFlag = value;
    }

    get areaFlag(): string {
        return this._data.areaFlag;
    }

    /**
     * 区域类型
     */
    set agentType(value: string) {
        this._agentType = value;
    }

    get agentType() {
        return this._agentType;
    }

    /**
     * 是否双向
     */
    set bidirectional(value: boolean) {
        this._data._updateBidirectional(value);
    }

    get bidirectional(): boolean {
        return this._data._bidirectional;
    }

    /**
   * 起始位置
   */

    set start(value: Vector2) {
        value.cloneTo(this._start);
        Navgiation2DUtils.vec2ToVec3(this._start, tempVec3);
        this._data._updateStartPoint(tempVec3);
    }

    get start(): Vector2 {
        return this._start;
    }

    /**
     * 结束位置
     */
    set end(value: Vector2) {
        value.cloneTo(this._end);
        Navgiation2DUtils.vec2ToVec3(this._end, tempVec3);
        this._data._updateEndPoint(tempVec3);
    }

    get end(): Vector2 {
        return this._end;
    }


    /**
     * 创建一个 <code>NavNavMeshLink</code> 实例。
     */
    constructor() {
        this._data = new NavMeshLinkData();
        this.width = 10;
    }

    bindSurface(surface: NavMesh2DSurface) {
        this._data._initSurface([surface]);
    }

    /**@internal */
    setWorldMatrix(worldMatrix:Matrix4x4) {
        worldMatrix.cloneTo(this._data._transfrom);
        this._data._refeahTransfrom();
    }

    destroy() {
        this._data.destroy();
    }
}