import { LayaGL } from "../../layagl/LayaGL";
import { Bounds } from "../math/Bounds";
import { Vector3 } from "../math/Vector3";

export class RenderBounds extends Bounds {
    constructor(min: Vector3, max: Vector3) {
        super(min, max);
    }
    set(bounds: Bounds) {
        this.min = bounds.min;
        this.max = bounds.max;
    }

    cloneTo(dest: Bounds): void {
        dest.min = this.min;
        dest.max = this.max;
    }

    clone(): RenderBounds {
        let dest = LayaGL.renderOBJCreate.createBounds(new Vector3(),new Vector3());
        this.cloneTo(dest);
        return dest as RenderBounds;
    }
}