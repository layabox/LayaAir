import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Vector3 } from "../../../maths/Vector3";
import { Handler } from "../../../utils/Handler";
import { BaseNavMeshSurface } from "../component/BaseNavMeshSurface";

const helpTempSet: Set<number> = new Set<number>();
export class CacheData {
    public static TransfromFlag: number = 1;
    public static AreaFlag: number = 2;
    public static MinFlag: number = 4;
    public static MaxFlag: number = 8;
    public static DataFlag: number = 16;
    public static DeleteFlag: number = 32;
    public static OtherDataFlag:number = 64;
    public static ResetDataFlag:number = 128;
    protected _cacheflag: number = 0;
    _surface: BaseNavMeshSurface;
    protected _areaFlag: string;
    _transfrom: Matrix4x4 = new Matrix4x4();
    _min: Vector3 = new Vector3();
    _max: Vector3 = new Vector3();

    public id: number;

    //缓存的title索引
    _titleIndex: Set<number>;
    protected _data: any;
    _flagChangeHander: Handler;
    _tileHander: Handler;
    constructor(surface: BaseNavMeshSurface) {
        this._surface = surface;
        this._titleIndex = new Set<number>();
    }

    setUpdateDataHander(handler: Handler) {
        this._flagChangeHander = handler;
    }

    setTileHander(handler: Handler) {
        this._tileHander = handler;
    }


    _updateTransfrom(mat: Matrix4x4) {
        if (mat.equalsOtherMatrix(this._transfrom)) return;
        mat.cloneTo(this._transfrom);
        this._setCacheFlag(CacheData.TransfromFlag);
    }

    _updateAreaFlag(flag: string) {
        if (this._areaFlag == flag) return;
        this._areaFlag = flag;
        this._setCacheFlag(CacheData.AreaFlag);
    }

    get areaFlag(): string {
        return this._areaFlag;
    }

    _cacheBound(min: Vector3, max: Vector3) {
        if (!Vector3.equals(this._min, min)) {
            min.cloneTo(this._min);
            this._setCacheFlag(CacheData.MinFlag);
        }
        if (!Vector3.equals(this._max, max)) {
            max.cloneTo(this._max);
            this._setCacheFlag(CacheData.MaxFlag);
        }
    }

    _cacheData(data: any) {
        if (this._data == data) return;
        this._data = data;
        this._setCacheFlag(CacheData.DataFlag);
    }

    get cacheData(): any {
        return this._data;
    }

    _destroy() {
        this._setCacheFlag(CacheData.DeleteFlag);
    }

    _setCacheFlag(type: number): void {
        this._cacheflag |= type;
        this._surface._delayCacheMap.add(this);
    }

    _getCacheFlag(type: number): boolean {
        return (this._cacheflag & type) != 0;
    }

    _updateCache(): void {
        if (this._cacheflag == 0) return;
        this._titleIndex.forEach((index) => {
            this._surface._buildTileList.add(index);
        });

        if (this._getCacheFlag(CacheData.DeleteFlag)) {
            this._cacheflag = 0;
            return;
        }
        let flags = this._surface._manager.getArea(this._areaFlag);
        if (this._flagChangeHander) this._flagChangeHander.runWith([this, flags.index]);
        helpTempSet.clear();
        this._surface.navMesh.navTileGrid.getUpdateTileIndexs(this._min, this._max, false, helpTempSet);
        helpTempSet.forEach((index) => {
            this._surface._buildTileList.add(index);
        });

        if(this._tileHander) this._tileHander.runWith([this,this._titleIndex, helpTempSet]);
        this._titleIndex.clear();
        helpTempSet.forEach((index) => {
            this._surface._buildTileList.add(index);
            this._titleIndex.add(index);
        });
        this._cacheflag = 0;
    }

    _resetData(){
        this._titleIndex.clear();
        this._setCacheFlag(CacheData.ResetDataFlag);
    }
}

