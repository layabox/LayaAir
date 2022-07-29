import { IClone } from "../../d3/core/IClone";
import { RenderPlane } from "../../d3/core/RenderPlane";
import { BoundFrustum } from "../../d3/math/BoundFrustum";
import { Matrix4x4 } from "../../d3/math/Matrix4x4";
import { Vector3 } from "../../d3/math/Vector3";
import { LayaGL } from "../../layagl/LayaGL";

export class RenderBoundingFrustum extends BoundFrustum implements IClone {

    /** @internal */
    protected _near: RenderPlane;
    public get near(): RenderPlane {
        return this._near;
    }

    /** @internal */
    protected _far: RenderPlane;
    public get far(): RenderPlane {
        return this._far;
    }

    /** @internal */
    protected _left: RenderPlane;
    public get left(): RenderPlane {
        return this._left;
    }

    /** @internal */
    protected _right: RenderPlane;
    public get right(): RenderPlane {
        return this._right;
    }

    /** @internal */
    protected _top: RenderPlane;
    public get top(): RenderPlane {
        return this._top;
    }

    /** @internal */
    protected _bottom: RenderPlane;
    public get bottom(): RenderPlane {
        return this._bottom;
    }

    constructor(matrix: Matrix4x4) {
        super(matrix);
    }

    protected initBoundingPlane() {
        this._near = LayaGL.renderOBJCreate.createPlane(new Vector3(), 0);
        this._far = LayaGL.renderOBJCreate.createPlane(new Vector3(), 0);
        this._left = LayaGL.renderOBJCreate.createPlane(new Vector3(), 0);
        this._right = LayaGL.renderOBJCreate.createPlane(new Vector3(), 0);
        this._top = LayaGL.renderOBJCreate.createPlane(new Vector3(), 0);
        this._bottom = LayaGL.renderOBJCreate.createPlane(new Vector3(), 0);
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