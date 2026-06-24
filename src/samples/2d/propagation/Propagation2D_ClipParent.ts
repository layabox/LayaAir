import { Main } from "../../Main";
import { Propagation2DPerfBase } from "./Propagation2DPerfBase";

export class Propagation2D_ClipParent extends Propagation2DPerfBase {
    constructor(maincls: typeof Main) {
        super(maincls, "clipParent", "Clip parent pan", 2047, 4095);
    }

    protected buildScene(nodes: number): void {
        this._buildClipTree(nodes);
    }

    protected runFrame(): void {
        const f = this._frame;
        const host = this._hosts[0];
        host.x = 160 + Math.sin(f * 0.05) * 70;
        host.y = 90 + Math.cos(f * 0.04) * 50;
        if ((f & 31) === 0) {
            this._clipRect.x = (f & 63) * 0.5;
            host.scrollRect = this._clipRect;
        }
    }
}
