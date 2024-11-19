import { Vector2 } from "../../../maths/Vector2";
import { TILEMAPLAYERDIRTYFLAG } from "./TileMapLayer";
import { TileSetCellData } from "./TileSetCellData";
import { TileSetCellGroup } from "./TileSetCellGroup";

export enum TtileAnimationMode {
    DEFAULT,
    RANDOM_START_TIMES
}

//模板数据

export class TileAlternativesData {

    private _owner: TileSetCellGroup;

    //tileData
    _tileDatas: Record<number, TileSetCellData>;

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

    private _animationNode: TtileAnimationMode;

    private _animationFrams: number[];

    //记录动画总时间数量；方便计算动画
    private _animationRunTime: number = 0;
    private _frameIndex: number = 0;


    /**
     * 格子的位置
     */
    public get localPos(): Vector2 {
        return this._localPos;
    }
    public set localPos(value: Vector2) {
        this._localPos = value;
    }

    /**
     * 格子的大小
     */
    public get sizeByAtlas(): Vector2 {
        return this._sizeByAtlas;
    }
    public set sizeByAtlas(value: Vector2) {
        this._sizeByAtlas.setValue(value.x, value.y);
        this._setOriUV();
    }

    /**
     * 格子的备份数据
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
    public get animation_columns(): number {
        return this._animation_columns;
    }
    public set animation_columns(value: number) {
        this._animation_columns = value;
    }

    public get animation_separation(): Vector2 {
        return this._animation_separation;
    }
    public set animation_separation(value: Vector2) {
        this._animation_separation = value;
    }

    public get animation_speed(): number {
        return this._animation_speed;
    }
    public set animation_speed(value: number) {
        this._animation_speed = value;
    }

    public get animationNode(): TtileAnimationMode {
        return this._animationNode;
    }
    public set animationNode(value: TtileAnimationMode) {
        this._animationNode = value;
    }

    public set animationFrams(frams: number[]) {
        this._animationFrams = frams;
    }

    public get animationFrams() {
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

        const celldata = new TileSetCellData();
        celldata.__init(this, 0);
        this._tileDatas[0] = celldata;

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

    public getId(): number {
        return this.owner._getGlobalAlternativesId(this.localPos.x, this.localPos.y);
    }


    _setOriUV() {
        if (!this._owner) {
            return;
        }
        this._owner._getTileUVExtends(this._sizeByAtlas, this._uvSize);
        let atlasSize = this._owner.atlasSize;
        this._uvExtends.x = this._uvSize.x / atlasSize.x;
        this._uvExtends.y = this._uvSize.y / atlasSize.y;
        this._updateOriginUV(0, 0, TILEMAPLAYERDIRTYFLAG.CELL_QUAD | TILEMAPLAYERDIRTYFLAG.CELL_QUADUV);
        this._owner._owner._addAnimatrionData(this);
    }


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

    _getTextureUVOri(): Vector2 {
        return this._uvOri;
    }

    _getTextureUVExtends(): Vector2 {
        return this._uvExtends;
    }

    _getTextureUVSize(): Vector2 {
        return this._uvSize;
    }

    _updateAnimator(time: number) {
        //计算动画，如果根据时间动画有偏移 通知所有cellData dirty TILEMAPLAYERDIRTYFLAG.CELL_QUADUV
        //如果animator让uv变了
        if (this._animationFrams.length === 0) { return; }
        this._animationRunTime += time;
        let curFrameTime = this._animationFrams[this._frameIndex];
        if (this._animationRunTime < curFrameTime) { return; }

        this._animationRunTime -= curFrameTime;
        this._frameIndex++;
        if (this._frameIndex >= this._animationFrams.length) {
            this._frameIndex = 0;
        }
        let x = this._frameIndex % this._animation_columns;
        let y = Math.floor(this._frameIndex / this._animation_columns);
        this._updateOriginUV(x * (1 + this._animation_separation.x), y * (1 + this._animation_separation.y), TILEMAPLAYERDIRTYFLAG.CELL_QUADUV);
    }


    public getCelldata(index: number): TileSetCellData {
        return this._tileDatas[index];
    }



    /**
     * 删除一个副本
     * @param index 
     */
    _removeCellData(index: number): TileSetCellData {
        let celldata = this._tileDatas[index];
        if (!celldata) {
            celldata.destroy();
        }
        delete this._tileDatas[index];
        return celldata;
    }

    destroy() {
        //TODO
    }



}
