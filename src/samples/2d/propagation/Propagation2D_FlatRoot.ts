import { Main } from "../../Main";
import { Propagation2DPerfBase } from "./Propagation2DPerfBase";

export class Propagation2D_FlatRoot extends Propagation2DPerfBase {
    constructor(maincls: typeof Main) {
        super(maincls, "flatRoot", "Flat root/camera pan", 8000, 20000);
    }

    protected buildScene(nodes: number): void {
        this._buildFlat(nodes);
    }

    protected runFrame(): void {
        this._runRootPan();
    }
}
