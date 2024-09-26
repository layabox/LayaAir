import { Vector3 } from "../../maths/Vector3";
import { AreaMask } from "./AreaMask";
import { NavMeshGrid } from "./NavMeshGrid";
import { NavigationPathData } from "./NavigationPathData";
import { NavigationUtils } from "./NavigationUtils";
import { RecastConfig } from "./RecastConfig";
import { TitleConfig } from "./TitleConfig";
import { BaseNavMeshSurface } from "./component/BaseNavMeshSurface";
import { NavTileCache } from "./NavTileData";
import { BaseNavAgent } from "./component/BaseNavAgent";

const CROW_MAX_FILTER: number = 16;
const tempVec3 = new Vector3();

/** 
 * @internal
 * <code>BaseNavMesh</code> 类用于创建导航网格。
*/
export class BaseNavMesh {
    /**@internal ori navMesh*/
    protected _navMesh: any;

    /**@internal ori navQuery*/
    protected _navQuery: any;

    /**@internal ori meshLink*/
    protected _navMeshLink: any;

    /**@internal ori convexVolume*/
    protected _navConvexVolume: any;

    /**@internal 寻路代理 */
    protected _crowd: any;

    /**@internal 过滤信息 */
    protected _defatfilter: any;

    /**@internal TODO */
    protected _extents: number[] = [2, 4, 2];

    /**@internal */
    _surface: BaseNavMeshSurface;

    /**@internal */
    protected _titileConfig: TitleConfig;

    /**@internal */
    protected _maxAgents: number = 128;

    /**@internal */
    protected _navcreateedTileMaps: Set<number>;

    /**@internal */
    protected _delayCreates: Map<number, BaseNavAgent[]>;

    /**@internal */
    protected _allAgents: Map<number, BaseNavAgent>;

    /**@internal */
    protected _fiterMap: Map<number, any>;

    /** @internal */
    protected _grid: NavMeshGrid;

    /**@internal */
    protected _is3D: boolean = true;

    /**
     * @internal
     * @en Find the nearest point's range
     * @zh 寻找最近点的范围
     */
    get extents(): number[] {
        return this._extents;
    }

    /**
     * @internal
     * @en Get the navigation mesh
     */
    get navMesh() {
        return this._navMesh;
    }

    /**
    * @internal
    */
    get navQuery() {
        return this._navQuery;
    }

    /**
    * @internal
    */
    get crowd(): any {
        return this._crowd;
    }

    /**
     * @internal
     */
    get navTileGrid(): NavMeshGrid {
        return this._grid;
    }

    /**
     * @internal
     */
    get is3D(): boolean {
        return this._is3D;
    }

    /**
     * <code>实例化一个NavMesh<code>
     */
    constructor(config: RecastConfig, min: Vector3, max: Vector3, surface: BaseNavMeshSurface, is3D: boolean = true) {
        this._grid = new NavMeshGrid(config, min, max);
        this._surface = surface;
        this._is3D = is3D;
        this._titileConfig = new TitleConfig();
        this._navcreateedTileMaps = new Set<number>();
        this._delayCreates = new Map<number, BaseNavAgent[]>();
        this._allAgents = new Map<number, BaseNavAgent>();
        this._fiterMap = new Map<number, any>();
        this._creatNavMesh();
    }

    /**
     * get filter
     *  @internal
     */
    private _getFilter(areaMask: AreaMask) {
        let excludeflag = areaMask.excludeflag;
        if (this._fiterMap.has(excludeflag)) {
            return this._fiterMap.get(excludeflag);
        }
        let size = this._fiterMap.size;
        if (size >= CROW_MAX_FILTER) {
            console.error("Not max " + CROW_MAX_FILTER + ".");
            return null;
        }
        let fiter = this._crowd.getFilter(size);
        fiter.setIncludeFlags(areaMask.flag);
        fiter.setExcludeFlags(excludeflag);
        fiter.queryFilterType = size;
        this._fiterMap.set(excludeflag, fiter);
        return fiter;
    }

    /**
     * create agent
     * @param agent 
     */
    protected _createAgents(agent: BaseNavAgent) {
        agent._filter = this._getFilter(agent._areaMask)
        let params = NavigationUtils._getCrowdAgentParams();
        params.radius = agent._getradius();
        params.collisionQueryRange = agent._getcollisionQueryRange();
        params.pathOptimizationRange = agent._getpathOptimizationRange();
        params.height = agent._getheight();
        params.maxAcceleration = agent.maxAcceleration;
        params.maxSpeed = agent.speed;
        params.obstacleAvoidanceType = agent.quality;
        params.separationWeight = agent.priority;
        params.queryFilterType = agent._filter.queryFilterType;
        params.updateFlags = agent._getUpdateFlags();
        agent._getpos(tempVec3);
        let refPoint = this._navQuery.findNearestPoly(tempVec3.toArray(), this._extents, agent._filter);
        agent._agentId = this._crowd.addAgent(refPoint.data, params);
        agent._crowAgent = this._crowd.getAgent(agent._agentId);
        this._allAgents.set(agent._agentId, agent);
    }

    /**
     * add Agent
     * @internal
     * @param agent 
     */
    _addAgent(agent: BaseNavAgent) {
        agent._getpos(tempVec3);
        let tileIndex = this._grid.getTileIndexByPos(tempVec3.x, tempVec3.z);
        if (this._navcreateedTileMaps.has(tileIndex)) {
            this._createAgents(agent);
        } else {
            if (!this._delayCreates.has(tileIndex)) {
                this._delayCreates.set(tileIndex, []);
            }
            this._delayCreates.get(tileIndex).push(agent);
        }
    }

    /**
     * remove agent
     * @internal
     * @param agent 
     */
    _removeAgent(agent: BaseNavAgent) {
        if (agent._agentId == null) {
            agent._getpos(tempVec3);
            let tileIndex = this._grid.getTileIndexByPos(tempVec3.x, tempVec3.z);
            if (this._delayCreates.has(tileIndex)) {
                let lists = this._delayCreates.get(tileIndex);
                let index = lists.indexOf(agent);
                if (index >= 0) {
                    lists.splice(index, 1);
                }
            }
        } else {
            this._crowd.removeAgent(agent._agentId);
            this._allAgents.delete(agent._agentId);
            agent._agentId = null;
            agent._crowAgent = null;
        }

    }

    /**
     * @internal
     * @en Get the current point's Flag
     * @zh 获得当前点的Flag
     * @param pos 世界坐标
     * @param fiter 
     * @return flag
     */
    _getPolyFlags(pos: Vector3, fiter: any = null): number {
        const polyRef = this._findNearestPoly(pos, fiter, tempVec3);
        return this._navMesh.getPolyFlags(polyRef);
    }

    /**
     * @internal
     * @en Get the current point's Area
     * @zh 获得当前点的Area
     * @param pos 世界坐标
     * @param fiter 
     * @return area
     */
    _getPolyArea(pos: Vector3, fiter: any = null): number {
        const polyRef = this._findNearestPoly(pos, fiter, tempVec3);
        return this._navMesh.getPolyArea(polyRef);
    }

    /**
     * @internal
     * @en Find the nearest point
     * @zh 查找最近点
     * @param pos 世界坐标
     * @param fiter 
     * @param out 返回世界坐标
     * @return polyRef
     */
    _findNearestPoly(pos: Vector3, fiter: any = null, out: Vector3): number {
        if (!fiter) fiter = this._defatfilter;
        let poly = this._navQuery.findNearestPoly(pos.toArray(), this.extents, fiter);
        out.fromArray(poly.data);
        return poly.polyRef;
    }

    /**
     * @internal
     * @en Find the Path from start to end
     * @param agent 
     * @param fllowPaths 
     * @returns 
     */
    _findFllowPath(fllowPaths: NavigationPathData[], startPos: Vector3, endPos: Vector3, speed: number, filter: any = null): boolean {
        if (!filter) filter = this._defatfilter;
        let tileIndex = this._grid.getTileIndexByPos(startPos.x, startPos.z);
        if (this._navcreateedTileMaps.has(tileIndex)) {
            NavigationUtils._findFllowPath(this, filter, startPos, endPos, speed * 0.1, 0.01, fllowPaths);
            return true;
        } else {
            return false;
        }
    }

    /**
     * @internal
     * @en Find the distance to the wall
     * @zh 查找到墙的距离
     * @param pos:Vector3 
     * @param filter
     * @returns {dist:number,pos:Array<number>(3),normal:Array<number>(3)}
     */
    _findDistanceToWall(pos: Vector3, filter: any = null): { dist: number, pos: Array<number>, normal: Array<number> } {
        if (!filter) filter = this._defatfilter;
        let posref = this._navQuery.findNearestPoly(pos.toArray(), this.extents, filter);
        let data = this._navQuery.findDistanceToWall(posref, filter, 100);
        if (NavigationUtils._statusSucceed(data.Status))
            return data;
        else
            return null;
    }

    /**
     * @internal
     * @param agent 
     * @returns 
     */
    _requestMoveTarget(agent: BaseNavAgent, destination: Vector3): boolean {
        agent._getpos(tempVec3);
        let tileIndex = this._grid.getTileIndexByPos(tempVec3.x, tempVec3.z);
        if (this._navcreateedTileMaps.has(tileIndex)) {
            let refPoint = this._navQuery.findNearestPoly(destination.toArray(), this._extents, agent._filter);
            this.crowd.requestMoveTarget(agent._agentId, refPoint);
            return true;
        } else {
            return false;
        }
    }

    /**
     * @internal
     * @en create a navMesh and navQuery
     */
    _creatNavMesh() {
        this._navMesh = NavigationUtils._createNavMesh();
        this._navQuery = NavigationUtils._createNavMeshQuery();
        this._crowd = NavigationUtils._createCrowd();
        this._navMeshLink = NavigationUtils._createMeshOffLink();
        this._navConvexVolume = NavigationUtils._createConvexVolume();
        let surface = this._surface;
        let manager = surface._manager;
        for (var i = 0; i < CROW_MAX_FILTER; i++) {
            manager.setFilterCost(this._crowd.getFilter(i));
        }
        this._defatfilter = this._getFilter(manager._deflatAllMask);
        this._navConvexVolume.setIs3D(this._is3D);
    }

    /**
     * @internal
     * @en init the navMesh
     * @zh 初始化导航网格
     */
    _navMeshInit() {
        let config = this._grid.config;
        let min = this._grid.min;
        let max = this._grid.max;
        this._navMesh.init(min.toArray(), max.toArray(), config.cellSize, config.tileSize);

        this._navQuery.init(this._navMesh, 2048);
        this._crowd.init(this._maxAgents, config.agentRadius, this.navMesh);
    }

    /**
     * @internal
     * @en The heartbeat of pathfinding, updating the navigation mesh, synchronizing the agent's position, orientation
     * @zh 寻路的心跳，更新导航网格,同步agent的位置,朝向
     * @param dt (秒)
     */
    _updateNavMesh(dt: number) {
        let datas: Float32Array = NavigationUtils._updateCrowd(this._crowd, dt);
        this._allAgents.forEach((agent, index) => {
            let off = agent._agentId * 6;
            let pos = [datas[off], datas[off + 1], datas[off + 2]];
            let vel = [datas[off + 3], datas[off + 4], datas[off + 5]];
            agent._updateNavMesh(pos, vel);
        });
    }

    /**
     * @internal
     * @en add a navigation grid link
     * @zh 添加一个导航网格链接
     * @param index
     * @param start
     * @param end
     * @param width
     * @param bidirectional
     * @param areaFlag
     * @returns 
     */
    _addNavMeshLink(index: number, start: Vector3, end: Vector3, width: number, bidirectional: boolean, areaFlag: number): void {
        this._navMeshLink.addOffMeshConnection(index, start.toArray(), end.toArray(), width, bidirectional ? 1 : 0, areaFlag);
    }

    /**
     * @internal
     * @en remove a navigation grid link
     * @zh 删除一个导航网格链接
     * @param linkid 
     */
    _removeNavMeshLink(index: number): void {
        this._navMeshLink.deleteOffMeshConnection(index);
    }

    /**
     * @internal
     * @en add a convexVolume
     * @zh 添加一个凸体
     */
    _updateConvexVolume(index: number, buffer: Float32Array, miny: number, maxy: number, areaType: number): boolean {
        this._navConvexVolume.addCovexVoume(index, buffer, miny, maxy, areaType);
        return true;
    }

    /**
     * @internal
     * @en remove a convexVolume
     * @zh 删除一个凸体
     * @param index 
     */
    _deleteConvexVoume(index: number): boolean {
        if (index < 0) return false;
        this._navConvexVolume.deleteCovexVoume(index);
        return true;
    }

    /**
     * @internal
     * @en add a tile
     * @zh 添加一个tile
     * @param cellX 
     * @param cellY 
     * @param binds
     * @param bound 
     */
    _addTile(cache: NavTileCache, binds: any[], partitionType: number, maxSimplificationError: number) {
        if (binds.length <= 0) return;
        const config = this._grid.config;
        this._titileConfig.partitionType = partitionType;
        this._titileConfig._setAgent(config.agentHeight, config.agentRadius, config.agentMaxClimb);
        this._titileConfig._setOff(cache.x, cache.y);
        this._titileConfig._setMin(cache.boundMin);
        this._titileConfig._setMax(cache.boundMax);
        this._titileConfig.maxSimplificationError = maxSimplificationError;
        this._removeTile(cache.x, cache.y);
        let ptrs: number[] = [];
        binds.forEach((value) => {
            ptrs.push(value.$$.ptr);
        });
        this._navMesh.addTile(config, this._titileConfig, ptrs, this._navMeshLink, this._navConvexVolume);
        const tileIndex = this._grid.getTileIndex(cache.x, cache.y);
        this._navcreateedTileMaps.add(tileIndex);
        if (this._delayCreates.has(tileIndex)) {
            const delaylists = this._delayCreates.get(tileIndex);
            delaylists.forEach((nav) => {
                this._createAgents(nav);
            })
            this._delayCreates.delete(tileIndex);
        }
    }

    /**
     * @internals
     * @en remove a tile
     * @zh 删除一个tile
     * @param cellX 
     * @param cellY 
     */
    _removeTile(tileX: number, tileY: number) {
        this._navMesh.removeTile(tileX, tileY);
        this._navcreateedTileMaps.delete(this._grid.getTileIndex(tileX, tileY));
    }

    /**@internal */
    _clearn() {
        this._allAgents.forEach((agent) => {
            this._removeAgent(agent);
        });
        this._allAgents.clear();
    }


    /**
     * @internal
     */
    _destroy(): void {

        if (this._navMesh) {
            NavigationUtils._freeNavMesh(this._navMesh);
            this._navMesh = null;
        }

        if (this._navQuery) {
            NavigationUtils._freeNavMeshQuery(this._navQuery);
            this._navQuery = null;
        }

        if (this._navMeshLink) {
            NavigationUtils._free(this._navMeshLink);
            this._navMeshLink = null;
        }

        if (this._navConvexVolume) {
            NavigationUtils._free(this._navConvexVolume);
            this._navConvexVolume = null;
        }

        if (this._crowd) {
            NavigationUtils._freeCrowd(this._crowd);
            this._crowd = null;
        }
    }
}