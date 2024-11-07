import { Vector3 } from "../../../maths/Vector3";
import { Handler } from "../../../utils/Handler";
import { BaseNavMeshSurface } from "../component/BaseNavMeshSurface";
import { BaseData } from "./BaseData";
import { CacheData } from "./CacheData";

export class NavMeshLinkData extends BaseData{

    /**@internal */
    _startPoint:Vector3 = new Vector3();
    /**@internal */
    _endPoint:Vector3 = new Vector3();
    /**@internal */
    _width:number = 1;
    /**@internal */
    _bidirectional:boolean = true;
    /**@internal */
    globalStart = new Vector3();
    /**@internal */
    globalEnd = new Vector3();

    /**@internal */
    _startNavSurfaces: BaseNavMeshSurface[] = [];

    /**@internal */
    _endNavSurfaces: BaseNavMeshSurface[] = [];

    /**@internal */
    private _regisgMaps:[];

    constructor() {
        super();
        this._regisgMaps = [];  
    }

    public _updateWidth(value:number):void{
        if(this._width == value)
            return;
        this._width = value;
        this._updateData(CacheData.OtherDataFlag);
    }

    public _updateBidirectional(value:boolean):void{
        if(this._bidirectional == value)
            return;
        this._bidirectional = value;
        this._updateData(CacheData.OtherDataFlag);
    }

    public _updateStartPoint(value:Vector3):void{
        if(Vector3.equals(this._startPoint,value))
            return;
        value.cloneTo(this._startPoint);
        this._updateData(CacheData.DataFlag);
    }

    public _updateEndPoint(value:Vector3):void{
        if(Vector3.equals(this._endPoint,value))
            return;
        value.cloneTo(this._endPoint);
        this._updateData(CacheData.DataFlag);
    }


    private _updateData(flag:number):void{
        this._cacheDatas.forEach(element => {
            element._setCacheFlag(flag);
        });
    }

    
    /**
     * @internal
     */
    _initSurface(surface:Array<BaseNavMeshSurface>): void {
        this._cacheDatas.length = 0;
        surface.forEach(element => {
            let cache = element._addModifileLink(this);
            cache._setUpdateDataHander(Handler.create(this,this._updateBuffer,undefined,false));
            this._cacheDatas.push(cache);
            cache._updateAreaFlag(this._areaFlags);
            cache._updateTransfrom(this._transfrom);
            cache._setCacheFlag(CacheData.DataFlag);
        });
    }

    /**
     * @internal
     */
    _updateBuffer(cache:CacheData,areaFlag:number): void {
        if(cache._getCacheFlag(CacheData.DataFlag|CacheData.TransfromFlag)){
            Vector3.transformCoordinate(this._startPoint,this._transfrom,this.globalStart);
            Vector3.transformCoordinate(this._endPoint,this._transfrom,this.globalEnd);
        }
        let surface = cache._surface;
        let manager = surface._manager;
        var starts = manager.getNavMeshSurfaces(this.globalStart);
        var ends = manager.getNavMeshSurfaces(this.globalEnd);
        for (var i = starts.length - 1; i >= 0; i--) {
            let surface = starts[i];
            let index = ends.indexOf(surface);
            if (index < 0) {
                continue;
            }
            ends.splice(index, 1);
            starts.splice(i);
            surface._navMesh._addNavMeshLink(cache.id,this.globalStart, this.globalEnd, this._width, this._bidirectional, areaFlag);
        }

        if (ends.length > 0 && starts.length > 0) {
            starts.forEach((value) => {
                this._startNavSurfaces.push(value);
            })

            ends.forEach((value) => {
                this._endNavSurfaces.push(value);
            })

            for (var i = 0, n = starts.length; i < n; i++) {
                for (var j = 0, k = ends.length; j < k; j++) {
                    manager.regNavMeshLink(starts[i], ends[j], this);
                }
            }
        }
    }

    /**@internal */
    getDistance():number{
        return Vector3.distance(this._startPoint,this._endPoint);
    }

    destroy():void{
        this._cacheDatas.forEach(element => {
            element._destroy();
        });
    }
    
}