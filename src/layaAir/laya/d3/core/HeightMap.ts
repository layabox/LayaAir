import { Bounds } from "./Bounds";
import { IndexBuffer3D } from "../graphics/IndexBuffer3D"
import { VertexBuffer3D } from "../graphics/VertexBuffer3D"
import { Ray } from "../math/Ray"
import { Vector2 } from "../math/Vector2"
import { Vector3 } from "../math/Vector3"
import { Mesh } from "../resource/models/Mesh"
import { SubMesh } from "../resource/models/SubMesh"
import { Picker } from "../utils/Picker"
import { Texture2D } from "../../resource/Texture2D"


/**
 * <code>HeightMap</code> 类用于实现高度图数据。
 */
export class HeightMap {
	private static _tempRay: Ray = new Ray(new Vector3(), new Vector3());

	/**
	 * 从网格精灵生成高度图。
	 * @param meshSprite 网格精灵。
	 * @param width	高度图宽度。
	 * @param height 高度图高度。
	 * @param outCellSize 输出 单元尺寸。
	 */
	static creatFromMesh(mesh: Mesh, width: number, height: number, outCellSize: Vector2): HeightMap {
		var vertices: any[] = [];
		var indexs: Uint16Array[] = [];

		var submesheCount: number = mesh.subMeshCount;
		for (var i: number = 0; i < submesheCount; i++) {
			var subMesh: SubMesh = (<SubMesh>mesh.getSubMesh(i));
			var vertexBuffer: VertexBuffer3D = subMesh._vertexBuffer;
			var verts: Float32Array =vertexBuffer.getFloat32Data();
			var subMeshVertices: Vector3[] = [];

			for (var j: number = 0; j < verts.length; j += vertexBuffer.vertexDeclaration.vertexStride / 4) {
				var position: Vector3 = new Vector3(verts[j + 0], verts[j + 1], verts[j + 2]);
				subMeshVertices.push(position);
			}
			vertices.push(subMeshVertices);

			var ib: IndexBuffer3D = subMesh._indexBuffer;
			indexs.push(ib.getData());
		}

		var bounds: Bounds = mesh.bounds;
		var minX: number = bounds.getMin().x;
		var minZ: number = bounds.getMin().z;
		var maxX: number = bounds.getMax().x;
		var maxZ: number = bounds.getMax().z;
		var minY: number = bounds.getMin().y;
		var maxY: number = bounds.getMax().y;

		var widthSize: number = maxX - minX;
		var heightSize: number = maxZ - minZ;
		var cellWidth: number = outCellSize.x = widthSize / (width - 1);
		var cellHeight: number = outCellSize.y = heightSize / (height - 1);

		var heightMap: HeightMap = new HeightMap(width, height, minY, maxY);

		var ray: Ray = HeightMap._tempRay;
		var rayDir: Vector3 = ray.direction;//Direction
		rayDir.x = 0;
		rayDir.y = -1;
		rayDir.z = 0;

		const heightOffset: number = 0.1;//OriginalY
		var rayY: number = maxY + heightOffset;
		ray.origin.y = rayY;

		for (var h: number = 0; h < height; h++) {
			var posZ: number = minZ + h * cellHeight;
			heightMap._datas[h] = [];
			for (var w: number = 0; w < width; w++) {
				var posX: number = minX + w * cellWidth;

				var rayOri: Vector3 = ray.origin;
				rayOri.x = posX;
				rayOri.z = posZ;

				var closestIntersection: number = HeightMap._getPosition(ray, vertices, indexs);
				heightMap._datas[h][w] = (closestIntersection === Number.MAX_VALUE) ? NaN : rayY - closestIntersection;
			}
		}
		return heightMap;
	}

	/**
	 * 从图片生成高度图。
	 * @param image 图片。
	 * @param maxHeight 最小高度。
	 * @param maxHeight 最大高度。
	 */
	static createFromImage(texture: Texture2D, minHeight: number, maxHeight: number): HeightMap {//TODO:texture类型，临时修复
		var textureWidth: number = texture.width;
		var textureHeight: number = texture.height;
		var heightMap: HeightMap = new HeightMap(textureWidth, textureHeight, minHeight, maxHeight);
		var compressionRatio: number = (maxHeight - minHeight) / 254;
		var pixelsInfo: Uint8Array = <Uint8Array>texture.getPixels();

		var index: number = 0;
		for (var h: number = 0; h < textureHeight; h++) {
			var colDatas: any[] = heightMap._datas[h] = [];
			for (var w: number = 0; w < textureWidth; w++) {
				var r: number = pixelsInfo[index++];
				var g: number = pixelsInfo[index++];
				var b: number = pixelsInfo[index++];
				var a: number = pixelsInfo[index++];

				if (r == 255 && g == 255 && b == 255 && a == 255)
					colDatas[w] = NaN;
				else {
					colDatas[w] = (r + g + b) / 3 * compressionRatio + minHeight;
				}
			}
		}
		return heightMap;
	}

	private static _getPosition(ray: Ray, vertices: any[], indexs: Uint16Array[]): number {
		var closestIntersection: number = Number.MAX_VALUE;
		for (var i: number = 0; i < vertices.length; i++) {
			var subMeshVertices: Vector3[] = vertices[i];
			var subMeshIndexes: Uint16Array = indexs[i];

			for (var j: number = 0; j < subMeshIndexes.length; j += 3) {
				var vertex1: Vector3 = subMeshVertices[subMeshIndexes[j + 0]];
				var vertex2: Vector3 = subMeshVertices[subMeshIndexes[j + 1]];
				var vertex3: Vector3 = subMeshVertices[subMeshIndexes[j + 2]];

				var intersection: number = Picker.rayIntersectsTriangle(ray, vertex1, vertex2, vertex3);

				if (!isNaN(intersection) && intersection < closestIntersection) {
					closestIntersection = intersection;
				}
			}
		}

		return closestIntersection;

	}

	private _datas: any[];
	private _w: number;
	private _h: number;
	private _minHeight: number;
	private _maxHeight: number;

	/**
	 * 获取宽度。
	 * @return value 宽度。
	 */
	get width(): number {
		return this._w;
	}

	/**
	 * 获取高度。
	 * @return value 高度。
	 */
	get height(): number {
		return this._h;
	}

	/**
	 * 最大高度。
	 * @return value 最大高度。
	 */
	get maxHeight(): number {
		return this._maxHeight;
	}

	/**
	 * 最大高度。
	 * @return value 最大高度。
	 */
	get minHeight(): number {
		return this._minHeight;
	}

	/**
	 * 创建一个 <code>HeightMap</code> 实例。
	 * @param width 宽度。
	 * @param height 高度。
	 * @param minHeight 最大高度。
	 * @param maxHeight 最大高度。
	 */
	constructor(width: number, height: number, minHeight: number, maxHeight: number) {
		this._datas = [];
		this._w = width;
		this._h = height;
		this._minHeight = minHeight;
		this._maxHeight = maxHeight;
	}

	/** @internal */
	private _inBounds(row: number, col: number): boolean {
		return row >= 0 && row < this._h && col >= 0 && col < this._w;
	}

	/**
	 * 获取高度。
	 * @param row 列数。
	 * @param col 行数。
	 * @return 高度。
	 */
	getHeight(row: number, col: number): number {
		if (this._inBounds(row, col))
			return this._datas[row][col];
		else
			return NaN;
	}

}


