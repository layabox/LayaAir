import { Matrix } from "../../maths/Matrix";

export class Transform {

	/**水平方向旋转角度 */
	skX: number = 0;		// 旋转？
	/**垂直方向旋转角度 */
	skY: number = 0;		// 不知道干什么的
	/**水平方向缩放 */
	scX: number = 1;		// 缩放
	/**垂直方向缩放 */
	scY: number = 1;
	/**水平方向偏移 */
	x: number = 0;		// 偏移
	/**垂直方向偏移 */
	y: number = 0;
	/**水平方向倾斜角度 */
	skewX: number = 0;	// skew
	/**垂直方向倾斜角度 */
	skewY: number = 0;
	private mMatrix: Matrix;

	/**
	 * 初始化数据
	 * @param data 
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
	 * 获取当前矩阵
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
	 * 获取倾斜矩阵
	 * @param m 
	 * @param x 
	 * @param y 
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

