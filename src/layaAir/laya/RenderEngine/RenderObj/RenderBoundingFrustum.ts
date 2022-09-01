import { IClone } from "../../utils/IClone";
import { BoundFrustum } from "../../d3/math/BoundFrustum";
import { Matrix4x4 } from "../../d3/math/Matrix4x4";
import { Vector3 } from "../../d3/math/Vector3";
import { LayaGL } from "../../layagl/LayaGL";
import { Plane } from "../../d3/math/Plane";

export class RenderBoundingFrustum extends BoundFrustum implements IClone {

    /** @internal */
    protected _near: Plane;
    public get near(): Plane {
        return this._near;
    }

    /** @internal */
    protected _far: Plane;
    public get far(): Plane {
        return this._far;
    }

    /** @internal */
    protected _left: Plane;
    public get left(): Plane {
        return this._left;
    }

    /** @internal */
    protected _right: Plane;
    public get right(): Plane {
        return this._right;
    }

    /** @internal */
    protected _top: Plane;
    public get top(): Plane {
        return this._top;
    }

    /** @internal */
    protected _bottom: Plane;
    public get bottom(): Plane {
        return this._bottom;
    }

    constructor(matrix: Matrix4x4) {
        super(matrix);
    }

    protected initBoundingPlane() {
        this._near = new Plane(new Vector3(), 0);
        this._far = new Plane(new Vector3(), 0);
        this._left = new Plane(new Vector3(), 0);
        this._right = new Plane(new Vector3(), 0);
        this._top = new Plane(new Vector3(), 0);
        this._bottom = new Plane(new Vector3(), 0);
        BoundFrustum.getPlanesFromMatrix(this._matrix, this._near, this._far, this._left, this._right, this._top, this._bottom);
    }

    cloneTo(dest: RenderBoundingFrustum) {
        dest.matrix = this.matrix;
    }

    clone(): RenderBoundingFrustum {
        let dest = LayaGL.renderOBJCreate.createBoundFrustum(new Matrix4x4);
        this.cloneTo(dest);
        return dest;
    }

}