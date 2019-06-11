import { Laya } from "Laya";
import { Physics } from "laya/d3/physics/Physics";
import { Resource } from "laya/resource/Resource";
import { Bounds } from "../../core/Bounds";
import { BufferState } from "../../core/BufferState";
import { IndexBuffer3D } from "../../graphics/IndexBuffer3D";
import { SubMeshInstanceBatch } from "../../graphics/SubMeshInstanceBatch";
import { VertexMesh } from "../../graphics/Vertex/VertexMesh";
import { VertexBuffer3D } from "../../graphics/VertexBuffer3D";
import { VertexElementFormat } from "../../graphics/VertexElementFormat";
import { MeshReader } from "../../loaders/MeshReader";
import { Vector3 } from "../../math/Vector3";
import { Utils3D } from "../../utils/Utils3D";
import { SubMesh } from "././SubMesh";
/**
 * <code>Mesh</code> 类用于创建文件网格数据模板。
 */
export class Mesh extends Resource {
    /**
     * 创建一个 <code>Mesh</code> 实例,禁止使用。
     * @param url 文件地址。
     */
    constructor() {
        super();
        /** @private */
        this._tempVector30 = new Vector3();
        /** @private */
        this._tempVector31 = new Vector3();
        /** @private */
        this._tempVector32 = new Vector3();
        /** @private */
        this._bufferState = new BufferState();
        /** @private */
        this._instanceBufferState = new BufferState();
        /** @private */
        this._vertexCount = 0;
        this._subMeshes = [];
        this._vertexBuffers = [];
        this._skinDataPathMarks = [];
    }
    /**
    * @private
    */
    static __init__() {
        var physics3D = Physics._physics3D;
        if (physics3D) {
            Mesh._nativeTempVector30 = new physics3D.btVector3(0, 0, 0);
            Mesh._nativeTempVector31 = new physics3D.btVector3(0, 0, 0);
            Mesh._nativeTempVector32 = new physics3D.btVector3(0, 0, 0);
        }
    }
    /**
     *@private
     */
    static _parse(data, propertyParams = null, constructParams = null) {
        var mesh = new Mesh();
        MeshReader.read(data, mesh, mesh._subMeshes);
        return mesh;
    }
    /**
     * 加载网格模板。
     * @param url 模板地址。
     * @param complete 完成回掉。
     */
    static load(url, complete) {
        Laya.loader.create(url, complete, null, Mesh.MESH);
    }
    /**
     * 获取网格的全局默认绑定动作逆矩阵。
     * @return  网格的全局默认绑定动作逆矩阵。
     */
    get inverseAbsoluteBindPoses() {
        return this._inverseBindPoses;
    }
    /**
     * 获取顶点个数
     */
    get vertexCount() {
        return this._vertexCount;
    }
    /**
     * 获取SubMesh的个数。
     * @return SubMesh的个数。
     */
    get subMeshCount() {
        return this._subMeshCount;
    }
    /**
     * 获取边界
     * @return 边界。
     */
    get bounds() {
        return this._bounds;
    }
    /**
     * @private
     */
    _getPositionElement(vertexBuffer) {
        var vertexElements = vertexBuffer.vertexDeclaration.vertexElements;
        for (var i = 0, n = vertexElements.length; i < n; i++) {
            var vertexElement = vertexElements[i];
            if (vertexElement.elementFormat === VertexElementFormat.Vector3 && vertexElement.elementUsage === VertexMesh.MESH_POSITION0)
                return vertexElement;
        }
        return null;
    }
    /**
     * @private
     */
    _generateBoundingObject() {
        var min = this._tempVector30;
        var max = this._tempVector31;
        min.x = min.y = min.z = Number.MAX_VALUE;
        max.x = max.y = max.z = -Number.MAX_VALUE;
        var vertexBufferCount = this._vertexBuffers.length;
        for (var i = 0; i < vertexBufferCount; i++) {
            var vertexBuffer = this._vertexBuffers[i];
            var positionElement = this._getPositionElement(vertexBuffer);
            var verticesData = vertexBuffer.getData();
            var floatCount = vertexBuffer.vertexDeclaration.vertexStride / 4;
            var posOffset = positionElement.offset / 4;
            for (var j = 0, m = verticesData.length; j < m; j += floatCount) {
                var ofset = j + posOffset;
                var pX = verticesData[ofset];
                var pY = verticesData[ofset + 1];
                var pZ = verticesData[ofset + 2];
                min.x = Math.min(min.x, pX);
                min.y = Math.min(min.y, pY);
                min.z = Math.min(min.z, pZ);
                max.x = Math.max(max.x, pX);
                max.y = Math.max(max.y, pY);
                max.z = Math.max(max.z, pZ);
            }
        }
        this._bounds = new Bounds(min, max);
    }
    /**
     *@private
     */
    _setSubMeshes(subMeshes) {
        this._subMeshes = subMeshes;
        this._subMeshCount = subMeshes.length;
        for (var i = 0; i < this._subMeshCount; i++)
            subMeshes[i]._indexInMesh = i;
        this._generateBoundingObject();
    }
    /**
     * @inheritDoc
     */
    _getSubMesh(index) {
        return this._subMeshes[index];
    }
    /**
     * @private
     */
    _setBuffer(vertexBuffers, indexBuffer) {
        var bufferState = this._bufferState;
        bufferState.bind();
        bufferState.applyVertexBuffers(vertexBuffers);
        bufferState.applyIndexBuffer(indexBuffer);
        bufferState.unBind();
        var instanceBufferState = this._instanceBufferState;
        instanceBufferState.bind();
        instanceBufferState.applyVertexBuffers(vertexBuffers);
        instanceBufferState.applyInstanceVertexBuffer(SubMeshInstanceBatch.instance.instanceWorldMatrixBuffer);
        instanceBufferState.applyInstanceVertexBuffer(SubMeshInstanceBatch.instance.instanceMVPMatrixBuffer);
        instanceBufferState.applyIndexBuffer(indexBuffer);
        instanceBufferState.unBind();
    }
    /**
     * @inheritDoc
     */
    /*override*/ _disposeResource() {
        for (var i = 0, n = this._subMeshes.length; i < n; i++)
            this._subMeshes[i].destroy();
        this._nativeTriangleMesh && window.Physics3D.destroy(this._nativeTriangleMesh);
        for (i = 0, n = this._vertexBuffers.length; i < n; i++)
            this._vertexBuffers[i].destroy();
        this._indexBuffer.destroy();
        this._setCPUMemory(0);
        this._setGPUMemory(0);
        this._bufferState.destroy();
        this._instanceBufferState.destroy();
        this._bufferState = null;
        this._instanceBufferState = null;
        this._vertexBuffers = null;
        this._indexBuffer = null;
        this._subMeshes = null;
        this._nativeTriangleMesh = null;
        this._vertexBuffers = null;
        this._indexBuffer = null;
        this._boneNames = null;
        this._inverseBindPoses = null;
    }
    /**
     * @private
     */
    _getPhysicMesh() {
        if (!this._nativeTriangleMesh) {
            var physics3D = window.Physics3D;
            var triangleMesh = new physics3D.btTriangleMesh(); //TODO:独立抽象btTriangleMesh,增加内存复用
            var nativePositio0 = Mesh._nativeTempVector30;
            var nativePositio1 = Mesh._nativeTempVector31;
            var nativePositio2 = Mesh._nativeTempVector32;
            var position0 = this._tempVector30;
            var position1 = this._tempVector31;
            var position2 = this._tempVector32;
            var vertexBuffer = this._vertexBuffers[0]; //TODO:临时
            var positionElement = this._getPositionElement(vertexBuffer);
            var verticesData = vertexBuffer.getData();
            var floatCount = vertexBuffer.vertexDeclaration.vertexStride / 4;
            var posOffset = positionElement.offset / 4;
            var indices = this._indexBuffer.getData(); //TODO:API修改问题
            for (var i = 0, n = indices.length; i < n; i += 3) {
                var p0Index = indices[i] * floatCount + posOffset;
                var p1Index = indices[i + 1] * floatCount + posOffset;
                var p2Index = indices[i + 2] * floatCount + posOffset;
                position0.setValue(verticesData[p0Index], verticesData[p0Index + 1], verticesData[p0Index + 2]);
                position1.setValue(verticesData[p1Index], verticesData[p1Index + 1], verticesData[p1Index + 2]);
                position2.setValue(verticesData[p2Index], verticesData[p2Index + 1], verticesData[p2Index + 2]);
                Utils3D._convertToBulletVec3(position0, nativePositio0, true);
                Utils3D._convertToBulletVec3(position1, nativePositio1, true);
                Utils3D._convertToBulletVec3(position2, nativePositio2, true);
                triangleMesh.addTriangle(nativePositio0, nativePositio1, nativePositio2, true);
            }
            this._nativeTriangleMesh = triangleMesh;
        }
        return this._nativeTriangleMesh;
    }
    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(destObject) {
        var destMesh = destObject;
        for (var i = 0; i < this._vertexBuffers.length; i++) {
            var vb = this._vertexBuffers[i];
            var destVB = new VertexBuffer3D(vb._byteLength, vb.bufferUsage, vb.canRead);
            destVB.vertexDeclaration = vb.vertexDeclaration;
            destVB.setData(vb.getData().slice());
            destMesh._vertexBuffers.push(destVB);
            destMesh._vertexCount += destVB.vertexCount;
        }
        var ib = this._indexBuffer;
        var destIB = new IndexBuffer3D(IndexBuffer3D.INDEXTYPE_USHORT, ib.indexCount, ib.bufferUsage, ib.canRead);
        destIB.setData(ib.getData().slice());
        destMesh._indexBuffer = destIB;
        destMesh._setBuffer(destMesh._vertexBuffers, destIB);
        destMesh._setCPUMemory(this.cpuMemory);
        destMesh._setGPUMemory(this.gpuMemory);
        var boneNames = this._boneNames;
        var destBoneNames = destMesh._boneNames = [];
        for (i = 0; i < boneNames.length; i++)
            destBoneNames[i] = boneNames[i];
        var inverseBindPoses = this._inverseBindPoses;
        var destInverseBindPoses = destMesh._inverseBindPoses = [];
        for (i = 0; i < inverseBindPoses.length; i++)
            destInverseBindPoses[i] = inverseBindPoses[i];
        destMesh._bindPoseIndices = new Uint16Array(this._bindPoseIndices);
        for (i = 0; i < this._skinDataPathMarks.length; i++)
            destMesh._skinDataPathMarks[i] = this._skinDataPathMarks[i].slice();
        for (i = 0; i < this.subMeshCount; i++) {
            var subMesh = this._subMeshes[i];
            var subIndexBufferStart = subMesh._subIndexBufferStart;
            var subIndexBufferCount = subMesh._subIndexBufferCount;
            var boneIndicesList = subMesh._boneIndicesList;
            var destSubmesh = new SubMesh(destMesh);
            destSubmesh._subIndexBufferStart.length = subIndexBufferStart.length;
            destSubmesh._subIndexBufferCount.length = subIndexBufferCount.length;
            destSubmesh._boneIndicesList.length = boneIndicesList.length;
            for (var j = 0; j < subIndexBufferStart.length; j++)
                destSubmesh._subIndexBufferStart[j] = subIndexBufferStart[j];
            for (j = 0; j < subIndexBufferCount.length; j++)
                destSubmesh._subIndexBufferCount[j] = subIndexBufferCount[j];
            for (j = 0; j < boneIndicesList.length; j++)
                destSubmesh._boneIndicesList[j] = new Uint16Array(boneIndicesList[j]);
            destSubmesh._indexBuffer = destIB;
            destSubmesh._indexStart = subMesh._indexStart;
            destSubmesh._indexCount = subMesh._indexCount;
            destSubmesh._indices = new Uint16Array(destIB.getData().buffer, subMesh._indexStart * 2, subMesh._indexCount);
            var vertexBuffer = destMesh._vertexBuffers[0];
            destSubmesh._vertexBuffer = vertexBuffer;
            destMesh._subMeshes.push(destSubmesh);
        }
        destMesh._setSubMeshes(destMesh._subMeshes);
    }
    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone() {
        var dest = new Mesh();
        this.cloneTo(dest);
        return dest;
    }
}
/**Mesh资源。*/
Mesh.MESH = "MESH";
