export type ProgressCallback = (progress: number) => void;

export interface IBatchProgress {
    readonly itemCount: number;
    createCallback(weight?: number): ProgressCallback;
    update(index: number, progress: number): void;
}

export class BatchProgress implements IBatchProgress {
    private _callback: ProgressCallback;
    private _items: Array<number>;
    private _weights: Array<number>;
    private _progress: number;

    constructor(callback: ProgressCallback) {
        this._callback = callback;
        this._items = [];
        this._weights = [];
        this._progress = 0;
    }

    get itemCount() {
        return this._items.length;
    }

    reset() {
        this._items.length = 0;
        this._weights.length = 0;
        this._progress = 0;
    }

    createCallback(weight?: number): ProgressCallback {
        let index = this._items.length;
        this._items.push(0);
        if (weight == null)
            this._weights.push(null);
        else
            this._weights.push(Math.max(0, Math.min(weight, 1)));

        return (progress: number) => this.update(index, progress);
    }

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