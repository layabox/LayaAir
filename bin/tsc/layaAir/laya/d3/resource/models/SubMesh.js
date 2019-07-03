import { LayaGL } from "../../../layagl/LayaGL";
import { Stat } from "../../../utils/Stat";
import { GeometryElement } from "../../core/GeometryElement";
import { SkinnedMeshSprite3D } from "../../core/SkinnedMeshSprite3D";
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
     * @internal
     * @override
     */
    _getType() {
        return SubMesh._type;
    }
    /**
     * @internal
     * @override
     */
    _prepareRender(state) {
        this._mesh._uploadVerticesData();
        return true;
    }
    /**
     * @internal
     * @override
     */
    _render(state) {
        this._mesh._bufferState.bind();
        var skinnedDatas = state.renderElement.render._skinnedData;
        if (skinnedDatas) {
            var subSkinnedDatas = skinnedDatas[this._indexInMesh];
            var boneIndicesListCount = this._boneIndicesList.length;
            for (var i = 0; i < boneIndicesListCount; i++) {
                state.shader.uploadCustomUniform(SkinnedMeshSprite3D.BONES, subSkinnedDatas[i]);
                LayaGL.instance.drawElements(WebGL2RenderingContext.TRIANGLES, this._subIndexBufferCount[i], WebGL2RenderingContext.UNSIGNED_SHORT, this._subIndexBufferStart[i] * 2);
            }
        }
        else {
            LayaGL.instance.drawElements(WebGL2RenderingContext.TRIANGLES, this._indexCount, WebGL2RenderingContext.UNSIGNED_SHORT, this._indexStart * 2);
        }
        Stat.trianglesFaces += this._indexCount / 3;
        Stat.renderBatches++;
    }
    /**
     * 获取索引数量。
     */
    getIndicesCount() {
        return this._indexCount;
    }
    /**
     * 获取索引。
     * @param triangles 索引。
     */
    getIndices() {
        if (this._mesh._isReadable)
            return this._indices;
        else
            throw "SubMesh:can't get indices on subMesh,mesh's isReadable must be true.";
    }
    /**
     * 设置子网格索引。
     * @param indices
     */
    setIndices(indices) {
        this._indexBuffer.setData(indices, this._indexStart, 0, this._indexCount);
    }
    /**
     * {@inheritDoc GeometryElement.destroy}
     * @override
     */
    destroy() {
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
/** @internal */
SubMesh._uniqueIDCounter = 0;
/**@internal */
SubMesh._type = GeometryElement._typeCounter++;
