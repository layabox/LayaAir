import { Handler } from "../../../utils/Handler";
import { CacheData } from "./CacheData";
import { BaseNavMeshSurface } from "../component/BaseNavMeshSurface";
import { NavigationUtils } from "../NavigationUtils";
import { NavTileCache } from "../NavTileData";
import { BaseData } from "./BaseData";

export class NavModifleData extends BaseData{
    /**@internal */
    _datas: NavTileCache;
    /**@internal */
    _bindData:any;

    
    set datas(value: NavTileCache) {
        if(this._datas == value) return;
        this._datas = value;
        this._refeashData();
    }

    get datas(): NavTileCache {
        return this._datas;
    }

    constructor(){
        super();
        this._bindData = NavigationUtils._createdtNavTileCache();
    }

    /**
     * @internal
     * 更新buffer
     */
    private _updateBuffer(cache:CacheData,flag:number): void {

        if(this._datas == null) return;

        if(cache._getCacheFlag(CacheData.DataFlag)){
            this._bindData.init(this._datas.bindData);
        }
        if(cache._getCacheFlag(CacheData.DataFlag|CacheData.AreaFlag)){
            this._bindData.setFlag(flag);
        }

        if(cache._getCacheFlag(CacheData.DataFlag|CacheData.TransfromFlag)){
            this._bindData.transfromData(this._transfrom.elements);
            NavigationUtils._transfromBoundBox(this._datas._boundMin,this._datas._boundMax,this._transfrom,this._min,this._max);
            cache._cacheBound(this._min,this._max);
        }
    }


    private _updateTileIndexs(cache:CacheData,oldTileIndex:Set<number>,newTileIndexs:Set<number>):void{
        let surface = cache._surface;
        oldTileIndex.forEach((index)=>{
            surface._featureCache.get(index).delete(this._bindData);
        })

        if(this._datas == null) return;

        newTileIndexs.forEach((index)=>{
            surface._featureCache.get(index).add(this._bindData);
        })
    }


    /**
     * @internal
     */
    _initSurface(surface:Array<BaseNavMeshSurface>): void {
        this._cacheDatas = [];
        surface.forEach(element => {
            let cache = element._addModifileNavMesh(this)
            cache._setUpdateDataHander(Handler.create(this,this._updateBuffer,undefined,false));
            cache._setTileHander(Handler.create(this,this._updateTileIndexs,undefined,false));
            this._cacheDatas.push(cache);
            cache._updateAreaFlag(this._areaFlags);
            cache._updateTransfrom(this._transfrom);
            cache._setCacheFlag(CacheData.DataFlag);
        });
    }

    /**
     * @internal
     */
    _destory(): void {
        this._cacheDatas.forEach(element => {
            let surface = element._surface;
            let oldTileIndex = element._titleIndex;
            oldTileIndex.forEach((index)=>{
                surface._featureCache.get(index).delete(this._bindData);
            })
            surface._removeModifileNavMesh(this);
        });
        this._cacheDatas = [];
    }
}