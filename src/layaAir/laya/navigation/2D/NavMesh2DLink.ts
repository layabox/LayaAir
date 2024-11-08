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

    /**@internal */
    private _data: NavMeshLinkData;

    /**@internal */
    private _agentType: string;

    /**@internal */
    private _start: Vector2 = new Vector2();

    /**@internal */
    private _end: Vector2 = new Vector2();

    /**
     * @en Agent type for the navigation node
     * @zh 导航节点的代理类型
     */
    set agentType(value: string) {
        this._agentType = value;
    }

    get agentType() {
        return this._agentType;
    }


    /**
     * @en Area type for the navigation node
     * @zh 导航节点的区域类型
     */
    set areaFlag(value: string) {
        this._data.areaFlag = value;
    }

    get areaFlag(): string {
        return this._data.areaFlag;
    }


    /**
     * @en The width of the link
     * @zh 链接的宽度
     */
    set width(value: number) {
        this._data._updateWidth(value);
    }

    get width(): number {
        return this._data._width;
    }

    /**
     * @en Whether the link is bidirectional
     * @zh 链接是否可双向通行
     */
    set bidirectional(value: boolean) {
        this._data._updateBidirectional(value);
    }

    get bidirectional(): boolean {
        return this._data._bidirectional;
    }

    /**
     * @en The start position of the link（local position）
     * @zh 链接的起始位置(局部坐标)
     */
    set start(value: Vector2) {
        value.cloneTo(this._start);
        Navgiation2DUtils._vec2ToVec3(this._start, tempVec3);
        this._data._updateStartPoint(tempVec3);
    }

    get start(): Vector2 {
        return this._start;
    }

    /**
     * @en The end position of the link （local position）
     * @zh 链接的结束位置(局部坐标)
     */
    set end(value: Vector2) {
        value.cloneTo(this._end);
        Navgiation2DUtils._vec2ToVec3(this._end, tempVec3);
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

    _bindSurface(surface: NavMesh2DSurface) {
        this._data._initSurface([surface]);
    }

    destroy() {
        this._data.destroy();
    }
}