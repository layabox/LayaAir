

import { Component } from "../../../components/Component";
import { Vector3 } from "../../../maths/Vector3";
import { NavTileData } from "../NavTileData";
import { BaseNavigationManager } from "../BaseNavigationManager";
import { NavigationConfig, PartitionType } from "../NavigationConfig";
import { BaseNavMesh } from "../BaseNavMesh";
import { TextResource } from "../../../resource/TextResource";
import { NavigationUtils } from "../NavigationUtils";
import { RecastConfig } from "../RecastConfig";
import { CacheData } from "../data/CacheData";
import { Handler } from "../../../utils/Handler";
import { ItemMapId } from "../ItemMapId";
import { ModifierVolumeData } from "../data/ModifierVolumeData";
import { NavModifleData } from "../data/NavModifleData";
import { NavMeshLinkData } from "../data/NavMeshLinkData";
import { NavigationPathData } from "../NavigationPathData";


/**
 * @en BaseNavMeshSurface is a base component used to generate navigation mesh. 2d and 3d integrate this class respectively.
 * @zh BaseNavMeshSurface 是一个用于生成导航网格的基础组件，2d 和 3d 分别集成该类。
 */
export class BaseNavMeshSurface extends Component {
    /**@internal 网格模型的数据 */
    private _datas: TextResource;

    /**@internal */
    private _maxSimplificationError: number = 0.9;

    /**@internal */
    private _agentType: string = NavigationConfig.defaltAgentName;

    /**@internal */
    private _partitionType: PartitionType;

    /**@internal */
    private _boundMin: Vector3 = new Vector3();

    /**@internal */
    private _boundMax: Vector3 = new Vector3();

    /**@internal load*/
    private _oriTiles: NavTileData;

    private _cachedata: CacheData;

    /**@internal 是否开启异步处理*/
    private _needAsyn: boolean = false;

    private _cacheDataMap: Map<any, CacheData>;

    /** @internal */
    private _meshlinkOffMaps: ItemMapId<NavMeshLinkData>;

    /** @internal */
    private _meshVolumeMaps: ItemMapId<CacheData>;


    /**@intenral */
    _navMesh: BaseNavMesh;

    /**@internal */
    _buildTileList: Set<number>;

    /**@internal */
    _manager: BaseNavigationManager;

    /**@internal 延时改变列表*/
    _delayCacheMap: Set<CacheData>;

    /**@internal */
    _featureCache: Map<number, Set<any>>;

     /**
     * @en Agent type
     * @zh 代理类型
     */
    set agentType(value: string) {
        if (this._agentType == value) return;
        this._agentType = value;
        if (this._oriTiles == null) return;
        let tileCount = this._oriTiles.length;
        for (var i = 0; i < tileCount; i++) {
            this._buildTileList.add(i);
        }
    }

    get agentType(): string {
        return this._agentType;
    }

    /**
     * @en Area type
     * @zh 区域类型
     */
    set areaFlag(value: string) {
        this._cachedata._updateAreaFlag(value);
    }

    get areaFlag() {
        return this._cachedata.areaFlag;
    }

    /**
     * 是否需要异步处理
     */
    set asyn(value: boolean) {
        this._needAsyn = value;
    }

    get asyn() {
        return this._needAsyn;
    }

    /**
     * @en Set the method for generating navMesh
     * @zh 设置生成导航网格的方法
     */
    set partitionType(value: PartitionType) {
        this._partitionType = value;
    }

    get partitionType(): PartitionType {
        return this._partitionType;
    }

     /**
     * @readonly
     * @en The minimum bounds of the navigation mesh
     * @zh 导航网格的最小边界 
     */
    get min(): Vector3 {
        return this._boundMin;
    }

    /**
     * @readonly
     * @en The maximum bounds of the navigation mesh
     * @zh 导航网格的最大边界 
     */
    get max(): Vector3 {
        return this._boundMax;
    }

    /**
     * @en Set navigation data
     * @zh 设置导航数据
     */
    set datas(value: TextResource) {
        this._datas = value;
        this._updateNavData();
    }

    get datas(): TextResource {
        return this._datas;
    }

    /**
     * @en The maximum amount of simplification error for the border of the polygon.
     * @zh 简化多边形边框可偏移的最大量
     */
    set maxSimplificationError(value: number) {
        if (this._maxSimplificationError == value) return;
        this._maxSimplificationError = value;
        this._cachedata._setCacheFlag(CacheData.OtherDataFlag);
    }

    get maxSimplificationError() {
        return this._maxSimplificationError;
    }


    /**
     * <code>实例化一个寻路功能<code>
     */
    constructor() {
        super();
        this.runInEditor = true;
        this._singleton = false;
        this._delayCacheMap = new Set<CacheData>();
        this._buildTileList = new Set<number>();
        this._featureCache = new Map<number, Set<any>>()
        this._partitionType = PartitionType.PARTITION_WATERSHED;
        this._cachedata = this._createCacheData();
        this._cachedata._setUpdateDataHander(new Handler(this, this._updateOrigTileCache, undefined, false));
        this._cachedata._cacheData = [];
        this._cacheDataMap = new Map<any, CacheData>();
        this._meshlinkOffMaps = new ItemMapId<NavMeshLinkData>(256);
        this._meshVolumeMaps = new ItemMapId<CacheData>(256);
    }

    /**
     * @internal
     * @en Clean all Tile
     * @zh 清理所有的Tile
     */
    public cleanAllTile() {
        for (var i = 0, n = this._oriTiles.length; i < n; i++) {
            let tile = this._oriTiles.getNavData(i);
            this._navMesh._removeTile(tile.x, tile.y);
        }
    }

    /**
     * @internal
     * @en Rebuild the tile at the specified location
     * @zh 重建指定位置的Tile
     */
    public rebuildTile(pos: Vector3) {
        let index = this._navMesh.navTileGrid.getTileIndexByPos(pos.x, pos.z);
        this._buildTileList.add(index);
    }

    /**
     * @en Get the current point's Flag
     * @param pos World coordinates;
     * @param fiter Optional query filter.
     * @returns flag
     * @zh 获得当前点的Flag
     * @param pos 世界坐标
     * @param fiter 可选的查询过滤器。
     * @return flag
     */
    public getPolyFlags(pos: Vector3, fiter: any = null): number {
        if (this._navMesh == null) return -1;
        return this._navMesh._getPolyFlags(pos, fiter);
    }

    /**
     * @en Find the nearest polygon to the specified position.
     * @param pos World coordinates.
     * @param fiter Optional filter for the query.
     * @param out Used to store the position.
     * @returns Information about the nearest polygon.
     * @zh 查找指定位置最近的多边形。
     * @param pos 世界坐标。
     * @param fiter 可选的查询过滤器。
     * @param out 用于存储位置。
     * @returns 最近多边形的引用id。
     */
    public findNearestPoly(pos: Vector3, fiter: any = null, out: Vector3) {
        if (this._navMesh == null) return null;
        return this._navMesh._findNearestPoly(pos, fiter, out);
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
    public findFllowPath(outPaths: NavigationPathData[], startPos: Vector3, endPos: Vector3, speed: number, filter: any = null): boolean {
        if (this._navMesh == null) return false;
        return this._navMesh._findFllowPath(outPaths, startPos, endPos, speed, filter);
    }

    /**
     * @en Find the distance to the nearest wall for the specified position.
     * @param pos The world position.
     * @param filter Optional filter for the query.
     * @returns An object containing the distance, position, and normal of the nearest wall, or null if not found.
     * @zh 查找指定位置到最近墙壁的距离。
     * @param pos 世界位置。
     * @param filter 可选的查询过滤器。
     * @returns 包含最近墙壁的距离、位置和法线的对象，如果未找到则返回 null。
     */
    public findDistanceToWall(pos: Vector3, filter: any): { dist: number, pos: Array<number>, normal: Array<number> } {
        if (this._navMesh == null) return null;
        return this._navMesh._findDistanceToWall(pos, filter);
    }

    /**
     * @internal
     * @en refresh the original data Flag
     * @zh 刷新原始数据的Flag
    */
    protected _updateOrigTileCache(cache: CacheData, areaflags: number) {
        if (!cache._getCacheFlag(CacheData.AreaFlag)) return;
        let datas = cache._cacheData;
        let tileCount = datas.length;

        if (cache._getCacheFlag(CacheData.DataFlag | CacheData.AreaFlag)) {
            for (var i = 0; i < tileCount; i++) {
                datas[i].setFlag(areaflags);
            }
        }

    }

    /**
     * @internal
     * @en create CacheData
     * @zh 创建CacheData
     * 
    */
    protected _createCacheData(): CacheData {
        return new CacheData(this);
    }

    /**@internal*/
    protected _getCahceData(data: any): CacheData {
        let cacheData = this._cacheDataMap.get(data);
        if (cacheData == null) {
            cacheData = this._createCacheData();
            this._cacheDataMap.set(data, cacheData);
        }
        return cacheData;
    }

    /**@internal*/
    protected _removeCacheData(data: any): CacheData {
        let cacheData = this._cacheDataMap.get(data);
        if (cacheData == null) return null;
        this._cacheDataMap.delete(data);
        cacheData._destroy();
        this._navMesh._deleteConvexVoume(cacheData.id);
        return cacheData;
    }

    /**@internal*/
    protected _crateNavMesh(config: RecastConfig, min: Vector3, max: Vector3): BaseNavMesh {
        throw new Error("BaseNavMeshSurface: must override this function");
    }

    /**@internal*/
    protected _updateNavData(): void {
        this._featureCache.clear();
        this._cleanBindData();
        if (this._navMesh) this._navMesh._clearn();
        if (this._datas) {
            this._oriTiles = new NavTileData(this._datas);
            if (this._navMesh) {
                this._navMesh.navTileGrid._refeashBound(this._oriTiles);
                this._navMesh._navMeshInit()
            }
            let bindDatas = [];
            for (var i = 0, n = this._oriTiles.length; i < n; i++) {
                let bindData = NavigationUtils._createdtNavTileCache();
                bindData.init(this._oriTiles.getNavData(i).bindData);
                this._featureCache.set(i, new Set<any>([bindData]));
                bindDatas.push(bindData);
            }
            this._cachedata._cacheBound(this._oriTiles._boundMin, this._oriTiles._boundMax);
            this._cachedata._cacheData = bindDatas;
            this._cacheDataMap.forEach((value) => { value._resetData() })
        } else {
            this._oriTiles = null;
            this._buildTileList.clear();
        }
    }

    /**@internal */
    _getManager(): BaseNavigationManager {
        throw new Error("BaseNavMeshSurface: must override this function");
    }

    /**
    * @internal
    */
    _onEnable(): void {
        this._manager = this._getManager();
        this._navMesh = this._crateNavMesh(this._manager.getNavConfig(this._agentType), this._boundMin, this._boundMax);
        if (this._oriTiles) {
            this._navMesh.navTileGrid._refeashBound(this._oriTiles);
            this._navMesh._navMeshInit()
        }

        this._manager.regNavMeshSurface(this);
    }


    /**
     * @internal
     * @param dt 
     */
    _updata(dt: number) {
        if (this._oriTiles == null) return;
        this._delayCacheMap.forEach((value) => { value._updateCache() });
        this._delayCacheMap.clear();
        if (this._needAsyn) {
            this._buildOneTileMesh();
        } else {
            this._buildAllTileMesh();
        }
        if (dt > 0) this._navMesh._updateNavMesh(dt);
    }


    /**
     * @internal
     * build one Mesh
     */
    protected _buildOneTileMesh() {
        if (this._buildTileList.size == 0) return;
        const setIter = this._buildTileList.keys();
        let tileIndex = setIter.next().value;
        let oritile = this._oriTiles.getNavData(tileIndex)
        var featureCache = this._featureCache.get(tileIndex);
        this._navMesh._addTile(oritile, [...featureCache], this._partitionType, this._maxSimplificationError);
        this._buildTileList.delete(tileIndex);
    }


    /**
     * @internal
     * build all Mesh
     */
    protected _buildAllTileMesh() {
        while (this._buildTileList.size > 0) {
            this._buildOneTileMesh();
        }
    }

    /**
    * @internal
    */
    protected _onDisable(): void {
        this.cleanAllTile();
    }

    /**
    * @internal
    */
    protected _onDestroy(): void {
        if (this._oriTiles) this._oriTiles = null;
    }

    /**
     * @internal
     */
    _cloneTo(dest: Component): void {
        let surface = dest as BaseNavMeshSurface;
        surface._agentType = this._agentType;
        surface.areaFlag = this.areaFlag;
        surface._partitionType = this._partitionType;
        super._cloneTo(dest);
    }

    /**
     * @internal 
     */
    _cleanBindData() {
        let bindDatas = this._cachedata._cacheData;
        bindDatas.forEach((value: any) => {
            NavigationUtils._freeLayaData(value);
        });
        this._cachedata._cacheData = [];
    }

    /**
     * @internal
     * add one modifile navMesh
     * @param navModifile 
     */
    _addModifileNavMesh(navModifile: NavModifleData) {
        return this._getCahceData(navModifile);
    }

    /**
     * @internal
     * remove one Modifile NavMesh
     * @param navModifile 
     */
    _removeModifileNavMesh(navModifile: NavModifleData) {
        this._removeCacheData(navModifile);
    }

    /** @internal */
    _addModifileLink(link: NavMeshLinkData) {
        let cache = this._getCahceData(link);
        let linkId = this._meshlinkOffMaps.getId(link);
        if (linkId == -1) {
            return null;
        }
        cache.id = linkId;
        return cache;
    }

    /** @internal */
    _addConvexVoume(volume: ModifierVolumeData) {
        let cache = this._getCahceData(volume);
        let volumeId = this._meshVolumeMaps.getId(cache);
        if (volumeId == -1) {
            return null;
        }
        cache.id = volumeId;
        return cache;
    }

    /**
     * @internal
     * @param volume 
     */
    _deleteCovexVoume(volume: ModifierVolumeData) {
        this._removeCacheData(volume);
    }

}