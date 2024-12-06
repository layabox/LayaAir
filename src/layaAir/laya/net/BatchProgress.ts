export type ProgressCallback = (progress: number) => void;

export interface IBatchProgress {
    readonly itemCount: number;
    createCallback(weight?: number): ProgressCallback;
    update(index: number, progress: number): void;
}

/**
 * @en Represents a batch progress tracker that manages multiple progress items.
 * @zh 表示一个批量进度跟踪器,用于管理多个进度项。
 */
export class BatchProgress implements IBatchProgress {
    private _callback: ProgressCallback;
    private _items: Array<number>;
    private _weights: Array<number>;
    private _progress: number;

    /**
     * @en Creates a new BatchProgress instance.
     * @param callback The callback function to be called when progress updates.
     * @zh 创建一个新的 BatchProgress 实例。
     * @param callback 进度更新时要调用的回调函数。
     */
    constructor(callback: ProgressCallback) {
        this._callback = callback;
        this._items = [];
        this._weights = [];
        this._progress = 0;
    }

    /**
     * @en The number of progress items.
     * @zh 进度项的数量。
     */
    get itemCount() {
        return this._items.length;
    }

    /**
     * @en Resets the progress tracker, clearing all items and weights.
     * @zh 重置进度跟踪器,清除所有项目和权重。
     */
    reset() {
        this._items.length = 0;
        this._weights.length = 0;
        this._progress = 0;
    }

    /**
     * @en Creates a callback function for a new progress item.
     * @param weight The weight of the progress item. Defaults to null.
     * @returns A callback function for updating the progress of this item.
     * @zh 为新的进度项创建一个回调函数。
     * @param weight 进度项的权重。默认为null。
     * @returns 用于更新此项目进度的回调函数。
     */
    createCallback(weight?: number): ProgressCallback {
        let index = this._items.length;
        this._items.push(0);
        if (weight == null)
            this._weights.push(null);
        else
            this._weights.push(Math.max(0, Math.min(weight, 1)));

        return (progress: number) => this.update(index, progress);
    }

    /**
     * @en Updates the progress of a specific item and recalculates the overall progress.
     * @param index The index of the item to update. Use -1 to update overall progress directly.
     * @param value The new progress value (0-1).
     * @zh 更新特定项目的进度并重新计算总体进度。
     * @param index 要更新的项目索引。使用-1直接更新总体进度。
     * @param value 新的进度值(0-1)。
     */
    update(index: number, value: number) {
        if (index != -1) {
            this._items[index] = Math.max(0, Math.min(value, 1));

            let np = 0;
            let col = this._items;
            let ws = this._weights;
            let perc = 1 / col.length;
            for (let i = 0; i < col.length; i++) {
                let p = col[i];
                let w = ws[i];
                if (p != null)
                    np += p * (w != null ? w : perc);
            }
            value = np;
            if (value > 1) value = 1;
        }

        if (value > this._progress) {
            this._progress = value;
            this._callback(value);
        }
    }
}