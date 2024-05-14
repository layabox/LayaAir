import { SpineMeshBase } from "../mesh/SpineMeshBase";
import { MultiRenderData } from "./MultiRenderData";

export class IBCreator {
    ib: Uint16Array;
    ibLength: number;
    outRenderData: MultiRenderData;

    private _realib: Uint16Array;

    get realIb(): Uint16Array {
        if (!this._realib) {
            this._realib = new Uint16Array(this.ib.buffer, 0, this.ibLength);
        }
        return this._realib;
    }
    constructor() {
        this.ib = new Uint16Array(SpineMeshBase.maxVertex * 3);
        this.ibLength = 0;
    }
}