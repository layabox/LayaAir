import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Vector3 } from "../../../maths/Vector3";
import { Handler } from "../../../utils/Handler";
import { BaseNavMeshSurface } from "../component/BaseNavMeshSurface";

const helpTempSet: Set<number> = new Set<number>();

/**
 * @internal
 * 存储缓存数据
 * 当数据有修改的时候;会调用对应的方法进行更新。
 */
export class CacheData {
    public static TransfromFlag: number = 1;
    public static AreaFlag: number = 2;
    public static MinFlag: number = 4;
    public static MaxFlag: number = 8;
    public static DataFlag: number = 16;
    public static DeleteFlag: number = 32;
    public static OtherDataFlag: number = 64;
    public static ResetDataFlag: number = 128;

    /**@internal */
    protected _cacheflag: number = 0;
    /**@internal */
    protected _areaFlag: string;
    /**@internal */
    protected _data: any;
    /**@internal */
    _surface: BaseNavMeshSurface;
    /**@internal */
    _transfrom: Matrix4x4 = new Matrix4x4();
    /**@internal */
    _min: Vector3 = new Vector3();
    /**@internal */
    _max: Vector3 = new Vector3();

    /**@internal */
    _titleIndex: Set<number>;
    /**@internal */
    _flagChangeHander: Handler;
    /**@internal */
    _tileHander: Handler;
    /**@internal */
    id: number;
    /**@internal */
    constructor(surface: BaseNavMeshSurface) {
        this._surface = surface;
        this._titleIndex = new Set<number>();
    }

    /**@internal */
    _setUpdateDataHander(handler: Handler) {
        this._flagChangeHander = handler;
    }

    /**@internal */
    _setTileHander(handler: Handler) {
        this._tileHander = handler;
    }

    /**@internal */
    _updateTransfrom(mat: Matrix4x4) {
        if (mat.equalsOtherMatrix(this._transfrom)) return;
        mat.cloneTo(this._transfrom);
        this._setCacheFlag(CacheData.TransfromFlag);
    }

    /**@internal */
    _updateAreaFlag(flag: string) {
        if (this._areaFlag == flag) return;
        this._areaFlag = flag;
        this._setCacheFlag(CacheData.AreaFlag);
    }

    /**@internal */
    get areaFlag(): string {
        return this._areaFlag;
    }

    /**@internal */
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

    /**@internal */
    set _cacheData(data: any) {
        if (this._data == data) return;
        this._data = data;
        this._setCacheFlag(CacheData.DataFlag);
    }

    /**@internal */
    get _cacheData(): any {
        return this._data;
    }

    /**@internal */
    _destroy() {
        this._setCacheFlag(CacheData.DeleteFlag);
    }

    /**@internal */
    _setCacheFlag(type: number): void {
        this._cacheflag |= type;
        this._surface._delayCacheMap.add(this);
    }

    /**@internal */
    _getCacheFlag(type: number): boolean {
        return (this._cacheflag & type) != 0;
    }

    /**@internal */
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
        let index = this._surface._navMesh.navTileGrid.getBoundTileIndex(this._min, this._max, false);
        index.forEach((index) => {
            helpTempSet.add(index);
            this._surface._buildTileList.add(index);
        });

        if (this._tileHander) this._tileHander.runWith([this, this._titleIndex, helpTempSet]);
        this._titleIndex.clear();
        helpTempSet.forEach((index) => {
            this._titleIndex.add(index);
        });
        this._cacheflag = 0;
    }

    /**@internal */
    _resetData() {
        this._titleIndex.clear();
        this._setCacheFlag(CacheData.ResetDataFlag);
    }
}

