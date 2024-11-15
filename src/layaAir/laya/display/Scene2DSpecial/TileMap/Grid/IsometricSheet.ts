import { Vector2 } from "../../../../maths/Vector2";
import { BaseSheet } from "./BaseSheet";
export class IsometricSheet extends BaseSheet {
    private _offset: number = 0;
    constructor(_offset: number = 1) {
        super();
        this._offset = _offset;
    }
    protected _initData() {
        this._origMatix.setTo(1, 0, 0, 1, 0.5, 0.5);
        this._ibData = [0, 1, 2, 0, 2, 3];
        this._vbData = [1, 1, 0, 1, 0, 0, 1, 0];
    }

    public piexToGrid(pixelX: number, pixelY: number, out: Vector2) {
        super.piexToGrid(pixelX, pixelY, out);
        let row = Math.round(out.x);
        let col = Math.round(out.y);
        let offx = 0, offy = 0;
        if ((Math.abs(out.x - row) + Math.abs(out.y - col)) > 0.5) {
            out.x < row ? offx = -1 : offx = 0;
            out.y < col ? offy = -1 : offy = 1;
            if (this._offset == -1) {
                offx += 1;
            }
        }
        out.x = row + offx;
        out.y = col * 2 + offy;
    }

    public gridToPiex(row: number, col: number, out: Vector2) {
        row = Math.floor(row);
        col = Math.floor(col);
        if (col & 1) {
            row = row + 0.5 * this._offset;
        }
        super.gridToPiex(row, col * 0.5, out);
    }

    _getChunkSize(rowCount: number, colCount: number, out: Vector2) {
        rowCount = Math.max(rowCount - 1, 0);
        colCount = Math.max(colCount - 1, 0);
        this.gridToPiex(rowCount, colCount, out);
        let endX = this._width;

        if (colCount % 2 == 1) {
            endX += 0.5 * this._width;
        }

        out.x += endX;
        out.y += this._height;
    }

    _getChunkLeftTop(row: number, col: number, rowCount: number, colCount: number, out: Vector2) {
        this.gridToPiex(row, col, out);

        if ((colCount == 1) || (col % 2 == 0)) {
            out.x -= 0.5 * this._width;
        } else {
            out.x -= this._width;
        }
        out.y -= this._height * 0.5;
    }

}