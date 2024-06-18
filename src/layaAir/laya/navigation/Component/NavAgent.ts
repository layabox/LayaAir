
import { Component } from "../../components/Component";
import { MathUtils3D } from "../../maths/MathUtils3D";
import { Quaternion } from "../../maths/Quaternion";
import { Vector3 } from "../../maths/Vector3";
import { Sprite3D } from "../../d3/core/Sprite3D";
import { Scene3D } from "../../d3/core/scene/Scene3D";
import { NavigationManager } from "../NavigationManager";
import { NavigationPathData } from "../NavigationPathData";
import { AreaMask } from "../AreaMask";
import { NavAgentLinkAnim } from "../NavAgentLinkAnim";
import { NavMeshSurface } from "./NavMeshSurface";
import { NavMeshLink } from "./NavMeshLink";



enum UpdateFlags {
    DT_CROWD_ANTICIPATE_TURNS = 1,
    DT_CROWD_OBSTACLE_AVOIDANCE = 2,
    DT_CROWD_SEPARATION = 4,
    DT_CROWD_OPTIMIZE_VIS = 8,	///< Use #dtPathCorridor::optimizePathVisibility() to optimize the agent path.
    DT_CROWD_OPTIMIZE_TOPO = 16 ///< Use dtPathCorridor::optimizePathTopology() to optimize the agent path.
};

enum CrowdAgentState {
    DT_CROWDAGENT_STATE_INVALID, ///< The agent is not in a valid state.
    DT_CROWDAGENT_STATE_WALKING, ///< The agent is traversing a normal navigation mesh polygon.
    DT_CROWDAGENT_STATE_OFFMESH	 ///< The agent is traversing an off-mesh connection.
};

export enum ObstacleAvoidanceType {
    NoObstacle,
    LowQuality,
    MedQuality,
    GoodQuality,
    HighQuality
}

/**
 * 类用来实例化一个寻路代理
 */
export class NavAgent extends Component {
    /**@internal */
    private static HelpTemp: Vector3 = new Vector3();
    /**@internal */
    private static HelpTemp1: Vector3 = new Vector3();
    /**@internal */
    private static HelpTemp2: Vector3 = new Vector3();
    /**@internal */
    private static TempQuaternion: Quaternion = new Quaternion();

    /**@internal */
    private _agentType: string = NavigationManager.defaltAgentName;
    /**@internal */
    _navManager: NavigationManager;

    _navAgentLinkAnim: NavAgentLinkAnim;
    /**@internal */
    private _currentNaveSurface: NavMeshSurface;
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
    //move
    /**@internal 速度*/
    private _speed: number = 3.5;
    /**@internal 加速度*/
    private _maxAcceleration: number = 10;
    /**@internal */
    private _angularSpeed: number = 120;
    /**@internal TODO*/
    private _stopDistance: number;
    /**@internal TODO*/
    private _Acceleration: number;
    /**@internal TODO*/
    private _autoBraking: boolean;
    //obstacles TODO
    /**@internal */
    private _radius: number = 0.5;
    /**@internal */
    private _height: number = 2;
    /**@internal */
    private _quality: ObstacleAvoidanceType = ObstacleAvoidanceType.MedQuality;
    /**@internal */
    private _priority: number = 0;
    /**@internal */
    private _destination: Vector3 = new Vector3();
    /**@internal */
    private _fllowPath: NavigationPathData[];
    /**@internal */
    private _baseOffset: number = 1;

    /**
     * 半径
     */
    set radius(value: number) {
        this._radius = value;
        if (this._crowAgent) {
            let params = this._crowAgent.getparams();
            const radius = this._getradius()
            params.radius = radius;
            params.collisionQueryRange = radius * 12;
            params.pathOptimizationRange = radius * 30;
        }
    }

    get radius() {
        return this._radius;
    }

    /**
     * 高度
     */
    set height(value: number) {
        this._height = value;
        if (this._crowAgent) {
            this._crowAgent.getparams().height = this._getheight();
        }
    }

    get height() {
        return this._height;
    }

    /**
     * 移动速度
     */
    set speed(value: number) {
        this._speed = value;
        if (this._crowAgent) {
            this._crowAgent.getparams().maxSpeed = this._speed;
        }
    }

    get speed() {
        return this._speed;
    }

    /**
    * 加速度
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
     * 转身速度
     */
    set angularSpeed(value: number) {
        this._angularSpeed = value;
    }

    get angularSpeed() {
        return this._angularSpeed;
    }

    /**
    * 轴心点的偏移
    */
    set baseOffset(value: number) {
        this._baseOffset = value;
    }

    get baseOffset(): number {
        return this._baseOffset;
    }

    /**
     * 	规避品质级别
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
     * 规避优先级别
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
     * 否绑定到导航网格
     */
    get isOnNavMesh(): boolean {
        return this._crowAgent != null;
    }

    /**
     * 当前是否位于 OffMeshLink 上
     */
    get isOnOffMeshLink(): boolean {
        if (!this.isOnNavMesh) return false;
        return this._crowAgent.state == CrowdAgentState.DT_CROWDAGENT_STATE_OFFMESH;
    }


    /**
     * 目的地
     */
    set destination(value: Vector3) {
        value.cloneTo(this._destination);
        if (!this._navManager) return;
        let targetSurface: NavMeshSurface = this._navManager.getNavMeshSurface(value, this._agentType);
        if (targetSurface == this._currentNaveSurface) {
            this._currentNaveSurface.navMesh.requestMoveTarget(this, this._destination);
            return;
        }
        let linkes = this._navManager.getNavMeshLink(this._currentNaveSurface, targetSurface);
        //没有找到链接
        if (linkes == null) return;
        let link: NavMeshLink = null;
        let distance: number = Number.MAX_VALUE;
        let isstart: boolean;
        linkes.forEach((value) => {
            if (value._startNavSurfaces.indexOf(this._currentNaveSurface) >= 0) {
                let dis = value._getdistance();
                if (dis < distance) {
                    dis = distance;
                    link = value;
                    isstart = true;
                }
            } else if (value._endNavSurfaces.indexOf(this._currentNaveSurface) >= 0 && value.bidirectional) {
                let dis = value._getdistance();
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
            this._navAgentLinkAnim._setStartPos(link._start);
            this._navAgentLinkAnim._setEndPos(link._end);
        } else {
            this._navAgentLinkAnim._setStartPos(link._end);
            this._navAgentLinkAnim._setEndPos(link._start);
        }
        let refPoint = this._currentNaveSurface.navMesh.findNearestPoly(this._navAgentLinkAnim._getSartPos());
        this._navAgentLinkAnim._getSartPos().fromArray(refPoint.data);
        this._currentNaveSurface.navMesh.requestMoveTarget(this, this._navAgentLinkAnim._getSartPos());
    }

    get destination(): Vector3 {
        return this._destination;
    }

    /**
     * 设置网格类型
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
     * @description: 
     * @param {*}
     * @return {*}
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
     * @internal 
     */
    protected _onEnable(): void {
        super._onEnable();
        this._fllowPath = [];
        let manager: NavigationManager = this._navManager = (this.owner.scene as Scene3D).getComponentElementManager(NavigationManager.managerName) as NavigationManager;
        this._areaMask._setAreaMap(manager.getAreaFlagMap())
        this._addAgent();
    }

    /**
     * @internal 
     */
    protected _addAgent() {
        let manager: NavigationManager = this._navManager = (this.owner.scene as Scene3D).getComponentElementManager(NavigationManager.managerName) as NavigationManager;
        let pos = (<Sprite3D>this.owner).transform.position;
        let surface = manager.getNavMeshSurface(pos, this._agentType);
        if (surface == null) {
            console.error("not get the NavMeshSurface in this position.");
            return;
        }
        this._currentNaveSurface = surface;
        this._currentNaveSurface.navMesh.addAgent(this);
    }

    /**
     * @internal 
     */
    protected _removeAgent() {
        if (this._currentNaveSurface == null || this._agentId == null || this._crowAgent == null)
            return;
        this._currentNaveSurface.navMesh.removeAgent(this);
        this._currentNaveSurface = null;
    }

    /**
     * @internal 
     */
    _getheight(): number {
        let scale = (<Sprite3D>this.owner).transform.getWorldLossyScale();
        return this._height * scale.y;
    }

    /**
     * @internal 
     */
    _getradius(): number {
        let scale = (<Sprite3D>this.owner).transform.getWorldLossyScale();
        return this._radius * Math.max(scale.x, scale.y);
    }

    /**
    * @private
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
     * @private
     */
    _onDestroy(): void {
        super._onDestroy();
        this._removeAgent();
    }

    onUpdate(): void {
        if (this._crowAgent == null && !this._navAgentLinkAnim._active) return;
        let transform = (<Sprite3D>this.owner).transform;
        const position = NavAgent.HelpTemp;
        const dir = NavAgent.HelpTemp1;
        if (this._crowAgent) {
            this._crowAgent.getCurPos(position);
            let isNearerStart: boolean = false;
            if (this._navAgentLinkAnim._active) {
                isNearerStart = this._navAgentLinkAnim._nearerStartPos(position);
            }
            this._crowAgent.getCurDir(dir);
            if (isNearerStart) {
                this._removeAgent();
                this._navAgentLinkAnim._start(this._speed, position);
            }
            dir.cloneTo(this._curentSpeed);
        } else {
            this._navAgentLinkAnim._update(position, dir);
            if (this._navAgentLinkAnim._nearerEndPos(position)) {
                this._addAgent();
                this._navAgentLinkAnim._clearn();
                this.destination = this._destination;
            }
        }
        position.y += this._baseOffset;
        transform.position = position;

        if (MathUtils3D.isZero(dir.length())) {
            return;
        }
        let up = NavAgent.HelpTemp2;
        transform.getUp(up);
        Vector3.normalize(dir, dir);
        let roate = NavAgent.TempQuaternion;
        Quaternion.rotationLookAt(dir, up, roate);
        transform.rotation = roate;
    }

    /**
     * 是否停止
     */
    isStop(): boolean {
        return MathUtils3D.isZero(this._curentSpeed.length())
    }

    /**
     * 当前路径
     */
    getCurrentPath(): Array<NavigationPathData> {
        if (!this._currentNaveSurface) {
            this._fllowPath.length = 0;
        } else {
            this._currentNaveSurface.navMesh.findFllowPath(this, this._fllowPath);
        }
        return this._fllowPath;
    }


    /**
     * 设置位置
     * @param pos 世界坐标
     */
    setPosition(pos: Vector3) {
        (<Sprite3D>this.owner).transform.position = pos;
        if (this.enabled) {
            this._removeAgent();
            this._addAgent();
        }
    }

    /**
     * 到墙面的距离
     * @returns {dist:距离，pos:碰撞点， normal:法向量}
     */
    findDistanceToWall(): { dist: number, pos: Array<number>, normal: Array<number> } {
        if (this._crowAgent) {
            return this._currentNaveSurface.navMesh.findDistanceToWall(this);
        } else {
            return null;
        }
    }

    /**@internal */
    _cloneTo(dest: Component): void {
        let agent = dest as NavAgent;
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