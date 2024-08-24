
import { Component } from "../../components/Component";
import { Bounds } from "../../d3/math/Bounds";
import { Matrix4x4 } from "../../maths/Matrix4x4";
import { TextResource } from "../../resource/TextResource";
import { NavTileData, NavTileCache } from "../NavTileData";
import { NavModifleBase } from "./NavModifleBase";


/**
 * @en NavMeshModifileSurface is a component that modifies the navigation mesh surface.
 * @zh NavMeshModifileSurface 是一个修改导航网格表面的组件。
 */
export class NavMeshModifileSurface extends NavModifleBase {

    /**@internal load*/
    _oriTiles: NavTileData;

    /**@internal */
    _oriNavTileCache: NavTileCache;


    /** @ignore */
    constructor() {
        super();
    }

    /**
     * @en Sets or gets the baked navigation data.
     * @param value The TextResource containing the navigation data.
     * @returns The TextResource containing the navigation data.
     * @zh 设置或获取烘焙的导航数据。
     * @param value 包含导航数据的 TextResource。
     * @returns 包含导航数据的 TextResource。
     */
    set datas(value: TextResource) {
        this._oriTiles = new NavTileData(value);
        this._oriNavTileCache = this._oriTiles.getNavData(0);
        this._dtNavTileCache.init(this._oriNavTileCache.bindData);
    }

    get datas(): TextResource {
        if (!this._oriTiles) return null;
        else return this._oriTiles._res;
    }

    /**
    * @internal
    */
    _refeashTranfrom(mat: Matrix4x4, bound: Bounds) {
        if (this._oriNavTileCache == null) return;
        this._oriNavTileCache.bound._tranform(mat, bound);
        this._dtNavTileCache.transfromData(mat.elements);
    }

    /**
    * @internal
    */
    protected _onEnable(): void {
        //start Build Tile
        if (!this.datas)
            return;
        super._onEnable();
    }


    /**
     * @internal
     */
    _cloneTo(dest: Component): void {
        let surface = dest as NavMeshModifileSurface;
        surface.datas = this._oriTiles._res;
        super._cloneTo(dest);
    }
}