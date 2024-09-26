
import { Component } from "../../../components/Component";
import { MathUtils3D } from "../../../maths/MathUtils3D";
import { Vector3 } from "../../../maths/Vector3";
import { BaseNavigationManager } from "../BaseNavigationManager";
import { NavigationPathData } from "../NavigationPathData";
import { AreaMask } from "../AreaMask";
import { NavAgentLinkAnim } from "../NavAgentLinkAnim";
import { CrowdAgentState, NavigationConfig, ObstacleAvoidanceType, UpdateFlags } from "../NavigationConfig";
import { BaseNavMeshSurface } from "./BaseNavMeshSurface";
import { NavMeshLinkData } from "../data/NavMeshLinkData";

const tempVector3 = new Vector3();
const tempVector31 = new Vector3();

/**
 * @en Class used to instantiate a navigation agent
 * @zh 类用来实例化一个寻路代理
 */
export class BaseNavAgent extends Component {

    /**@internal */
    private _targetPos: Vector3 = new Vector3();

    /**@internal */
    protected _agentType: string = NavigationConfig.defaltAgentName;

    /**@internal */
    protected _currentNaveSurface: BaseNavMeshSurface;

    /**@internal 速度*/
    protected _speed: number = 3.5;

    /**@internal 加速度*/
    protected _maxAcceleration: number = 10;

    /**@internal */
    protected _angularSpeed: number = 120;

    /**@internal TODO*/
    protected _stopDistance: number;

    /**@internal TODO*/
    protected _Acceleration: number;

    /**@internal TODO*/
    protected _autoBraking: boolean;

    /**@internal */
    protected _radius: number = 0.5;

    /**@internal */
    protected _height: number = 2;

    /**@internal */
    protected _quality: ObstacleAvoidanceType = ObstacleAvoidanceType.MedQuality;

    /**@internal */
    protected _priority: number = 0;

    /**@internal */
    protected _fllowPath: NavigationPathData[];

    /**@internal */
    protected _baseOffset: number = 1;

    /**@internal */
    _navManager: BaseNavigationManager;

    /**@internal */
    _navAgentLinkAnim: NavAgentLinkAnim;

    /**@internal */
    _crowAgent: any;
    /**@internal */
    _agentId: number;
    /**@internal */
    _areaMask: AreaMask;
    /**@internal */
    _filter: any;
    /**@internal */
    _curentSpeed: Vector3;

    /**
     * @en Radius of the agent.
     * @zh 代理的半径。
     */
    public set radius(value: number) {
        this._radius = value;
        if (this._crowAgent) {
            let params = this._crowAgent.getparams();
            const radius = this._getradius()
            params.radius = radius;
            params.collisionQueryRange = radius * 12;
            params.pathOptimizationRange = radius * 30;
        }
    }

    public get radius() {
        return this._radius;
    }

    /**
     * @en Height of the agent.
     * @zh 代理的高度。
     */
    public set height(value: number) {
        this._height = value;
        if (this._crowAgent) {
            this._crowAgent.getparams().height = this._getheight();
        }
    }

    public get height() {
        return this._height;
    }

    /**
     * @en Movement speed of the agent.
     * @zh 代理的移动速度。
     */
    public set speed(value: number) {
        this._speed = value;
        if (this._crowAgent) {
            this._crowAgent.getparams().maxSpeed = this._speed;
        }
    }

    get speed() {
        return this._speed;
    }

    /**
     * @en Maximum acceleration of the agent.
     * @zh 代理的最大加速度。
     */
    set maxAcceleration(value: number) {
        this._maxAcceleration = value;
        if (this._crowAgent) {
            this._crowAgent.getparams().maxAcceleration = this._speed;
        }
    }

    get maxAcceleration() {
        return this._maxAcceleration;
    }

    /**
     * @en Angular speed of the agent.
     * @zh 代理的转身速度。
     */
    set angularSpeed(value: number) {
        this._angularSpeed = value;
    }

    get angularSpeed() {
        return this._angularSpeed;
    }


    /**
     * @en Obstacle avoidance quality level.
     * @zh 障碍物规避品质级别。
     */
    set quality(value: ObstacleAvoidanceType) {
        if (this._quality == value) return;
        this._quality = value;
        if (this._crowAgent) {
            let params = this._crowAgent.getparams();
            params.updateFlags = this._getUpdateFlags();
            params.obstacleAvoidanceType = this._quality;
        }
    }

    get quality(): ObstacleAvoidanceType {
        return this._quality;
    }

    /**
     * @en Avoidance priority level.
     * @zh 规避优先级别。
     */
    set priority(value: number) {
        if (this._priority == value) return;
        this._priority = value;
        if (this._crowAgent) {
            let params = this._crowAgent.getparams();
            params.updateFlags = this._getUpdateFlags();
            params.separationWeight = this._priority;
        }
    }

    get priority(): number {
        return this._priority;
    }

    /**
     * @en Whether the agent is bound to a navigation mesh.
     * @zh 代理是否绑定到导航网格。
     */
    get isOnNavMesh(): boolean {
        return this._crowAgent != null;
    }

    /**
     * @en Whether the agent is currently on an OffMeshLink.
     * @zh 代理当前是否位于 OffMeshLink 上。
     */
    get isOnOffMeshLink(): boolean {
        if (!this.isOnNavMesh) return this._navAgentLinkAnim._active;
        return this._crowAgent.state == CrowdAgentState.DT_CROWDAGENT_STATE_OFFMESH;
    }

    /**
     * @en Set the agent type.
     * @param value The agent type.
     * @zh 设置代理类型。
     * @param value 代理类型。
     */
    set agentType(value: string) {
        if (value == this._agentType) return;
        this._agentType = value;
        if (this._crowAgent) {
            this._removeAgent();
            this._addAgent();
        }
    }

    get agentType() {
        return this._agentType;
    }

    /**
     * @en Set the area mask for the agent.
     * @zh 设置代理的区域掩码。
     */
    set areaMask(value: number) {
        this._areaMask.flag = value
    }

    get areaMask(): number {
        return this._areaMask.flag;
    }


    /**
     * 创建一个 <code>NavAgent</code> 实例。
     */
    constructor() {
        super();
        this._navAgentLinkAnim = new NavAgentLinkAnim();
        this._areaMask = new AreaMask();
        this._curentSpeed = new Vector3();
    }

    /**
     * 由系统调用
     */
    onUpdate() {
        if (this._crowAgent != null) return;
        if (!this._navAgentLinkAnim._active) return;
        let position = tempVector3;
        let dir = tempVector31;
        this._navAgentLinkAnim._update(position, dir);
        if (this._navAgentLinkAnim._nearerEndPos(position)) {
            this._addAgent();
            this._navAgentLinkAnim._clearn();
            this._setTarget(this._targetPos);
        }
        this._updatePosition(position, dir);
    }

    /**
     * @en Whether the agent has stopped moving.
     * @zh 代理是否已停止移动。
     */
    isStop(): boolean {
        return MathUtils3D.isZero(this._curentSpeed.length())
    }

    /**
     * @en Get the current path of the agent.
     * @zh 获取代理的当前路径。
     */
    getCurrentPath(): Array<NavigationPathData> {
        if (!this._currentNaveSurface) {
            this._fllowPath.length = 0;
        } else {
            this._getpos(tempVector3);
            this._currentNaveSurface.findFllowPath(this._fllowPath, tempVector3, this._targetPos, this._speed, this._filter);
        }
        return this._fllowPath;
    }

    /**
     * 到墙面的距离
     * @returns {dist:距离,pos:碰撞点, normal:法向量}
     */
    findDistanceToWall(): { dist: number, pos: Array<number>, normal: Array<number> } {
        if (this._crowAgent) {
            this._getpos(tempVector3);
            return this._currentNaveSurface.findDistanceToWall(tempVector3, this._filter);
        } else {
            return null;
        }
    }

    /**
     * 目的地
     */

    protected _setTarget(value: Vector3) {
        value.cloneTo(this._targetPos);
        if (!this._navManager) return;
        let targetSurface: BaseNavMeshSurface = this._navManager.getNavMeshSurface(value, this._agentType);
        if (targetSurface == this._currentNaveSurface) {
            this._currentNaveSurface._navMesh._requestMoveTarget(this, this._targetPos);
            return;
        }
        let linkes = this._navManager.getNavMeshLink(this._currentNaveSurface, targetSurface);
        //没有找到链接
        if (linkes == null) return;
        let link: NavMeshLinkData = null;
        let distance: number = Number.MAX_VALUE;
        let isstart: boolean;
        linkes.forEach((value) => {
            if (value._startNavSurfaces.indexOf(this._currentNaveSurface) >= 0) {
                let dis = value.getDistance();
                if (dis < distance) {
                    dis = distance;
                    link = value;
                    isstart = true;
                }
            } else if (value._endNavSurfaces.indexOf(this._currentNaveSurface) >= 0 && value._bidirectional) {
                let dis = value.getDistance();
                if (dis < distance) {
                    dis = distance;
                    link = value;
                    isstart = false;
                }
            }
        })
        if (link == null) {
            return;
        }
        this._navAgentLinkAnim.targetSurface = targetSurface;
        this._navAgentLinkAnim._active = true;
        if (isstart) {
            this._navAgentLinkAnim._setStartPos(link.globalStart);
            this._navAgentLinkAnim._setEndPos(link.globalEnd);
        } else {
            this._navAgentLinkAnim._setStartPos(link.globalEnd);
            this._navAgentLinkAnim._setEndPos(link.globalStart);
        }
        let startPos = this._navAgentLinkAnim._getSartPos();
        let refPoint = this._currentNaveSurface._navMesh._findNearestPoly(startPos, this._filter, startPos);
        if (refPoint >= 0) {
            this._currentNaveSurface._navMesh._requestMoveTarget(this, startPos);
        }

    }


    /**
     * @internal 
     */
    _getpos(vec: Vector3) {
        throw new Error("Method not implemented.");
    }

    /**@internal */
    _getcollisionQueryRange(): number {
        return this.radius * 12;
    }

    /**@internal */
    _getpathOptimizationRange(): number {
        return this.radius * 30;
    }


    /**@internal */
    protected _getManager(): BaseNavigationManager {
        throw new Error("BaseNavMeshSurface: must override this function");
    }

    /**
     * @internal 
     */
    protected _onEnable(): void {
        super._onEnable();
        this._fllowPath = [];
        let manager = this._navManager = this._getManager();
        this._areaMask._setAreaMap(manager.getAreaFlagMap())
        this._addAgent();
    }

    /**
     * @internal 
     */
    protected _addAgent() {
        if (this._navManager == null) return;
        this._getpos(tempVector3);
        let surface = this._navManager.getNavMeshSurface(tempVector3, this._agentType);
        if (surface == null) {
            console.error("not get the NavMeshSurface in this position.");
            return;
        }
        this._currentNaveSurface = surface;
        this._currentNaveSurface._navMesh._addAgent(this);
    }

    /**
     * @internal 
     */
    protected _removeAgent() {
        if (this._currentNaveSurface == null || this._agentId == null || this._crowAgent == null)
            return;
        this._currentNaveSurface._navMesh._removeAgent(this);
        this._currentNaveSurface = null;
    }

    /**
     * @internal 
     */
    _getheight(): number {
        throw new Error("Method not implemented.");
    }

    /**
     * @internal 
     */
    _getradius(): number {
        throw new Error("Method not implemented.");
    }

    /**
    * @protected
    */
    _getUpdateFlags(): number {
        let updateFlags = UpdateFlags.DT_CROWD_ANTICIPATE_TURNS | UpdateFlags.DT_CROWD_OPTIMIZE_VIS | UpdateFlags.DT_CROWD_OPTIMIZE_TOPO;
        if (this._quality > 0) {
            updateFlags |= UpdateFlags.DT_CROWD_OBSTACLE_AVOIDANCE;
        }
        if (this._priority > 0) {
            updateFlags |= UpdateFlags.DT_CROWD_SEPARATION;
        }
        return updateFlags;
    }

    /**
     * @protected
     */
    _onDestroy(): void {
        super._onDestroy();
        this._removeAgent();
    }

    /**
     * 由系统调用
     * @internal 
     */
    _updateNavMesh(pos: number[], dir: number[]) {
        if (this._crowAgent == null) return;
        let position = tempVector3;
        let direction = tempVector31;
        position.fromArray(pos);
        direction.fromArray(dir);
        let isNearerStart: boolean = false;
        if (this._navAgentLinkAnim._active) {
            isNearerStart = this._navAgentLinkAnim._nearerStartPos(position);
        }
        if (isNearerStart) {
            this._removeAgent();
            this._navAgentLinkAnim._start(this._speed, position);
        }
        direction.cloneTo(this._curentSpeed);
        this._updatePosition(position, direction);
    }


    /**
     * @internal 
     */
    protected _updatePosition(pos: Vector3, dir: Vector3) {
        throw new Error("Method not implemented.");
    }

    /**@internal */
    _cloneTo(dest: Component): void {
        let agent = dest as BaseNavAgent;
        agent.agentType = this.agentType;
        agent.speed = this._speed;
        agent.angularSpeed = this.angularSpeed;
        agent.radius = this.radius;
        agent.height = this.height;
        agent.areaMask = this.areaMask;
        agent.quality = this.quality;
        agent.priority = this.priority;
        agent.maxAcceleration = this.maxAcceleration;
        super._cloneTo(dest);
    }
}