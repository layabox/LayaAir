import { Main } from "../../Main";
import { Propagation2DPerfBase } from "./Propagation2DPerfBase";

export class Propagation2D_FlatWrite extends Propagation2DPerfBase {
    constructor(maincls: typeof Main) {
        super(maincls, "flatWrite", "Flat x/y writes", 8000, 20000);
    }

    protected buildScene(nodes: number): void {
        this._buildFlat(nodes);
    }

    protected runFrame(): void {
        const f = this._frame;
        const arr = this._sprites;
        for (let i = 0; i < arr.length; i++) {
            const sp = arr[i];
            sp.x = ((f * 3 + i * 5) % 900);
            sp.y = ((f * 2 + i * 7) % 540);
        }
    }
}
