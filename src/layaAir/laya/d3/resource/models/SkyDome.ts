import { BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { VertexDeclaration } from "../../../RenderEngine/VertexDeclaration";
import { GeometryElement } from "../../core/GeometryElement";
import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { RenderContext3D } from "../../core/render/RenderContext3D";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { BufferState } from "../../../webgl/utils/BufferState";
import { Laya3DRender } from "../../RenderObjs/Laya3DRender";
import { VertexPositionTexture } from "../../graphics/Vertex/VertexPositionTexture";

/**
 * @en SkyDome class is used to create a sky dome.
 * @zh SkyDome 类用于创建天空球。
 */
export class SkyDome extends GeometryElement {
	/**@internal */
	private static _radius: number = 1;
	/**
	 * @en The singleton instance of the SkyDome.
	 * @zh SkyDome的实例。
	 */
	static instance: SkyDome;

	/**
	 * @internal
	 */
	static __init__(): void {
		SkyDome.instance = new SkyDome();//TODO:移植为标准Mesh后需要加锁
	}

	/**@internal */
	private _stacks: number;
	/**@internal */
	private _slices: number;

	/**
	 * @internal
	 * @en The number of stacks of the SkyDome.
	 * @zh SkyDome的堆数。
	 */
	get stacks(): number {
		return this._stacks;
	}

	/**
	 * @internal
	 * @en The number of slices of the SkyDome.
	 * @zh SkyDome的层数。
	 */
	get slices(): number {
		return this._slices;
	}

	/**
	 * @en Creates an instance of SkyDome.
	 * @param stacks The number of stacks of the SkyDome.
	 * @param slices The number of slices of the SkyDome.
	 * @zh 创建一个 SkyDome 的实例。
	 * @param stacks SkyDome的堆数。
	 * @param slices SkyDome的层数。
	 */
	constructor(stacks: number = 48, slices: number = 48) {
		super(MeshTopology.Triangles, DrawType.DrawElement);
		this._stacks = stacks;
		this._slices = slices;
		var vertexDeclaration: VertexDeclaration = VertexPositionTexture.vertexDeclaration;
		var vertexFloatCount: number = vertexDeclaration.vertexStride / 4;
		var numberVertices: number = (this._stacks + 1) * (this._slices + 1);
		var numberIndices: number = (3 * this._stacks * (this._slices + 1)) * 2;

		var vertices: Float32Array = new Float32Array(numberVertices * vertexFloatCount);
		var indices: Uint16Array = new Uint16Array(numberIndices);

		var stackAngle: number = Math.PI / this._stacks;
		var sliceAngle: number = (Math.PI * 2.0) / this._slices;

		// Generate the group of Stacks for the sphere  
		var vertexIndex: number = 0;
		var vertexCount: number = 0;
		var indexCount: number = 0;

		for (var stack: number = 0; stack < (this._stacks + 1); stack++) {
			var r: number = Math.sin(stack * stackAngle);
			var y: number = Math.cos(stack * stackAngle);

			// Generate the group of segments for the current Stack  
			for (var slice: number = 0; slice < (this._slices + 1); slice++) {
				var x: number = r * Math.sin(slice * sliceAngle);
				var z: number = r * Math.cos(slice * sliceAngle);
				vertices[vertexCount + 0] = x * SkyDome._radius;
				vertices[vertexCount + 1] = y * SkyDome._radius;
				vertices[vertexCount + 2] = z * SkyDome._radius;
				vertices[vertexCount + 3] = -(slice / this._slices) + 0.75;//gzk 改成我喜欢的坐标系 原来是 slice/_slices
				vertices[vertexCount + 4] = stack / this._stacks;
				vertexCount += vertexFloatCount;
				if (stack != (this._stacks - 1)) {
					// First Face
					indices[indexCount++] = vertexIndex + 1;
					indices[indexCount++] = vertexIndex;
					indices[indexCount++] = vertexIndex + (this._slices + 1);
					// Second 
					indices[indexCount++] = vertexIndex + (this._slices + 1);
					indices[indexCount++] = vertexIndex;
					indices[indexCount++] = vertexIndex + (this._slices);
					vertexIndex++;
				}
			}
		}

		let vertexBuffer = Laya3DRender.renderOBJCreate.createVertexBuffer3D(vertices.length * 4, BufferUsage.Static, false);
		vertexBuffer.vertexDeclaration = vertexDeclaration;
		let indexBuffer = Laya3DRender.renderOBJCreate.createIndexBuffer3D(IndexFormat.UInt16, indices.length, BufferUsage.Static, false);
		vertexBuffer.setData(vertices.buffer);
		indexBuffer.setData(indices);

		var bufferState: BufferState = new BufferState();
		bufferState.applyState([vertexBuffer], indexBuffer);
		this.bufferState = bufferState;
		this.indexFormat = IndexFormat.UInt16;
		this._geometryElementOBj.setDrawElemenParams(indexBuffer.indexCount, 0);
	}

	/**
	 * @internal
	 * UpdateGeometry Data
	 */
	_updateRenderParams(state: RenderContext3D): void {

	}
}

