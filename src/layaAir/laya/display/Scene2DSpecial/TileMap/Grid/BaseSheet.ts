import { Matrix } from "../../../../maths/Matrix";
import { Vector2 } from "../../../../maths/Vector2";
import { TileMapUtils } from "../TileMapUtils";


export class BaseSheet {
    protected _origMatix: Matrix;
    protected _matrix: Matrix;
    protected _reverseMatrix: Matrix;
    protected _width: number = 0;
    protected _height: number = 0;
    protected _vbData: number[] = [];
    protected _ibData: number[] = [];

    constructor() {
        this._matrix = new Matrix();
        this._origMatix = new Matrix();
        this._reverseMatrix = new Matrix();
        this._initData();
        this.setTileSize(1, 1);
    }

    // 像素转格子的矩阵
    getMatrix(): Matrix { return this._matrix; }

    // 格子转像素的矩阵
    getInverseMatrix(): Matrix { return this._reverseMatrix; }

    // 格子宽度
    getTileWidth(): number { return this._width; }

    // 格子高度
    getTileHeight(): number { return this._height; }

    protected _initData() {

    }

    /**
     * 设置格子大小
     * @param width 每个格子的宽度 
     * @param height 每个格子的高度
     */
    public setTileSize(width: number, height: number) {
        if (width < 1 || height < 1) console.error(" value must bigger than 1.");
        if (this._width == width && this._height == height) return;
        this._width = width;
        this._height = height;

        //计算格子转像素的矩阵
        this._matrix.setTo(this._width, 0, 0, this._height, 0, 0);
        Matrix.mul(this._origMatix, this._matrix, this._matrix);
        //计算像素转格子的矩阵
        this._matrix.copyTo(this._reverseMatrix);
        this._reverseMatrix.invert();
    }
    public getvbs(): number[] { return this._vbData; }

    public getibs(): number[] { return this._ibData; }


    /**
     * 像素系统转格子系统
     */
    public pixelToGrid(pixelx: number, pixely: number, out: Vector2) {
        TileMapUtils.transfromPointByValue(this._reverseMatrix, pixelx, pixely, out);
    }

    /**
     * 格子系统转像素系统
     */
    public gridToPiex(row: number, col: number, out: Vector2) {
        TileMapUtils.transfromPointByValue(this._matrix, row, col, out);
    }

    /**
     * @internal
     * 计算chunk的大小,内部方法。不对用户开发
     * @param rowCount chunk的宽度
     * @param colCount chunk的高度
     * @param out 输出的Vector2
     */
    _getChunkSize(rowCount: number, colCount: number, out: Vector2) {}

    /**
     * @internal
     * 计算 chunk 左上角的坐标,内部方法。不对用户开发
     * @param row 
     * @param col 
     * @param rowCount 
     * @param colCount 
     * @param out 
     */
    _getChunkLeftTop(row: number, col: number,rowCount:number,colCount:number, out: Vector2){}

}