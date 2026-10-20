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
    private _regisgMaps: Array<[BaseNavMeshSurface, BaseNavMeshSurface]>;

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
        if(value !== this._startPoint && Vector3.equals(this._startPoint,value))
            return;
        value.cloneTo(this._startPoint);
        this._updateData(CacheData.DataFlag);
    }

    public _updateEndPoint(value:Vector3):void{
        if(value !== this._endPoint && Vector3.equals(this._endPoint,value))
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
        this.destroy();
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
        // Bounds schedule both old and new endpoint tiles, including links far from the origin.
        Vector3.min(this.globalStart, this.globalEnd, this._min);
        Vector3.max(this.globalStart, this.globalEnd, this._max);
        this._min.x -= this._width;
        this._min.z -= this._width;
        this._max.x += this._width;
        this._max.z += this._width;
        cache._cacheBound(this._min, this._max);
        const surface = cache._surface;
        surface._navMesh._addNavMeshLink(cache.id, this.globalStart, this.globalEnd, this._width, this._bidirectional, areaFlag);
        this._clearRegistrations();
        const manager = surface._manager;
        const starts = manager.getNavMeshSurfaces(this.globalStart).filter(s => s.agentType === this.agentType);
        const ends = manager.getNavMeshSurfaces(this.globalEnd).filter(s => s.agentType === this.agentType);
        this._startNavSurfaces = starts;
        this._endNavSurfaces = ends;
        for (const start of starts) for (const end of ends) {
            if (start === end) continue;
            manager.regNavMeshLink(start, end, this);
            this._regisgMaps.push([start, end]);
        }
    }

    private _clearRegistrations(): void {
        for (const [start, end] of this._regisgMaps) start._manager.removeMeshLink(start, end, this);
        this._regisgMaps.length = 0;
        this._startNavSurfaces.length = 0;
        this._endNavSurfaces.length = 0;
    }

    /**@internal */
    getDistance():number{
        return Vector3.distance(this._startPoint,this._endPoint);
    }

    destroy():void{
        this._clearRegistrations();
        this._cacheDatas.forEach(element => element._surface._removeModifileLink(this));
        this._cacheDatas.length = 0;
    }
    
}