import { Point } from "../../maths/Point"

// 注意长宽都不要超过256，一个是影响效率，一个是超出表达能力
export class AtlasGrid {
    atlasID: number = 0;
    private _width: number = 0;
    private _height: number = 0;
    private _texCount: number = 0;
    private _rowInfo: Uint8Array = null;		// 当前行的最大长度
    private _cells: Uint8Array = null;		// 每个格子的信息。{type,w,h} 相当于一个距离场. type =0 表示空闲的。不为0的情况下填充的是宽高（有什么用呢）
    _used: number = 0;				// 使用率

    // TODO type 是否有用

    //------------------------------------------------------------------------------
    constructor(width: number = 0, height: number = 0, id: number = 0) {
        this._cells = null;
        this._rowInfo = null;
        this.atlasID = id;
        this._init(width, height);
    }

    //------------------------------------------------------------------
    addRect(type: number, width: number, height: number, pt: Point): boolean {
        //调用获得应该放在哪 返回值有三个。。bRet是否成功，nX x位置，nY y位置
        if (!this._get(width, height, pt))
            return false;
        //根据获得的x,y填充
        this._fill(pt.x, pt.y, width, height, type);
        this._texCount++;
        //返回是否成功，以及X位置和Y位置
        return true;
    }

    //------------------------------------------------------------------------------
    private _release(): void {
        this._cells = null;
        this._rowInfo = null;
    }

    //------------------------------------------------------------------------------
    private _init(width: number, height: number): boolean {
        this._width = width;
        this._height = height;
        this._release();
        if (this._width == 0) return false;
        this._cells = new Uint8Array(this._width * this._height * 3);
        this._rowInfo = new Uint8Array(this._height);
        this._used = 0;
        this._clear();
        return true;
    }

    //------------------------------------------------------------------
    private _get(width: number, height: number, pt: Point): boolean {
        if (width > this._width || height > this._height) {
            return false;
        }
        //定义返回的x,y的位置
        var rx: number = -1;
        var ry: number = -1;
        //为了效率先保存临时变量
        var nWidth: number = this._width;
        var nHeight: number = this._height;
        //定义一个变量为了指向 m_pCells
        var pCellBox: Uint8Array = this._cells;

        //遍历查找合适的位置  //TODO 下面的方法应该可以优化
        for (var y: number = 0; y < nHeight; y++) {
            //如果该行的空白数 小于 要放入的宽度返回
            if (this._rowInfo[y] < width) continue;
            for (var x: number = 0; x < nWidth;) {

                var tm: number = (y * nWidth + x) * 3;

                if (pCellBox[tm] != 0 || pCellBox[tm + 1] < width || pCellBox[tm + 2] < height) {
                    x += pCellBox[tm + 1];
                    continue;
                }
                rx = x;
                ry = y;
                // 检查当前宽度是否能完全放下，即x方向的每个位置都有足够的高度。
                for (var xx: number = 0; xx < width; xx++) {
                    if (pCellBox[3 * xx + tm + 2] < height) {
                        rx = -1;
                        break;
                    }
                }
                // 不行就x继续前进
                if (rx < 0) {
                    x += pCellBox[tm + 1];
                    continue;
                }
                // 找到了
                pt.x = rx;
                pt.y = ry;
                return true;
            }
        }
        return false;
    }

    //------------------------------------------------------------------
    private _fill(x: number, y: number, w: number, h: number, type: number): void {
        //定义一些临时变量
        var nWidth: number = this._width;
        var nHeghit: number = this._height;
        //代码检查
        this._check((x + w) <= nWidth && (y + h) <= nHeghit);

        //填充
        for (var yy: number = y; yy < (h + y); ++yy) {
            this._check(this._rowInfo[yy] >= w);
            this._rowInfo[yy] -= w;
            for (var xx: number = 0; xx < w; xx++) {
                var tm: number = (x + yy * nWidth + xx) * 3;
                this._check(this._cells[tm] == 0);
                this._cells[tm] = type;
                this._cells[tm + 1] = w;
                this._cells[tm + 2] = h;
            }
        }
        //调整我左方相邻空白格子的宽度连续信息描述
        if (x > 0) {
            for (yy = 0; yy < h; ++yy) {
                // TODO 下面应该可以优化
                var s: number = 0;
                for (xx = x - 1; xx >= 0; --xx, ++s) {
                    if (this._cells[((y + yy) * nWidth + xx) * 3] != 0) break;
                }
                for (xx = s; xx > 0; --xx) {
                    this._cells[((y + yy) * nWidth + x - xx) * 3 + 1] = xx;
                    this._check(xx > 0);
                }
            }
        }
        //调整我上方相邻空白格子的高度连续信息描述
        if (y > 0) {
            for (xx = x; xx < (x + w); ++xx) {
                // TODO 下面应该可以优化
                s = 0;
                for (yy = y - 1; yy >= 0; --yy, s++) {
                    if (this._cells[(xx + yy * nWidth) * 3] != 0) break;
                }
                for (yy = s; yy > 0; --yy) {
                    this._cells[(xx + (y - yy) * nWidth) * 3 + 2] = yy;
                    this._check(yy > 0);
                }
            }
        }

        this._used += (w * h) / (this._width * this._height);
    }

    private _check(ret: boolean): void {
        if (ret == false) {
            console.log("xtexMerger 错误啦");
        }
    }

    //------------------------------------------------------------------
    private _clear(): void {
        this._texCount = 0;
        for (var y: number = 0; y < this._height; y++) {
            this._rowInfo[y] = this._width;
        }
        for (var i: number = 0; i < this._height; i++) {
            for (var j: number = 0; j < this._width; j++) {
                var tm: number = (i * this._width + j) * 3;
                this._cells[tm] = 0;
                this._cells[tm + 1] = this._width - j;
                this._cells[tm + 2] = this._width - i;
            }
        }
    }
    //------------------------------------------------------------------
}


