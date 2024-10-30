
import { Component } from "../../components/Component";
import { Vector3 } from "../../maths/Vector3";
import { Sprite3D } from "../../d3/core/Sprite3D";
import { Scene3D } from "../../d3/core/scene/Scene3D";
import { TextResource } from "../../resource/TextResource";
import { SingletonList } from "../../utils/SingletonList";

import { NavMesh } from "../NavMesh";
import { NavTileData } from "../NavTileData";
import { NavigationManager } from "../NavigationManager";
import { NavigationUtils } from "../NavigationUtils";
import { NavMeshModifierVolume } from "./NavMeshModifierVolume";
import { NavModifleBase } from "./NavModifleBase";
import { NavMeshLink } from "./NavMeshLink";



/**
 * @en Data partitioning algorithm
 * @zh 数据分块算法
 */
export enum PartitionType {
    PARTITION_WATERSHED,
    PARTITION_MONOTONE,
    PARTITION_LAYERS
};

/**
 * @en NavMeshSurface is a component used to generate navigation mesh.
 * @zh NavMeshSurface 是一个用于生成导航网格的组件。
 */
export class NavMeshSurface extends Component {

    /**
     * @en Find all NavMeshSurface components that match the given agent flags in the sprite hierarchy.
     * @param surfaces An array to store the found NavMeshSurface components.
     * @param sprite The starting Sprite3D to search from.
     * @param agentFlags An array of agent types to filter the NavMeshSurface components.
     * @zh 在精灵层级中查找所有匹配给定代理标志的 NavMeshSurface 组件。
     * @param surfaces 用于存储找到的 NavMeshSurface 组件的数组。
     * @param sprite 开始搜索的 Sprite3D 对象。
     * @param agentFlags 用于过滤 NavMeshSurface 组件的代理类型数组。
     */
    static findNavMeshSurface(surfaces: Array<NavMeshSurface>, sprite: Sprite3D, agentFlags: string[]) {
        let array = sprite.getComponents(NavMeshSurface) as NavMeshSurface[];
        if (array && array.length > 0) {
            array.forEach(element => {
                (agentFlags.indexOf(element.agentType) >= 0) && surfaces.push(element);
            });
        }
        let parat = sprite.parent;
        if (parat && (parat instanceof Sprite3D)) {
            NavMeshSurface.findNavMeshSurface(surfaces, parat, agentFlags);
        }
    }


    /**@internal */
    private _agentType: string = NavigationManager.defaltAgentName;;

    /**@internal */
    private _areaFlags: string = NavigationManager.defaltWalk;

    /**@internal */
    private _partitionType: PartitionType;

    /**@internal */
    private _navMesh: NavMesh;

    /**@internal */
    private _boundMin: Vector3 = new Vector3();
    /**@internal */
    private _boundMax: Vector3 = new Vector3();

    /**@internal load*/
    _oriTiles: NavTileData;

    /**@internal */
    private _bindDatas: Map<number, any>;

    /**@internal */
    _featureCache: Map<number, SingletonList<NavModifleBase>>;

    /**@internal */
    private _buildTileList: SingletonList<number>;

    /**@internal 是否开启异步处理*/
    private _needAsyn: boolean = false;

    /**
     * @en Agent type
     * @zh 代理类型
     */
    set agentType(value: string) {
        this._agentType = value;
    }

    get agentType(): string {
        return this._agentType;
    }

    /**
     * @en Area type
     * @zh 区域类型
     */
    set areaFlag(value: string) {
        this._areaFlags = value;
    }

    get areaFlag() {
        return this._areaFlags;
    }

    /**
     * @en Whether asynchronous processing is needed
     * @zh 是否需要异步处理
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
    get boundMin() { return this._boundMin; }

    /**
     * @readonly
     * @en The maximum bounds of the navigation mesh
     * @zh 导航网格的最大边界 
     */
    get boundMax() { return this._boundMax; }

    /**
     * @en Set navigation data
     * @zh 设置导航数据
     */
    set datas(value: TextResource) {
        this._featureCache.clear();
        if (value) {
            this._oriTiles = new NavTileData(value);
            if (this._navMesh) {
                this._navMesh.navTileGrid.refeachConfig(this._oriTiles);
                this._navMesh._navMeshInit();
            }
            for (var i = 0, n = this._oriTiles.length; i < n; i++) {
                if (!this._bindDatas.has(i)) this._bindDatas.set(i, NavigationUtils.createdtNavTileCache());
                this._bindDatas.get(i).init(this._oriTiles.getNavData(i).bindData);
                this._buildTileList.add(i);
            }
        } else {
            this._oriTiles = null;
            this._cleanBindData();
        }
    }

    get datas(): TextResource {
        if (!this._oriTiles) return null;
        return this._oriTiles._res;
    }

    /**
     * @en The navigation mesh
     * @zh 导航网格
     */
    get navMesh(): NavMesh {
        return this._navMesh;
    }


    /**
     * @en Instantiate a pathfinding functionality
     * @zh 实例化一个寻路功能
     */
    constructor() {
        super();
        this._singleton = false;
        this._buildTileList = new SingletonList<number>();
        this._featureCache = new Map<number, SingletonList<NavModifleBase>>()
        this._boundMax = new Vector3();
        this._boundMin = new Vector3();
        this._bindDatas = new Map<number, any>();
        this._partitionType = PartitionType.PARTITION_WATERSHED;
    }

    /**
    * @internal
    */
    _onEnable(): void {
        //start Build Tile
        let manager: NavigationManager = (this.owner.scene as Scene3D).getComponentElementManager("navMesh") as NavigationManager;
        if(!this._navMesh){
            this._navMesh = new NavMesh(manager.getNavConfig(this._agentType), this._boundMin, this._boundMax, manager);
            if (this._oriTiles) {
                this._navMesh.navTileGrid.refeachConfig(this._oriTiles);
                this._navMesh._navMeshInit()
            }
        }

        manager.regNavMeshSurface(this);
    }

    /**
    * @internal
    */
    protected _onDisable(): void {
        
        let manager: NavigationManager = (this.owner.scene as Scene3D).getComponentElementManager("navMesh") as NavigationManager;
        manager.removeNavMeshSurface(this);
    }

    /**
    * @internal
    */
    protected _onDestroy(): void {
        //clean up data
        this.cleanAllTile();
        if (this._oriTiles) this._oriTiles = null;
    }

    _cloneTo(dest: NavMeshSurface): void {
        dest._agentType = this._agentType;
        dest._areaFlags = this._areaFlags;
        dest._partitionType = this._partitionType;
        super._cloneTo(dest);
    }
    /**
     * add one modifile navMesh
     * @param navModifile 
     */
    _addModifileNavMesh(navModifile: NavModifleBase) {
        let indexs = this.navMesh.navTileGrid.getBoundTileIndex(navModifile.boundMin,navModifile.boundMax, true);
        indexs.forEach((index) => {
            let cacheFeature = this._featureCache.get(index);
            if (!cacheFeature) {
                cacheFeature = new SingletonList<NavModifleBase>();
                this._featureCache.set(index, cacheFeature);
            }
            if (cacheFeature.indexof(navModifile) < 0) {
                cacheFeature.add(navModifile);
                if (this._buildTileList.indexof(index) < 0) this._buildTileList.add(index);
            }
        })
    }

    /**
     * @internal
     * remove one Modifile NavMesh
     * @param navModifile 
     */
    _removeModifileNavMesh(navModifile: NavModifleBase) {
        let indexs = this.navMesh.navTileGrid.getBoundTileIndex(navModifile.boundMin,navModifile.boundMax, true);
        indexs.forEach((index) => {
            let cacheFeature = this._featureCache.get(index);
            if (!cacheFeature) {
                return;
            }
            if (cacheFeature.indexof(navModifile) >= 0) {
                cacheFeature.remove(navModifile);
                if (this._buildTileList.indexof(index) < 0) this._buildTileList.add(index);
            }
        })
    }

    /**
     * @internal 
     */
    _addMeshLink(meshLink: NavMeshLink) {
        this._navMesh.addNavMeshLink(meshLink);
    }

    /**
     * @internal 
     */
    _removeMeshLink(meshLink: NavMeshLink) {
        this._navMesh.removeNavMeshLink(meshLink);
    }

    /**
    * @internal 
    */
    _addCovexVoume(volume: NavMeshModifierVolume) {
        this._navMesh.addCovexVoume(volume);
    }

    /**
    * @internal 
    */
    _updateCovexVoume(volume: NavMeshModifierVolume) {
        this._navMesh.updateCovexVoume(volume);
    }

    /**
     * @internal 
     */
    _removeCovexVoume(volume: NavMeshModifierVolume) {
        this._navMesh.deleteCovexVoume(volume);
    }



    /**
     * @internal 
     */
    _cleanBindData() {
        this._bindDatas.forEach((value) => {
            NavigationUtils.freeLayaData(value);
        })
        this._bindDatas.clear();
    }

    /**
     * build tile mesh
     * @internal
     * @param tileIndex 
     */
    private _updateFinalTileMesh(tileIndex: number) {
        let oritile = this._oriTiles.getNavData(tileIndex)
        var binds: any[] = [this._bindDatas.get(tileIndex)];
        var featureCache = this._featureCache.get(tileIndex);
        if (featureCache) {
            for (var i = 0, n = featureCache.length; i < n; i++) {
                binds.push(featureCache.elements[i].dtNavTileCache);
            }
        }
        this._navMesh._addTile(oritile.x, oritile.y, binds, oritile.boundMin,oritile.boundMax, this._partitionType);
    }

    /**
     * start build one Mesh
     */
    _buildOneTileMesh() {
        if (this._buildTileList.length <= 0) return;
        let tileIndex = this._buildTileList.elements[this._buildTileList.length - 1];
        this._updateFinalTileMesh(tileIndex);
        this._buildTileList.length--;
    }


    /**
     * start build all Mesh
     */
    _buildAllTileMesh() {
        while (this._buildTileList.length > 0) {
            this._buildOneTileMesh();
        }
    }

    /**
     * @internal
     * @param dt 
     */
    _updata(dt: number) {
        if (this._needAsyn) {
            this._buildOneTileMesh();
        } else {
            this._buildAllTileMesh();
        }
        this.navMesh.crowd.update(dt);
    }


    /**
     * @en Clean all navigation tiles
     * @zh 清除所有导航网格块
     */
    cleanAllTile() {
        //clear cache TODO
        for (var i = 0, n = this._oriTiles.length; i < n; i++) {
            let tile = this._oriTiles.getNavData(i);
            this._navMesh.removeTile(tile.x, tile.y);
        }
    }

    /**
     * @en Rebuild a specific tile at the given position
     * @param pos The position vector to determine which tile to rebuild
     * @zh 重建指定位置的导航网格块
     * @param pos 用于确定要重建哪个网格块的位置向量
     */
    rebuildTile(pos: Vector3) {
        let index = this._navMesh.navTileGrid.getTileIndexByPos(pos.x, pos.z)
        this._buildTileList.add(index);
        this._buildOneTileMesh();
    }
}