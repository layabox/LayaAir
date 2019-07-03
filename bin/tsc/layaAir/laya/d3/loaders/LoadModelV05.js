import { IndexBuffer3D } from "../graphics/IndexBuffer3D";
import { VertexMesh } from "../graphics/Vertex/VertexMesh";
import { VertexBuffer3D } from "../graphics/VertexBuffer3D";
import { HalfFloatUtils } from "../math/HalfFloatUtils";
import { Matrix4x4 } from "../math/Matrix4x4";
import { SubMesh } from "../resource/models/SubMesh";
/**
 * @internal
 * <code>LoadModelV05</code> 类用于模型加载。
 */
export class LoadModelV05 {
    /**
     * @internal
     */
    static parse(readData, version, mesh, subMeshes) {
        LoadModelV05._mesh = mesh;
        LoadModelV05._subMeshes = subMeshes;
        LoadModelV05._version = version;
        LoadModelV05._readData = readData;
        LoadModelV05.READ_DATA();
        LoadModelV05.READ_BLOCK();
        LoadModelV05.READ_STRINGS();
        for (var i = 0, n = LoadModelV05._BLOCK.count; i < n; i++) {
            LoadModelV05._readData.pos = LoadModelV05._BLOCK.blockStarts[i];
            var index = LoadModelV05._readData.getUint16();
            var blockName = LoadModelV05._strings[index];
            var fn = LoadModelV05["READ_" + blockName];
            if (fn == null)
                throw new Error("model file err,no this function:" + index + " " + blockName);
            else
                fn.call(null);
        }
        LoadModelV05._mesh._bindPoseIndices = new Uint16Array(LoadModelV05._bindPoseIndices);
        LoadModelV05._bindPoseIndices.length = 0;
        LoadModelV05._strings.length = 0;
        LoadModelV05._readData = null;
        LoadModelV05._version = null;
        LoadModelV05._mesh = null;
        LoadModelV05._subMeshes = null;
    }
    /**
     * @internal
     */
    static _readString() {
        return LoadModelV05._strings[LoadModelV05._readData.getUint16()];
    }
    /**
     * @internal
     */
    static READ_DATA() {
        LoadModelV05._DATA.offset = LoadModelV05._readData.getUint32();
        LoadModelV05._DATA.size = LoadModelV05._readData.getUint32();
    }
    /**
     * @internal
     */
    static READ_BLOCK() {
        var count = LoadModelV05._BLOCK.count = LoadModelV05._readData.getUint16();
        var blockStarts = LoadModelV05._BLOCK.blockStarts = [];
        var blockLengths = LoadModelV05._BLOCK.blockLengths = [];
        for (var i = 0; i < count; i++) {
            blockStarts.push(LoadModelV05._readData.getUint32());
            blockLengths.push(LoadModelV05._readData.getUint32());
        }
    }
    /**
     * @internal
     */
    static READ_STRINGS() {
        var offset = LoadModelV05._readData.getUint32();
        var count = LoadModelV05._readData.getUint16();
        var prePos = LoadModelV05._readData.pos;
        LoadModelV05._readData.pos = offset + LoadModelV05._DATA.offset;
        for (var i = 0; i < count; i++)
            LoadModelV05._strings[i] = LoadModelV05._readData.readUTFString();
        LoadModelV05._readData.pos = prePos;
    }
    /**
     * @internal
     */
    static READ_MESH() {
        var i, n;
        var memorySize = 0;
        var name = LoadModelV05._readString();
        var arrayBuffer = LoadModelV05._readData.__getBuffer();
        var vertexBufferCount = LoadModelV05._readData.getInt16();
        var offset = LoadModelV05._DATA.offset;
        for (i = 0; i < vertexBufferCount; i++) { //TODO:始终为1
            var vbStart = offset + LoadModelV05._readData.getUint32();
            var vertexCount = LoadModelV05._readData.getUint32();
            var vertexFlag = LoadModelV05._readString();
            var vertexDeclaration = VertexMesh.getVertexDeclaration(vertexFlag, false);
            var vertexStride = vertexDeclaration.vertexStride;
            var vertexData;
            var floatData;
            var uint8Data;
            var subVertexFlags = vertexFlag.split(",");
            var subVertexCount = subVertexFlags.length;
            switch (LoadModelV05._version) {
                case "LAYAMODEL:05":
                    vertexData = arrayBuffer.slice(vbStart, vbStart + vertexCount * vertexStride);
                    floatData = new Float32Array(vertexData);
                    uint8Data = new Uint8Array(vertexData);
                    break;
                case "LAYAMODEL:COMPRESSION_05":
                    vertexData = new ArrayBuffer(vertexStride * vertexCount);
                    floatData = new Float32Array(vertexData);
                    uint8Data = new Uint8Array(vertexData);
                    var lastPosition = LoadModelV05._readData.pos;
                    LoadModelV05._readData.pos = vbStart;
                    for (var j = 0; j < vertexCount; j++) {
                        var subOffset;
                        var verOffset = j * vertexStride;
                        for (var k = 0; k < subVertexCount; k++) {
                            switch (subVertexFlags[k]) {
                                case "POSITION":
                                    subOffset = verOffset / 4;
                                    floatData[subOffset] = HalfFloatUtils.convertToNumber(LoadModelV05._readData.getUint16());
                                    floatData[subOffset + 1] = HalfFloatUtils.convertToNumber(LoadModelV05._readData.getUint16());
                                    floatData[subOffset + 2] = HalfFloatUtils.convertToNumber(LoadModelV05._readData.getUint16());
                                    verOffset += 12;
                                    break;
                                case "NORMAL":
                                    subOffset = verOffset / 4;
                                    floatData[subOffset] = LoadModelV05._readData.getUint8() / 127.5 - 1;
                                    floatData[subOffset + 1] = LoadModelV05._readData.getUint8() / 127.5 - 1;
                                    floatData[subOffset + 2] = LoadModelV05._readData.getUint8() / 127.5 - 1;
                                    verOffset += 12;
                                    break;
                                case "COLOR":
                                    subOffset = verOffset / 4;
                                    floatData[subOffset] = LoadModelV05._readData.getUint8() / 255;
                                    floatData[subOffset + 1] = LoadModelV05._readData.getUint8() / 255;
                                    floatData[subOffset + 2] = LoadModelV05._readData.getUint8() / 255;
                                    floatData[subOffset + 3] = LoadModelV05._readData.getUint8() / 255;
                                    verOffset += 16;
                                    break;
                                case "UV":
                                    subOffset = verOffset / 4;
                                    floatData[subOffset] = HalfFloatUtils.convertToNumber(LoadModelV05._readData.getUint16());
                                    floatData[subOffset + 1] = HalfFloatUtils.convertToNumber(LoadModelV05._readData.getUint16());
                                    verOffset += 8;
                                    break;
                                case "UV1":
                                    subOffset = verOffset / 4;
                                    floatData[subOffset] = HalfFloatUtils.convertToNumber(LoadModelV05._readData.getUint16());
                                    floatData[subOffset + 1] = HalfFloatUtils.convertToNumber(LoadModelV05._readData.getUint16());
                                    verOffset += 8;
                                    break;
                                case "BLENDWEIGHT":
                                    subOffset = verOffset / 4;
                                    floatData[subOffset] = LoadModelV05._readData.getUint8() / 255;
                                    floatData[subOffset + 1] = LoadModelV05._readData.getUint8() / 255;
                                    floatData[subOffset + 2] = LoadModelV05._readData.getUint8() / 255;
                                    floatData[subOffset + 3] = LoadModelV05._readData.getUint8() / 255;
                                    verOffset += 16;
                                    break;
                                case "BLENDINDICES":
                                    uint8Data[verOffset] = LoadModelV05._readData.getUint8();
                                    uint8Data[verOffset + 1] = LoadModelV05._readData.getUint8();
                                    uint8Data[verOffset + 2] = LoadModelV05._readData.getUint8();
                                    uint8Data[verOffset + 3] = LoadModelV05._readData.getUint8();
                                    verOffset += 4;
                                    break;
                                case "TANGENT":
                                    subOffset = verOffset / 4;
                                    floatData[subOffset] = LoadModelV05._readData.getUint8() / 127.5 - 1;
                                    floatData[subOffset + 1] = LoadModelV05._readData.getUint8() / 127.5 - 1;
                                    floatData[subOffset + 2] = LoadModelV05._readData.getUint8() / 127.5 - 1;
                                    floatData[subOffset + 3] = LoadModelV05._readData.getUint8() / 127.5 - 1;
                                    verOffset += 16;
                                    break;
                            }
                        }
                    }
                    LoadModelV05._readData.pos = lastPosition;
                    break;
            }
            var vertexBuffer = new VertexBuffer3D(vertexData.byteLength, WebGL2RenderingContext.STATIC_DRAW, true);
            vertexBuffer.vertexDeclaration = vertexDeclaration;
            vertexBuffer.setData(vertexData);
            LoadModelV05._mesh._vertexBuffer = vertexBuffer;
            LoadModelV05._mesh._vertexCount += vertexBuffer.vertexCount;
            memorySize += floatData.length * 4;
        }
        var ibStart = offset + LoadModelV05._readData.getUint32();
        var ibLength = LoadModelV05._readData.getUint32();
        var ibDatas = new Uint16Array(arrayBuffer.slice(ibStart, ibStart + ibLength));
        var indexBuffer = new IndexBuffer3D(IndexBuffer3D.INDEXTYPE_USHORT, ibLength / 2, WebGL2RenderingContext.STATIC_DRAW, true);
        indexBuffer.setData(ibDatas);
        LoadModelV05._mesh._indexBuffer = indexBuffer;
        LoadModelV05._mesh._setBuffer(LoadModelV05._mesh._vertexBuffer, indexBuffer);
        memorySize += indexBuffer.indexCount * 2;
        LoadModelV05._mesh._setCPUMemory(memorySize);
        LoadModelV05._mesh._setGPUMemory(memorySize);
        var boneNames = LoadModelV05._mesh._boneNames = [];
        var boneCount = LoadModelV05._readData.getUint16();
        boneNames.length = boneCount;
        for (i = 0; i < boneCount; i++)
            boneNames[i] = LoadModelV05._strings[LoadModelV05._readData.getUint16()]; //[兼容性]
        var bindPoseDataStart = LoadModelV05._readData.getUint32();
        var bindPoseDataLength = LoadModelV05._readData.getUint32();
        var bindPoseDatas = new Float32Array(arrayBuffer.slice(offset + bindPoseDataStart, offset + bindPoseDataStart + bindPoseDataLength));
        var bindPoseFloatCount = bindPoseDatas.length;
        var bindPoseCount = bindPoseFloatCount / 16;
        var bindPoseBuffer = LoadModelV05._mesh._inverseBindPosesBuffer = new ArrayBuffer(bindPoseFloatCount * 4); //TODO:[NATIVE]临时
        LoadModelV05._mesh._inverseBindPoses = [];
        for (i = 0; i < bindPoseFloatCount; i += 16) {
            var inverseGlobalBindPose = new Matrix4x4(bindPoseDatas[i + 0], bindPoseDatas[i + 1], bindPoseDatas[i + 2], bindPoseDatas[i + 3], bindPoseDatas[i + 4], bindPoseDatas[i + 5], bindPoseDatas[i + 6], bindPoseDatas[i + 7], bindPoseDatas[i + 8], bindPoseDatas[i + 9], bindPoseDatas[i + 10], bindPoseDatas[i + 11], bindPoseDatas[i + 12], bindPoseDatas[i + 13], bindPoseDatas[i + 14], bindPoseDatas[i + 15], new Float32Array(bindPoseBuffer, i * 4, 16));
            LoadModelV05._mesh._inverseBindPoses[i / 16] = inverseGlobalBindPose;
        }
        return true;
    }
    /**
     * @internal
     */
    static READ_SUBMESH() {
        var arrayBuffer = LoadModelV05._readData.__getBuffer();
        var submesh = new SubMesh(LoadModelV05._mesh);
        LoadModelV05._readData.getInt16(); //TODO:vbIndex
        var ibStart = LoadModelV05._readData.getUint32();
        var ibCount = LoadModelV05._readData.getUint32();
        var indexBuffer = LoadModelV05._mesh._indexBuffer;
        submesh._indexBuffer = indexBuffer;
        submesh._indexStart = ibStart;
        submesh._indexCount = ibCount;
        submesh._indices = new Uint16Array(indexBuffer.getData().buffer, ibStart * 2, ibCount);
        var vertexBuffer = LoadModelV05._mesh._vertexBuffer;
        submesh._vertexBuffer = vertexBuffer;
        var offset = LoadModelV05._DATA.offset;
        var subIndexBufferStart = submesh._subIndexBufferStart;
        var subIndexBufferCount = submesh._subIndexBufferCount;
        var boneIndicesList = submesh._boneIndicesList;
        var drawCount = LoadModelV05._readData.getUint16();
        subIndexBufferStart.length = drawCount;
        subIndexBufferCount.length = drawCount;
        boneIndicesList.length = drawCount;
        var pathMarks = LoadModelV05._mesh._skinDataPathMarks;
        var bindPoseIndices = LoadModelV05._bindPoseIndices;
        var subMeshIndex = LoadModelV05._subMeshes.length;
        for (var i = 0; i < drawCount; i++) {
            subIndexBufferStart[i] = LoadModelV05._readData.getUint32();
            subIndexBufferCount[i] = LoadModelV05._readData.getUint32();
            var boneDicofs = LoadModelV05._readData.getUint32();
            var boneDicCount = LoadModelV05._readData.getUint32();
            var boneIndices = boneIndicesList[i] = new Uint16Array(arrayBuffer.slice(offset + boneDicofs, offset + boneDicofs + boneDicCount));
            for (var j = 0, m = boneIndices.length; j < m; j++) {
                var index = boneIndices[j];
                var combineIndex = bindPoseIndices.indexOf(index);
                if (combineIndex === -1) {
                    boneIndices[j] = bindPoseIndices.length;
                    bindPoseIndices.push(index);
                    pathMarks.push([subMeshIndex, i, j]);
                }
                else {
                    boneIndices[j] = combineIndex;
                }
            }
        }
        LoadModelV05._subMeshes.push(submesh);
        return true;
    }
}
/**@internal */
LoadModelV05._BLOCK = { count: 0 };
/**@internal */
LoadModelV05._DATA = { offset: 0, size: 0 };
/**@internal */
LoadModelV05._strings = [];
/**@internal */
LoadModelV05._bindPoseIndices = [];
