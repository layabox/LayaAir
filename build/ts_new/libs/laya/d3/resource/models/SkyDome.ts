import { SkyMesh } from "./SkyMesh";
import { BufferState } from "../../core/BufferState"
import { RenderContext3D } from "../../core/render/RenderContext3D"
import { IndexBuffer3D } from "../../graphics/IndexBuffer3D"
import { VertexPositionTexture0 } from "../../graphics/Vertex/VertexPositionTexture0"
import { VertexBuffer3D } from "../../graphics/VertexBuffer3D"
import { VertexDeclaration } from "../../graphics/VertexDeclaration"
import { LayaGL } from "../../../layagl/LayaGL"
import { Stat } from "../../../utils/Stat"
import { IndexFormat } from "../../graphics/IndexFormat";

/**
 * <code>SkyDome</code> 类用于创建天空盒。
 */
export class SkyDome extends SkyMesh {
	/**@internal */
	private static _radius: number = 1;

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
	 * 获取堆数。
	 */
	get stacks(): number {
		return this._stacks;
	}

	/**
	 * 获取层数。
	 */
	get slices(): number {
		return this._slices;
	}

	/**
	 * 创建一个 <code>SkyDome</code> 实例。
	 * @param stacks 堆数。
	 * @param slices 层数。
	 */
	constructor(stacks: number = 48, slices: number = 48) {
		super();
		var gl: WebGLRenderingContext = LayaGL.instance;
		this._stacks = stacks;
		this._slices = slices;
		var vertexDeclaration: VertexDeclaration = VertexPositionTexture0.vertexDeclaration;
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

		this._vertexBuffer = new VertexBuffer3D(vertices.length * 4, gl.STATIC_DRAW, false);
		this._vertexBuffer.vertexDeclaration = vertexDeclaration;
		this._indexBuffer = new IndexBuffer3D(IndexFormat.UInt16, indices.length, gl.STATIC_DRAW, false);
		this._vertexBuffer.setData(vertices.buffer);
		this._indexBuffer.setData(indices);

		var bufferState: BufferState = new BufferState();
		bufferState.bind();
		bufferState.applyVertexBuffer(this._vertexBuffer);
		bufferState.applyIndexBuffer(this._indexBuffer);
		bufferState.unBind();
		this._bufferState = bufferState;
	}

	/**
	 * @internal
	 */
	_render(state: RenderContext3D): void {
		var gl: WebGLRenderingContext = LayaGL.instance;
		var indexCount: number = this._indexBuffer.indexCount;
		gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_SHORT, 0);
		Stat.trianglesFaces += indexCount / 3;
		Stat.renderBatches++;
	}
}

