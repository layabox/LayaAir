import { Vector2 } from "../../../../maths/Vector2";
import { BaseSheet } from "./BaseSheet";

export class HeixSheet extends BaseSheet {
    private _offset: number = 0;
    constructor(_offset: number = -1) {
        super();
        this._offset = _offset;
    }

    protected _initData() {
        this._origMatix.setTo(1, 0, 0.5, 0.75, 0.5, 0.5);
        this._ibData = [0, 1, 2, 0, 2, 3];
        this._vbData = [1, 1, 0, 1, 0, 0, 1, 0];
    }

    private prixToGrid(out: Vector2, offset: number) {
        const q: number = out.x;
        const r: number = out.y;
        const s: number = -q - r;
        var qi = Math.round(q);
        var ri = Math.round(r);
        var si = Math.round(s);

        var q_diff = Math.abs(qi - q);
        var r_diff = Math.abs(ri - r);
        var s_diff = Math.abs(si - s);
        if (q_diff > r_diff && q_diff > s_diff) {
            qi = -ri - si;
        }
        else if (r_diff > s_diff) {
            ri = -qi - si;
        }
        out.x = qi + (ri + offset * (ri & 1)) / 2;
        out.y = ri;
    }


    public pixelToGrid(pixelX: number, pixelY: number, out: Vector2) {
        super.pixelToGrid(pixelX, pixelY, out);
        this.prixToGrid(out, this._offset);
    }

    public gridToPiex(row: number, col: number, out: Vector2) {
        row = row - (col + this._offset * (col & 1)) / 2;
        super.gridToPiex(row, col, out);
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