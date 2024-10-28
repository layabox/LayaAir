
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
 * @en Class used to instantiate a navigation agent
 * @zh 类用来实例化一个寻路代理
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
     * @en Radius of the agent.
     * @zh 代理的半径。
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
     * @en Height of the agent.
     * @zh 代理的高度。
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
     * @en Movement speed of the agent.
     * @zh 代理的移动速度。
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
     * @en Offset of the pivot point.
     * @zh 轴心点的偏移。
     */
    set baseOffset(value: number) {
        this._baseOffset = value;
    }

    get baseOffset(): number {
        return this._baseOffset;
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
        if (!this.isOnNavMesh) return false;
        return this._crowAgent.state == CrowdAgentState.DT_CROWDAGENT_STATE_OFFMESH;
    }


    /**
     * @en Set the destination for the agent.
     * @param value The destination vector.
     * @zh 设置代理的目的地。
     * @param value 目的地位置向量。
     */
    set destination(value: Vector3) {
        value.cloneTo(this._destination);
        if (!this._navManager) return;
        if (this._currentNaveSurface == null|| !this._currentNaveSurface.enabled) return;
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
     * @en Create a new NavAgent instance.
     * @zh 创建一个新的 NavAgent 实例。
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

    /**
     * @en Update method called every frame.
     * @zh 每帧调用的更新方法。
     */
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
            this._currentNaveSurface.navMesh.findFllowPath(this, this._fllowPath);
        }
        return this._fllowPath;
    }


    /**
     * @en Set the position of the agent in world coordinates.
     * @param pos The new position in world coordinates.
     * @zh 在世界坐标中设置代理的位置。
     * @param pos 世界坐标系下的新位置。
     */
    setPosition(pos: Vector3) {
        (<Sprite3D>this.owner).transform.position = pos;
        if (this.enabled) {
            this._removeAgent();
            this._addAgent();
        }
    }

    /**
     * @en Find the distance to the nearest wall.
     * @returns {dist:distance， pos:collision point， normal:Normal vector}
     * @zh 查找到最近墙面的距离。
     * @returns {dist:距离， pos:碰撞点， normal:法向量}
     */
    findDistanceToWall(): { dist: number, pos: Array<number>, normal: Array<number> } {
        if (this._crowAgent) {
            return this._currentNaveSurface.navMesh.findDistanceToWall(this);
        } else {
            return null;
        }
    }

    /**@internal */
    _cloneTo(dest: NavAgent): void {
        dest.agentType = this.agentType;
        dest.speed = this._speed;
        dest.angularSpeed = this.angularSpeed;
        dest.radius = this.radius;
        dest.height = this.height;
        dest.areaMask = this.areaMask;
        dest.quality = this.quality;
        dest.priority = this.priority;
        dest.maxAcceleration = this.maxAcceleration;
        super._cloneTo(dest);
    }
}