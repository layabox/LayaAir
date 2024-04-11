
import { Component } from "../../components/Component";
import { Bounds } from "../../d3/math/Bounds";
import { Matrix4x4 } from "../../maths/Matrix4x4";
import { TextResource } from "../../resource/TextResource";
import { NavTileData, NavTileCache } from "../NavTileData";
import { NavModifleBase } from "./NavModifleBase";


export class NavMeshModifileSurface extends NavModifleBase {

    /**@internal load*/
    _oriTiles: NavTileData;

    /**@internal */
    _oriNavTileCache: NavTileCache;


    /**
     * <code>NavMeshModifileSurface<Code>
     */
    constructor() {
        super();
    }

    /**
     * bake datas
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