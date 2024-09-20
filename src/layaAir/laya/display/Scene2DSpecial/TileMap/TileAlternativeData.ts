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

    owner: TileSetCellGroup;

    //Base Data
    private _localPos: Vector2;

    private _sizeByAtlas: Vector2;//unit int

    private _uvOri: Vector2;
    private _uvExtends: Vector2;

    //animator
    private _animation_columns: number;

    private _animation_separation: Vector2;

    private _animation_speed: number = 1.0;

    private _animationNode: TtileAnimationMode;

    private _animationFrams: number[];

    private _animationUVOri: Vector2;

    //tileData
    _tileDatas: TileSetCellData[];

    public get localPos(): Vector2 {
        return this._localPos;
    }
    public set localPos(value: Vector2) {
        this._localPos = value;
    }

    public get sizeByAtlas(): Vector2 {
        return this._sizeByAtlas;
    }
    public set sizeByAtlas(value: Vector2) {
        this._sizeByAtlas = value;
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

    constructor(localPos: Vector2, size: Vector2, tileSetGroup: TileSetCellGroup) {
        this._localPos = new Vector2();
        this._sizeByAtlas = new Vector2();
        this._uvOri = new Vector2();
        this._uvExtends = new Vector2();
        this.owner = tileSetGroup;
        localPos.cloneTo(this._localPos);
        size.cloneTo(this._sizeByAtlas);
        this._setOriUV(tileSetGroup._getTileUVOri(localPos), tileSetGroup._getTileUVExtends(this._sizeByAtlas));

    }

    _setOriUV(uvOri: Vector2, uvextend: Vector2) {
        this._uvOri.setValue(uvOri.x + uvextend.x, uvOri.y + uvextend.y);
        this._uvExtends.setValue(uvextend.x, uvextend.y);
        //Update Animator uv

        if (this._tileDatas.length = 1) {
            this._tileDatas[0]._notifyDataChange(TILEMAPLAYERDIRTYFLAG.CELL_QUADUV);
        } else {
            this._tileDatas.forEach(element => {
                element._notifyDataChange(TILEMAPLAYERDIRTYFLAG.CELL_QUADUV);
            });
        }
    }

    _getTextureUVOri(): Vector2 {
        if (this._animation_columns != 0) {
            return this._animationUVOri;//TODO
        } else
            return this._uvOri;
    }

    _getTextureUVExtends(): Vector2 {
        return this._uvExtends;
    }

    _updateAnimator() {
        //计算动画，如果根据时间动画有偏移 通知所有cellData dirty TILEMAPLAYERDIRTYFLAG.CELL_QUADUV
        //如果animator让uv变了
        if (false) {
            if (this._tileDatas.length = 1) {
                this._tileDatas[0]._notifyDataChange(TILEMAPLAYERDIRTYFLAG.CELL_QUADUV);
            } else {
                this._tileDatas.forEach(element => {
                    element._notifyDataChange(TILEMAPLAYERDIRTYFLAG.CELL_QUADUV);
                });
            }
        }
    }

    /**
     * 创建一个副本
     * @returns 
     */
    createCellData() {
        let index = this._tileDatas.length
        let celldata = new TileSetCellData(this, index);
        this._tileDatas.push(celldata);
        return index;
    }

    /**
     * 删除一个副本
     * @param index 
     */
    _removeCellData(index: number) {
        let celldata = this._tileDatas[index];
        if (!celldata) {
            celldata.destroy();
        }
    }

    destroy() {
        //TODO
    }
}
