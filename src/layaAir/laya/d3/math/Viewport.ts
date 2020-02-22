import { Matrix4x4 } from "./Matrix4x4";
import { Vector3 } from "./Vector3";
import { Vector4 } from "./Vector4";
/**
 * <code>Viewport</code> 类用于创建视口。
 */
export class Viewport {
	/** @internal */
	private static _tempMatrix4x4: Matrix4x4 = new Matrix4x4();

	/**X轴坐标*/
	x: number;
	/**Y轴坐标*/
	y: number;
	/**宽度*/
	width: number;
	/**高度*/
	height: number;
	/**最小深度*/
	minDepth: number;
	/**最大深度*/
	maxDepth: number;

	/**
	 * 创建一个 <code>Viewport</code> 实例。
	 * @param	x x坐标。
	 * @param	y y坐标。
	 * @param	width 宽度。
	 * @param	height 高度。
	 */
	constructor(x: number, y: number, width: number, height: number) {
		this.minDepth = 0.0;
		this.maxDepth = 1.0;

		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}

	/**
	 * 投影一个三维向量到视口空间。
	 * @param	source 三维向量。
	 * @param	matrix 变换矩阵。
	 * @param	out x、y、z为视口空间坐标,透视投影下w为相对于变换矩阵的z轴坐标。
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
	 * 反变换一个三维向量。
	 * @param	source 源三维向量。
	 * @param	matrix 变换矩阵。
	 * @param	out 输出三维向量。
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
	 * 反变换一个三维向量。
	 * @param	source 源三维向量。
	 * @param	projection  透视投影矩阵。
	 * @param	view 视图矩阵。
	 * @param	world 世界矩阵,可设置为null。
	 * @param   out 输出向量。
	 */
	unprojectFromWVP(source: Vector3, projection: Matrix4x4, view: Matrix4x4, world: Matrix4x4, out: Vector3): void {

		Matrix4x4.multiply(projection, view, Viewport._tempMatrix4x4);
		(world) && (Matrix4x4.multiply(Viewport._tempMatrix4x4, world, Viewport._tempMatrix4x4));
		Viewport._tempMatrix4x4.invert(Viewport._tempMatrix4x4);
		this.unprojectFromMat(source, Viewport._tempMatrix4x4, out);
	}

	/**
	 * 克隆
	 * @param	out
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


