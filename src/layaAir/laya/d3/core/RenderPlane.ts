import { IClone } from "../../utils/IClone";
import { Plane } from "../math/Plane";
import { Vector3 } from "../math/Vector3";
import { LayaGL } from "../../layagl/LayaGL";

/**
 * @internal
 */
export class RenderPlane extends Plane implements IClone {

    constructor(normal: Vector3, distance: number) {
        super(normal, distance);
    }

    set(plane: Plane) {
        this.normal = plane.normal;
        this.distance = plane.distance;
    }

    cloneTo(dest: RenderPlane): void {
        dest.normal = this.normal;
        dest.distance = this.distance;
    }

    clone(): RenderPlane {
        let dest = LayaGL.renderOBJCreate.createPlane(new Vector3(), 0);
        this.cloneTo(dest);
        return dest;
    }

}