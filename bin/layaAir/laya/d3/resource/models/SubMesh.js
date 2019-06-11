import { GeometryElement } from "../../core/GeometryElement";
import { SkinnedMeshSprite3D } from "../../core/SkinnedMeshSprite3D";
import { LayaGL } from "laya/layagl/LayaGL";
import { Stat } from "laya/utils/Stat";
import { WebGLContext } from "laya/webgl/WebGLContext";
/**
 * <code>SubMesh</code> 类用于创建子网格数据模板。
 */
export class SubMesh extends GeometryElement {
    /**
     * 创建一个 <code>SubMesh</code> 实例。
     * @param	mesh  网格数据模板。
     */
    constructor(mesh) {
        super();
        this._id = ++SubMesh._uniqueIDCounter;
        this._mesh = mesh;
        this._boneIndicesList = [];
        this._subIndexBufferStart = [];
        this._subIndexBufferCount = [];
    }
    /**
     * @inheritDoc
     */
    /*override*/ _getType() {
        return SubMesh._type;
    }
    /**
     * @inheritDoc
     */
    /*override*/ _render(state) {
        this._mesh._bufferState.bind();
        var skinnedDatas = state.renderElement.render._skinnedData;
        if (skinnedDatas) {
            var subSkinnedDatas = skinnedDatas[this._indexInMesh];
            var boneIndicesListCount = this._boneIndicesList.length;
            for (var i = 0; i < boneIndicesListCount; i++) {
                state.shader.uploadCustomUniform(SkinnedMeshSprite3D.BONES, subSkinnedDatas[i]);
                LayaGL.instance.drawElements(WebGLContext.TRIANGLES, this._subIndexBufferCount[i], WebGLContext.UNSIGNED_SHORT, this._subIndexBufferStart[i] * 2);
            }
        }
        else {
            LayaGL.instance.drawElements(WebGLContext.TRIANGLES, this._indexCount, WebGLContext.UNSIGNED_SHORT, this._indexStart * 2);
        }
        Stat.trianglesFaces += this._indexCount / 3;
        Stat.renderBatches++;
    }
    /**
     * @private
     */
    getIndices() {
        return this._indices;
    }
    /**
     * @inheritDoc
     */
    /*override*/ destroy() {
        if (this._destroyed)
            return;
        super.destroy();
        this._indexBuffer.destroy();
        this._indexBuffer = null;
        this._mesh = null;
        this._boneIndicesList = null;
        this._subIndexBufferStart = null;
        this._subIndexBufferCount = null;
        this._skinAnimationDatas = null;
    }
}
/** @private */
SubMesh._uniqueIDCounter = 0;
/**@private */
SubMesh._type = GeometryElement._typeCounter++;
