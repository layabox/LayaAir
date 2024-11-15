
import { Vector2 } from "../../../maths/Vector2";
import { Vector3 } from "../../../maths/Vector3";
import { Grid } from "./Grid/Grid";

/**
 * @internal
 * TileMapChunk 瓦片地图块与渲染块之间的转换
 * 因为瓦片地图是无限的；因此 Chunk 也是无限的；
 * 瓦块的坐标是相对原点的，而一个Chunk的坐标是相对于瓦块的;
 * 一个Chunk 内部的单元格索引从左到右，从上到下计算
 */
export class TileMapChunk {
    private _pixexToCell: Grid;
    private _chunkWidth: number;
    private _chunkHeight: number;
    private _maxCell: number;
    constructor(grid: Grid) {
        this._pixexToCell = grid;
        this._maxCell = 0;
        this.setChunkSize(1, 1);
    }

    /**
     * 设置chunk的宽高
     * @param width 设置块的列数
     * @param height 设置块的行数
     */
    public setChunkSize(width: number, height: number) {
        this._chunkWidth = width;
        this._chunkHeight = height;
        this._maxCell = width * height;
    }

    /**
     * 获得一个块内格子的最大数量
     */
    public get maxCell(): number {
        return this._maxCell;
    }

    /**
     * 将像素单位转换为chunk索引
     * @param x  像素单位x
     * @param y  像素单位y
     * @param out 输出 x chunk列坐标 y chunk行坐标 z Chunk内部索引
     */
    public getChunkPosByPiexl(piexlx: number, piexly: number, out: Vector3) {
        const tempPoint = new Vector2();
        this._pixexToCell.piexToGrid(piexlx, piexly, tempPoint);
        this.getChunkPosByCell(Math.round(tempPoint.x), Math.round(tempPoint.y), out);
    }

    /**
     * 将cell坐标转换为块的信息
     * @param x 单元格x索引
     * @param y 单元格y索引
     * @param out 输出 x chunk列坐标 y chunk行坐标 z Chunk内部索引
     */
    public getChunkPosByCell(cellRow: number, cellCol: number, out: Vector3) {
        out.x = Math.floor(cellRow / this._chunkWidth);
        out.y = Math.floor(cellCol / this._chunkHeight);
        out.z = this.getChunkIndexByCellPos(cellRow, cellCol);
    }

    /**
     * 获得cell 在chunk内部的索引 从第一行第一列开始计数，从左到右，从上到下计算
     * @param cellRow 单元格的列索引
     * @param cellCol 单元格的行索引
     * @returns 单元格在chunk内部的索引 
     */
    public getChunkIndexByCellPos(cellRow: number, cellCol: number):number {
        return (cellRow % this._chunkWidth) + (cellCol % this._chunkHeight) * this._chunkWidth;
    }


    /**
     * 通过块的行列索引和块内部的索引获得单元格的行列索引
     * @param chunkx 块的列索引
     * @param chunky 块的行索引
     * @param index 块内部的索引
     * @param out 输出单元格的行列索引
     */
    public getCellPosByChunkPosAndIndex(chunkx: number, chunky: number, index: number, out: Vector2) {
        chunkx = Math.floor(chunkx);
        chunky = Math.floor(chunky);
        index = index % this._maxCell;
        out.x = chunkx * this._chunkWidth + index % this._chunkWidth;
        out.y = chunky * this._chunkHeight + Math.floor(index / this._chunkWidth);
    }


    /**
     * 获得快的像素宽高
     * @param out 输出块的像素宽高
     */
    public getChunkSize(out: Vector2){
        let basesheet = this._pixexToCell._sheet;
        basesheet._getChunkSize(this._chunkWidth, this._chunkHeight, out);
    }

    
    /**
     * 获得块的左上角像素坐标
     */
    public getChunkLeftTop(chunkx: number, chunky: number, out: Vector2) {
        let basesheet = this._pixexToCell._sheet;
        basesheet._getChunkLeftTop(chunkx, chunky,this._chunkWidth, this._chunkHeight, out);
    }

}