import { Main } from "../../Main";
import { Propagation2DPerfBase } from "./Propagation2DPerfBase";

export class Propagation2D_DeepRoot extends Propagation2DPerfBase {
    constructor(maincls: typeof Main) {
        super(maincls, "deepRoot", "Deep root/camera pan", 2047, 4095);
    }

    protected buildScene(nodes: number): void {
        this._buildDeep(nodes);
    }

    protected runFrame(): void {
        this._runRootPan();
    }
}
