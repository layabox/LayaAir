import { Sprite3D } from "../Sprite3D";
import { BaseRender } from "../render/BaseRender";
import { FrustumCulling } from "../../graphics/FrustumCulling";
import { Matrix4x4 } from "../../math/Matrix4x4";
import { Render } from "../../../renders/Render";
/**
 * <code>PixelLineRenderer</code> 类用于线渲染器。
 */
export class PixelLineRenderer extends BaseRender {
    constructor(owner) {
        super(owner);
        this._projectionViewWorldMatrix = new Matrix4x4();
        this._supportOctree = false;
    }
    /**
     * @inheritDoc
     */
    /*override*/ _calculateBoundingBox() {
        var min = this._bounds.getMin();
        min.x = -Number.MAX_VALUE;
        min.y = -Number.MAX_VALUE;
        min.z = -Number.MAX_VALUE;
        this._bounds.setMin(min);
        var max = this._bounds.getMax();
        max.x = Number.MAX_VALUE;
        max.y = Number.MAX_VALUE;
        max.z = Number.MAX_VALUE;
        this._bounds.setMax(max);
        if (Render.supportWebGLPlusCulling) { //[NATIVE]
            var min = this._bounds.getMin();
            var max = this._bounds.getMax();
            var buffer = FrustumCulling._cullingBuffer;
            buffer[this._cullingBufferIndex + 1] = min.x;
            buffer[this._cullingBufferIndex + 2] = min.y;
            buffer[this._cullingBufferIndex + 3] = min.z;
            buffer[this._cullingBufferIndex + 4] = max.x;
            buffer[this._cullingBufferIndex + 5] = max.y;
            buffer[this._cullingBufferIndex + 6] = max.z;
        }
    }
    /**
     * @inheritDoc
     */
    /*override*/ _renderUpdateWithCamera(context, transform) {
        var projectionView = context.projectionViewMatrix;
        var sv = this._shaderValues;
        if (transform) {
            var worldMat = transform.worldMatrix;
            sv.setMatrix4x4(Sprite3D.WORLDMATRIX, worldMat);
            Matrix4x4.multiply(projectionView, worldMat, this._projectionViewWorldMatrix);
            sv.setMatrix4x4(Sprite3D.MVPMATRIX, this._projectionViewWorldMatrix);
        }
        else {
            sv.setMatrix4x4(Sprite3D.WORLDMATRIX, Matrix4x4.DEFAULT);
            sv.setMatrix4x4(Sprite3D.MVPMATRIX, projectionView);
        }
    }
}
