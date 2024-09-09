import { Sprite3D } from "../d3/core/Sprite3D";
import { Bounds } from "../d3/math/Bounds";
import { Ray } from "../d3/math/Ray";
import { Mesh } from "../d3/resource/models/Mesh";
import { Vector3 } from "../maths/Vector3";
import { SingletonList } from "../utils/SingletonList";
import { AreaMask } from "./AreaMask";
import { NavAgent } from "./Component/NavAgent";
import { NavMeshModifierVolume } from "./Component/NavMeshModifierVolume";
import { NavMeshLink } from "./Component/NavMeshLink";
import { NavMeshGrid } from "./NavMeshGrid";
import { NavigationManager } from "./NavigationManager";
import { NavigationPathData } from "./NavigationPathData";
import { NavigationUtils } from "./NavigationUtils";
import { RecastConfig } from "./RecastConfig";
import { TitleConfig } from "./TitleConfig";

const CROW_MAX_FILTER: number = 16;

/**
 * @en NavMesh class is used to create and manage navigation meshes.
 * @zh NavMesh 类用于创建和管理导航网格。
 */
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
    private _meshlinkOffList: SingletonList<NavMeshLink>;
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
     * @ignore
     * @en Instantiate a NavMesh component.
     * @param config The Recast configuration for the NavMesh.
     * @param bound The bounds of the NavMesh.
     * @param manager The NavigationManager instance.
     * @zh 实例化一个 NavMesh 组件。
     * @param config NavMesh 的 Recast 配置。
     * @param bound NavMesh 的边界。
     * @param manager NavigationManager 实例。
     */
    constructor(config: RecastConfig, bound: Bounds, manager: NavigationManager) {
        this._manager = manager;
        this._grid = new NavMeshGrid(config, bound);
        this._titileConfig = new TitleConfig();
        this._navcreateedTileMaps = new Set<number>();
        this._delayCreates = new Map<number, NavAgent[]>();
        this._fiterMap = new Map<number, any>();

        this._meshlinkOffList = new SingletonList<NavMeshLink>();
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
        this._navConvexVolume.setIs3D(true);
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
        let refPoint = this._navQuery.findNearestPoly(pos.toArray(), this._extents, agent._filter);
        agent._agentId = this._crowd.addAgent(refPoint.data, params);
        agent._crowAgent = this._crowd.getAgent(agent._agentId);
    }


    /**
     * @en Add an agent to the NavMesh.
     * @param agent The NavAgent to be added.
     * @zh 向 NavMesh 添加一个代理。
     * @param agent 要添加的 NavAgent。
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
     * @en Remove an agent from the NavMesh.
     * @param agent The NavAgent to be removed.
     * @zh 从 NavMesh 中移除一个代理。
     * @param agent 要移除的 NavAgent。
     */
    removeAgent(agent: NavAgent) {
        this._crowd.removeAgent(agent._agentId);
        agent._agentId = null;
        agent._crowAgent = null;
    }

    /**
     * @en Perform a raycast on the NavMesh.
     * @param ray The ray to cast.
     * @param outPos The output vector to store the hit position.
     * @zh 在 NavMesh 上执行射线投射。
     * @param ray 要投射的射线。
     * @param outPos 用于存储命中位置的输出向量。
     */
    raycastNavMesh(ray: Ray, outPos: Vector3): boolean {
        return false;
    }


    /**
     * @internal
     * @param link 
     * @returns 
     */
    addNavMeshLink(link: NavMeshLink): void {
        if (this._meshlinkOffList.indexof(link) >= 0) return;
        this._meshlinkOffList.add(link);
        let index = this._meshlinkOffList.length - 1;
        let area = this._manager.getArea(link.areaFlag);
        let pos = link._start.toArray();
        pos[1] += this._grid.config.cellHeight;
        this._meshlinkoffIdLists[index] = this._navMeshLink.addOffMeshConnection(index,pos, link._end.toArray(), link.width, link.bidirectional ? 1 : 0,  area.index);
    }

    /**
     * @internal
     * @param linkid 
     */
    removeNavMeshLink(link: NavMeshLink): void {
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
        let index = this._meshVolumeList.length - 1;
        let areaType = this._manager.getArea(volume.areaFlag).index;
        this._navConvexVolume.addCovexVoume(index,volume._datas,0,0, areaType);
        this._meshVolumeIdLists[this._meshVolumeList.length - 1] =index;
    }


    /**
   * @internal
   * @param volume 
   * @returns 
   */
    updateCovexVoume(volume: NavMeshModifierVolume) {
        let index = this._meshVolumeList.indexof(volume);
        if (index < 0) return;
        let areaType = this._manager.getArea(volume.areaFlag).index;
        this._navConvexVolume.addCovexVoume(index,volume._datas,0,0, areaType);
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
     * @en Get the flag of the polygon at the specified position.
     * @param pos World coordinates.
     * @param fiter Optional filter for the query.
     * @returns The flag of the polygon.
     * @zh 获取指定位置多边形的标志。
     * @param pos 世界坐标。
     * @param fiter 可选的查询过滤器。
     * @returns 多边形的标志。
     */
    getPolyFlags(pos: Vector3, fiter: any = null): number {
        const posRef = this.findNearestPoly(pos, fiter);
        return this._navMesh.getPolyFlags(posRef.polyRef);
    }

    /**
     * @en Get the area flag of the polygon at the specified position.
     * @param pos World coordinates.
     * @param fiter Optional filter for the query.
     * @returns The area flag of the polygon.
     * @zh 获取指定位置多边形的区域标志。
     * @param pos 世界坐标。
     * @param fiter 可选的查询过滤器。
     * @returns 多边形的区域标志。
     */
    getPolyArea(pos: Vector3, fiter: any = null): number {
        const posRef = this.findNearestPoly(pos, fiter);
        return this._navMesh.getPolyArea(posRef.polyRef);
    }

    /**
     * @en Find the nearest polygon to the specified position.
     * @param pos World coordinates.
     * @param fiter Optional filter for the query.
     * @returns Information about the nearest polygon.
     * @zh 查找指定位置最近的多边形。
     * @param pos 世界坐标。
     * @param fiter 可选的查询过滤器。
     * @returns 最近多边形的信息。
     */
    findNearestPoly(pos: Vector3, fiter: any = null): any {
        if (!fiter) fiter = this._defatfilter;
        return this._navQuery.findNearestPoly(pos.toArray(), this.extents, fiter);
    }

    /**
     * @en Find a follow path for the specified agent.
     * @param agent The navigation agent.
     * @param fllowPaths Array to store the resulting path data.
     * @returns Whether the path was successfully found.
     * @zh 为指定的代理查找跟随路径。
     * @param agent 导航代理。
     * @param fllowPaths 用于存储结果路径数据的数组。
     * @returns 是否成功找到路径。
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
     * @en Find the distance to the nearest wall for the specified agent.
     * @param agent The navigation agent.
     * @returns An object containing the distance, position, and normal of the nearest wall, or null if not found.
     * @zh 查找指定代理到最近墙壁的距离。
     * @param agent 导航代理。
     * @returns 包含最近墙壁的距离、位置和法线的对象，如果未找到则返回 null。
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
     * @en Request a move target for the specified agent.
     * @param agent The navigation agent.
     * @param destination The target destination.
     * @returns Whether the move target request was successful.
     * @zh 为指定的代理请求移动目标。
     * @param agent 导航代理。
     * @param destination 目标位置。
     * @returns 移动目标请求是否成功。
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
        this._titileConfig.maxSimplificationError = 0.9;
        this._titileConfig.setMaxEdgeLen(12 / config.cellSize);
        this._titileConfig.setAgent(config.agentHeight, config.agentRadius, config.agentMaxClimb);
        this._titileConfig.setOff(tileX, tileY);
        this._titileConfig.setMin(bound.min);
        this._titileConfig.setMax(bound.max);
        this.removeTile(tileX, tileY);
        let ptrs:number[]= [];
        binds.forEach((value) => {
            ptrs.push(value.$$.ptr);
        });
        this._navMesh.addTile(config, this._titileConfig, ptrs, this._navMeshLink, this._navConvexVolume);
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
     * @en Build and get the debug mesh for the NavMesh.
     * @returns The created debug mesh.
     * @zh 构建并获取 NavMesh 的调试网格。
     * @returns 创建的调试网格。
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