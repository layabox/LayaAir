import { Matrix } from "../../maths/Matrix";

/**
 * @en The `Transform` class represents a 2D transformation matrix, used to apply rotations, scaling, skewing, and translation to objects.
 * @zh `Transform` 类表示一个2D变换矩阵，用于对对象应用旋转、缩放、倾斜和位移。
 */
export class Transform {

	/**
	* @en The rotation angle around the X-axis (in degrees).
	* @zh 绕X轴旋转的角度（以度为单位）。
	*/
	skX: number = 0;
	/**
	 * @en The rotation angle around the Y-axis (in degrees).
	 * @zh 绕Y轴旋转的角度（以度为单位）。
	 */
	skY: number = 0;
	/**
	 * @en The scaling factor along the X-axis.
	 * @zh 沿X轴的缩放系数。
	 */
	scX: number = 1;
	/**
	 * @en The scaling factor along the Y-axis.
	 * @zh 沿Y轴的缩放系数。
	 */
	scY: number = 1;
	/**
	 * @en The translation along the X-axis.
	 * @zh 沿X轴的平移。
	 */
	x: number = 0;
	/**
	 * @en The translation along the Y-axis.
	 * @zh 沿Y轴的平移。
	 */
	y: number = 0;
	/**
	 * @en The skew angle along the X-axis (in degrees).
	 * @zh 沿X轴的倾斜角度（以度为单位）。
	 */
	skewX: number = 0;	// skew
	/**
	 * @en The skew angle along the Y-axis (in degrees).
	 * @zh 沿Y轴的倾斜角度（以度为单位）。
	 */
	skewY: number = 0;
	/**
	 * @en The internal matrix used for transformations.
	 * @zh 用于变换的内部矩阵。
	 * @private
	 */
	private mMatrix: Matrix;

	/**
	 * @en Initializes the transform data with the provided values.
	 * @param data The data object containing transformation properties.
	 * @zh 使用提供的数据初始化变换。
	 * @param data 数据对象，包含变换属性。
	 */
	//TODO:coverage
	initData(data: any): void {
		if (data.x != undefined) {
			this.x = data.x;
		}
		if (data.y != undefined) {
			this.y = data.y;
		}
		if (data.skX != undefined) {
			this.skX = data.skX;
		}
		if (data.skY != undefined) {
			this.skY = data.skY;
		}
		if (data.scX != undefined) {
			this.scX = data.scX;
		}
		if (data.scY != undefined) {
			this.scY = data.scY;
		}
	}

	/**
	 * @en Gets the current matrix.
	 * @returns The transformation matrix.
	 * @zh 获取当前矩阵。
	 * @returns 变换矩阵。
	 */
	//TODO:coverage
	getMatrix(): Matrix {
		var tMatrix: Matrix;
		if (this.mMatrix) {
			tMatrix = this.mMatrix;
		} else {
			tMatrix = this.mMatrix = new Matrix();
		}

		tMatrix.identity();
		tMatrix.scale(this.scX, this.scY);
		if (this.skewX || this.skewY) {
			this.skew(tMatrix, this.skewX * Math.PI / 180, this.skewY * Math.PI / 180);
		}
		tMatrix.rotate(this.skX * Math.PI / 180);
		tMatrix.translate(this.x, this.y);

		return tMatrix;
	}

	/**
	 * @en Applies skew to the matrix based on the given angles.
	 * @param m The matrix to apply the skew transformation to.
	 * @param x The horizontal skew angle, in radians.
	 * @param y The vertical skew angle, in radians.
	 * @returns The modified matrix with skew applied.
	 * @zh 根据给定的角度对矩阵应用倾斜。
	 * @param m 要应用倾斜变换的矩阵。
	 * @param x 水平倾斜角度，以弧度为单位。
	 * @param y 垂直倾斜角度，以弧度为单位。
	 * @returns 应用倾斜后的矩阵。
	 */
	//TODO:coverage
	skew(m: Matrix, x: number, y: number): Matrix {
		var sinX: number = Math.sin(y);
		var cosX: number = Math.cos(y);
		var sinY: number = Math.sin(x);
		var cosY: number = Math.cos(x);

		m.setTo(m.a * cosY - m.b * sinX,
			m.a * sinY + m.b * cosX,
			m.c * cosY - m.d * sinX,
			m.c * sinY + m.d * cosX,
			m.tx * cosY - m.ty * sinX,
			m.tx * sinY + m.ty * cosX);
		return m;
	}
}

