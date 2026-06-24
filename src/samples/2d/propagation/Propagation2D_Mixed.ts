import { Main } from "../../Main";
import { Propagation2DPerfBase } from "./Propagation2DPerfBase";

export class Propagation2D_Mixed extends Propagation2DPerfBase {
    constructor(maincls: typeof Main) {
        super(maincls, "mixed", "Mixed transform/alpha/root pan", 8000, 20000);
    }

    protected buildScene(nodes: number): void {
        this._buildFlat(nodes);
    }

    protected runFrame(): void {
        const f = this._frame;
        const arr = this._sprites;
        for (let i = 0; i < 160 && arr.length > 0; i++) {
            const sp = arr[(i * 53 + f * 7) % arr.length];
            sp.x += ((i + f) & 1) ? 1 : -1;
            sp.y += ((i + f) & 2) ? 1 : -1;
        }
        for (let i = 0; i < 24 && arr.length > 0; i++) {
            arr[(i * 97 + f) % arr.length].alpha = 0.55 + ((f + i) % 20) / 45;
        }
        this._runRootPan();
    }
}
