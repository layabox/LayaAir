import { IClone } from "./IClone";
import { BoundSphere } from "../math/BoundSphere";
import { Vector3 } from "../math/Vector3";
import { LayaGL } from "../../layagl/LayaGL";

/**
 * @internal
 */
export class RenderBoundingSphere extends BoundSphere implements IClone {

    constructor(center: Vector3, radius: number) {
        super(center, radius);
    }

    /**
     * @internal
     * @param bSphere 
     */
    set(bSphere: BoundSphere): void {
        this.center = bSphere.center;
        this.radius = bSphere.radius;
    }

    cloneTo(dest: RenderBoundingSphere): void {
        dest.center = this.center;
        dest.radius = this.radius;
    }

    clone(): RenderBoundingSphere {
        let dest = LayaGL.renderOBJCreate.createBoundsSphere(new Vector3, 0);
        this.cloneTo(dest);
        return dest;
    }

}