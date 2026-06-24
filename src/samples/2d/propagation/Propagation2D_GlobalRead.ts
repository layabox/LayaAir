import { Main } from "../../Main";
import { Propagation2DPerfBase } from "./Propagation2DPerfBase";

export class Propagation2D_GlobalRead extends Propagation2DPerfBase {
    constructor(maincls: typeof Main) {
        super(maincls, "globalRead", "Flat root pan + global matrix reads", 8000, 20000);
    }

    protected buildScene(nodes: number): void {
        this._buildFlat(nodes);
    }

    protected runFrame(): void {
        this._runRootPan();
        const arr = this._sprites;
        let sink = this._sink;
        for (let i = 0, n = arr.length; i < n; i++) {
            const m = arr[i].globalTrans.getMatrix();
            sink += m.a + m.d + m.tx * 0.001 + m.ty * 0.001;
        }
        this._sink = sink;
    }
}
