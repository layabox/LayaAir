import { LayaGL } from "../../layagl/LayaGL";
import { Resource } from "../../resource/Resource";
import { Stat } from "../../utils/Stat";
import { WebGLContext } from "../../webgl/WebGLContext";
import { BufferState } from "../core/BufferState";
import { GeometryElement } from "../core/GeometryElement";
import { IndexBuffer3D } from "././IndexBuffer3D";
import { VertexBuffer3D } from "././VertexBuffer3D";
import { VertexMesh } from "./Vertex/VertexMesh";
import { ILaya3D } from "../../../ILaya3D";
/**
 * @private
 * <code>SubMeshDynamicBatch</code> 类用于网格动态合并。
 */
export class SubMeshDynamicBatch extends GeometryElement {
    /**
     * 创建一个 <code>SubMeshDynamicBatch</code> 实例。
     */
    constructor() {
        super();
        /** @private */
        this._bufferState = new BufferState();
        var maxVerDec = VertexMesh.getVertexDeclaration("POSITION,NORMAL,COLOR,UV,UV1,TANGENT");
        var maxByteCount = maxVerDec.vertexStride * SubMeshDynamicBatch.maxIndicesCount;
        this._vertices = new Float32Array(maxByteCount / 4);
        this._vertexBuffer = new VertexBuffer3D(maxByteCount, WebGLContext.DYNAMIC_DRAW);
        this._indices = new Int16Array(SubMeshDynamicBatch.maxIndicesCount);
        this._indexBuffer = new IndexBuffer3D(IndexBuffer3D.INDEXTYPE_USHORT, this._indices.length, WebGLContext.DYNAMIC_DRAW);
        var memorySize = this._vertexBuffer._byteLength + this._indexBuffer._byteLength;
        Resource._addMemory(memorySize, memorySize);
    }
    /**
    * @private
    */
    static __init__() {
        SubMeshDynamicBatch.instance = new SubMeshDynamicBatch();
    }
    /**
     * @private
     */
    _getBatchVertices(vertexDeclaration, batchVertices, batchOffset, transform, element, subMesh) {
        var vertexFloatCount = vertexDeclaration.vertexStride / 4;
        var oriVertexes = subMesh._vertexBuffer.getData();
        var lightmapScaleOffset = element.render.lightmapScaleOffset;
        var multiSubMesh = element._dynamicMultiSubMesh;
        var vertexCount = element._dynamicVertexCount;
        element._computeWorldPositionsAndNormals(this._positionOffset, this._normalOffset, multiSubMesh, vertexCount);
        var worldPositions = element._dynamicWorldPositions;
        var worldNormals = element._dynamicWorldNormals;
        var indices = subMesh._indices;
        for (var i = 0; i < vertexCount; i++) {
            var index = multiSubMesh ? indices[i] : i;
            var oriOffset = index * vertexFloatCount;
            var bakeOffset = (i + batchOffset) * vertexFloatCount;
            var oriOff = i * 3;
            var bakOff = bakeOffset + this._positionOffset;
            batchVertices[bakOff] = worldPositions[oriOff];
            batchVertices[bakOff + 1] = worldPositions[oriOff + 1];
            batchVertices[bakOff + 2] = worldPositions[oriOff + 2];
            if (this._normalOffset !== -1) {
                bakOff = bakeOffset + this._normalOffset;
                batchVertices[bakOff] = worldNormals[oriOff];
                batchVertices[bakOff + 1] = worldNormals[oriOff + 1];
                batchVertices[bakOff + 2] = worldNormals[oriOff + 2];
            }
            if (this._colorOffset !== -1) {
                bakOff = bakeOffset + this._colorOffset;
                oriOff = oriOffset + this._colorOffset;
                batchVertices[bakOff] = oriVertexes[oriOff];
                batchVertices[bakOff + 1] = oriVertexes[oriOff + 1];
                batchVertices[bakOff + 2] = oriVertexes[oriOff + 2];
                batchVertices[bakOff + 3] = oriVertexes[oriOff + 3];
            }
            if (this._uv0Offset !== -1) {
                bakOff = bakeOffset + this._uv0Offset;
                oriOff = oriOffset + this._uv0Offset;
                batchVertices[bakOff] = oriVertexes[oriOff];
                batchVertices[bakOff + 1] = oriVertexes[oriOff + 1];
            }
            //if (lightmapScaleOffset) {//TODO:动态合并光照贴图UV如何处理
            //if (_uv1Offset !== -1)
            //Utils3D.transformLightingMapTexcoordByUV1Array(oriVertexes, oriOffset + _uv1Offset, lightmapScaleOffset, batchVertices, bakeOffset + _uv1Offset);
            //else
            //Utils3D.transformLightingMapTexcoordByUV0Array(oriVertexes, oriOffset + _uv0Offset, lightmapScaleOffset, batchVertices, bakeOffset + _uv1Offset);
            //}
            if (this._sTangentOffset !== -1) {
                bakOff = bakeOffset + this._sTangentOffset;
                oriOff = oriOffset + this._sTangentOffset;
                batchVertices[bakOff] = oriVertexes[oriOff];
                batchVertices[bakOff + 1] = oriVertexes[oriOff + 1];
                batchVertices[bakOff + 2] = oriVertexes[oriOff + 2];
                batchVertices[bakOff + 3] = oriVertexes[oriOff + 3];
                bakOff = bakeOffset + this._sTangentOffset;
                oriOff = oriOffset + this._sTangentOffset;
                batchVertices[bakOff] = oriVertexes[oriOff];
                batchVertices[bakOff + 1] = oriVertexes[oriOff + 1];
                batchVertices[bakOff + 2] = oriVertexes[oriOff + 2];
                batchVertices[bakOff + 3] = oriVertexes[oriOff + 3];
            }
        }
    }
    /**
     * @private
     */
    _getBatchIndices(batchIndices, batchIndexCount, batchVertexCount, transform, subMesh, multiSubMesh) {
        var subIndices = subMesh._indices;
        var k, m, batchOffset;
        var isInvert = transform._isFrontFaceInvert;
        if (multiSubMesh) {
            if (isInvert) {
                for (k = 0, m = subIndices.length; k < m; k += 3) {
                    batchOffset = batchIndexCount + k;
                    var index = batchVertexCount + k;
                    batchIndices[batchOffset] = index;
                    batchIndices[batchOffset + 1] = index + 2;
                    batchIndices[batchOffset + 2] = index + 1;
                }
            }
            else {
                for (k = m, m = subIndices.length; k < m; k += 3) {
                    batchOffset = batchIndexCount + k;
                    index = batchVertexCount + k;
                    batchIndices[batchOffset] = index;
                    batchIndices[batchOffset + 1] = index + 1;
                    batchIndices[batchOffset + 2] = index + 2;
                }
            }
        }
        else {
            if (isInvert) {
                for (k = 0, m = subIndices.length; k < m; k += 3) {
                    batchOffset = batchIndexCount + k;
                    batchIndices[batchOffset] = batchVertexCount + subIndices[k];
                    batchIndices[batchOffset + 1] = batchVertexCount + subIndices[k + 2];
                    batchIndices[batchOffset + 2] = batchVertexCount + subIndices[k + 1];
                }
            }
            else {
                for (k = m, m = subIndices.length; k < m; k += 3) {
                    batchOffset = batchIndexCount + k;
                    batchIndices[batchOffset] = batchVertexCount + subIndices[k];
                    batchIndices[batchOffset + 1] = batchVertexCount + subIndices[k + 1];
                    batchIndices[batchOffset + 2] = batchVertexCount + subIndices[k + 2];
                }
            }
        }
    }
    /**
     * @private
     */
    _flush(vertexCount, indexCount) {
        this._vertexBuffer.setData(this._vertices, 0, 0, vertexCount * (this._vertexBuffer.vertexDeclaration.vertexStride / 4));
        this._indexBuffer.setData(this._indices, 0, 0, indexCount);
        LayaGL.instance.drawElements(WebGLContext.TRIANGLES, indexCount, WebGLContext.UNSIGNED_SHORT, 0);
    }
    /**
     * @inheritDoc
     */
    /*override*/ _prepareRender(state) {
        var element = state.renderElement;
        var vertexDeclaration = element.vertexBatchVertexDeclaration;
        this._bufferState = ILaya3D.MeshRenderDynamicBatchManager.instance._getBufferState(vertexDeclaration);
        this._positionOffset = vertexDeclaration.getVertexElementByUsage(VertexMesh.MESH_POSITION0).offset / 4;
        var normalElement = vertexDeclaration.getVertexElementByUsage(VertexMesh.MESH_NORMAL0);
        this._normalOffset = normalElement ? normalElement.offset / 4 : -1;
        var colorElement = vertexDeclaration.getVertexElementByUsage(VertexMesh.MESH_COLOR0);
        this._colorOffset = colorElement ? colorElement.offset / 4 : -1;
        var uv0Element = vertexDeclaration.getVertexElementByUsage(VertexMesh.MESH_TEXTURECOORDINATE0);
        this._uv0Offset = uv0Element ? uv0Element.offset / 4 : -1;
        var uv1Element = vertexDeclaration.getVertexElementByUsage(VertexMesh.MESH_TEXTURECOORDINATE1);
        this._uv1Offset = uv1Element ? uv1Element.offset / 4 : -1;
        var tangentElement = vertexDeclaration.getVertexElementByUsage(VertexMesh.MESH_TANGENT0);
        this._sTangentOffset = tangentElement ? tangentElement.offset / 4 : -1;
        return true;
    }
    /**
     * @inheritDoc
     */
    /*override*/ _render(context) {
        this._bufferState.bind();
        var element = context.renderElement;
        var vertexDeclaration = element.vertexBatchVertexDeclaration;
        var batchElements = element.vertexBatchElementList;
        var batchVertexCount = 0;
        var batchIndexCount = 0;
        var floatStride = vertexDeclaration.vertexStride / 4;
        var renderBatchCount = 0;
        var elementCount = batchElements.length;
        for (var i = 0; i < elementCount; i++) {
            var subElement = batchElements[i];
            var subMesh = subElement._geometry;
            var indexCount = subMesh._indexCount;
            if (batchIndexCount + indexCount > SubMeshDynamicBatch.maxIndicesCount) {
                this._flush(batchVertexCount, batchIndexCount);
                renderBatchCount++;
                Stat.trianglesFaces += batchIndexCount / 3;
                batchVertexCount = batchIndexCount = 0;
            }
            var transform = subElement._transform;
            this._getBatchVertices(vertexDeclaration, this._vertices, batchVertexCount, transform, /*(element.render as MeshRender)*/ subElement, subMesh);
            this._getBatchIndices(this._indices, batchIndexCount, batchVertexCount, transform, subMesh, subElement._dynamicMultiSubMesh);
            batchVertexCount += subElement._dynamicVertexCount;
            batchIndexCount += indexCount;
        }
        this._flush(batchVertexCount, batchIndexCount);
        renderBatchCount++;
        Stat.renderBatches += renderBatchCount;
        Stat.savedRenderBatches += elementCount - renderBatchCount;
        Stat.trianglesFaces += batchIndexCount / 3;
    }
}
/** @private
 * //MI6 (微信) 大于12个顶点微小提升
 * //MI6 (QQ浏览器8.2 X5内核038230GPU-UU) 大于12个顶点微小提升
 * //MI6 (chrome63) 大于10个顶点微小提升
 * //IPHONE7PLUS  IOS11 微信 大于12个顶点微小提升
 * //IPHONE5s  IOS8 微信 大于12仍有较大提升
 */
SubMeshDynamicBatch.maxAllowVertexCount = 10;
/** @private */
SubMeshDynamicBatch.maxAllowAttribueCount = 900; //TODO:
/** @private */
SubMeshDynamicBatch.maxIndicesCount = 32000;
