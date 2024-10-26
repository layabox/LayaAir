
import { Component } from "../../components/Component";
import { Sprite3D } from "../../d3/core/Sprite3D";
import { Vector3 } from "../../maths/Vector3";
import { NavigationManager } from "../NavigationManager";
import { NavMeshSurface } from "./NavMeshSurface";


/**
 * @en NavMeshLink represents a connection between two points outside the navigation mesh.
 * @zh NavMeshLink 表示导航网格外的两点之间的连接。
 */
export class NavMeshLink extends Component {
    /**@internal */
    _start: Vector3 = new Vector3();

    /**@internal */
    _end: Vector3 = new Vector3();

    /**@internal */
    private _localstart: Vector3 = new Vector3(-1, 0, 0);

    /**@internal */
    private _localend: Vector3 = new Vector3(1, 0, 0);

    /**@internal 记录原始NavMeshSurface*/
    _surfaces: NavMeshSurface[] = [];
    /**@internal */
    _startNavSurfaces: NavMeshSurface[] = [];

    /**@internal */
    _endNavSurfaces: NavMeshSurface[] = [];

    /**@internal */
    private _width: number = 1;

    /**@internal */
    private _bidirectional: boolean = true;

    /**@internal */
    private _areaFlag: string = NavigationManager.defaltJump;

    /**@internal */
    private _agentType: string = NavigationManager.defaltAgentName;

    /**
     * @en The start position of the link
     * @zh 链接的起始位置
     */
    set start(value: Vector3) {
        value.cloneTo(this._localstart);
    }

    get start(): Vector3 {
        return this._localstart;
    }

    /**
     * @en The end position of the link
     * @zh 链接的结束位置
     */
    set end(value: Vector3) {
        value.cloneTo(this._localend);
    }

    get end(): Vector3 {
        return this._localend;
    }

    /**
     * @en The width of the link
     * @zh 链接的宽度
     */
    set width(value: number) {
        if (value == this._width)
            return;
        this._width = value;
    }

    get width(): number {
        return this._width;
    }


    /**
     * @en The area flag of the link
     * @zh 链接的区域标记
     */
    set areaFlag(value: string) {
        this._areaFlag = value;
    }

    get areaFlag() {
        return this._areaFlag;
    }

    /**
     * @en The agent type that can use this link
     * @zh 可以使用此链接的代理类型
     */
    set agentType(value: string) {
        this._agentType = value;
    }

    get agentType() {
        return this._agentType;
    }

    /**
     * @en Whether the link is bidirectional
     * @zh 链接是否为双向
     */
    set bidirectional(value: boolean) {
        this._bidirectional = value;
    }

    get bidirectional(): boolean {
        return this._bidirectional;
    }

    /**
     * @ignore
     * @en Creates a new NavMeshLink instance.
     * @zh 创建一个新的 NavMeshLink 实例。
     */
    constructor() {
        super();
        this._singleton = false;
    }


    /**
    * @internal
    */
    _onWorldMatNeedChange() {
        const mat = (<Sprite3D>this.owner).transform.worldMatrix;
        Vector3.transformCoordinate(this._localstart, mat, this._start);
        Vector3.transformCoordinate(this._localend, mat, this._end);
    }

    /**@internal */
    protected _onEnable(): void {
        super._onEnable();
        this._onWorldMatNeedChange();
        let manager: NavigationManager = this.owner.scene.getComponentElementManager(NavigationManager.managerName);
        var starts = manager.getNavMeshSurfaces(this._start);
        var ends = manager.getNavMeshSurfaces(this._end);
        for (var i = starts.length - 1; i >= 0; i--) {
            let surface = starts[i];
            let index = ends.indexOf(surface);
            if (index < 0) {
                continue;
            }
            ends.splice(index, 1);
            starts.splice(i);
            surface._addMeshLink(this);
            this._surfaces.push(surface);
        }

        if (ends.length > 0 && starts.length > 0) {
            starts.forEach((value) => {
                this._startNavSurfaces.push(value);
            })

            ends.forEach((value) => {
                this._endNavSurfaces.push(value);
            })

            for (var i = 0, n = starts.length; i < n; i++) {
                for (var j = 0, k = ends.length; j < k; j++) {
                    manager.regNavMeshLink(starts[i], ends[j], this);
                }
            }
        }

    }

    /**@internal */
    protected _onDestroy(): void {
        super._onDestroy();
        for (var i = this._surfaces.length - 1; i >= 0; i--) {
            this._surfaces[i]._removeMeshLink(this);
        }
        this._surfaces = null;
    }

    /**
     * @internal
     */
    _getdistance(): number {
        return Vector3.distance(this.start, this._end);
    }


    /**@internal */
    _cloneTo(dest: NavMeshLink): void {
        this._localstart.cloneTo(dest._localstart);
        this._localend.cloneTo(dest._localend);
        dest._agentType = this._agentType;
        dest._areaFlag = this.areaFlag;
        dest._bidirectional = this._bidirectional;
        super._cloneTo(dest);
    }
}