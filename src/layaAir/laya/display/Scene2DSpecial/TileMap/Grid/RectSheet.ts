import { Vector2 } from "../../../../maths/Vector2";
import { BaseSheet } from "./BaseSheet";

export class RectSheet extends BaseSheet {

    constructor() {
        super();
    }
    protected _initData() {
        this._origMatix.setTo(1, 0, 0, 1, 0.5, 0.5);
        this._ibData = [0, 1, 2, 0, 2, 3];
        this._vbData = [1, 1, 0, 1, 0, 0, 1, 0];
    }

    public gridToPiex(row: number, col: number, out: Vector2) {
        super.gridToPiex(row, col, out);
        out.x = Math.round(out.x);
        out.y = Math.round(out.y);
    }


    _getChunkSize(rowCount: number, colCount: number, out: Vector2) {
        rowCount = Math.max(rowCount - 1, 0);
        colCount = Math.max(colCount - 1, 0);
        this.gridToPiex(rowCount, colCount, out);
        out.x += this._width;
        out.y += this._height;
    }

    _getChunkLeftTop(row: number, col: number, rowCount: number, colCount: number, out: Vector2) {
        this.gridToPiex(row, col, out);
        out.x -= this._width * 0.5;
        out.y -= this._height * 0.5;
    }

}