import { IndexBuffer3D } from "../../graphics/IndexBuffer3D";
import { VertexMesh } from "../../graphics/Vertex/VertexMesh";
import { VertexBuffer3D } from "../../graphics/VertexBuffer3D";
import { VertexDeclaration } from "../../graphics/VertexDeclaration";
import { Quaternion } from "../../math/Quaternion";
import { Vector3 } from "../../math/Vector3";
import { Mesh } from "./Mesh";
import { SubMesh } from "./SubMesh";
import { LayaGL } from "../../../layagl/LayaGL";
import { IndexFormat } from "../../graphics/IndexFormat";

/**
 * <code>PrimitiveMesh</code> 类用于创建简单网格。
 */
export class PrimitiveMesh {

	static __init__(): void {

	}

	/**
	 * @internal
	 */
	static _createMesh(vertexDeclaration: VertexDeclaration, vertices: Float32Array, indices: Uint16Array): Mesh {
		var gl: WebGLRenderingContext = LayaGL.instance;
		var mesh: Mesh = new Mesh();
		var subMesh: SubMesh = new SubMesh(mesh);

		var vertexBuffer: VertexBuffer3D = new VertexBuffer3D(vertices.length * 4, gl.STATIC_DRAW, true);
		vertexBuffer.vertexDeclaration = vertexDeclaration;
		vertexBuffer.setData(vertices.buffer);
		mesh._vertexBuffer = vertexBuffer;
		mesh._vertexCount = vertexBuffer._byteLength / vertexDeclaration.vertexStride;
		var indexBuffer: IndexBuffer3D = new IndexBuffer3D(IndexFormat.UInt16, indices.length, gl.STATIC_DRAW, true);
		indexBuffer.setData(indices);
		mesh._indexBuffer = indexBuffer;

		mesh._setBuffer(vertexBuffer, indexBuffer);
		mesh._setInstanceBuffer(mesh._instanceBufferStateType);
		subMesh._vertexBuffer = vertexBuffer;
		subMesh._indexBuffer = indexBuffer;
		subMesh._setIndexRange(0, indexBuffer.indexCount);

		var subIndexBufferStart: number[] = subMesh._subIndexBufferStart;
		var subIndexBufferCount: number[] = subMesh._subIndexBufferCount;
		var boneIndicesList: Uint16Array[] = subMesh._boneIndicesList;
		subIndexBufferStart.length = 1;
		subIndexBufferCount.length = 1;
		boneIndicesList.length = 1;
		subIndexBufferStart[0] = 0;
		subIndexBufferCount[0] = indexBuffer.indexCount;

		var subMeshes: SubMesh[] = [];
		subMeshes.push(subMesh);
		mesh._setSubMeshes(subMeshes);
		mesh.calculateBounds();
		var memorySize: number = vertexBuffer._byteLength + indexBuffer._byteLength;
		mesh._setCPUMemory(memorySize);
		mesh._setGPUMemory(memorySize);
		return mesh;
	}

	/**
	 * 创建Box网格。
	 * @param long 半径
	 * @param height 垂直层数
	 * @param width 水平层数
	 * @return
	 */
	static createBox(long: number = 1, height: number = 1, width: number = 1): Mesh {
		var vertexDeclaration: VertexDeclaration = VertexMesh.getVertexDeclaration("POSITION,NORMAL,UV");

		var halfLong: number = long / 2;
		var halfHeight: number = height / 2;
		var halfWidth: number = width / 2;

		var vertices: Float32Array = new Float32Array([
			//上
			-halfLong, halfHeight, -halfWidth, 0, 1, 0, 0, 0, halfLong, halfHeight, -halfWidth, 0, 1, 0, 1, 0, halfLong, halfHeight, halfWidth, 0, 1, 0, 1, 1, -halfLong, halfHeight, halfWidth, 0, 1, 0, 0, 1,
			//下
			-halfLong, -halfHeight, -halfWidth, 0, -1, 0, 0, 1, halfLong, -halfHeight, -halfWidth, 0, -1, 0, 1, 1, halfLong, -halfHeight, halfWidth, 0, -1, 0, 1, 0, -halfLong, -halfHeight, halfWidth, 0, -1, 0, 0, 0,
			//左
			-halfLong, halfHeight, -halfWidth, -1, 0, 0, 0, 0, -halfLong, halfHeight, halfWidth, -1, 0, 0, 1, 0, -halfLong, -halfHeight, halfWidth, -1, 0, 0, 1, 1, -halfLong, -halfHeight, -halfWidth, -1, 0, 0, 0, 1,
			//右
			halfLong, halfHeight, -halfWidth, 1, 0, 0, 1, 0, halfLong, halfHeight, halfWidth, 1, 0, 0, 0, 0, halfLong, -halfHeight, halfWidth, 1, 0, 0, 0, 1, halfLong, -halfHeight, -halfWidth, 1, 0, 0, 1, 1,
			//前
			-halfLong, halfHeight, halfWidth, 0, 0, 1, 0, 0, halfLong, halfHeight, halfWidth, 0, 0, 1, 1, 0, halfLong, -halfHeight, halfWidth, 0, 0, 1, 1, 1, -halfLong, -halfHeight, halfWidth, 0, 0, 1, 0, 1,
			//后
			-halfLong, halfHeight, -halfWidth, 0, 0, -1, 1, 0, halfLong, halfHeight, -halfWidth, 0, 0, -1, 0, 0, halfLong, -halfHeight, -halfWidth, 0, 0, -1, 0, 1, -halfLong, -halfHeight, -halfWidth, 0, 0, -1, 1, 1]);

		var indices: Uint16Array = new Uint16Array([
			//上
			0, 1, 2, 2, 3, 0,
			//下
			4, 7, 6, 6, 5, 4,
			//左
			8, 9, 10, 10, 11, 8,
			//右
			12, 15, 14, 14, 13, 12,
			//前
			16, 17, 18, 18, 19, 16,
			//后
			20, 23, 22, 22, 21, 20]);
		return PrimitiveMesh._createMesh(vertexDeclaration, vertices, indices);
	}

	/**
	 * 创建一个胶囊体模型
	 * @param radius 半径
	 * @param height 高度
	 * @param stacks 水平层数,一般设为垂直层数的一半
	 * @param slices 垂直层数
	 */
	static createCapsule(radius: number = 0.5, height: number = 2, stacks: number = 16, slices: number = 32): Mesh {
		var vertexCount: number = (stacks + 1) * (slices + 1) * 2 + (slices + 1) * 2;
		var indexCount: number = (3 * stacks * (slices + 1)) * 2 * 2 + 2 * slices * 3;

		//定义顶点数据结构
		var vertexDeclaration: VertexDeclaration = VertexMesh.getVertexDeclaration("POSITION,NORMAL,UV");
		//单个顶点数据个数,总共字节数/单个字节数
		var vertexFloatStride: number = vertexDeclaration.vertexStride / 4;
		//顶点
		var vertices: Float32Array = new Float32Array(vertexCount * vertexFloatStride);
		//顶点索引
		var indices: Uint16Array = new Uint16Array(indexCount);

		var stackAngle: number = (Math.PI / 2.0) / stacks;
		var sliceAngle: number = (Math.PI * 2.0) / slices;

		//圆柱体高度的一半
		var hcHeight: number = height / 2 - radius;

		var posX: number = 0;
		var posY: number = 0;
		var posZ: number = 0;

		var vc: number = 0;
		var ic: number = 0;

		var verticeCount: number = 0;

		var stack: number, slice: number;

		//顶部半球
		for (stack = 0; stack <= stacks; stack++) {

			for (slice = 0; slice <= slices; slice++) {

				posX = radius * Math.cos(stack * stackAngle) * Math.cos(slice * sliceAngle + Math.PI);
				posY = radius * Math.sin(stack * stackAngle);
				posZ = radius * Math.cos(stack * stackAngle) * Math.sin(slice * sliceAngle + Math.PI);

				//pos
				vertices[vc++] = posX;
				vertices[vc++] = posY + hcHeight;
				vertices[vc++] = posZ;

				//normal
				vertices[vc++] = posX;
				vertices[vc++] = posY;
				vertices[vc++] = posZ;

				//uv
				vertices[vc++] = 1 - slice / slices;
				vertices[vc++] = (1 - stack / stacks) * ((Math.PI * radius / 2) / (height + Math.PI * radius));

				if (stack < stacks) {

					// First
					indices[ic++] = (stack * (slices + 1)) + slice + (slices + 1);
					indices[ic++] = (stack * (slices + 1)) + slice;
					indices[ic++] = (stack * (slices + 1)) + slice + 1;
					// Second
					indices[ic++] = (stack * (slices + 1)) + slice + (slices);
					indices[ic++] = (stack * (slices + 1)) + slice;
					indices[ic++] = (stack * (slices + 1)) + slice + (slices + 1);

				}

			}
		}

		verticeCount += (stacks + 1) * (slices + 1);

		//底部半球
		for (stack = 0; stack <= stacks; stack++) {

			for (slice = 0; slice <= slices; slice++) {

				posX = radius * Math.cos(stack * stackAngle) * Math.cos(slice * sliceAngle + Math.PI);
				posY = radius * Math.sin(-stack * stackAngle);
				posZ = radius * Math.cos(stack * stackAngle) * Math.sin(slice * sliceAngle + Math.PI);

				//pos
				vertices[vc++] = posX;
				vertices[vc++] = posY - hcHeight;
				vertices[vc++] = posZ;

				//normal
				vertices[vc++] = posX;
				vertices[vc++] = posY;
				vertices[vc++] = posZ;

				//uv
				vertices[vc++] = 1 - slice / slices;
				vertices[vc++] = ((stack / stacks) * (Math.PI * radius / 2) + (height + Math.PI * radius / 2)) / (height + Math.PI * radius);

				if (stack < stacks) {

					// First
					indices[ic++] = verticeCount + (stack * (slices + 1)) + slice;
					indices[ic++] = verticeCount + (stack * (slices + 1)) + slice + (slices + 1);
					indices[ic++] = verticeCount + (stack * (slices + 1)) + slice + 1;
					// Second
					indices[ic++] = verticeCount + (stack * (slices + 1)) + slice;
					indices[ic++] = verticeCount + (stack * (slices + 1)) + slice + (slices);
					indices[ic++] = verticeCount + (stack * (slices + 1)) + slice + (slices + 1);

				}
			}
		}

		verticeCount += (stacks + 1) * (slices + 1);

		//侧壁
		for (slice = 0; slice <= slices; slice++) {
			posX = radius * Math.cos(slice * sliceAngle + Math.PI);
			posY = hcHeight;
			posZ = radius * Math.sin(slice * sliceAngle + Math.PI);

			//pos
			vertices[vc++] = posX;
			vertices[vc + (slices + 1) * 8 - 1] = posX;
			vertices[vc++] = posY;
			vertices[vc + (slices + 1) * 8 - 1] = -posY;
			vertices[vc++] = posZ;
			vertices[vc + (slices + 1) * 8 - 1] = posZ;
			//normal
			vertices[vc++] = posX;
			vertices[vc + (slices + 1) * 8 - 1] = posX;
			vertices[vc++] = 0;
			vertices[vc + (slices + 1) * 8 - 1] = 0;
			vertices[vc++] = posZ;
			vertices[vc + (slices + 1) * 8 - 1] = posZ;
			//uv    
			vertices[vc++] = 1 - slice * 1 / slices;
			vertices[vc + (slices + 1) * 8 - 1] = 1 - slice * 1 / slices;
			vertices[vc++] = (Math.PI * radius / 2) / (height + Math.PI * radius);
			vertices[vc + (slices + 1) * 8 - 1] = (Math.PI * radius / 2 + height) / (height + Math.PI * radius);
		}

		for (slice = 0; slice < slices; slice++) {

			indices[ic++] = slice + verticeCount + (slices + 1);
			indices[ic++] = slice + verticeCount + 1;
			indices[ic++] = slice + verticeCount;

			indices[ic++] = slice + verticeCount + (slices + 1);
			indices[ic++] = slice + verticeCount + (slices + 1) + 1;
			indices[ic++] = slice + verticeCount + 1;
		}

		verticeCount += 2 * (slices + 1);
		return PrimitiveMesh._createMesh(vertexDeclaration, vertices, indices);
	}

	/**
	 * 创建一个圆锥体模型
	 * @param radius 半径
	 * @param height 高度
	 * @param slices 分段数
	 */
	static createCone(radius: number = 0.5, height: number = 1, slices: number = 32): Mesh {
		//(this._released) || (dispose());//如果已存在，则释放资源
		var vertexCount: number = (slices + 1 + 1) + (slices + 1) * 2;
		var indexCount: number = 6 * slices + 3 * slices;

		//定义顶点数据结构
		var vertexDeclaration: VertexDeclaration = VertexMesh.getVertexDeclaration("POSITION,NORMAL,UV");
		//单个顶点数据个数,总共字节数/单个字节数
		var vertexFloatStride: number = vertexDeclaration.vertexStride / 4;
		//顶点
		var vertices: Float32Array = new Float32Array(vertexCount * vertexFloatStride);
		//顶点索引
		var indices: Uint16Array = new Uint16Array(indexCount);

		var sliceAngle: number = (Math.PI * 2.0) / slices;

		var halfHeight: number = height / 2;
		var curAngle: number = 0;
		var verticeCount: number = 0;

		var posX: number = 0;
		var posY: number = 0;
		var posZ: number = 0;

		var normal: Vector3 = new Vector3();
		var downV3: Vector3 = new Vector3(0, -1, 0);
		var upPoint: Vector3 = new Vector3(0, halfHeight, 0);
		var downPoint: Vector3 = new Vector3();
		var v3: Vector3 = new Vector3();
		var q4: Quaternion = new Quaternion();
		var rotateAxis: Vector3 = new Vector3();
		var rotateRadius: number;

		var vc: number = 0;
		var ic: number = 0;

		//壁
		for (var rv: number = 0; rv <= slices; rv++) {
			curAngle = rv * sliceAngle;
			posX = Math.cos(curAngle + Math.PI) * radius;
			posY = halfHeight;
			posZ = Math.sin(curAngle + Math.PI) * radius;

			//pos
			vertices[vc++] = 0;
			vertices[vc + (slices + 1) * 8 - 1] = posX;
			vertices[vc++] = posY;
			vertices[vc + (slices + 1) * 8 - 1] = -posY;
			vertices[vc++] = 0;
			vertices[vc + (slices + 1) * 8 - 1] = posZ;

			normal.x = posX;
			normal.y = 0;
			normal.z = posZ;
			downPoint.x = posX;
			downPoint.y = -posY;
			downPoint.z = posZ;
			Vector3.subtract(downPoint, upPoint, v3);
			Vector3.normalize(v3, v3);
			rotateRadius = Math.acos(Vector3.dot(downV3, v3));
			Vector3.cross(downV3, v3, rotateAxis);
			Vector3.normalize(rotateAxis, rotateAxis);
			Quaternion.createFromAxisAngle(rotateAxis, rotateRadius, q4);
			Vector3.normalize(normal, normal);
			Vector3.transformQuat(normal, q4, normal);
			Vector3.normalize(normal, normal);
			//normal
			vertices[vc++] = normal.x;
			vertices[vc + (slices + 1) * 8 - 1] = normal.x;
			vertices[vc++] = normal.y;
			vertices[vc + (slices + 1) * 8 - 1] = normal.y;
			vertices[vc++] = normal.z;
			vertices[vc + (slices + 1) * 8 - 1] = normal.z;
			//uv    
			vertices[vc++] = 1 - rv * 1 / slices;
			vertices[vc + (slices + 1) * 8 - 1] = 1 - rv * 1 / slices;
			vertices[vc++] = 0;
			vertices[vc + (slices + 1) * 8 - 1] = 1;

		}

		vc += (slices + 1) * 8;

		for (var ri: number = 0; ri < slices; ri++) {
			indices[ic++] = ri + verticeCount + (slices + 1);
			indices[ic++] = ri + verticeCount + 1;
			indices[ic++] = ri + verticeCount;

			indices[ic++] = ri + verticeCount + (slices + 1);
			indices[ic++] = ri + verticeCount + (slices + 1) + 1;
			indices[ic++] = ri + verticeCount + 1;

		}

		verticeCount += 2 * (slices + 1);

		//底
		for (var bv: number = 0; bv <= slices; bv++) {
			if (bv === 0) {
				//pos
				vertices[vc++] = 0;
				vertices[vc++] = -halfHeight;
				vertices[vc++] = 0;
				//normal
				vertices[vc++] = 0;
				vertices[vc++] = -1;
				vertices[vc++] = 0;
				//uv
				vertices[vc++] = 0.5;
				vertices[vc++] = 0.5;
			}

			curAngle = bv * sliceAngle;
			posX = Math.cos(curAngle + Math.PI) * radius;
			posY = -halfHeight;
			posZ = Math.sin(curAngle + Math.PI) * radius;

			//pos
			vertices[vc++] = posX;
			vertices[vc++] = posY;
			vertices[vc++] = posZ;
			//normal
			vertices[vc++] = 0;
			vertices[vc++] = -1;
			vertices[vc++] = 0;
			//uv
			vertices[vc++] = 0.5 + Math.cos(curAngle) * 0.5;
			vertices[vc++] = 0.5 + Math.sin(curAngle) * 0.5;

		}

		for (var bi: number = 0; bi < slices; bi++) {
			indices[ic++] = 0 + verticeCount;
			indices[ic++] = bi + 2 + verticeCount;
			indices[ic++] = bi + 1 + verticeCount;
		}

		verticeCount += slices + 1 + 1;
		return PrimitiveMesh._createMesh(vertexDeclaration, vertices, indices);
	}

	/**
	 * 创建一个圆柱体模型
	 * @param radius 半径
	 * @param height 高度
	 * @param slices 垂直层数
	 */
	static createCylinder(radius: number = 0.5, height: number = 2, slices: number = 32): Mesh {
		//(this._released) || (dispose());//如果已存在，则释放资源
		var vertexCount: number = (slices + 1 + 1) + (slices + 1) * 2 + (slices + 1 + 1);
		var indexCount: number = 3 * slices + 6 * slices + 3 * slices;

		//定义顶点数据结构
		var vertexDeclaration: VertexDeclaration = VertexMesh.getVertexDeclaration("POSITION,NORMAL,UV");
		//单个顶点数据个数,总共字节数/单个字节数
		var vertexFloatStride: number = vertexDeclaration.vertexStride / 4;
		//顶点
		var vertices: Float32Array = new Float32Array(vertexCount * vertexFloatStride);
		//顶点索引
		var indices: Uint16Array = new Uint16Array(indexCount);

		var sliceAngle: number = (Math.PI * 2.0) / slices;

		var halfHeight: number = height / 2;
		var curAngle: number = 0;
		var verticeCount: number = 0;
		var posX: number = 0;
		var posY: number = 0;
		var posZ: number = 0;

		var vc: number = 0;
		var ic: number = 0;

		//顶
		for (var tv: number = 0; tv <= slices; tv++) {

			if (tv === 0) {
				//pos
				vertices[vc++] = 0;
				vertices[vc++] = halfHeight;
				vertices[vc++] = 0;
				//normal
				vertices[vc++] = 0;
				vertices[vc++] = 1;
				vertices[vc++] = 0;
				//uv
				vertices[vc++] = 0.5;
				vertices[vc++] = 0.5;

			}

			curAngle = tv * sliceAngle;
			posX = Math.cos(curAngle) * radius;
			posY = halfHeight;
			posZ = Math.sin(curAngle) * radius;

			//pos
			vertices[vc++] = posX;
			vertices[vc++] = posY;
			vertices[vc++] = posZ;
			//normal
			vertices[vc++] = 0;
			vertices[vc++] = 1;
			vertices[vc++] = 0;

			//uv
			vertices[vc++] = 0.5 + Math.cos(curAngle) * 0.5;
			vertices[vc++] = 0.5 + Math.sin(curAngle) * 0.5;
		}

		for (var ti: number = 0; ti < slices; ti++) {
			indices[ic++] = 0;
			indices[ic++] = ti + 1;
			indices[ic++] = ti + 2;
		}
		verticeCount += slices + 1 + 1;

		//壁
		for (var rv: number = 0; rv <= slices; rv++) {
			curAngle = rv * sliceAngle;
			posX = Math.cos(curAngle + Math.PI) * radius;
			posY = halfHeight;
			posZ = Math.sin(curAngle + Math.PI) * radius;

			//pos
			vertices[vc++] = posX;
			vertices[vc + (slices + 1) * 8 - 1] = posX;
			vertices[vc++] = posY;
			vertices[vc + (slices + 1) * 8 - 1] = -posY;
			vertices[vc++] = posZ;
			vertices[vc + (slices + 1) * 8 - 1] = posZ;
			//normal
			vertices[vc++] = posX;
			vertices[vc + (slices + 1) * 8 - 1] = posX;
			vertices[vc++] = 0;
			vertices[vc + (slices + 1) * 8 - 1] = 0;
			vertices[vc++] = posZ;
			vertices[vc + (slices + 1) * 8 - 1] = posZ;
			//uv    
			vertices[vc++] = 1 - rv * 1 / slices;
			vertices[vc + (slices + 1) * 8 - 1] = 1 - rv * 1 / slices;
			vertices[vc++] = 0;
			vertices[vc + (slices + 1) * 8 - 1] = 1;

		}

		vc += (slices + 1) * 8;

		for (var ri: number = 0; ri < slices; ri++) {
			indices[ic++] = ri + verticeCount + (slices + 1);
			indices[ic++] = ri + verticeCount + 1;
			indices[ic++] = ri + verticeCount;

			indices[ic++] = ri + verticeCount + (slices + 1);
			indices[ic++] = ri + verticeCount + (slices + 1) + 1;
			indices[ic++] = ri + verticeCount + 1;

		}

		verticeCount += 2 * (slices + 1);

		//底
		for (var bv: number = 0; bv <= slices; bv++) {
			if (bv === 0) {
				//pos
				vertices[vc++] = 0;
				vertices[vc++] = -halfHeight;
				vertices[vc++] = 0;
				//normal
				vertices[vc++] = 0;
				vertices[vc++] = -1;
				vertices[vc++] = 0;
				//uv
				vertices[vc++] = 0.5;
				vertices[vc++] = 0.5;

			}

			curAngle = bv * sliceAngle;
			posX = Math.cos(curAngle + Math.PI) * radius;
			posY = -halfHeight;
			posZ = Math.sin(curAngle + Math.PI) * radius;

			//pos
			vertices[vc++] = posX;
			vertices[vc++] = posY;
			vertices[vc++] = posZ;
			//normal
			vertices[vc++] = 0;
			vertices[vc++] = -1;
			vertices[vc++] = 0;
			//uv
			vertices[vc++] = 0.5 + Math.cos(curAngle) * 0.5;
			vertices[vc++] = 0.5 + Math.sin(curAngle) * 0.5;

		}

		for (var bi: number = 0; bi < slices; bi++) {
			indices[ic++] = 0 + verticeCount;
			indices[ic++] = bi + 2 + verticeCount;
			indices[ic++] = bi + 1 + verticeCount;
		}

		verticeCount += slices + 1 + 1;
		return PrimitiveMesh._createMesh(vertexDeclaration, vertices, indices);
	}

	/**
	 * 创建一个平面模型
	 * @param long  长
	 * @param width 宽
	 */
	static createPlane(long: number = 10, width: number = 10, stacks: number = 10, slices: number = 10): Mesh {
		var vertexCount: number = (stacks + 1) * (slices + 1);
		var indexCount: number = stacks * slices * 2 * 3;
		var indices: Uint16Array = new Uint16Array(indexCount);
		//定义顶点数据结构
		var vertexDeclaration: VertexDeclaration = VertexMesh.getVertexDeclaration("POSITION,NORMAL,UV");
		//单个顶点数据个数,总共字节数/单个字节数
		var vertexFloatStride: number = vertexDeclaration.vertexStride / 4;
		//顶点数组长度
		var vertices: Float32Array = new Float32Array(vertexCount * vertexFloatStride);

		var halfLong: number = long / 2;
		var halfWidth: number = width / 2;
		var stacksLong: number = long / stacks;
		var slicesWidth: number = width / slices;

		var verticeCount: number = 0;

		for (var i: number = 0; i <= slices; i++) {

			for (var j: number = 0; j <= stacks; j++) {

				vertices[verticeCount++] = j * stacksLong - halfLong;
				vertices[verticeCount++] = 0;
				vertices[verticeCount++] = i * slicesWidth - halfWidth;
				vertices[verticeCount++] = 0;
				vertices[verticeCount++] = 1;
				vertices[verticeCount++] = 0;
				vertices[verticeCount++] = j * 1 / stacks;
				vertices[verticeCount++] = i * 1 / slices;
			}
		}

		var indiceIndex: number = 0;

		for (i = 0; i < slices; i++) {

			for (j = 0; j < stacks; j++) {

				indices[indiceIndex++] = (i + 1) * (stacks + 1) + j;
				indices[indiceIndex++] = i * (stacks + 1) + j;
				indices[indiceIndex++] = (i + 1) * (stacks + 1) + j + 1;

				indices[indiceIndex++] = i * (stacks + 1) + j;
				indices[indiceIndex++] = i * (stacks + 1) + j + 1;
				indices[indiceIndex++] = (i + 1) * (stacks + 1) + j + 1;
			}
		}

		return PrimitiveMesh._createMesh(vertexDeclaration, vertices, indices);
	}

	/**
	 * 创建一个四边形模型
	 * @param long  长
	 * @param width 宽
	 */
	static createQuad(long: number = 1, width: number = 1): Mesh {
		//定义顶点数据结构
		var vertexDeclaration: VertexDeclaration = VertexMesh.getVertexDeclaration("POSITION,NORMAL,UV");
		var halfLong: number = long / 2;
		var halfWidth: number = width / 2;

		var vertices: Float32Array = new Float32Array([-halfLong, halfWidth, 0, 0, 0, 1, 0, 0, halfLong, halfWidth, 0, 0, 0, 1, 1, 0, -halfLong, -halfWidth, 0, 0, 0, 1, 0, 1, halfLong, -halfWidth, 0, 0, 0, 1, 1, 1]);
		var indices: Uint16Array = new Uint16Array([0, 1, 2, 3, 2, 1]);

		return PrimitiveMesh._createMesh(vertexDeclaration, vertices, indices);
	}

	/**
	 * 创建一个球体模型
	 * @param radius 半径
	 * @param stacks 水平层数
	 * @param slices 垂直层数
	 */
	static createSphere(radius: number = 0.5, stacks: number = 32, slices: number = 32): Mesh {
		var vertexCount: number = (stacks + 1) * (slices + 1);
		var indexCount: number = (3 * stacks * (slices + 1)) * 2;

		var indices: Uint16Array = new Uint16Array(indexCount);
		var vertexDeclaration: VertexDeclaration = VertexMesh.getVertexDeclaration("POSITION,NORMAL,UV");
		var vertexFloatStride: number = vertexDeclaration.vertexStride / 4;
		var vertices: Float32Array = new Float32Array(vertexCount * vertexFloatStride);

		var stackAngle: number = Math.PI / stacks;
		var sliceAngle: number = (Math.PI * 2.0) / slices;

		// Generate the group of Stacks for the sphere  
		var vertexIndex: number = 0;
		vertexCount = 0;
		indexCount = 0;

		for (var stack: number = 0; stack < (stacks + 1); stack++) {
			var r: number = Math.sin(stack * stackAngle);
			var y: number = Math.cos(stack * stackAngle);

			// Generate the group of segments for the current Stack  
			for (var slice: number = 0; slice < (slices + 1); slice++) {
				var x: number = r * Math.sin(slice * sliceAngle + Math.PI * 1 / 2);
				var z: number = r * Math.cos(slice * sliceAngle + Math.PI * 1 / 2);
				vertices[vertexCount + 0] = x * radius;
				vertices[vertexCount + 1] = y * radius;
				vertices[vertexCount + 2] = z * radius;

				vertices[vertexCount + 3] = x;
				vertices[vertexCount + 4] = y;
				vertices[vertexCount + 5] = z;

				vertices[vertexCount + 6] = slice / slices;
				vertices[vertexCount + 7] = stack / stacks;
				vertexCount += vertexFloatStride;
				if (stack != (stacks - 1)) {
					// First Face
					indices[indexCount++] = vertexIndex + (slices + 1);
					indices[indexCount++] = vertexIndex;
					indices[indexCount++] = vertexIndex + 1;
					// Second 
					indices[indexCount++] = vertexIndex + (slices);
					indices[indexCount++] = vertexIndex;
					indices[indexCount++] = vertexIndex + (slices + 1);
					vertexIndex++;
				}
			}
		}
		return PrimitiveMesh._createMesh(vertexDeclaration, vertices, indices);
	}
}

