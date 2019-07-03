import { IndexBuffer3D } from "../graphics/IndexBuffer3D"
import { VertexMesh } from "../graphics/Vertex/VertexMesh"
import { VertexBuffer3D } from "../graphics/VertexBuffer3D"
import { VertexDeclaration } from "../graphics/VertexDeclaration"
import { HalfFloatUtils } from "../math/HalfFloatUtils"
import { Matrix4x4 } from "../math/Matrix4x4"
import { Mesh } from "../resource/models/Mesh"
import { SubMesh } from "../resource/models/SubMesh"
import { Byte } from "../../utils/Byte"


/**
 * @internal
 * <code>LoadModelV05</code> 类用于模型加载。
 */
export class LoadModelV05 {

	/**@internal */
	private static _BLOCK: any = { count: 0 };
	/**@internal */
	private static _DATA: any = { offset: 0, size: 0 };

	/**@internal */
	private static _strings: any[] = [];
	/**@internal */
	private static _readData: Byte;
	/**@internal */
	private static _version: string;
	/**@internal */
	private static _mesh: Mesh;
	/**@internal */
	private static _subMeshes: SubMesh[];
	/**@internal */
	private static _bindPoseIndices: number[] = [];

	/**
	 * @internal
	 */
	static parse(readData: Byte, version: string, mesh: Mesh, subMeshes: SubMesh[]): void {
		LoadModelV05._mesh = mesh;
		LoadModelV05._subMeshes = subMeshes;
		LoadModelV05._version = version;
		LoadModelV05._readData = readData;
		LoadModelV05.READ_DATA();
		LoadModelV05.READ_BLOCK();
		LoadModelV05.READ_STRINGS();
		for (var i: number = 0, n: number = LoadModelV05._BLOCK.count; i < n; i++) {
			LoadModelV05._readData.pos = LoadModelV05._BLOCK.blockStarts[i];
			var index: number = LoadModelV05._readData.getUint16();
			var blockName: string = LoadModelV05._strings[index];
			var fn: Function = LoadModelV05["READ_" + blockName];
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
	private static _readString(): string {
		return LoadModelV05._strings[LoadModelV05._readData.getUint16()];
	}

	/**
	 * @internal
	 */
	private static READ_DATA(): void {
		LoadModelV05._DATA.offset = LoadModelV05._readData.getUint32();
		LoadModelV05._DATA.size = LoadModelV05._readData.getUint32();
	}

	/**
	 * @internal
	 */
	private static READ_BLOCK(): void {
		var count: number = LoadModelV05._BLOCK.count = LoadModelV05._readData.getUint16();
		var blockStarts: any[] = LoadModelV05._BLOCK.blockStarts = [];
		var blockLengths: any[] = LoadModelV05._BLOCK.blockLengths = [];
		for (var i: number = 0; i < count; i++) {
			blockStarts.push(LoadModelV05._readData.getUint32());
			blockLengths.push(LoadModelV05._readData.getUint32());
		}
	}

	/**
	 * @internal
	 */
	private static READ_STRINGS(): void {
		var offset: number = LoadModelV05._readData.getUint32();
		var count: number = LoadModelV05._readData.getUint16();
		var prePos: number = LoadModelV05._readData.pos;
		LoadModelV05._readData.pos = offset + LoadModelV05._DATA.offset;

		for (var i: number = 0; i < count; i++)
			LoadModelV05._strings[i] = LoadModelV05._readData.readUTFString();

		LoadModelV05._readData.pos = prePos;
	}

	/**
	 * @internal
	 */
	private static READ_MESH(): boolean {
		var i: number, n: number;
		var memorySize: number = 0;
		var name: string = LoadModelV05._readString();
		var arrayBuffer: ArrayBuffer = LoadModelV05._readData.__getBuffer();
		var vertexBufferCount: number = LoadModelV05._readData.getInt16();
		var offset: number = LoadModelV05._DATA.offset;
		for (i = 0; i < vertexBufferCount; i++) {//TODO:始终为1
			var vbStart: number = offset + LoadModelV05._readData.getUint32();
			var vertexCount: number = LoadModelV05._readData.getUint32();
			var vertexFlag: string = LoadModelV05._readString();
			var vertexDeclaration: VertexDeclaration = VertexMesh.getVertexDeclaration(vertexFlag, false);

			var vertexStride: number = vertexDeclaration.vertexStride;
			var vertexData: ArrayBuffer;
			var floatData: Float32Array;
			var uint8Data: Uint8Array;

			var subVertexFlags: any[] = vertexFlag.split(",");
			var subVertexCount: number = subVertexFlags.length;

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
					var lastPosition: number = LoadModelV05._readData.pos;
					LoadModelV05._readData.pos = vbStart;

					for (var j: number = 0; j < vertexCount; j++) {
						var subOffset: number;
						var verOffset: number = j * vertexStride;
						for (var k: number = 0; k < subVertexCount; k++) {
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

			var vertexBuffer: VertexBuffer3D = new VertexBuffer3D(vertexData.byteLength, WebGL2RenderingContext.STATIC_DRAW, true);
			vertexBuffer.vertexDeclaration = vertexDeclaration;
			vertexBuffer.setData(vertexData);
			LoadModelV05._mesh._vertexBuffer = vertexBuffer;
			LoadModelV05._mesh._vertexCount += vertexBuffer.vertexCount;
			memorySize += floatData.length * 4;
		}

		var ibStart: number = offset + LoadModelV05._readData.getUint32();
		var ibLength: number = LoadModelV05._readData.getUint32();
		var ibDatas: Uint16Array = new Uint16Array(arrayBuffer.slice(ibStart, ibStart + ibLength));
		var indexBuffer: IndexBuffer3D = new IndexBuffer3D(IndexBuffer3D.INDEXTYPE_USHORT, ibLength / 2, WebGL2RenderingContext.STATIC_DRAW, true);
		indexBuffer.setData(ibDatas);
		LoadModelV05._mesh._indexBuffer = indexBuffer;

		LoadModelV05._mesh._setBuffer(LoadModelV05._mesh._vertexBuffer, indexBuffer);

		memorySize += indexBuffer.indexCount * 2;
		LoadModelV05._mesh._setCPUMemory(memorySize);
		LoadModelV05._mesh._setGPUMemory(memorySize);

		var boneNames: string[] = LoadModelV05._mesh._boneNames = [];
		var boneCount: number = LoadModelV05._readData.getUint16();
		boneNames.length = boneCount;
		for (i = 0; i < boneCount; i++)
			boneNames[i] = LoadModelV05._strings[LoadModelV05._readData.getUint16()];//[兼容性]

		var bindPoseDataStart: number = LoadModelV05._readData.getUint32();
		var bindPoseDataLength: number = LoadModelV05._readData.getUint32();
		var bindPoseDatas: Float32Array = new Float32Array(arrayBuffer.slice(offset + bindPoseDataStart, offset + bindPoseDataStart + bindPoseDataLength));
		var bindPoseFloatCount: number = bindPoseDatas.length;
		var bindPoseCount: number = bindPoseFloatCount / 16;
		var bindPoseBuffer: ArrayBuffer = LoadModelV05._mesh._inverseBindPosesBuffer = new ArrayBuffer(bindPoseFloatCount * 4);//TODO:[NATIVE]临时
		LoadModelV05._mesh._inverseBindPoses = [];
		for (i = 0; i < bindPoseFloatCount; i += 16) {
			var inverseGlobalBindPose: Matrix4x4 = new Matrix4x4(bindPoseDatas[i + 0], bindPoseDatas[i + 1], bindPoseDatas[i + 2], bindPoseDatas[i + 3], bindPoseDatas[i + 4], bindPoseDatas[i + 5], bindPoseDatas[i + 6], bindPoseDatas[i + 7], bindPoseDatas[i + 8], bindPoseDatas[i + 9], bindPoseDatas[i + 10], bindPoseDatas[i + 11], bindPoseDatas[i + 12], bindPoseDatas[i + 13], bindPoseDatas[i + 14], bindPoseDatas[i + 15], new Float32Array(bindPoseBuffer, i * 4, 16));
			LoadModelV05._mesh._inverseBindPoses[i / 16] = inverseGlobalBindPose;
		}
		return true;
	}

	/**
	 * @internal
	 */
	private static READ_SUBMESH(): boolean {
		var arrayBuffer: ArrayBuffer = LoadModelV05._readData.__getBuffer();
		var subMesh: SubMesh = new SubMesh(LoadModelV05._mesh);

		LoadModelV05._readData.getInt16();//TODO:vbIndex
		var ibStart: number = LoadModelV05._readData.getUint32();
		var ibCount: number = LoadModelV05._readData.getUint32();
		var indexBuffer: IndexBuffer3D = LoadModelV05._mesh._indexBuffer;
		subMesh._indexBuffer = indexBuffer;
		subMesh._setIndexRange(ibStart,ibCount);
		var vertexBuffer: VertexBuffer3D = LoadModelV05._mesh._vertexBuffer;
		subMesh._vertexBuffer = vertexBuffer;

		var offset: number = LoadModelV05._DATA.offset;
		var subIndexBufferStart: number[] = subMesh._subIndexBufferStart;
		var subIndexBufferCount: number[] = subMesh._subIndexBufferCount;
		var boneIndicesList: Uint16Array[] = subMesh._boneIndicesList;
		var drawCount: number = LoadModelV05._readData.getUint16();
		subIndexBufferStart.length = drawCount;
		subIndexBufferCount.length = drawCount;
		boneIndicesList.length = drawCount;

		var pathMarks: any[][] = LoadModelV05._mesh._skinDataPathMarks;
		var bindPoseIndices: number[] = LoadModelV05._bindPoseIndices;
		var subMeshIndex: number = LoadModelV05._subMeshes.length;
		for (var i: number = 0; i < drawCount; i++) {
			subIndexBufferStart[i] = LoadModelV05._readData.getUint32();
			subIndexBufferCount[i] = LoadModelV05._readData.getUint32();
			var boneDicofs: number = LoadModelV05._readData.getUint32();
			var boneDicCount: number = LoadModelV05._readData.getUint32();
			var boneIndices: Uint16Array = boneIndicesList[i] = new Uint16Array(arrayBuffer.slice(offset + boneDicofs, offset + boneDicofs + boneDicCount));
			for (var j: number = 0, m: number = boneIndices.length; j < m; j++) {
				var index: number = boneIndices[j];
				var combineIndex: number = bindPoseIndices.indexOf(index);
				if (combineIndex === -1) {
					boneIndices[j] = bindPoseIndices.length;
					bindPoseIndices.push(index);
					pathMarks.push([subMeshIndex, i, j]);
				} else {
					boneIndices[j] = combineIndex;
				}
			}
		}
		LoadModelV05._subMeshes.push(subMesh);
		return true;
	}

}


