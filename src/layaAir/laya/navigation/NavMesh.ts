import { Sprite3D } from "../d3/core/Sprite3D";
import { Bounds } from "../d3/math/Bounds";
import { Ray } from "../d3/math/Ray";
import { Mesh } from "../d3/resource/models/Mesh";
import { Vector3 } from "../maths/Vector3";
import { SingletonList } from "../utils/SingletonList";
import { AreaMask } from "./AreaMask";
import { NavAgent } from "./Component/NavAgent";
import { NavMeshModifierVolume } from "./Component/NavMeshModifierVolume";
import { NavNavMeshLink } from "./Component/NavNavMeshLink";
import { NavMeshGrid } from "./NavMeshGrid";
import { NavigationManager } from "./NavigationManager";
import { NavigationPathData } from "./NavigationPathData";
import { NavigationUtils } from "./NavigationUtils";
import { RecastConfig } from "./RecastConfig";
import { TitleConfig } from "./TitleConfig";

const CROW_MAX_FILTER: number = 16;

export class NavMesh {
    /**@internal ori navMesh*/
    private _navMesh: any;

    /**@internal ori navQuery*/
    private _navQuery: any;

    /**@internal ori meshLink*/
    private _navMeshLink: any;

    /**@internal ori convexVolume*/
    private _navConvexVolume: any;

    /**寻路代理 */
    private _crowd: any;


    /**过滤信息 */
    private _defatfilter: any;

    /**TODO */
    private _extents: number[] = [2, 4, 2];

    /**navigation manager */
    private _manager: NavigationManager;
    /**@internal */
    private _titileConfig: TitleConfig;
    /**@internal */
    private _maxAgents: number = 128;

    /**@internal */
    private _navcreateedTileMaps: Set<number>;
    /**@internal */
    private _delayCreates: Map<number, NavAgent[]>;
    private _fiterMap: Map<number, any>;
    /**@internal */
    private _debugMesh: Mesh;
    /** @internal */
    private _grid: NavMeshGrid;

    /** @internal */
    private _meshlinkOffList: SingletonList<NavNavMeshLink>;
    /** @internal */
    private _meshlinkoffIdLists: number[];

    /** @internal */
    private _meshVolumeList: SingletonList<NavMeshModifierVolume>;
    /** @internal */
    private _meshVolumeIdLists: number[];


    /**
    * @internal
    * get  bounds of mesh
    */
    get bounds(): Bounds {
        return this._grid.bounds;
    }

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
     * <code>实例化一个NavMesh组件<code>
     */
    constructor(config: RecastConfig, bound: Bounds, manager: NavigationManager) {
        this._manager = manager;
        this._grid = new NavMeshGrid(config, bound);
        this._titileConfig = new TitleConfig();
        this._navcreateedTileMaps = new Set<number>();
        this._delayCreates = new Map<number, NavAgent[]>();
        this._fiterMap = new Map<number, any>();

        this._meshlinkOffList = new SingletonList<NavNavMeshLink>();
        this._meshlinkoffIdLists = [];

        this._meshVolumeList = new SingletonList<NavMeshModifierVolume>();
        this._meshVolumeIdLists = [];
        this._creatNavMesh();
        this._navMeshInit();
    }

    /**
     * create a navMesh and navQuery
     * @internal
     */
    private _creatNavMesh() {
        this._navMesh = NavigationUtils.createNavMesh();
        this._navQuery = NavigationUtils.createNavMeshQuery();
        this._crowd = NavigationUtils.createCrowd();
        this._navMeshLink = NavigationUtils.createMeshOffLink();
        this._navConvexVolume = NavigationUtils.createConvexVolume();
    }

    /**
     * init navMesh
     *  @internal
     */
    _navMeshInit() {
        let config = this._grid.config;
        let min = this._grid.bounds.min;
        let max = this._grid.bounds.max;
        this._navMesh.init(min.toArray(), max.toArray(), config.cellSize, config.tileSize);
        this._navQuery.init(this._navMesh, 2048);
        this._crowd.init(this._maxAgents, config.agentRadius, this.navMesh);
        let areaFlagMap = this._manager._areaFlagMap;
        for (var i = 0; i < CROW_MAX_FILTER; i++) {
            let filer = this._crowd.getFilter(i);
            areaFlagMap.forEach((value) => {
                filer.setAreaCost(value.flag, value.cost);
            });
        }
        let fiter = this._defatfilter = this._crowd.getFilter(0);
        fiter.setIncludeFlags(this._manager._deflatAllMask.flag);
        fiter.queryFilterType = 0;
        this._fiterMap.set(0, fiter);
    }

    /**
     * get filter
     *  @internal
     */
    _getFilter(areaMask: AreaMask) {
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
        fiter.setIncludeFlags(this._manager._deflatAllMask.flag);
        fiter.setExcludeFlags(excludeflag);
        fiter.queryFilterType = size;
        this._fiterMap.set(excludeflag, fiter);
        return fiter;
    }


    /**
     * create agent
     * @param agent 
     */
    private _createAgents(agent: NavAgent) {
        agent._filter = this._getFilter(agent._areaMask)
        const pos = (<Sprite3D>agent.owner).transform.position;
        let params = NavigationUtils.getCrowdAgentParams();
        const radius = agent._getradius()
        params.radius = radius;
        params.collisionQueryRange = radius * 12;
        params.pathOptimizationRange = radius * 30;
        params.height = agent._getheight();
        params.maxAcceleration = agent.maxAcceleration;
        params.maxSpeed = agent.speed;
        params.obstacleAvoidanceType = agent.quality;
        params.separationWeight = agent.priority;
        params.queryFilterType = agent._filter.queryFilterType;
        params.updateFlags = agent._getUpdateFlags();
        agent._agentId = this._crowd.addAgent(pos.toArray(), params);
        agent._crowAgent = this._crowd.getAgent(agent._agentId);
    }


    /**
     * add Agent
     * @param agent 
     */
    addAgent(agent: NavAgent) {
        let pos = (<Sprite3D>agent.owner).transform.position;
        let tileIndex = this._grid.getTileIndexByPos(pos.x, pos.z);
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
    removeAgent(agent: NavAgent) {
        this._crowd.removeAgent(agent._agentId);
        agent._agentId = null;
        agent._crowAgent = null;
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
     * @internal
     * @param link 
     * @returns 
     */
    addNavMeshLink(link: NavNavMeshLink): void {
        if (this._meshlinkOffList.indexof(link) >= 0) return;
        this._meshlinkOffList.add(link);
        let index = this._meshlinkOffList.length - 1;
        let area = this._manager.getArea(link.areaFlag);
        let pos = link._start.toArray();
        pos[1] += this._grid.config.cellHeight;
        this._meshlinkoffIdLists[index] = this._navMeshLink.addOffMeshConnection(pos, link._end.toArray(), link.width, link.bidirectional ? 1 : 0, area.index, area.flag, link.id);
    }

    /**
     * @internal
     * @param linkid 
     */
    removeNavMeshLink(link: NavNavMeshLink): void {
        let index = this._meshlinkOffList.indexof(link);
        if (index < 0) return;
        this._navMeshLink.deleteOffMeshConnection(index);
        this._meshlinkOffList.remove(link);
        this._meshlinkoffIdLists[index] = this._meshlinkoffIdLists[this._meshlinkOffList.length];
    }

    /**
    * @internal
    * @param volume 
    * @returns 
    */
    addCovexVoume(volume: NavMeshModifierVolume): void {
        if (this._meshVolumeList.indexof(volume) >= 0) return;
        this._meshVolumeList.add(volume);
        let type = this._manager.getArea(volume.areaFlag).index;
        this._meshVolumeIdLists[this._meshVolumeList.length - 1] = this._navConvexVolume.addCovexVoume(volume._datas, volume._transfrom.elements, type);
    }


    /**
   * @internal
   * @param volume 
   * @returns 
   */
    updateCovexVoume(volume: NavMeshModifierVolume) {
        let index = this._meshVolumeList.indexof(volume);
        if (index < 0) return;
        let type = this._manager.getArea(volume.areaFlag).index;
        return this._navConvexVolume.updateCovexVoume(this._meshVolumeIdLists[index], volume._datas, volume._transfrom.elements, type);
    }

    /**
     * @internal
     * @param linkid 
     */
    deleteCovexVoume(volume: NavMeshModifierVolume): void {
        let index = this._meshVolumeList.indexof(volume);
        if (index < 0) return;
        this._navConvexVolume.deleteCovexVoume(index);
        this._meshVolumeList.remove(volume);
        this._meshVolumeIdLists[index] = this._meshVolumeIdLists[this._meshVolumeList.length];
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
    findFllowPath(agent: NavAgent, fllowPaths: NavigationPathData[]): boolean {
        let pos = (<Sprite3D>agent.owner).transform.position;
        let tileIndex = this._grid.getTileIndexByPos(pos.x, pos.z);
        if (this._navcreateedTileMaps.has(tileIndex)) {
            NavigationUtils.findFllowPath(this, agent._filter, (<Sprite3D>agent.owner).transform.position, agent.destination, 0.1, 0.01, fllowPaths);
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
    findDistanceToWall(agent: NavAgent): { dist: number, pos: Array<number>, normal: Array<number> } {
        let filter = agent._filter;
        let pos = (<Sprite3D>agent.owner).transform.position;
        let posref = this._navQuery.findNearestPoly(pos.toArray(), this.extents, filter);
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
    requestMoveTarget(agent: NavAgent, destination: Vector3): boolean {
        let pos = (<Sprite3D>agent.owner).transform.position;
        let tileIndex = this._grid.getTileIndexByPos(pos.x, pos.z);
        if (this._navcreateedTileMaps.has(tileIndex)) {
            let refPoint = this._navQuery.findNearestPoly(destination.toArray(), this._extents, agent._filter);
            this.crowd.requestMoveTarget(agent._agentId, refPoint);
            return true;
        } else {
            return false;
        }
    }

    /**
     * add a tile
     * @internal
     * @param cellX 
     * @param cellY 
     * @param binds
     * @param bound 
     */
    _addTile(tileX: number, tileY: number, binds: any[], bound: Bounds, partitionType: number) {
        if (binds.length <= 0) return;
        const config = this._grid.config;
        this._titileConfig.partitionType = partitionType;
        this._titileConfig.setAgent(config.agentHeight, config.agentRadius, config.agentMaxClimb);
        this._titileConfig.setOff(tileX, tileY);
        this._titileConfig.setMin(bound.min);
        this._titileConfig.setMax(bound.max);
        this.removeTile(tileX, tileY);
        this._navMesh.addTile(config, this._titileConfig, binds, this._navMeshLink, this._navConvexVolume);
        this._navcreateedTileMaps.add(this._grid.getTileIndex(tileX, tileY));
        let tileIndex = this._grid.getTileIndex(tileX, tileY);
        if (this._delayCreates.has(tileIndex)) {
            const delaylists = this._delayCreates.get(tileIndex);
            delaylists.forEach((nav) => {
                this._createAgents(nav);
            })
            this._delayCreates.delete(tileIndex);
        }
        if (this._debugMesh) {
            NavigationUtils.creageDebugMesh(this, this._debugMesh);
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

    /**
    * get Mesh
    * 
    */
    buildDebugMesh() {
        this._debugMesh = NavigationUtils.creageDebugMesh(this, null);
        return this._debugMesh;
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