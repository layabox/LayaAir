import { MeshSprite3D } from "./MeshSprite3D";
import { HeightMap } from "./HeightMap";
import { Bounds } from "./Bounds";
import { RenderContext3D } from "./render/RenderContext3D"
import { Matrix4x4 } from "../math/Matrix4x4"
import { Quaternion } from "../math/Quaternion"
import { Vector2 } from "../math/Vector2"
import { Vector3 } from "../math/Vector3"
import { Mesh } from "../resource/models/Mesh"
import { Texture2D } from "../../resource/Texture2D"

/**
 * <code>TerrainMeshSprite3D</code> 类用于地形节点转换普通mesh渲染。
 */
export class MeshTerrainSprite3D extends MeshSprite3D {
	private static _tempVector3: Vector3 = new Vector3();
	private static _tempMatrix4x4: Matrix4x4 = new Matrix4x4();

	/**
	 * 从网格创建一个TerrainMeshSprite3D实例和其高度图属性。
	 * @param mesh 网格。
	 * @param heightMapWidth 高度图宽度。
	 * @param heightMapHeight 高度图高度。
	 * @param name 名字。
	 */
	static createFromMesh(mesh: Mesh, heightMapWidth: number, heightMapHeight: number, name: string = null): MeshTerrainSprite3D {
		var meshTerrainSprite3D: MeshTerrainSprite3D = new MeshTerrainSprite3D(mesh, null, name);
		meshTerrainSprite3D._initCreateFromMesh(heightMapWidth, heightMapHeight);
		return meshTerrainSprite3D;
	}

	/**
	 * 从网格创建一个TerrainMeshSprite3D实例、图片读取高度图属性。
	 * @param mesh 网格。
	 * @param image 高度图。
	 * @param name 名字。
	 * @returns 地形渲染节点
	 */
	static createFromMeshAndHeightMap(mesh: Mesh, texture: Texture2D, minHeight: number, maxHeight: number, name: string = null): MeshTerrainSprite3D {
		var meshTerrainSprite3D: MeshTerrainSprite3D = new MeshTerrainSprite3D(mesh, null, name);
		meshTerrainSprite3D._initCreateFromMeshHeightMap(texture, minHeight, maxHeight);
		return meshTerrainSprite3D;
	}

	private _minX: number;
	private _minZ: number;
	private _cellSize: Vector2;
	private _heightMap: HeightMap;

	/**
	 * 获取地形X轴最小位置。
	 * @return  地形X轴最小位置。
	 */
	get minX(): number {
		var worldMat: Matrix4x4 = this.transform.worldMatrix;
		var worldMatE: Float32Array = worldMat.elements;
		return this._minX * this._getScaleX() + worldMatE[12];
	}

	/**
	 * 获取地形Z轴最小位置。
	 * @return  地形X轴最小位置。
	 */
	get minZ(): number {
		var worldMat: Matrix4x4 = this.transform.worldMatrix;
		var worldMatE: Float32Array = worldMat.elements;
		return this._minZ * this._getScaleZ() + worldMatE[14];
	}

	/**
	 * 获取地形X轴长度。
	 * @return  地形X轴长度。
	 */
	get width(): number {
		return (this._heightMap.width - 1) * this._cellSize.x * this._getScaleX();
	}

	/**
	 * 获取地形Z轴长度。
	 * @return  地形Z轴长度。
	 */
	get depth(): number {
		return (this._heightMap.height - 1) * this._cellSize.y * this._getScaleZ();
	}

	/**
	 * 创建一个 <code>TerrainMeshSprite3D</code> 实例。
	 * @param mesh 网格。
	 * @param heightMap 高度图。
	 * @param name 名字。
	 */
	constructor(mesh: Mesh, heightMap: HeightMap, name: string = null) {
		super(mesh, name);
		this._heightMap = heightMap;
		this._cellSize = new Vector2();
	}

	private _disableRotation(): void {
		var rotation: Quaternion = this.transform.rotation;
		rotation.x = 0;
		rotation.y = 0;
		rotation.z = 0;
		rotation.w = 1;
		this.transform.rotation = rotation;
	}

	private _getScaleX(): number {
		var worldMat: Matrix4x4 = this.transform.worldMatrix;
		var worldMatE: Float32Array = worldMat.elements;
		var m11: number = worldMatE[0];
		var m12: number = worldMatE[1];
		var m13: number = worldMatE[2];
		return Math.sqrt((m11 * m11) + (m12 * m12) + (m13 * m13));
	}

	private _getScaleZ(): number {
		var worldMat: Matrix4x4 = this.transform.worldMatrix;
		var worldMatE: Float32Array = worldMat.elements;
		var m31: number = worldMatE[8];
		var m32: number = worldMatE[9];
		var m33: number = worldMatE[10];
		return Math.sqrt((m31 * m31) + (m32 * m32) + (m33 * m33));
	}

	private _initCreateFromMesh(heightMapWidth: number, heightMapHeight: number): void {
		this._heightMap = HeightMap.creatFromMesh((<Mesh>this.meshFilter.sharedMesh), heightMapWidth, heightMapHeight, this._cellSize);

		var boundingBox: Bounds = this.meshFilter.sharedMesh.bounds;
		var min: Vector3 = boundingBox.getMin();
		this._minX = min.x;
		this._minZ = min.z;
	}

	private _initCreateFromMeshHeightMap(texture: Texture2D, minHeight: number, maxHeight: number): void {
		var boundingBox: Bounds = this.meshFilter.sharedMesh.bounds;
		this._heightMap = HeightMap.createFromImage(texture, minHeight, maxHeight);
		this._computeCellSize(boundingBox);

		var min: Vector3 = boundingBox.getMin();
		this._minX = min.x;
		this._minZ = min.z;
	}

	private _computeCellSize(boundingBox: Bounds): void {
		var min: Vector3 = boundingBox.getMin();
		var max: Vector3 = boundingBox.getMax();
		var minX: number = min.x;
		var minZ: number = min.z;
		var maxX: number = max.x;
		var maxZ: number = max.z;

		var widthSize: number = maxX - minX;
		var heightSize: number = maxZ - minZ;

		this._cellSize.x = widthSize / (this._heightMap.width - 1);
		this._cellSize.y = heightSize / (this._heightMap.height - 1);
	}

	/**
	 * @internal
	 */
	_update(state: RenderContext3D): void {//TODO:
		this._disableRotation();
		//super._update(state);
	}

	/**
	 * 获取地形高度。
	 * @param x X轴坐标。
	 * @param z Z轴坐标。
	 */
	getHeight(x: number, z: number): number {
		MeshTerrainSprite3D._tempVector3.x = x;
		MeshTerrainSprite3D._tempVector3.y = 0;
		MeshTerrainSprite3D._tempVector3.z = z;

		this._disableRotation();
		var worldMat: Matrix4x4 = this.transform.worldMatrix;
		worldMat.invert(MeshTerrainSprite3D._tempMatrix4x4);

		Vector3.transformCoordinate(MeshTerrainSprite3D._tempVector3, MeshTerrainSprite3D._tempMatrix4x4, MeshTerrainSprite3D._tempVector3);
		x = MeshTerrainSprite3D._tempVector3.x;
		z = MeshTerrainSprite3D._tempVector3.z;

		var c: number = (x - this._minX) / this._cellSize.x;
		var d: number = (z - this._minZ) / this._cellSize.y;
		var row: number = Math.floor(d);
		var col: number = Math.floor(c);

		var s: number = c - col;
		var t: number = d - row;

		var uy: number;
		var vy: number;
		var worldMatE: Float32Array = worldMat.elements;
		var m21: number = worldMatE[4];
		var m22: number = worldMatE[5];
		var m23: number = worldMatE[6];
		var scaleY: number = Math.sqrt((m21 * m21) + (m22 * m22) + (m23 * m23));
		var translateY: number = worldMatE[13];

		var h01: number = this._heightMap.getHeight(row, col + 1);
		var h10: number = this._heightMap.getHeight((row + 1), col);
		if (isNaN(h01) || isNaN(h10))
			return NaN;

		if (s + t <= 1.0) {
			var h00: number = this._heightMap.getHeight(row, col);
			if (isNaN(h00))
				return NaN;

			uy = h01 - h00;
			vy = h10 - h00;
			return (h00 + s * uy + t * vy) * scaleY + translateY;
		} else {
			var h11: number = this._heightMap.getHeight((row + 1), col + 1);
			if (isNaN(h11))
				return NaN;

			uy = h10 - h11;
			vy = h01 - h11;
			return (h11 + (1.0 - s) * uy + (1.0 - t) * vy) * scaleY + translateY;
		}
	}

}


