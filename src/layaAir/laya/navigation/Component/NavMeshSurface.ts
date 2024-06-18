
import { Component } from "../../components/Component";
import { Vector3 } from "../../maths/Vector3";
import { Sprite3D } from "../../d3/core/Sprite3D";
import { Scene3D } from "../../d3/core/scene/Scene3D";
import { Bounds } from "../../d3/math/Bounds";
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
* 数据分块算法
*/
export enum PartitionType {
    PARTITION_WATERSHED,
    PARTITION_MONOTONE,
    PARTITION_LAYERS
};

export class NavMeshSurface extends Component {

    /**
     * find all 
     * @param surfaces 
     * @param sprite 
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

    /**@intenral */
    private _navMesh: NavMesh;

    /**@internal */
    private _boundBox: Bounds;

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
     * agent 类型
     */
    set agentType(value: string) {
        this._agentType = value;
    }

    get agentType(): string {
        return this._agentType;
    }

    /**
     * area 类型
     */
    set areaFlag(value: string) {
        this._areaFlags = value;
    }

    get areaFlag() {
        return this._areaFlags;
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
     * @internal
     * load set only
     */
    set bounds(value: Bounds) {
        value.cloneTo(this._boundBox);
    }

    get bounds() {
        return this._boundBox;
    }

    set datas(value: TextResource) {
        this._featureCache.clear();
        if (value) {
            this._oriTiles = new NavTileData(value);
            if (this._navMesh) {
                this._navMesh.navTileGrid.refeachConfig(this._oriTiles);
                this._navMesh._navMeshInit()
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

    get navMesh(): NavMesh {
        return this._navMesh;
    }


    /**
     * <code>实例化一个寻路功能<code>
     */
    constructor() {
        super();
        this._singleton = false;
        this._buildTileList = new SingletonList<number>();
        this._featureCache = new Map<number, SingletonList<NavModifleBase>>()
        this._boundBox = new Bounds();
        this._bindDatas = new Map<number, any>();
        this._partitionType = PartitionType.PARTITION_WATERSHED;
    }

    /**
    * @internal
    */
    _onEnable(): void {
        //start Build Tile
        let manager: NavigationManager = (this.owner.scene as Scene3D).getComponentElementManager("navMesh") as NavigationManager;
        this._navMesh = new NavMesh(manager.getNavConfig(this._agentType), this._boundBox, manager);
        if (this._oriTiles) {
            this._navMesh.navTileGrid.refeachConfig(this._oriTiles);
            this._navMesh._navMeshInit()
        }
        manager.regNavMeshSurface(this);
    }

    /**
    * @internal
    */
    protected _onDisable(): void {
        //remove all Tile 
        this.cleanAllTile();

    }

    /**
    * @internal
    */
    protected _onDestroy(): void {
        //clean up data
        if (this._oriTiles) this._oriTiles = null;
    }

    _cloneTo(dest: Component): void {
        let surface = dest as NavMeshSurface;
        surface._agentType = this._agentType;
        surface._areaFlags = this._areaFlags;
        surface._partitionType = this._partitionType;
        super._cloneTo(dest);
    }
    /**
     * add one modifile navMesh
     * @param navModifile 
     */
    _addModifileNavMesh(navModifile: NavModifleBase) {
        let indexs = this.navMesh.navTileGrid.getBoundTileIndex(navModifile.bounds, true);
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
        let indexs = this.navMesh.navTileGrid.getBoundTileIndex(navModifile.bounds, true);
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
        this._navMesh._addTile(oritile.x, oritile.y, binds, oritile.bound, this._partitionType);
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


    cleanAllTile() {
        //clear cache TODO
        for (var i = 0, n = this._oriTiles.length; i < n; i++) {
            let tile = this._oriTiles.getNavData(i);
            this._navMesh.removeTile(tile.x, tile.y);
        }
    }

    rebuildTile(pos: Vector3) {
        let index = this._navMesh.navTileGrid.getTileIndexByPos(pos.x, pos.z)
        this._buildTileList.add(index);
        this._buildOneTileMesh();
    }
}