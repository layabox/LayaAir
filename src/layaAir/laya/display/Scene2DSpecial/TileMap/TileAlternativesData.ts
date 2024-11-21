import { Laya } from "../../../../Laya";
import { Vector2 } from "../../../maths/Vector2";
import { TILEMAPLAYERDIRTYFLAG } from "./TileMapLayer";
import { TileSetCellData } from "./TileSetCellData";
import { TileSetCellGroup } from "./TileSetCellGroup";

export enum TileAnimationMode {
    DEFAULT,
    RANDOM_START_TIMES
}

//模板数据
export class TileAlternativesData {

    //tileData
    _tileDatas: Record<number, TileSetCellData>;

    private _owner: TileSetCellGroup;

    //Base Data
    private _localPos: Vector2;

    private _sizeByAtlas: Vector2;//unit int

    private _uvOri: Vector2;

    private _uvExtends: Vector2;

    private _uvSize: Vector2;

    //animator
    private _animation_columns: number = 0;

    private _animation_separation: Vector2 = new Vector2();

    private _animation_speed: number = 1.0;

    private _animationNode: TileAnimationMode;

    private _animationFrams: number[];
    //动画总时间
    private _totalAnimatorTime: number;

    private _animationFramsTime: number[];

    private _frameIndex: number = 0;

    private _animatorUpdateMask: number = 0;

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
        this._setOriUV();
    }

    get owner(): TileSetCellGroup {
        return this._owner;
    }

    set owner(value: TileSetCellGroup) {
        if (value === this._owner) return;
        this._owner = value;
        this._setOriUV();
    }

    /**
     * 格子的备份数据IDE todo?
     */
    get tileDatas() {
        return this._tileDatas;
    }
    set tileDatas(value: Record<number, TileSetCellData>) {
        if (value) {
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
        this._animationFrams = frams;
        this._animationFramsTime = [];
        this._animationFramsTime.length = frams.length;
        this._totalAnimatorTime = 0;

        for (var i = 0; i < frams.length; i++) {
            this._animationFramsTime[i] = this._totalAnimatorTime;
            this._totalAnimatorTime += frams[i];
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
        this._uvSize = new Vector2();
        this._animationFrams = [];
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
    _setOriUV() {
        if (!this._owner) {
            return;
        }
        this._owner._getTileUVExtends(this._sizeByAtlas, this._uvSize);
        let atlasSize = this._owner.atlasSize;
        this._uvExtends.x = this._uvSize.x / atlasSize.x;
        this._uvExtends.y = this._uvSize.y / atlasSize.y;
        this._updateOriginUV(0, 0, TILEMAPLAYERDIRTYFLAG.CELL_QUAD | TILEMAPLAYERDIRTYFLAG.CELL_QUADUV);
    }

    /**
     * @internal
     */
    _updateOriginUV(x: number, y: number, data: number) {
        this._uvOri.setValue(this.localPos.x + x, this.localPos.y + y);
        this._owner._getTileUVOri(this._uvOri, this._uvOri);
        let atlasSize = this._owner.atlasSize;
        this._uvOri.x = (this._uvOri.x + this._uvSize.x * 0.5) / atlasSize.x;
        this._uvOri.y = (this._uvOri.y + this._uvSize.y * 0.5) / atlasSize.y;
        for (let k in this._tileDatas) {
            this._tileDatas[k]._notifyDataChange(data);
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
    _getTextureUVSize(): Vector2 {
        return this._uvSize;
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
        let cur = (Laya.timer.totalTime / 1000) % this._totalAnimatorTime;

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
        this._updateOriginUV(x * (this._sizeByAtlas.x + this._animation_separation.x), y * (this._sizeByAtlas.y + this._animation_separation.y), TILEMAPLAYERDIRTYFLAG.CELL_QUADUV);
    }

    getId(): number {
        return this.owner._getGlobalAlternativesId(this.localPos.x, this.localPos.y);
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
        this._tileDatas
        celldata.__init(this, index);
        this._tileDatas[index] = celldata;
        return celldata;
    }

    destroy() {
        //TODO
    }

}
