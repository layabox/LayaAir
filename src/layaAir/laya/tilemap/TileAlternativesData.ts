import { Laya } from "../../Laya";
import { Vector2 } from "../maths/Vector2";
import { DirtyFlagType, TileMapDirtyFlag } from "./TileMapEnum";
import { TileSetCellData } from "./TileSetCellData";
import { TileSetCellGroup } from "./TileSetCellGroup";

export enum TileAnimationMode {
    DEFAULT,
    RANDOM_START_TIMES
}

/**
 * 模板数据 
 * 定义一个 tile 各种样式
 */
export class TileAlternativesData {

    /** @internal */
    _tileDatas: Record<number, TileSetCellData>;

    /** @internal */
    _owner: TileSetCellGroup;

    /** Base Data 瓦片在group中的位置 uint int */
    private _localPos: Vector2;
    /** group中单位大小 uint int */
    private _sizeByAtlas: Vector2;
    /** uv 原点,瓦片正中心的uv值 */
    private _uvOri: Vector2;
    /** uv范围 0- 1 */
    private _uvExtends: Vector2;
    /** 实际区域大小 */
    private _regionSize: Vector2;

    //animator
    private _animation_columns: number = 0;

    private _animation_separation: Vector2 = new Vector2();

    private _animation_speed: number = 1.0;

    private _animationNode: TileAnimationMode;

    private _animationFrams: number[] = [];
    //动画总时间
    private _totalAnimatorTime: number;

    private _animationFramsTime: number[];

    private _frameIndex: number = 0;

    private _animatorUpdateMask: number = 0;

    /** @private */
    nativeId: number;

    /**
     * 格子的位置
     */
    get localPos(): Vector2 {
        return this._localPos;
    }

    set localPos(value: Vector2) {
        this._localPos = value;
    }

    /**
     * 格子的大小
     */
    get sizeByAtlas(): Vector2 {
        return this._sizeByAtlas;
    }
    set sizeByAtlas(value: Vector2) {
        this._sizeByAtlas.setValue(value.x, value.y);
        this._init();
    }

    get owner(): TileSetCellGroup {
        return this._owner;
    }

    set owner(value: TileSetCellGroup) {
        if (value === this._owner) return;
        this._owner = value;
        this._init();
    }

    /**
     * 格子的备份数据IDE todo?
     */
    get tileDatas() {
        return this._tileDatas;
    }

    set tileDatas(value: Record<number, TileSetCellData>) {
        if (this._owner && value) {
            for (let k in value) {
                value[k].__init(this, parseInt(k));
            }
        }
        this._tileDatas = value;
    }

    //animation
    get animation_columns(): number {
        return this._animation_columns;
    }
    set animation_columns(value: number) {
        this._animation_columns = value;
    }

    get animation_separation(): Vector2 {
        return this._animation_separation;
    }
    set animation_separation(value: Vector2) {
        this._animation_separation = value;
    }

    get animation_speed(): number {
        return this._animation_speed;
    }
    set animation_speed(value: number) {
        this._animation_speed = value;
    }

    get animationMode(): TileAnimationMode {
        return this._animationNode;
    }
    set animationMode(value: TileAnimationMode) {
        this._animationNode = value;
    }

    set animationFrams(frams: number[]) {
        if (!frams) frams = [];
        let oldLength = this._animationFrams.length;
        let newLength = frams.length;

        this._animationFrams = frams;
        this._animationFramsTime = [];
        this._animationFramsTime.length = frams.length;
        this._totalAnimatorTime = 0;

        for (var i = 0; i < frams.length; i++) {
            this._animationFramsTime[i] = this._totalAnimatorTime;
            this._totalAnimatorTime += frams[i];
        }

        if (oldLength != newLength && (oldLength > 1 || newLength > 1)) {
            for (let k in this._tileDatas) {
                this._tileDatas[k]._noticeRenderChange();
            }
        }

    }

    get animationFrams() {
        return this._animationFrams;
    }

    constructor() {
        this._localPos = new Vector2();
        this._sizeByAtlas = new Vector2();
        this._uvOri = new Vector2();
        this._uvExtends = new Vector2();
        this._regionSize = new Vector2();
        this._tileDatas = {};
        this._sizeByAtlas.setValue(1, 1);
    }

    /**
     * @internal
     */
    _initialIndexFIrstCellData() {
        const celldata = new TileSetCellData();
        celldata.__init(this, 0);
        this._tileDatas[0] = celldata;
    }

    /**
     * @internal
     */
    _hasAni() {
        return this._animationFrams.length > 1
    }

    /**
     * @internal
     */
    _init() {
        if (!this._owner) {
            return;
        }

        this._owner._getTileUVExtends(this._sizeByAtlas, this._regionSize);
        let atlasSize = this._owner.atlasSize;
        this._uvExtends.x = Math.max(this._regionSize.x - 1, 0) / atlasSize.x;
        this._uvExtends.y = Math.max(this._regionSize.y - 1, 0) / atlasSize.y;

        // this._uvExtends.x = Math.max(this._regionSize.x , 0) / atlasSize.x;
        // this._uvExtends.y = Math.max(this._regionSize.y , 0) / atlasSize.y;
        this._updateOriginUV(0, 0, TileMapDirtyFlag.CELL_QUAD | TileMapDirtyFlag.CELL_QUADUV);

        //update ID
        this.nativeId = this._owner._getGlobalAlternativesId(this._localPos.x, this._localPos.y);
        if (this._tileDatas) {
            for (let k in this._tileDatas) {
                this._tileDatas[k].__init(this, parseInt(k));
            }
        }
    }

    /**
     * @internal
     */
    _updateOriginUV(x: number, y: number, data: number) {
        this._uvOri.setValue(this._localPos.x + x, this._localPos.y + y);
        this._owner._getTilePixelOrgin(this._uvOri, this._uvOri);
        let atlasSize = this._owner.atlasSize;
        this._uvOri.x = (this._uvOri.x + this._regionSize.x * 0.5) / atlasSize.x;
        this._uvOri.y = (this._uvOri.y + this._regionSize.y * 0.5) / atlasSize.y;
        for (let k in this._tileDatas) {
            this._tileDatas[k]._notifyDataChange(data, DirtyFlagType.RENDER);
        }
    }

    /**
     * @internal
     */
    _getTextureUVOri(): Vector2 {
        return this._uvOri;
    }

    /**
     * @internal
     */
    _getTextureUVExtends(): Vector2 {
        return this._uvExtends;
    }

    /**
     * @internal
     */
    _getRegionSize(): Vector2 {
        return this._regionSize;
    }

    /**
     * @internal
     */
    _updateAnimator() {
        //计算动画，如果根据时间动画有偏移 通知所有cellData dirty TILEMAPLAYERDIRTYFLAG.CELL_QUADUV
        //如果animator让uv变了
        if (this._animationFrams.length <= 1 || Laya.timer.currFrame == this._animatorUpdateMask) { return; }
        this._animatorUpdateMask = Laya.timer.currFrame;
        let oldFrameIndex = this._frameIndex;
        let cur = (Laya.timer.totalTime / 1000) * this._animation_speed % this._totalAnimatorTime;

        if (cur < this._animationFramsTime[this._frameIndex]) {
            this._frameIndex = 0;
        }
        let j = 0;
        for (var i = this._frameIndex, n = this._animationFrams.length; i < n; i++) {
            if (cur >= this._animationFramsTime[i]) {
                this._frameIndex = i;
            }
        }
        this._frameIndex += j;

        if (oldFrameIndex == this._frameIndex) {
            return;
        }


        let x;
        let y;
        if (this._animation_columns != 0) {
            x = this._frameIndex % this._animation_columns;
            y = Math.floor(this._frameIndex / this._animation_columns);
        } else {
            x = this._frameIndex;
            y = 0;
        }
        this._updateOriginUV(x * (this._sizeByAtlas.x + this._animation_separation.x), y * (this._sizeByAtlas.y + this._animation_separation.y), TileMapDirtyFlag.CELL_QUADUV);
    }

    getCelldata(index: number): TileSetCellData {
        return this._tileDatas[index];
    }

    removeCellData(index: number) {
        let celldata = this._tileDatas[index];
        if (celldata) {
            celldata.destroy();
            delete this._tileDatas[index];
        }
    }

    addCellData(index: number) {
        let celldata = this._tileDatas[index];
        if (celldata) {
            return celldata;
        }
        celldata = new TileSetCellData();
        celldata.__init(this, index);
        this._tileDatas[index] = celldata;
        return celldata;
    }

    destroy() {
        //TODO
    }

}
