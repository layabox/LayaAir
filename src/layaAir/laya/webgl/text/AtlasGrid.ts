import { Mutable } from "../../../ILaya";

/**
 * @ignore @blueprintIgnore
 */
export interface IAtlasRegion {
    x: number;      // 像素坐标
    y: number;      // 像素坐标
    w: number;      // 像素宽度
    h: number;      // 像素高度
    _cx: number;    // 单元格宽度(格数)
    _cy: number;    // 单元格高度(格数)
}

/**
 * AtlasGrid
 * 仅支持追加分配（allocate），不支持 free。
 * 按行线性排布块，避免复杂的空洞搜索逻辑，适用于：
 * - 字形缓存、UI 小图标等典型“只追加很少回收”的图集；
 * - 需要极致分配性能但可以接受一定空间浪费的场景。
 * @ignore @blueprintIgnore
 */
export class AtlasGrid {
    readonly atlasWidth: number;
    readonly atlasHeight: number;
    readonly cellSize: number;
    readonly cols: number;
    readonly rows: number;
    readonly totalCells: number;
    readonly freeCells: number;

    // 每一列当前“堆叠”的高度（单位：格子数）
    private columnHeights: Uint8Array;

    // atlasWidth / cellSize 不能超过255，否则 Uint8Array 不够用。
    // 一般atlasWidth=2048,cellSize=16, 则 cols=128，是够用的。
    constructor(atlasWidth: number, atlasHeight: number, cellSize: number) {
        this.atlasWidth = atlasWidth;
        this.atlasHeight = atlasHeight;
        this.cellSize = cellSize;
        this.cols = Math.floor(this.atlasWidth / this.cellSize);
        this.rows = Math.floor(this.atlasHeight / this.cellSize);
        this.freeCells = this.totalCells = this.cols * this.rows;
        this.columnHeights = new Uint8Array(this.cols);
    }

    /**
     * 仅追加分配：按行从左到右排满，再换到下一行。
     * 不考虑空洞与碎片，因此时间复杂度为 O(1)。
     */
    allocate(widthPx: number, heightPx: number): IAtlasRegion | null {
        if (widthPx <= 0 || heightPx <= 0) return null;

        const cs = this.cellSize;
        const cw = Math.ceil(widthPx / cs);
        const ch = Math.ceil(heightPx / cs);
        if (cw <= 0 || ch <= 0) return null;
        if (cw > this.cols || ch > this.rows) return null;

        const cols = this.cols;
        const rows = this.rows;
        const heights = this.columnHeights;

        let bestCol = -1;
        let bestHeight = Number.MAX_SAFE_INTEGER;

        // 简单启发式：在所有起点列中选择“区间内最大高度”最小的那个
        outer: for (let c = 0; c <= cols - cw; c++) {
            let maxH = 0;
            for (let cc = c; cc < c + cw; cc++) {
                const hCol = heights[cc];
                if (hCol > maxH) maxH = hCol;
                // 如果这个区间已经不可能放下，提前跳过
                if (maxH + ch > rows) {
                    continue outer;
                }
            }
            if (maxH < bestHeight) {
                bestHeight = maxH;
                bestCol = c;
                if (bestHeight === 0) break; // 找到完美位置，直接退出
            }
        }

        if (bestCol < 0) return null;

        const x = bestCol * cs;
        const y = bestHeight * cs;

        // 更新列高度与总使用格子数
        const newH = bestHeight + ch;
        for (let cc = bestCol; cc < bestCol + cw; cc++) {
            const oldH = heights[cc];
            heights[cc] = newH;
            (<Mutable<this>>this).freeCells -= (newH - oldH);
        }

        const region: IAtlasRegion = {
            x,
            y,
            w: cw * cs,
            h: ch * cs,
            _cx: cw,
            _cy: ch
        };

        return region;
    }

    /**
     * 重置为初始状态，方便基准测试或重建图集。
     */
    reset(): void {
        if (this.freeCells === this.totalCells) return;
        this.columnHeights.fill(0);
        (<Mutable<this>>this).freeCells = this.totalCells;
    }
}
