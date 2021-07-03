
import { IndexBuffer3D } from "../graphics/IndexBuffer3D"
import { VertexMesh } from "../graphics/Vertex/VertexMesh"
import { VertexBuffer3D } from "../graphics/VertexBuffer3D"
import { VertexDeclaration } from "../graphics/VertexDeclaration"
import { Matrix4x4 } from "../math/Matrix4x4"
import { Mesh, skinnedMatrixCache } from "../resource/models/Mesh"
import { SubMesh } from "../resource/models/SubMesh"
import { Byte } from "../../utils/Byte"
import { LayaGL } from "../../layagl/LayaGL";
import { IndexFormat } from "../graphics/IndexFormat"

/**
 * @internal
 * <code>LoadModel</code> 类用于模型加载。
 */
export class LoadModelV04 {

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

	/**
	 * @internal
	 */
	static parse(readData: Byte, version: string, mesh: Mesh, subMeshes: SubMesh[]): void {
		LoadModelV04._mesh = mesh;
		LoadModelV04._subMeshes = subMeshes;
		LoadModelV04._version = version;
		LoadModelV04._readData = readData;
		LoadModelV04.READ_DATA();
		LoadModelV04.READ_BLOCK();
		LoadModelV04.READ_STRINGS();
		for (var i: number = 0, n: number = LoadModelV04._BLOCK.count; i < n; i++) {
			LoadModelV04._readData.pos = LoadModelV04._BLOCK.blockStarts[i];
			var index: number = LoadModelV04._readData.getUint16();
			var blockName: string = LoadModelV04._strings[index];
			var fn: Function = (LoadModelV04 as any)["READ_" + blockName];
			if (fn == null)
				throw new Error("model file err,no this function:" + index + " " + blockName);
			else
				fn.call(null);
		}
		LoadModelV04._strings.length = 0;
		LoadModelV04._readData = null;
		LoadModelV04._version = null;
		LoadModelV04._mesh = null;
		LoadModelV04._subMeshes = null;
	}

	/**
	 * @internal
	 */
	private static _readString(): string {
		return LoadModelV04._strings[LoadModelV04._readData.getUint16()];
	}

	/**
	 * @internal
	 */
	private static READ_DATA(): void {
		LoadModelV04._DATA.offset = LoadModelV04._readData.getUint32();
		LoadModelV04._DATA.size = LoadModelV04._readData.getUint32();
	}

	/**
	 * @internal
	 */
	private static READ_BLOCK(): void {
		var count: number = LoadModelV04._BLOCK.count = LoadModelV04._readData.getUint16();
		var blockStarts: any[] = LoadModelV04._BLOCK.blockStarts = [];
		var blockLengths: any[] = LoadModelV04._BLOCK.blockLengths = [];
		for (var i: number = 0; i < count; i++) {
			blockStarts.push(LoadModelV04._readData.getUint32());
			blockLengths.push(LoadModelV04._readData.getUint32());
		}
	}

	/**
	 * @internal
	 */
	private static READ_STRINGS(): void {
		var offset: number = LoadModelV04._readData.getUint32();
		var count: number = LoadModelV04._readData.getUint16();
		var prePos: number = LoadModelV04._readData.pos;
		LoadModelV04._readData.pos = offset + LoadModelV04._DATA.offset;

		for (var i: number = 0; i < count; i++)
			LoadModelV04._strings[i] = LoadModelV04._readData.readUTFString();

		LoadModelV04._readData.pos = prePos;
	}

	/**
	 * @internal
	 */
	private static READ_MESH(): boolean {
		var gl: WebGLRenderingContext = LayaGL.instance;
		var name: string = LoadModelV04._readString();
		var arrayBuffer: ArrayBuffer = LoadModelV04._readData.__getBuffer();
		var i: number;

		var memorySize: number = 0;
		var vertexBufferCount: number = LoadModelV04._readData.getInt16();
		var offset: number = LoadModelV04._DATA.offset;
		for (i = 0; i < vertexBufferCount; i++) {//TODO:始终为1
			var vbStart: number = offset + LoadModelV04._readData.getUint32();
			var vbLength: number = LoadModelV04._readData.getUint32();
			var vbArrayBuffer: ArrayBuffer = arrayBuffer.slice(vbStart, vbStart + vbLength);
			var vbDatas: Float32Array = new Float32Array(vbArrayBuffer);
			var bufferAttribute: string = LoadModelV04._readString();
			var vertexDeclaration: VertexDeclaration;
			switch (LoadModelV04._version) {
				case "LAYAMODEL:0301":
				case "LAYAMODEL:0400":
					vertexDeclaration = VertexMesh.getVertexDeclaration(bufferAttribute);
					break;
				case "LAYAMODEL:0401":
					vertexDeclaration = VertexMesh.getVertexDeclaration(bufferAttribute, false);
					break;
				default:
					throw new Error("LoadModelV03: unknown version.");
			}

			if (!vertexDeclaration)
				throw new Error("LoadModelV03: unknown vertexDeclaration.");

			var vertexBuffer: VertexBuffer3D = new VertexBuffer3D(vbDatas.length * 4, gl.STATIC_DRAW, true);
			vertexBuffer.vertexDeclaration = vertexDeclaration;
			vertexBuffer.setData(vbDatas.buffer);
			LoadModelV04._mesh._vertexBuffer = vertexBuffer;
			LoadModelV04._mesh._vertexCount += vertexBuffer._byteLength / vertexDeclaration.vertexStride;
			memorySize += vbDatas.length * 4;
		}

		var ibStart: number = offset + LoadModelV04._readData.getUint32();
		var ibLength: number = LoadModelV04._readData.getUint32();
		var ibDatas: Uint16Array = new Uint16Array(arrayBuffer.slice(ibStart, ibStart + ibLength));
		var indexBuffer: IndexBuffer3D = new IndexBuffer3D(IndexFormat.UInt16, ibLength / 2, gl.STATIC_DRAW, true);
		indexBuffer.setData(ibDatas);
		LoadModelV04._mesh._indexBuffer = indexBuffer;
		memorySize += indexBuffer.indexCount * 2;

		LoadModelV04._mesh._setBuffer(LoadModelV04._mesh._vertexBuffer, indexBuffer);

		LoadModelV04._mesh._setCPUMemory(memorySize);
		LoadModelV04._mesh._setGPUMemory(memorySize);

		var boneNames: string[] = LoadModelV04._mesh._boneNames = [];
		var boneCount: number = LoadModelV04._readData.getUint16();
		boneNames.length = boneCount;
		for (i = 0; i < boneCount; i++)
			boneNames[i] = LoadModelV04._strings[LoadModelV04._readData.getUint16()];

		LoadModelV04._readData.pos += 8;//TODO:优化

		var bindPoseDataStart: number = LoadModelV04._readData.getUint32();
		var bindPoseDataLength: number = LoadModelV04._readData.getUint32();
		var bindPoseDatas: Float32Array = new Float32Array(arrayBuffer.slice(offset + bindPoseDataStart, offset + bindPoseDataStart + bindPoseDataLength));
		var bindPoseFloatCount: number = bindPoseDatas.length;
		var bindPoseBuffer: ArrayBuffer = LoadModelV04._mesh._inverseBindPosesBuffer = new ArrayBuffer(bindPoseFloatCount * 4);//TODO:[NATIVE]临时
		LoadModelV04._mesh._inverseBindPoses = [];
		if(bindPoseFloatCount!=0) 
			LoadModelV04._mesh._instanceBufferStateType = Mesh.MESH_INSTANCEBUFFER_TYPE_SIMPLEANIMATOR;
		else
			LoadModelV04._mesh._instanceBufferStateType = Mesh.MESH_INSTANCEBUFFER_TYPE_NORMAL;
		LoadModelV04._mesh._setInstanceBuffer(LoadModelV04._mesh._instanceBufferStateType);
		for (i = 0; i < bindPoseFloatCount; i += 16) {
			var inverseGlobalBindPose: Matrix4x4 = new Matrix4x4(bindPoseDatas[i + 0], bindPoseDatas[i + 1], bindPoseDatas[i + 2], bindPoseDatas[i + 3], bindPoseDatas[i + 4], bindPoseDatas[i + 5], bindPoseDatas[i + 6], bindPoseDatas[i + 7], bindPoseDatas[i + 8], bindPoseDatas[i + 9], bindPoseDatas[i + 10], bindPoseDatas[i + 11], bindPoseDatas[i + 12], bindPoseDatas[i + 13], bindPoseDatas[i + 14], bindPoseDatas[i + 15], new Float32Array(bindPoseBuffer, i * 4, 16));
			LoadModelV04._mesh._inverseBindPoses[i / 16] = inverseGlobalBindPose;
		}
		return true;
	}

	/**
	 * @internal
	 */
	private static READ_SUBMESH(): boolean {
		var arrayBuffer: ArrayBuffer = LoadModelV04._readData.__getBuffer();
		var subMesh: SubMesh = new SubMesh(LoadModelV04._mesh);

		LoadModelV04._readData.getInt16();//TODO:vbIndex
		LoadModelV04._readData.getUint32();//TODO:vbStart
		LoadModelV04._readData.getUint32();//TODO:vbLength

		var ibStart: number = LoadModelV04._readData.getUint32();
		var ibCount: number = LoadModelV04._readData.getUint32();
		var indexBuffer: IndexBuffer3D = LoadModelV04._mesh._indexBuffer;
		subMesh._indexBuffer = indexBuffer;
		subMesh._setIndexRange(ibStart, ibCount);
		var vertexBuffer: VertexBuffer3D = LoadModelV04._mesh._vertexBuffer;
		subMesh._vertexBuffer = vertexBuffer;

		var offset: number = LoadModelV04._DATA.offset;
		var subIndexBufferStart: number[] = subMesh._subIndexBufferStart;
		var subIndexBufferCount: number[] = subMesh._subIndexBufferCount;
		var boneIndicesList: Uint16Array[] = subMesh._boneIndicesList;
		var drawCount: number = LoadModelV04._readData.getUint16();
		subIndexBufferStart.length = drawCount;
		subIndexBufferCount.length = drawCount;
		boneIndicesList.length = drawCount;

		var skinnedCache: skinnedMatrixCache[] = LoadModelV04._mesh._skinnedMatrixCaches;
		var subMeshIndex: number = LoadModelV04._subMeshes.length;
		skinnedCache.length = LoadModelV04._mesh._inverseBindPoses.length;
		for (var i: number = 0; i < drawCount; i++) {
			subIndexBufferStart[i] = LoadModelV04._readData.getUint32();
			subIndexBufferCount[i] = LoadModelV04._readData.getUint32();
			var boneDicofs: number = LoadModelV04._readData.getUint32();
			var boneDicCount: number = LoadModelV04._readData.getUint32();
			var boneIndices: Uint16Array = boneIndicesList[i] = new Uint16Array(arrayBuffer.slice(offset + boneDicofs, offset + boneDicofs + boneDicCount));
			var boneIndexCount: number = boneIndices.length;
			for (var j: number = 0; j < boneIndexCount; j++) {
				var index: number = boneIndices[j];
				skinnedCache[index] || (skinnedCache[index] = new skinnedMatrixCache(subMeshIndex, i, j));
			}
		}
		LoadModelV04._subMeshes.push(subMesh);
		return true;
	}
}


