import { VertexBuffer3D } from "./VertexBuffer3D";
import { IndexBuffer3D } from "./IndexBuffer3D";
import { BufferState } from "../core/BufferState";
import { GeometryElement } from "../core/GeometryElement";
import { VertexMesh } from "./Vertex/VertexMesh";
import { Matrix4x4 } from "../math/Matrix4x4";
import { Quaternion } from "../math/Quaternion";
import { Vector3 } from "../math/Vector3";
import { Utils3D } from "../utils/Utils3D";
import { LayaGL } from "../../layagl/LayaGL";
import { Resource } from "../../resource/Resource";
import { Stat } from "../../utils/Stat";
/**
 * @internal
 * <code>SubMeshStaticBatch</code> 类用于网格静态合并。
 */
export class SubMeshStaticBatch extends GeometryElement {
    /**
     * 创建一个 <code>SubMeshStaticBatch</code> 实例。
     */
    constructor(batchOwner, number, vertexDeclaration) {
        super();
        /** @internal */
        this._bufferState = new BufferState();
        this._batchID = SubMeshStaticBatch._batchIDCounter++;
        this._batchElements = [];
        this._currentBatchVertexCount = 0;
        this._currentBatchIndexCount = 0;
        this._vertexDeclaration = vertexDeclaration;
        this.batchOwner = batchOwner;
        this.number = number;
    }
    /**
     * @internal
     */
    _getStaticBatchBakedVertexs(batchVertices, batchOffset, batchOwnerTransform, transform, render, mesh) {
        var vertexBuffer = mesh._vertexBuffer;
        var vertexDeclaration = vertexBuffer.vertexDeclaration;
        var positionOffset = vertexDeclaration.getVertexElementByUsage(VertexMesh.MESH_POSITION0)._offset / 4;
        var normalElement = vertexDeclaration.getVertexElementByUsage(VertexMesh.MESH_NORMAL0);
        var normalOffset = normalElement ? normalElement._offset / 4 : -1;
        var colorElement = vertexDeclaration.getVertexElementByUsage(VertexMesh.MESH_COLOR0);
        var colorOffset = colorElement ? colorElement._offset / 4 : -1;
        var uv0Element = vertexDeclaration.getVertexElementByUsage(VertexMesh.MESH_TEXTURECOORDINATE0);
        var uv0Offset = uv0Element ? uv0Element._offset / 4 : -1;
        var uv1Element = vertexDeclaration.getVertexElementByUsage(VertexMesh.MESH_TEXTURECOORDINATE1);
        var uv1Offset = uv1Element ? uv1Element._offset / 4 : -1;
        var tangentElement = vertexDeclaration.getVertexElementByUsage(VertexMesh.MESH_TANGENT0);
        var sTangentOffset = tangentElement ? tangentElement._offset / 4 : -1;
        var bakeVertexFloatCount = 18;
        var oriVertexFloatCount = vertexDeclaration.vertexStride / 4;
        var oriVertexes = vertexBuffer.getFloat32Data();
        var worldMat;
        if (batchOwnerTransform) {
            var rootMat = batchOwnerTransform.worldMatrix;
            rootMat.invert(SubMeshStaticBatch._tempMatrix4x40);
            worldMat = SubMeshStaticBatch._tempMatrix4x41;
            Matrix4x4.multiply(SubMeshStaticBatch._tempMatrix4x40, transform.worldMatrix, worldMat);
        }
        else {
            worldMat = transform.worldMatrix;
        }
        var rotation = SubMeshStaticBatch._tempQuaternion0;
        worldMat.decomposeTransRotScale(SubMeshStaticBatch._tempVector30, rotation, SubMeshStaticBatch._tempVector31); //可不计算position和scale	
        var lightmapScaleOffset = render.lightmapScaleOffset;
        var vertexCount = mesh.vertexCount;
        for (var i = 0; i < vertexCount; i++) {
            var oriOffset = i * oriVertexFloatCount;
            var bakeOffset = (i + batchOffset) * bakeVertexFloatCount;
            Utils3D.transformVector3ArrayToVector3ArrayCoordinate(oriVertexes, oriOffset + positionOffset, worldMat, batchVertices, bakeOffset + 0);
            if (normalOffset !== -1)
                Utils3D.transformVector3ArrayByQuat(oriVertexes, oriOffset + normalOffset, rotation, batchVertices, bakeOffset + 3);
            var j, m;
            var bakOff = bakeOffset + 6;
            if (colorOffset !== -1) {
                var oriOff = oriOffset + colorOffset;
                for (j = 0, m = 4; j < m; j++)
                    batchVertices[bakOff + j] = oriVertexes[oriOff + j];
            }
            else {
                for (j = 0, m = 4; j < m; j++)
                    batchVertices[bakOff + j] = 1.0;
            }
            if (uv0Offset !== -1) {
                var absUv0Offset = oriOffset + uv0Offset;
                batchVertices[bakeOffset + 10] = oriVertexes[absUv0Offset];
                batchVertices[bakeOffset + 11] = oriVertexes[absUv0Offset + 1];
            }
            if (lightmapScaleOffset) {
                if (uv1Offset !== -1)
                    Utils3D.transformLightingMapTexcoordArray(oriVertexes, oriOffset + uv1Offset, lightmapScaleOffset, batchVertices, bakeOffset + 12);
                else
                    Utils3D.transformLightingMapTexcoordArray(oriVertexes, oriOffset + uv0Offset, lightmapScaleOffset, batchVertices, bakeOffset + 12);
            }
            if (sTangentOffset !== -1) {
                var absSTanegntOffset = oriOffset + sTangentOffset;
                batchVertices[bakeOffset + 14] = oriVertexes[absSTanegntOffset];
                batchVertices[bakeOffset + 15] = oriVertexes[absSTanegntOffset + 1];
                batchVertices[bakeOffset + 16] = oriVertexes[absSTanegntOffset + 2];
                batchVertices[bakeOffset + 17] = oriVertexes[absSTanegntOffset + 3];
            }
        }
        return vertexCount;
    }
    /**
     * @internal
     */
    addTest(sprite) {
        var vertexCount;
        var subMeshVertexCount = sprite.meshFilter.sharedMesh.vertexCount;
        vertexCount = this._currentBatchVertexCount + subMeshVertexCount;
        if (vertexCount > SubMeshStaticBatch.maxBatchVertexCount)
            return false;
        return true;
    }
    /**
     * @internal
     */
    add(sprite) {
        var oldStaticBatch = sprite._render._staticBatch;
        (oldStaticBatch) && (oldStaticBatch.remove(sprite)); //重复合并需要从旧的staticBatch移除
        var mesh = sprite.meshFilter.sharedMesh;
        var subMeshVertexCount = mesh.vertexCount;
        this._batchElements.push(sprite);
        var render = sprite._render;
        render._isPartOfStaticBatch = true;
        render._staticBatch = this;
        var renderElements = render._renderElements;
        for (var i = 0, n = renderElements.length; i < n; i++)
            renderElements[i].staticBatch = this;
        this._currentBatchIndexCount += mesh._indexBuffer.indexCount;
        this._currentBatchVertexCount += subMeshVertexCount;
    }
    /**
     * @internal
     */
    remove(sprite) {
        var mesh = sprite.meshFilter.sharedMesh;
        var index = this._batchElements.indexOf(sprite);
        if (index !== -1) {
            this._batchElements.splice(index, 1);
            var render = sprite._render;
            var renderElements = sprite._render._renderElements;
            for (var i = 0, n = renderElements.length; i < n; i++)
                renderElements[i].staticBatch = null;
            var meshVertexCount = mesh.vertexCount;
            this._currentBatchIndexCount = this._currentBatchIndexCount - mesh._indexBuffer.indexCount;
            this._currentBatchVertexCount = this._currentBatchVertexCount - meshVertexCount;
            sprite._render._isPartOfStaticBatch = false;
        }
    }
    /**
     * @internal
     */
    finishInit() {
        if (this._vertexBuffer) {
            this._vertexBuffer.destroy();
            this._indexBuffer.destroy();
            Resource._addGPUMemory(-(this._vertexBuffer._byteLength + this._indexBuffer._byteLength));
        }
        var batchVertexCount = 0;
        var batchIndexCount = 0;
        var rootOwner = this.batchOwner;
        var floatStride = this._vertexDeclaration.vertexStride / 4;
        var vertexDatas = new Float32Array(floatStride * this._currentBatchVertexCount);
        var indexDatas = new Uint16Array(this._currentBatchIndexCount);
        this._vertexBuffer = new VertexBuffer3D(this._vertexDeclaration.vertexStride * this._currentBatchVertexCount, WebGL2RenderingContext.STATIC_DRAW);
        this._vertexBuffer.vertexDeclaration = this._vertexDeclaration;
        this._indexBuffer = new IndexBuffer3D(IndexBuffer3D.INDEXTYPE_USHORT, this._currentBatchIndexCount, WebGL2RenderingContext.STATIC_DRAW);
        for (var i = 0, n = this._batchElements.length; i < n; i++) {
            var sprite = this._batchElements[i];
            var mesh = sprite.meshFilter.sharedMesh;
            var meshVerCount = this._getStaticBatchBakedVertexs(vertexDatas, batchVertexCount, rootOwner ? rootOwner._transform : null, sprite._transform, sprite._render, mesh);
            var indices = mesh._indexBuffer.getData();
            var indexOffset = batchVertexCount;
            var indexEnd = batchIndexCount + indices.length; //TODO:indexStartCount和Index
            var elements = sprite._render._renderElements;
            for (var j = 0, m = mesh.subMeshCount; j < m; j++) {
                var subMesh = mesh._subMeshes[j];
                var start = batchIndexCount + subMesh._indexStart;
                var element = elements[j];
                element.staticBatchIndexStart = start;
                element.staticBatchIndexEnd = start + subMesh._indexCount;
            }
            indexDatas.set(indices, batchIndexCount); //TODO:换成函数和动态合并一样
            var k;
            var isInvert = rootOwner ? (sprite._transform._isFrontFaceInvert !== rootOwner.transform._isFrontFaceInvert) : sprite._transform._isFrontFaceInvert;
            if (isInvert) {
                for (k = batchIndexCount; k < indexEnd; k += 3) {
                    indexDatas[k] = indexOffset + indexDatas[k];
                    var index1 = indexDatas[k + 1];
                    var index2 = indexDatas[k + 2];
                    indexDatas[k + 1] = indexOffset + index2;
                    indexDatas[k + 2] = indexOffset + index1;
                }
            }
            else {
                for (k = batchIndexCount; k < indexEnd; k += 3) {
                    indexDatas[k] = indexOffset + indexDatas[k];
                    indexDatas[k + 1] = indexOffset + indexDatas[k + 1];
                    indexDatas[k + 2] = indexOffset + indexDatas[k + 2];
                }
            }
            batchIndexCount += indices.length;
            batchVertexCount += meshVerCount;
        }
        this._vertexBuffer.setData(vertexDatas.buffer);
        this._indexBuffer.setData(indexDatas);
        var memorySize = this._vertexBuffer._byteLength + this._indexBuffer._byteLength;
        Resource._addGPUMemory(memorySize);
        this._bufferState.bind();
        this._bufferState.applyVertexBuffer(this._vertexBuffer);
        this._bufferState.applyIndexBuffer(this._indexBuffer);
        this._bufferState.unBind();
    }
    /**
     * @inheritDoc
     */
    /*override*/ _render(state) {
        this._bufferState.bind();
        var element = state.renderElement;
        var batchElementList = element.staticBatchElementList;
        /*合并drawcall版本:合并几率不大*/
        var from = 0;
        var end = 0;
        var count = batchElementList.length;
        for (var i = 1; i < count; i++) {
            var lastElement = batchElementList[i - 1];
            if (lastElement.staticBatchIndexEnd === batchElementList[i].staticBatchIndexStart) {
                end++;
                continue;
            }
            else {
                var start = batchElementList[from].staticBatchIndexStart;
                var indexCount = batchElementList[end].staticBatchIndexEnd - start;
                LayaGL.instance.drawElements(WebGL2RenderingContext.TRIANGLES, indexCount, WebGL2RenderingContext.UNSIGNED_SHORT, start * 2);
                from = ++end;
                Stat.trianglesFaces += indexCount / 3;
            }
        }
        start = batchElementList[from].staticBatchIndexStart;
        indexCount = batchElementList[end].staticBatchIndexEnd - start;
        LayaGL.instance.drawElements(WebGL2RenderingContext.TRIANGLES, indexCount, WebGL2RenderingContext.UNSIGNED_SHORT, start * 2);
        Stat.renderBatches++;
        Stat.savedRenderBatches += count - 1;
        Stat.trianglesFaces += indexCount / 3;
        /*暴力循环版本:drawcall调用次数有浪费
           //for (var i:int = 0, n:int = batchElementList.length; i < n; i++) {
           //var element:SubMeshRenderElement = batchElementList[i];
           //var start:int = element.staticBatchIndexStart;
           //var indexCount:int = element.staticBatchIndexEnd - start;
           //LayaGL.instance.drawElements(WebGLContext.TRIANGLES, indexCount, WebGLContext.UNSIGNED_SHORT, start * 2);
           //Stat.drawCall++;
           //Stat.trianglesFaces += indexCount / 3;
           //}
         */
    }
    /**
     * @internal
     */
    dispose() {
        var memorySize = this._vertexBuffer._byteLength + this._indexBuffer._byteLength;
        Resource._addGPUMemory(-memorySize);
        this._batchElements = null;
        this.batchOwner = null;
        this._vertexDeclaration = null;
        this._bufferState.destroy();
        this._vertexBuffer.destroy();
        this._indexBuffer.destroy();
        this._vertexBuffer = null;
        this._indexBuffer = null;
        this._bufferState = null;
    }
}
/** @internal */
SubMeshStaticBatch._tempVector30 = new Vector3();
/** @internal */
SubMeshStaticBatch._tempVector31 = new Vector3();
/** @internal */
SubMeshStaticBatch._tempQuaternion0 = new Quaternion();
/** @internal */
SubMeshStaticBatch._tempMatrix4x40 = new Matrix4x4();
/** @internal */
SubMeshStaticBatch._tempMatrix4x41 = new Matrix4x4();
/** @internal */
SubMeshStaticBatch.maxBatchVertexCount = 65535;
/** @internal */
SubMeshStaticBatch._batchIDCounter = 0;
