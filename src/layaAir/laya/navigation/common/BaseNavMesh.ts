import { Ray } from "../../d3/math/Ray";
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
    protected _allAgents: BaseNavAgent[];

    /**@internal */
    protected _fiterMap: Map<number, any>;

    /** @internal */
    protected _grid: NavMeshGrid;

    /**@internal */
    protected _is3D: boolean = true;

    /**
     * @internal
     * get  bounds of mesh
     */
    get extents(): number[] {
        return this._extents;
    }

    /**
     * @internal
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
        this._allAgents = [];
        this._fiterMap = new Map<number, any>();

        this._creatNavMesh();
    }


    /**
     * add Agent
     * @param agent 
     */
    addAgent(agent: BaseNavAgent) {
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
     * @param agent 
     */
    removeAgent(agent: BaseNavAgent) {
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
            let index = this._allAgents.indexOf(agent);
            if (index >= 0) {
                this._allAgents.splice(index, 1);
            }
            agent._agentId = null;
            agent._crowAgent = null;
        }

    }

    /**
     * rayCast navMesh
     * @param ray 
     * @param outPos 
     * @returns 
     */
    raycastNavMesh(ray: Ray, outPos: Vector3): boolean {
        return false;
    }


    /**
     * 获得当前点的Flag
     * @param pos 世界坐标
     * @param fiter 
     * @return area
     */
    getPolyFlags(pos: Vector3, fiter: any = null): number {
        const posRef = this.findNearestPoly(pos, fiter);
        return this._navMesh.getPolyFlags(posRef.polyRef);
    }

    /**
     * 获得当前点的AreaFlag
     * @param pos 世界坐标
     * @param fiter 
     * @return area
     */
    getPolyArea(pos: Vector3, fiter: any = null): number {
        const posRef = this.findNearestPoly(pos, fiter);
        return this._navMesh.getPolyArea(posRef.polyRef);
    }

    /**
     * 查找最近点
     * @param pos 世界坐标
     * @param fiter 
     */
    findNearestPoly(pos: Vector3, fiter: any = null): any {
        if (!fiter) fiter = this._defatfilter;
        return this._navQuery.findNearestPoly(pos.toArray(), this.extents, fiter);
    }

    /**
     * @param agent 
     * @param fllowPaths 
     * @returns 
     */
    findFllowPath(agent: BaseNavAgent, fllowPaths: NavigationPathData[]): boolean {
        agent._getpos(tempVec3);
        let tileIndex = this._grid.getTileIndexByPos(tempVec3.x, tempVec3.z);
        if (this._navcreateedTileMaps.has(tileIndex)) {
            agent._getpos(tempVec3);
            NavigationUtils.findFllowPath(this, agent._filter, tempVec3, agent._targetPos, agent.speed * 0.1, 0.01, fllowPaths);
            return true;
        } else {
            return false;
        }
    }
    /**
     * @param agent 
     * @param fllowPaths 
     * @returns {dist:number,pos:Array<number>(3),normal:Array<number>(3)}
     */
    findDistanceToWall(agent: BaseNavAgent): { dist: number, pos: Array<number>, normal: Array<number> } {
        let filter = agent._filter;
        agent._getpos(tempVec3);
        let posref = this._navQuery.findNearestPoly(tempVec3.toArray(), this.extents, filter);
        let data = this._navQuery.findDistanceToWall(posref, filter, 100);
        if (NavigationUtils.statusSucceed(data.Status))
            return data;
        else
            return null;
    }

    /**
     * @param agent 
     * @returns 
     */
    requestMoveTarget(agent: BaseNavAgent, destination: Vector3): boolean {
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
     * create a navMesh and navQuery
     * @internal
     */
    _creatNavMesh() {
        this._navMesh = NavigationUtils.createNavMesh();
        this._navQuery = NavigationUtils.createNavMeshQuery();
        this._crowd = NavigationUtils.createCrowd();
        this._navMeshLink = NavigationUtils.createMeshOffLink();
        this._navConvexVolume = NavigationUtils.createConvexVolume();
        let surface = this._surface;
        let manager = surface._manager;
        for (var i = 0; i < CROW_MAX_FILTER; i++) {
            manager.setFilterCost(this._crowd.getFilter(i));
        }
        this._getFilter(manager._deflatAllMask);
        this._navConvexVolume.setIs3D(this._is3D);
    }

    /**
     * init navMesh
     *  @internal
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
     * @internal
     * @param dt 
     */
    _updateNavMesh(dt: number) {
        let datas: Float32Array = NavigationUtils.updateCrowd(this._crowd, dt);
        this._allAgents.forEach((agent, index) => {
            let off = agent._agentId * 6;
            let pos = [datas[off], datas[off + 1], datas[off + 2]];
            let vel = [datas[off + 3], datas[off + 4], datas[off + 5]];
            agent._updateNavMesh(pos, vel);
        });
    }

    /**
     * create agent
     * @param agent 
     */
    protected _createAgents(agent: BaseNavAgent) {
        agent._filter = this._getFilter(agent._areaMask)
        let params = NavigationUtils.getCrowdAgentParams();
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
        this._allAgents.push(agent);
    }

    /**
     * @internal
     * @param index
     * @returns 
     */
    _addNavMeshLink(index: number, start: Vector3, end: Vector3, width: number, bidirectional: boolean, areaType: number): void {
        this._navMeshLink.addOffMeshConnection(index, start.toArray(), end.toArray(), width, bidirectional ? 1 : 0, areaType);
    }

    /**
     * @internal
     * @param linkid 
     */
    _removeNavMeshLink(index: number): void {
        this._navMeshLink.deleteOffMeshConnection(index);
    }

    /**
     * @internal
     */
    _updateCovexVoume(index: number, buffer: Float32Array, miny: number, maxy: number, areaType: number): boolean {
        this._navConvexVolume.addCovexVoume(index, buffer, miny, maxy, areaType);
        return true;
    }

    /**
     * @internal
     */
    _updataCoverVolumeTransform(index: number, transfrom: Float32Array): boolean {
        this._navConvexVolume.addTransform(index, transfrom);
        return true;
    }

    /**
     * @internal
     * @param linkid 
     */
    _deleteCovexVoume(index: number): boolean {
        if (index < 0) return false;
        this._navConvexVolume.deleteCovexVoume(index);
        return true;
    }

    /**
     * add a tile
     * @internal
     * @param cellX 
     * @param cellY 
     * @param binds
     * @param bound 
     */
    _addTile(cache: NavTileCache, binds: any[], partitionType: number, maxSimplificationError: number) {
        if (binds.length <= 0) return;
        const config = this._grid.config;
        this._titileConfig.partitionType = partitionType;
        this._titileConfig.setAgent(config.agentHeight, config.agentRadius, config.agentMaxClimb);
        this._titileConfig.setOff(cache.x, cache.y);
        this._titileConfig.setMin(cache.boundMin);
        this._titileConfig.setMax(cache.boundMax);
        this._titileConfig.maxSimplificationError = maxSimplificationError;
        this.removeTile(cache.x, cache.y);
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
     * remove a tile
     * @internals
     * @param cellX 
     * @param cellY 
     */
    removeTile(tileX: number, tileY: number) {
        this._navMesh.removeTile(tileX, tileY);
        this._navcreateedTileMaps.delete(this._grid.getTileIndex(tileX, tileY));
    }

    clearn() {
        this._allAgents.forEach((agent) => {
            this.removeAgent(agent);
        });
        this._allAgents.length = 0;
    }


    /**
     * @internal
     */
    destroy(): void {

        if (this._navMesh) {
            NavigationUtils.freeNavMesh(this._navMesh);
            this._navMesh = null;
        }

        if (this._navQuery) {
            NavigationUtils.freeNavMeshQuery(this._navQuery);
            this._navQuery = null;
        }

        if (this._navMeshLink) {
            NavigationUtils.free(this._navMeshLink);
            this._navMeshLink = null;
        }

        if (this._navConvexVolume) {
            NavigationUtils.free(this._navConvexVolume);
            this._navConvexVolume = null;
        }

        if (this._crowd) {
            NavigationUtils.freeCrowd(this._crowd);
            this._crowd = null;
        }
    }
}