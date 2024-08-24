

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


/**
 * 寻路网格组件的基类
 */
export class BaseNavMeshSurface extends Component {
    /**@internal */
    _datas: TextResource;

    /**@internal */
    _maxSimplificationError: number = 0.9;

    /**@internal */
    _agentType: string = NavigationConfig.defaltAgentName;


    /**@internal */
    _partitionType: PartitionType;

    /**@intenral */
    _navMesh: BaseNavMesh;

    /**@internal */
    _boundMin: Vector3 = new Vector3();

    /**@internal */
    _boundMax: Vector3 = new Vector3();

    /**@internal load*/
    _oriTiles: NavTileData;

    _cachedata: CacheData;

    /**@internal */
    _featureCache: Map<number, Set<any>>;

    _cacheDataMap: Map<any, CacheData>;

    /** @internal */
    _meshlinkOffMaps: ItemMapId<NavMeshLinkData>;

    /** @internal */
    _meshVolumeMaps: ItemMapId<CacheData>;

    /**@internal */
    _manager: BaseNavigationManager;

    /**@internal */
    _buildTileList: Set<number>;

    /**@internal 是否开启异步处理*/
    _needAsyn: boolean = false;

    /**@internal 延时改变列表*/
    _delayCacheMap: Set<CacheData>;

    /**
     * agent 类型
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
     * area 类型
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
    * 设置产生navMesh的方法
    */
    set partitionType(value: PartitionType) {
        this._partitionType = value;
    }

    get partitionType(): PartitionType {
        return this._partitionType;
    }

    /**
     * 设置最小边缘
     */
    get min(): Vector3 {
        return this._boundMin;
    }

    /** 
     * 设置最大边缘
     * */
    get max(): Vector3 {
        return this._boundMax;
    }

    /**
     * 烘培数据
     */
    set datas(value: TextResource) {
        this._datas = value;
        this._updateNavData();
    }

    get datas(): TextResource {
        return this._datas;
    }

    /**
     * 简化多边形边框可偏移的最大量
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
     * 获取navMesh
     */
    get navMesh(): BaseNavMesh {
        return this._navMesh;
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
        this._cachedata.setUpdateDataHander(new Handler(this, this._updateOrigTileCache, undefined, false));
        this._cachedata._cacheData([]);
        this._cacheDataMap = new Map<any, CacheData>();
        this._meshlinkOffMaps = new ItemMapId<NavMeshLinkData>(256);
        this._meshVolumeMaps = new ItemMapId<CacheData>(256);
    }


    public cleanAllTile() {
        //clear cache TODO
        for (var i = 0, n = this._oriTiles.length; i < n; i++) {
            let tile = this._oriTiles.getNavData(i);
            this._navMesh.removeTile(tile.x, tile.y);
        }
    }

    public rebuildTile(pos: Vector3) {
        let index = this._navMesh.navTileGrid.getTileIndexByPos(pos.x, pos.z);
        this._buildTileList.add(index);
    }

    /**@internal*/
    protected _updateOrigTileCache(cache: CacheData, areaflags: number) {
        if (!cache._getCacheFlag(CacheData.AreaFlag)) return;
        let datas = cache.cacheData;
        let tileCount = datas.length;

        if (cache._getCacheFlag(CacheData.DataFlag | CacheData.AreaFlag)) {
            for (var i = 0; i < tileCount; i++) {
                datas[i].setFlag(areaflags);
            }
        }

    }

    /**@internal*/
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
        this._navMesh._deleteCovexVoume(cacheData.id);
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
        if (this._navMesh) this._navMesh.clearn();
        if (this._datas) {
            this._oriTiles = new NavTileData(this._datas);
            if (this._navMesh) {
                this._navMesh.navTileGrid.refeachConfig(this._oriTiles);
                this._navMesh._navMeshInit()
            }
            let bindDatas = [];
            for (var i = 0, n = this._oriTiles.length; i < n; i++) {
                let bindData = NavigationUtils.createdtNavTileCache();
                bindData.init(this._oriTiles.getNavData(i).bindData);
                this._featureCache.set(i, new Set<any>([bindData]));
                bindDatas.push(bindData);
            }
            this._cachedata._cacheBound(this._oriTiles._boundMin, this._oriTiles._boundMax);
            this._cachedata._cacheData(bindDatas);
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
            this._navMesh.navTileGrid.refeachConfig(this._oriTiles);
            this._navMesh._navMeshInit()
        }

        this._manager.regNavMeshSurface(this);
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
        let bindDatas = this._cachedata.cacheData;
        bindDatas.forEach((value: any) => {
            NavigationUtils.freeLayaData(value);
        });
        this._cachedata._cacheData([]);
    }

    /**
     * @internal
     * start build one Mesh
     */
    _buildOneTileMesh() {
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
     * start build all Mesh
     */
    _buildAllTileMesh() {
        while (this._buildTileList.size > 0) {
            this._buildOneTileMesh();
        }
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
        this.navMesh._updateNavMesh(dt);
    }

}