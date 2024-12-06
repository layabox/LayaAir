import { Matrix4x4 } from "./Matrix4x4";
import { Vector3 } from "./Vector3";
import { Vector4 } from "./Vector4";


/**
 * @en The `Viewport` class is used to create a viewport.
 * @zh `Viewport` 类用于创建视口。
 */
export class Viewport {
	/** @internal */
	static _tempViewport: Viewport = new Viewport(0, 0, 0, 0);
	/**
	 * @en X-axis coordinate
	 * @zh X轴坐标
	 */
	x: number;

	/**
	 * @en Y-axis coordinate
	 * @zh Y轴坐标
	 */
	y: number;

	/**
	 * @en Width
	 * @zh 宽度
	 */
	width: number;

	/**
	 * @en Height
	 * @zh 高度
	 */
	height: number;

	/**
	 * @en Minimum depth
	 * @zh 最小深度
	 */
	minDepth: number;

	/**
	 * @en Maximum depth
	 * @zh 最大深度
	 */
	maxDepth: number;

	/**
	 * @en Constructor method, initialize viewport.
	 * @param x X-axis coordinate.
	 * @param y Y-axis coordinate.
	 * @param width Width.
	 * @param height Height.
	 * @zh 构造方法，初始化视口。
	 * @param x X轴坐标。
	 * @param y Y轴坐标。
	 * @param width 宽度。
	 * @param height 高度。
	 */
	constructor(x?: number, y?: number, width?: number, height?: number) {
		this.minDepth = 0.0;
		this.maxDepth = 1.0;

		this.x = x ?? 0;
		this.y = y ?? 0;
		this.width = width ?? 0;
		this.height = height ?? 0;
	}

	/**
	 * @en Project a three-dimensional vector to viewport space.
	 * @param source vector3.
	 * @param matrix Transformation matrix.
	 * @param out x, y, z are viewport space coordinates; in perspective projection, w is the z-axis coordinate relative to the transformation matrix.
	 * @zh 投影一个三维向量到视口空间。
	 * @param source 三维向量。
	 * @param matrix 变换矩阵。
	 * @param out x、y、z为视口空间坐标，透视投影下w为相对于变换矩阵的z轴坐标。
	 */
	project(source: Vector3, matrix: Matrix4x4, out: Vector4): void {
		Vector3.transformV3ToV4(source, matrix, out);
		var x: number = out.x, y: number = out.y, z: number = out.z;
		var w: number = out.w;
		if (w !== 1.0) {
			x = x / w;
			y = y / w;
			z = z / w;
		}
		out.x = (x + 1.0) * 0.5 * this.width + this.x;
		out.y = (-y + 1.0) * 0.5 * this.height + this.y;
		out.z = z * (this.maxDepth - this.minDepth) + this.minDepth;
	}

	/**
	 * @en Unproject a three-dimensional vector.
	 * @param source Source vector3.
	 * @param matrix Transformation matrix.
	 * @param out Output vector3.
	 * @zh 反变换一个三维向量。
	 * @param source 源三维向量。
	 * @param matrix 变换矩阵。
	 * @param out 输出三维向量。
	 */
	unprojectFromMat(source: Vector3, matrix: Matrix4x4, out: Vector3): void {
		var matrixEleme: Float32Array = matrix.elements;

		out.x = (((source.x - this.x) / this.width) * 2.0) - 1.0;
		out.y = -((((source.y - this.y) / this.height) * 2.0) - 1.0);
		out.z = (source.z - this.minDepth) / (this.maxDepth - this.minDepth);
		var a: number = (((out.x * matrixEleme[3]) + (out.y * matrixEleme[7])) + (out.z * matrixEleme[11])) + matrixEleme[15];
		Vector3.transformV3ToV3(out, matrix, out);
		if (a !== 1.0) {
			out.x = out.x / a;
			out.y = out.y / a;
			out.z = out.z / a;
		}
	}

	/**
	 * @en Unproject a three-dimensional vector using World-View-Projection matrices.
	 * @param source Source vector3.
	 * @param projection Perspective projection matrix.
	 * @param view View matrix.
	 * @param world World matrix, can be set to null.
	 * @param out Output vector.
	 * @zh 使用世界-视图-投影矩阵反变换一个三维向量。
	 * @param source 源三维向量。
	 * @param projection 透视投影矩阵。
	 * @param view 视图矩阵。
	 * @param world 世界矩阵，可设置为null。
	 * @param out 输出向量。
	 */
	unprojectFromWVP(source: Vector3, projection: Matrix4x4, view: Matrix4x4, world: Matrix4x4, out: Vector3): void {

		Matrix4x4.multiply(projection, view, _tempMatrix4x4);
		(world) && (Matrix4x4.multiply(_tempMatrix4x4, world, _tempMatrix4x4));
		_tempMatrix4x4.invert(_tempMatrix4x4);
		this.unprojectFromMat(source, _tempMatrix4x4, out);
	}

	/**
	 * @en Set viewport values.
	 * @param x X-axis coordinate.
	 * @param y Y-axis coordinate.
	 * @param width Width.
	 * @param height Height.
	 * @zh 设置视口值。
	 * @param x X轴坐标。
	 * @param y Y轴坐标。
	 * @param width 宽度。
	 * @param height 高度。
	 */
	set(x: number, y: number, width: number, height: number) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}

	/**
	 * @en Clone the viewport.
	 * @param out Output viewport.
	 * @zh 克隆视口。
	 * @param out 输出视口。
	 */
	cloneTo(out: Viewport): void {
		out.x = this.x;
		out.y = this.y;
		out.width = this.width;
		out.height = this.height;
		out.minDepth = this.minDepth;
		out.maxDepth = this.maxDepth;
	}
}

const _tempMatrix4x4: Matrix4x4 = new Matrix4x4();